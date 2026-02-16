const http = require('http');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const PORT = 18081;
const MASTER_DIRECTIVE_PATH = 'C:\\UCONAI-LLM\\data\\MASTER_DIRECTIVES.md';

// Helper to send JSON responses
const sendJson = (res, status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(data));
};

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

    // API: Get Master Directive
    if (req.url === '/api/directive' && req.method === 'GET') {
        try {
            if (!fs.existsSync(MASTER_DIRECTIVE_PATH)) fs.writeFileSync(MASTER_DIRECTIVE_PATH, '');
            const content = fs.readFileSync(MASTER_DIRECTIVE_PATH, 'utf8');
            sendJson(res, 200, { content });
        } catch (e) { sendJson(res, 500, { error: e.message }); }
        return;
    }

    // API: Save Master Directive
    if (req.url === '/api/directive' && req.method === 'POST') {
        let body = '';
        req.on('data', c => body += c);
        req.on('end', () => {
            try {
                const { content } = JSON.parse(body);
                fs.writeFileSync(MASTER_DIRECTIVE_PATH, content, 'utf8');
                sendJson(res, 200, { success: true });
            } catch (e) { sendJson(res, 500, { error: e.message }); }
        });
        return;
    }

    // API: Rebuild Knowledge Index
    if (req.url === '/api/reindex' && req.method === 'POST') {
        const script = 'C:\\UCONAI-LLM\\modules\\knowledge-engine\\ucon_vault_index.ps1';
        exec(\powershell.exe -ExecutionPolicy Bypass -File \
\\\, (err, stdout, stderr) => {
            sendJson(res, 200, { success: !err, stdout, stderr });
        });
        return;
    }

    // ORIGINAL CHAT LOGIC (PLACEHOLDER FOR FULL RESTORE)
    if (req.url === '/chat') { /* Existing chat processing */ }
});

// Since I cannot rewrite the entire ai-bridge.js easily while maintaining all logic,
// I am providing these endpoint fragments to be merged.

