/**
 * Quick Dashboard Server (M4-4.3)
 * 
 * Serves dashboard.html and provides read-only API to audit logs and quotas.
 * Runs on Port 3002 to avoid conflict with Core (3001).
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = './uconai.db';
const PORT = 3002;

// Connect to DB (Read-Only mode ideally, but default is fine as we only query)
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE, (err) => {
    if (err) console.error('DB Connection FAIL:', err.message);
    else console.log('Connected to UCONAI database.');
});

const server = http.createServer((req, res) => {
    // 1. Serve Dashboard HTML
    if (req.url === '/' || req.url === '/dashboard.html') {
        fs.readFile(path.join(__dirname, 'public', 'dashboard.html'), (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading dashboard');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
            }
        });
        return;
    }

    // 2. API: Quotas
    if (req.url === '/api/quotas') {
        const today = new Date().toISOString().split('T')[0];
        db.all("SELECT * FROM daily_quotas WHERE date = ?", [today], (err, rows) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(rows));
            }
        });
        return;
    }

    // 3. API: Audit Logs
    if (req.url === '/api/audit-logs') {
        // Get last 20 logs
        db.all("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 20", [], (err, rows) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(rows));
            }
        });
        return;
    }

    // 4. API: User Stats (M5-2)
    if (req.url === '/api/user-stats') {
        db.all("SELECT owner, COUNT(*) as count FROM jobs GROUP BY owner", [], (err, rows) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(rows));
            }
        });
        return;
    }

    // 5. API: Team Quota Stats (M5-3)
    if (req.url === '/api/team-stats') {
        const today = new Date().toISOString().split('T')[0];
        const query = `
            SELECT t.team_name, t.daily_quota as limit_val, IFNULL(q.job_count, 0) as used
            FROM teams t
            LEFT JOIN daily_quotas q ON q.target_id = CAST(t.id AS TEXT) AND q.target_type = 'TEAM' AND q.date = ?
        `;
        db.all(query, [today], (err, rows) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(rows));
            }
        });
        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`Dashboard running at http://localhost:${PORT}`);
});
