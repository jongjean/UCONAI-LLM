const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'uconai.db'));

// Mock identity: root user (123456789) in ROOT_TEAM (0)
const teamId = 0;
const actorId = 1;
const username = 'root (TG_MOCK)';
const text = process.argv[2] || 'Hello from Simulated Telegram!';

const correlationId = `tg_mock_${Date.now()}`;

db.run(`
    INSERT INTO chat_messages (correlation_id, channel, source_chat_id, source_msg_id, actor_id, team_id, text)
    VALUES (?, 'TG', '-1000000000000', 'mock_msg', ?, ?, ?)
`, [correlationId, actorId, teamId, text], function (err) {
    if (err) {
        console.error('Error inserting mock message:', err.message);
        return;
    }
    console.log(`✅ Mock TG Message inserted: "${text}"`);
    console.log('If the Dashboard is open, you should see this message sync via History Replay or Broadcast.');

    // Note: To see it live without refresh, the admin-server should be watching the DB.
    // In our current implementation, only real bot events or WS events trigger a broadcast.
    // For v1.0, history replay on refresh will show this.
});
