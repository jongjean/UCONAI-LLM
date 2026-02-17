const TelegramBot = require('node-telegram-bot-api');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'uconai.db'));

// In-process broadcast helper (could be replaced by Redis/EventEmitters for scale)
let broadcastCallback = null;

class TelegramBridge {
    constructor(token) {
        if (!token || token === 'YOUR_BOT_TOKEN') {
            console.warn('[TG] No token provided. Running in SIMULATION MODE.');
            this.simulation = true;
        } else {
            this.bot = new TelegramBot(token, { polling: true });
            this.simulation = false;
        }
    }

    setBroadcastCallback(callback) {
        broadcastCallback = callback;
    }

    async init() {
        if (this.simulation) return;

        console.log('[TG] Telegram Bridge Active');

        // [Inbound] Telegram -> UCONAI
        this.bot.on('message', async (msg) => {
            const chatId = msg.chat.id.toString();
            const userId = msg.from.id.toString();
            const messageId = msg.message_id.toString();
            const text = msg.text;

            if (!text) return;

            // 1. Team-Chat Binding & User Mapping
            db.get(`
                SELECT u.id as actor_id, u.team_id, u.username
                FROM users u
                JOIN teams t ON u.team_id = t.id
                WHERE u.telegram_user_id = ? AND t.telegram_chat_id = ?
            `, [userId, chatId], async (err, identity) => {
                if (err || !identity) {
                    // Unauthorized or Unmapped source
                    console.log(`[TG] Unmapped message from ${userId} in ${chatId}`);
                    return;
                }

                // 2. Idempotency Check (Duplicate Prevention)
                const correlationId = `tg_${chatId}_${messageId}`;

                db.run(`
                    INSERT INTO chat_messages (correlation_id, channel, source_chat_id, source_msg_id, actor_id, team_id, text)
                    VALUES (?, 'TG', ?, ?, ?, ?, ?)
                `, [correlationId, chatId, messageId, identity.actor_id, identity.team_id, text], function (err) {
                    if (err) {
                        if (err.message.includes('UNIQUE constraint failed')) {
                            console.log(`[TG] Duplicate message skipped: ${correlationId}`);
                        }
                        return;
                    }

                    console.log(`[TG] Message from ${identity.username}: ${text}`);

                    // 3. Sync to Web UI (WebSocket Broadcast)
                    if (broadcastCallback) {
                        broadcastCallback(identity.team_id, {
                            type: 'chat',
                            message: {
                                id: this.lastID,
                                correlation_id: correlationId,
                                channel: 'TG',
                                username: identity.username,
                                text: text,
                                created_at: new Date().toISOString()
                            }
                        });
                    }

                    // TODO: Trigger Step 1.4 Command Router if text starts with '/'
                });
            });
        });

        // [Outbound] Watch for deliveries (Simulated polling for DB messages to send out)
        setInterval(() => this.processOutbound(), 5000);
    }

    async processOutbound() {
        // Find messages that need to be sent to TG
        db.all(`
            SELECT cd.id as delivery_id, m.text, t.telegram_chat_id, cd.message_id
            FROM chat_deliveries cd
            JOIN chat_messages m ON cd.message_id = m.id
            JOIN teams t ON m.team_id = t.id
            WHERE cd.target_channel = 'TG' AND cd.status = 'PENDING'
            LIMIT 5
        `, [], async (err, rows) => {
            if (err || !rows) return;

            for (const row of rows) {
                if (this.simulation) {
                    console.log(`[TG_SIM] Simulating outbound to ${row.telegram_chat_id}: ${row.text}`);
                    db.run('UPDATE chat_deliveries SET status = "SENT_SIMULATED", last_attempt_at = CURRENT_TIMESTAMP WHERE id = ?', [row.delivery_id]);
                    continue;
                }

                try {
                    await this.bot.sendMessage(row.telegram_chat_id, row.text);
                    db.run('UPDATE chat_deliveries SET status = "SENT", last_attempt_at = CURRENT_TIMESTAMP WHERE id = ?', [row.delivery_id]);
                } catch (e) {
                    console.error(`[TG_OUT_ERR] ${e.message}`);
                    db.run('UPDATE chat_deliveries SET status = "FAILED", error_msg = ?, retry_count = retry_count + 1, last_attempt_at = CURRENT_TIMESTAMP WHERE id = ?', [e.message, row.delivery_id]);
                }
            }
        });
    }

    // Manual send helper for other modules
    async sendToTeam(teamId, text) {
        db.get('SELECT telegram_chat_id FROM teams WHERE id = ?', [teamId], (err, team) => {
            if (err || !team || !team.telegram_chat_id) return;

            // Create chat_message first
            const correlationId = `out_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            db.run(`
                INSERT INTO chat_messages (correlation_id, channel, actor_id, team_id, text)
                VALUES (?, 'API', 0, ?, ?)
            `, [correlationId, teamId, text], function (err) {
                if (err) return;

                const msgId = this.lastID;
                // Create delivery
                db.run(`
                    INSERT INTO chat_deliveries (message_id, target_channel, status)
                    VALUES (?, 'TG', 'PENDING')
                `, [msgId]);
            });
        });
    }
}

module.exports = TelegramBridge;
