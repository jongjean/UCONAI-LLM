const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'uconai.db'));
const GCore = require('./modules/governance-core');
const AuditLogger = require('./modules/audit-exporter');

class CommandRouter {
    async route(chatMsg) {
        // [Step 1.4] Absolute Flow: Auth -> C11 Context -> Policy -> Job -> Audit

        const { id: chatMsgId, text, actor_id, team_id, correlation_id, channel } = chatMsg;

        if (!text.startsWith('/')) return null;

        const parts = text.slice(1).split(' ');
        const command = parts[0];
        const args = parts.slice(1);

        console.log(`[ROUTER] Processing command: ${command} from ${channel}`);

        // 1. Create C11 Context (Standardized Actor/Team/Auth)
        const ctx = {
            actor_id,
            team_id,
            correlation_id,
            channel,
            timestamp: new Date().toISOString()
        };

        // 2. [C15/C23] Governance Policy Pre-check
        try {
            const authResult = await GCore.authorize(ctx, {
                action: command,
                params: args
            });

            if (authResult.status !== 'ALLOW') {
                return {
                    status: 'DENIED',
                    reason: authResult.reason || 'GOVERNANCE_BLOCK'
                };
            }

            // 3. Create Job (If authorized)
            const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

            return new Promise((resolve, reject) => {
                db.run(`
                    INSERT INTO jobs (job_id, module, action, args, status, team_id, owner)
                    VALUES (?, 'CMD', ?, ?, 'RECEIVED', ?, ?)
                `, [jobId, command, JSON.stringify(args), team_id, actor_id], async (err) => {
                    if (err) return reject(err);

                    // 4. Update Chat Message with Job ID (Link Chain)
                    db.run('UPDATE chat_messages SET job_id = ?, is_command = 1 WHERE id = ?', [jobId, chatMsgId]);

                    // 5. Log to Audit Chain (C21)
                    // AuditLogger.log(...) - Integration point

                    console.log(`[ROUTER] Job created: ${jobId} for command ${command}`);

                    // [Step 3.1] Playbook Integration
                    if (command === 'playbook' || command === 'pb') {
                        const pbId = args[0];
                        try {
                            const pbResult = await require('./playbook-engine').execute(pbId, { args }, actor_id, team_id);
                            resolve({
                                status: pbResult.status,
                                job_id: pbResult.job_id,
                                command: `PLAYBOOK_${pbId}`
                            });
                        } catch (e) { resolve({ status: 'ERROR', reason: e.message }); }
                        return;
                    }

                    resolve({
                        status: 'STARTED',
                        job_id: jobId,
                        command: command
                    });
                });
            });

        } catch (e) {
            console.error('[ROUTER_ERR]', e);
            return { status: 'ERROR', reason: e.message };
        }
    }
}

module.exports = new CommandRouter();
