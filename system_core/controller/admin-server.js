const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(path.join(__dirname, 'uconai.db'));

// Modules
const LLM = require('./modules/llm-client');
const TelegramBridgeClass = require('./telegram-bridge');
const CommandRouter = require('./command-router');

const PORT = 3003;
const TG_TOKEN = '8314694161:AAHEMzJPJ1bZ6AyRK9PGxjkyTQfZ2CCBQ1E';

// Initialize Telegram Bridge
const TG = new TelegramBridgeClass(TG_TOKEN);

// HTTP Server
const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/' || req.url === '/index.html') {
        const filePath = path.join(__dirname, 'admin_dashboard.html');
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading dashboard');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
            }
        });
    } else if (req.url === '/api/playbook/list') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'OK', playbooks: require('./playbook-engine').PLAYBOOK_DEFS || {} }));
    } else if (req.url === '/api/playbook/run' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                // In a real app, actor/team would come from session/API key
                const result = await require('./playbook-engine').execute(data.id, data.params || {}, 1, 0);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (e) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: e.message }));
            }
        });
    } else if (req.url === '/api/playbook/approve' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const result = await require('./playbook-engine').approve(data.jobId, 1);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (e) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: e.message }));
            }
        });
    } else if (req.url === '/api/ai/memory' && req.method === 'GET') {
        db.get('SELECT content FROM ai_long_term_memory WHERE team_id = 0', (err, row) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ content: row ? row.content : '' }));
        });
    } else if (req.url === '/api/ai/memory' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                db.run(`
                    INSERT INTO ai_long_term_memory (team_id, content, updated_at) 
                    VALUES (0, ?, CURRENT_TIMESTAMP)
                    ON CONFLICT(team_id) DO UPDATE SET 
                        content = excluded.content,
                        updated_at = CURRENT_TIMESTAMP
                `, [data.content], (err) => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: err ? 'ERROR' : 'OK' }));
                });
            } catch (e) { res.writeHead(400); res.end(); }
        });
    } else if (req.url === '/api/remote/list') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'OK', tools: require('./remote-operator').getTools() }));
    } else if (req.url === '/api/linux/full-scan') {
        const { exec } = require('child_process');
        // Command Chain Updated:
        // 1. CPU (top), 2. GPU, 3. Memory, 4. Ports, 5. Storage, 6. Web Hits & Active Conn, 7. Projects, 8. Processes
        const cmd = `ssh -o BatchMode=yes -o ConnectTimeout=8 uconai-main "export LC_ALL=C; export PATH=$PATH:/usr/local/cuda/bin:/usr/bin:/usr/sbin; top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\\([0-9.]*\\)%* id.*/\\1/'; echo '---SEP---'; if command -v nvidia-smi &> /dev/null; then nvidia-smi --query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,noheader,nounits; else echo 'N/A'; fi; echo '---SEP---'; free -m; echo '---SEP---'; ss -tulnp; echo '---SEP---'; df -h --output=source,size,used,avail,pcent,target -x tmpfs -x devtmpfs -x squashfs; echo '---SEP---'; if [ -r /var/log/nginx/access.log ]; then grep -c \\"$(date '+%d/%b/%Y')\\" /var/log/nginx/access.log; else echo 'ACCESS_DENIED'; fi; echo '|'; ss -tan state established | grep -E ':(80|443) ' | wc -l; echo '---SEP---'; ls -F /var/www/ 2>/dev/null | grep /$ | grep -v 'backup/' | grep -v 'html/'; echo '---SEP---'; ps -Ao pid,user,comm,%cpu,%mem --sort=-%mem | head -n 21"`;

        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: stderr || err.message }));
                return;
            }

            try {
                const parts = stdout.split('---SEP---');

                // 1. CPU
                const idleStr = parts[0].trim();
                const idle = parseFloat(idleStr);
                const cpuUsage = isNaN(idle) ? 0 : (100 - idle).toFixed(1);

                // 2. GPU
                const gpuRaw = parts[1].trim();
                let gpu = null;
                if (gpuRaw !== 'N/A' && gpuRaw.length > 0) {
                    const gParts = gpuRaw.split(',').map(s => s.trim());
                    gpu = {
                        name: gParts[0],
                        util: gParts[1],
                        memUsed: gParts[2],
                        memTotal: gParts[3],
                        temp: gParts[4]
                    };
                }

                // 3. Memory
                const memLines = parts[2].trim().split('\n');
                const memVals = memLines[1].split(/\s+/);
                const memory = {
                    total: parseInt(memVals[1]),
                    used: parseInt(memVals[2]),
                    free: parseInt(memVals[3]),
                    available: parseInt(memVals[6] || memVals[3])
                };

                // 4. Ports & Apps (with Fallback)
                const portLines = parts[3].trim().split('\n').slice(1);
                const KNOWN_PORTS = {
                    '22': 'sshd', '80': 'nginx', '443': 'nginx',
                    '3000': 'Node.js', '3306': 'MySQL', '5432': 'PostgreSQL',
                    '6379': 'Redis', '8080': 'Tomcat', '27017': 'MongoDB',
                    '9000': 'Portainer', '9001': 'Portainer'
                };
                const ports = portLines
                    .filter(l => l.includes('LISTEN') || l.includes('UNCONN'))
                    .map(line => {
                        const cols = line.trim().split(/\s+/);
                        const localAddr = cols[4] || '';
                        const port = localAddr.split(':').pop();

                        let app = 'Unknown';
                        const match = line.match(/users:\(\("([^"]+)"/);
                        if (match && match[1]) app = match[1];
                        else if (KNOWN_PORTS[port]) app = KNOWN_PORTS[port];

                        return { proto: cols[0], port: port, state: cols[1], addr: localAddr, app: app };
                    })
                    .sort((a, b) => parseInt(a.port) - parseInt(b.port));

                // 5. Storage
                const diskLines = parts[4].trim().split('\n').slice(1);
                const storage = diskLines.map(l => {
                    const c = l.trim().split(/\s+/);
                    return { fs: c[0], size: c[1], used: c[2], avail: c[3], pcent: c[4], mount: c[5] };
                });

                // 6. Web Hits & Active
                const webParts = parts[5].trim().split('|');
                const hitsRaw = webParts[0].trim();
                let webHits = parseInt(hitsRaw); // could be NaN if 'ACCESS_DENIED'
                if (isNaN(webHits)) webHits = -1; // -1 indicates permission error
                const activeConn = parseInt(webParts[1] || '0');

                // 7. Projects
                const projRaw = parts[6].trim();
                const projects = projRaw ? projRaw.split('\n').map(s => s.replace('/', '')) : [];

                // 8. Processes
                const procLines = parts[7].trim().split('\n').slice(1);
                const processes = procLines.map(line => {
                    const cols = line.trim().split(/\s+/);
                    return {
                        pid: cols[0],
                        user: cols[1],
                        name: cols[2],
                        cpu: cols[3],
                        mem: cols[4]
                    };
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    cpu: cpuUsage, gpu, memory, ports, storage,
                    webHits: webHits, activeConn: activeConn,
                    projects, processes
                }));
            } catch (pErr) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Parse Error: ' + pErr.message }));
            }
        });
    } else if (req.url === '/api/system/full-scan') {
        const op = require('./remote-operator');
        Promise.all([
            op.execute('system_vitals', {}, 1),
            op.execute('process_all_info', {}, 1),
            op.execute('gpu_usage', {}, 1),
            op.execute('gpu_full_status', {}, 1),
            op.execute('storage_scan', {}, 1),
            op.execute('port_status', {}, 1),
            db.allAsync ? db.allAsync('SELECT * FROM job_logs WHERE level="ERROR" ORDER BY created_at DESC LIMIT 10') :
                new Promise(resolve => db.all('SELECT * FROM job_logs WHERE level="ERROR" ORDER BY created_at DESC LIMIT 10', (err, rows) => resolve(rows || [])))
        ]).then(([vitals, processes, gpu, gpuFull, storage, ports, logs]) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                vitals: JSON.parse(vitals.output || '{}'),
                processes: JSON.parse(processes.output || '[]'),
                gpu: JSON.parse(gpu.output || '[]'),
                gpuFull: JSON.parse(gpuFull.output || '{}'),
                storage: storage.output,
                ports: ports.output,
                recentErrors: logs
            }));
        }).catch(e => {
            res.writeHead(500);
            res.end(JSON.stringify({ error: e.message }));
        });
    } else if (req.url === '/api/remote/exec' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const result = await require('./remote-operator').execute(data.toolId, data.params || {}, 1);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (e) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: e.message }));
            }
        });
    } else if (req.url.startsWith('/api/audit/chain')) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const correlationId = url.searchParams.get('cid');

        db.get(`
            SELECT m.*, j.status as job_status, j.result as job_result
            FROM chat_messages m
            LEFT JOIN jobs j ON m.job_id = j.job_id
            WHERE m.correlation_id = ?
        `, [correlationId], (err, row) => {
            if (err || !row) {
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'CHAIN_NOT_FOUND' }));
                return;
            }
            db.all('SELECT level, message, created_at FROM job_logs WHERE job_id = ? ORDER BY created_at ASC', [row.job_id], (err, logs) => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ chain: row, logs: logs || [] }));
            });
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

// [D1] WebSocket Server (Port 3003 Integrated)
const wss = new WebSocket.Server({ server });
const clients = new Map(); // actor_id -> ws

// Unified Message Processor
async function handleInboundMessage(teamId, chatEntry) {
    // 1. Broadcast to all clients in the team
    broadcastToTeam(teamId, { type: 'chat', message: chatEntry });

    // 2. Outbound Sync: Web -> Telegram
    if (chatEntry.channel === 'WEB') {
        TG.sendToTeam(teamId, `👤 [강박사님] ${chatEntry.text}`);
    }

    // 3. Command Routing (Step 1.4)
    if (chatEntry.text.startsWith('/')) {
        const result = await CommandRouter.route(chatEntry);
        if (result) {
            const systemMsg = `[SYSTEM] ${result.status}: ${result.job_id || result.reason}`;
            broadcastToTeam(teamId, { type: 'system', text: systemMsg });
            TG.sendToTeam(teamId, `🚀 Command ${result.status}\n${result.job_id ? 'Job ID: ' + result.job_id : 'Reason: ' + result.reason}`);
        }
    } else if (chatEntry.channel !== 'AI' && chatEntry.channel !== 'API') {
        // 4. AI Assistant Response (General Chat)
        try {
            // 4.1 Auto-Memory Trigger (Real-time Sync)
            if (chatEntry.text.match(/이거 기억해|기억해둬|영구 저장해/)) {
                const newFact = chatEntry.text.replace(/이거 기억해|기억해둬|영구 저장해/g, '').trim();
                if (newFact) {
                    await new Promise(resolve => {
                        db.run(`UPDATE ai_long_term_memory SET content = content || '\n' || ?, updated_at = CURRENT_TIMESTAMP WHERE team_id = ?`, [newFact, teamId], (err) => {
                            if (!err) broadcastToTeam(teamId, { type: 'memory_update' });
                            resolve();
                        });
                    });
                }
            }

            // Fetch Long-Term Memory (Permanent Directives)
            const ltMemory = await new Promise(resolve => {
                db.get('SELECT content FROM ai_long_term_memory WHERE team_id = ?', [teamId], (err, row) => {
                    resolve(row ? row.content : '');
                });
            });

            // Fetch expanded short-term history (50 messages for better focus)
            const historyRows = await new Promise(resolve => {
                db.all(`SELECT channel, text FROM chat_messages WHERE team_id = ? ORDER BY id DESC LIMIT 50`, [teamId], (err, rows) => {
                    resolve(err ? [] : rows.reverse());
                });
            });

            // Identity-aware history labeling
            let historyText = historyRows.map(r => {
                const label = r.channel === 'API' ? '유코나이(AI)' : '강박사님(User)';
                return `${label}: ${r.text}`;
            }).join('\n');

            // [Step 1.7] Context injection for system queries (C11 Context Contract)
            let systemContext = "";
            const op = require('./remote-operator');
            const isSystemQuery = chatEntry.text.match(/시스템|상태|현황|분석|status|브리핑|체크|조사|보고|리스트|목록/i);
            const isAppQuery = chatEntry.text.match(/앱|프로그램|소프트웨어|app|software/i);
            const isPortQuery = chatEntry.text.match(/포트|port|네트워크|통신/i);
            const isDiskQuery = chatEntry.text.match(/저장장치|디스크|용량|disk|storage/i);
            const isLoadQuery = chatEntry.text.match(/부하|프로세스|CPU|점유율|process/i);

            if (isSystemQuery || isAppQuery || isPortQuery || isDiskQuery || isLoadQuery) {
                const os = require('os');
                const mem = process.memoryUsage();
                const sysData = {
                    platform: os.platform(),
                    release: os.release(),
                    cpus: os.cpus().length,
                    totalMem: Math.round(os.totalmem() / 1024 / 1024 / 1024) + 'GB',
                    rss: Math.round(mem.rss / 1024 / 1024) + 'MB',
                    uptime: Math.floor(process.uptime()) + 's'
                };
                systemContext = `[실시간 하이퍼바이저 기본 데이터: ${JSON.stringify(sysData)}]\n`;

                // Advanced real-time scanning (Flattened triggers)
                if (isAppQuery) {
                    const r = await op.execute('app_list', {}, 1);
                    systemContext += `[실시간 설치 앱 스캔 결과]:\n${r.output}\n`;
                }
                if (isPortQuery) {
                    const r = await op.execute('port_status', {}, 1);
                    systemContext += `[실시간 포트 감시 결과]:\n${r.output}\n`;
                }
                if (isDiskQuery) {
                    const r = await op.execute('storage_scan', {}, 1);
                    systemContext += `[실시간 저장장치 인벤토리]:\n${r.output}\n`;
                }
                if (isLoadQuery) {
                    const r = await op.execute('cpu_top', {}, 1);
                    systemContext += `[실시간 프로세스 부하 분석]:\n${r.output}\n`;
                }
            }

            // [Step 1.8] External Connectivity: Weather Fetch
            if (chatEntry.text.match(/날씨|기온|weather/i)) {
                try {
                    const weather = await require('./remote-operator').execute('weather', { city: 'Seoul' }, 1);
                    systemContext += `[실시간 외부 정보(날씨): ${weather.output.trim()}]\n`;
                } catch (e) {
                    systemContext += `[실시간 정보 알림: 현재 날씨 서비스를 일시적으로 이용할 수 없습니다.]\n`;
                }
            }

            const fullPrompt = `당신은 '유코나이(UCONAI)'입니다. 

[⚠️ 지능형 비서 지침]
1. (중요) "안녕하세요", "강박사님 안녕하세요"와 같은 인사를 절대 하지 마십시오.
2. (중요) "제 이름은 유코나이입니다"와 같은 자기소개는 이름을 물어볼 때만 하십시오.
3. 답변은 불필요한 서술 없이 즉시 '본론'부터 시작하십시오.
4. 사용자는 '강박사님'입니다.

[절대 우선: 영구 지침 (RAG Memory)]
아래 내용은 강박사님이 당신의 뇌에 직접 각인시킨 최신 지침입니다.
${ltMemory}

[대화 흐름 참고]
${historyText}

${systemContext}
- 불필요한 서술을 배제하고 강박사님의 질문에 대한 정답이나 결과 위주로 번호를 붙여 답변하세요.
- (중요) 각 번호 항목이 끝날 때마다 반드시 줄바꿈(NEWLINE)을 추가하여 가독성을 확보하십시오.
- 마크다운 기호를 절대 사용하지 않습니다.

[현재 강박사님의 메시지]
${chatEntry.text}`;

            let aiResponse = await LLM.generate(fullPrompt, 'CHAT');

            // Post-process: Strip ALL markdown artifacts (Aggressive)
            aiResponse = aiResponse.replace(/\*\*|__|[*_#`|>\[\]]/g, '').trim();

            const aiCorrelationId = `resp_${chatEntry.correlation_id}`;
            db.run(`INSERT INTO chat_messages (correlation_id, channel, actor_id, team_id, text) VALUES (?, 'API', 1, ?, ?)`,
                [aiCorrelationId, teamId, aiResponse], function (err) {
                    if (err) return;

                    const aiChatEntry = {
                        id: this.lastID,
                        correlation_id: aiCorrelationId,
                        channel: 'API',
                        actor_id: 1,
                        username: 'UCONAI_ASSISTANT',
                        text: aiResponse,
                        created_at: new Date().toISOString()
                    };

                    broadcastToTeam(teamId, { type: 'chat', message: aiChatEntry });
                    TG.sendToTeam(teamId, `🤖 [유코나이] ${aiResponse}`);
                });
        } catch (e) {
            console.error('[AI_ERR]', e);
        }
    }
}

// [Step 1.3] Connect TG Bridge to Unified Processor
TG.setBroadcastCallback((teamId, payload) => {
    if (payload.type === 'chat') {
        handleInboundMessage(teamId, payload.message);
    } else {
        broadcastToTeam(teamId, payload);
    }
});

wss.on('connection', async (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const apiKey = url.searchParams.get('key');

    if (!apiKey) {
        ws.close(4001, 'API_KEY_REQUIRED');
        return;
    }

    db.get('SELECT id, team_id, username, role FROM users WHERE api_key = ?', [apiKey], (err, user) => {
        if (err || !user) {
            ws.close(4003, 'UNAUTHORIZED');
            return;
        }

        ws.user = user;
        clients.set(user.id, ws);
        console.log(`[WS] Active Session: ${user.username} (Team ${user.team_id})`);

        // History Replay
        db.all(`
            SELECT m.*, u.username 
            FROM chat_messages m
            JOIN users u ON m.actor_id = u.id
            WHERE m.team_id = ? 
            ORDER BY m.created_at DESC LIMIT 50
        `, [user.team_id], (err, rows) => {
            if (!err) ws.send(JSON.stringify({ type: 'history', messages: rows.reverse() }));
        });

        // 1-B/1-D: Message Inbound & Routing
        ws.on('message', async (data) => {
            try {
                const msg = JSON.parse(data);
                if (msg.type === 'chat') {
                    const correlationId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

                    db.run(`
                        INSERT INTO chat_messages (correlation_id, channel, actor_id, team_id, text)
                        VALUES (?, 'WEB', ?, ?, ?)
                    `, [correlationId, user.id, user.team_id, msg.text], async function (err) {
                        if (err) return;


                        const chatEntry = {
                            id: this.lastID,
                            correlation_id: correlationId,
                            channel: 'WEB',
                            actor_id: user.id,
                            username: user.username,
                            text: msg.text,
                            created_at: new Date().toISOString()
                        };

                        // Use the unified processor for commands, AI, and broadcasting
                        handleInboundMessage(user.team_id, chatEntry);
                    });
                }

            } catch (e) { console.error('[WS_ERR]', e); }
        });

        ws.on('close', () => clients.delete(user.id));
    });
});

function broadcastToTeam(teamId, data) {
    const payload = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client.user?.team_id === teamId) {
            client.send(payload);
        }
    });
}

// [Step 1.5] Approval Watcher (Simple Polling for v1.0)
setInterval(() => {
    db.all('SELECT * FROM approval_requests WHERE status = "PENDING"', [], (err, rows) => {
        if (err || !rows) return;
        rows.forEach(async (req) => {
            // Broadcast to WEB
            broadcastToTeam(0, { type: 'approval_required', data: req });

            // Push to TG if not already pushed (idempotency via custom field or separate table)
            // For v1.0, we just ensure the router/bridge handles the UI cards
        });
    });
}, 5000);

// Start
TG.init();
server.listen(PORT, () => {
    console.log(`[DASHBOARD] UCONAI Command Center v1.0 (PROD_GRADE) listening on port ${PORT}`);
});
