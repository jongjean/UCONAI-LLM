const http = require("http");
const fs = require("fs");
const { exec } = require("child_process");
const TaskPlanner = require("./task-planner");
const WorkflowEngine = require("./workflow-engine");
const PatternLearner = require("./pattern-learner");
const RagEngine = require("./rag-engine");
const Gatekeeper = require("./gatekeeper");
const AuditLogger = require("./audit-logger");

const planner = new TaskPlanner();
const learner = new PatternLearner();
const rag = new RagEngine();
const gatekeeper = new Gatekeeper();
const audit = new AuditLogger();
const workflow = new WorkflowEngine("http://localhost:18083", "http://localhost:18088");

const CHAT_HISTORY_PATH = "C:\\UCONAI-LLM\\data\\chat_history.json";
const MASTER_DIRECTIVE_PATH = "C:\\UCONAI-LLM\\data\\MASTER_DIRECTIVES.md";

const saveHistory = (role, content) => {
    try {
        let history = [];
        if (fs.existsSync(CHAT_HISTORY_PATH)) {
            history = JSON.parse(fs.readFileSync(CHAT_HISTORY_PATH, "utf8"));
        }
        history.push({
            role: role,
            content: content,
            time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
        if (history.length > 50) history = history.slice(-50);
        fs.writeFileSync(CHAT_HISTORY_PATH, JSON.stringify(history, null, 2), "utf8");
    } catch (e) {
        console.error("History Error:", e);
    }
};

const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok" }));
        return;
    }

    if (req.url === "/api/history") {
        const history = fs.existsSync(CHAT_HISTORY_PATH) ? JSON.parse(fs.readFileSync(CHAT_HISTORY_PATH, "utf8")) : [];
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(history));
        return;
    }

    if (req.url === "/api/directive" && req.method === "GET") {
        const content = fs.existsSync(MASTER_DIRECTIVE_PATH) ? fs.readFileSync(MASTER_DIRECTIVE_PATH, "utf8") : "";
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ content }));
        return;
    }

    if (req.url === "/api/directive" && req.method === "POST") {
        let body = "";
        req.on("data", c => body += c);
        req.on("end", () => {
            const { content } = JSON.parse(body);
            fs.writeFileSync(MASTER_DIRECTIVE_PATH, content, "utf8");
            res.writeHead(200); res.end();
        });
        return;
    }

    if (req.url === "/chat" && req.method === "POST") {
        let body = "";
        req.on("data", c => body += c);
        req.on("end", async () => {
            const data = JSON.parse(body);
            const userMsg = data.message || "";
            const isSync = data.isSync || false;

            if (!isSync) saveHistory("USER", userMsg);

            let responseText = "";
            const tempIntent = planner.identifyTask(userMsg);

            if (tempIntent && ["restart", "execute_app", "vision_analysis"].includes(tempIntent.type)) {
                const plan = planner.createPlan({ tasks: [tempIntent], original: userMsg });
                const result = await workflow.executeWorkflow(plan);
                responseText = `명령 수행 결과: ${JSON.stringify(result)}`;
            } else {
                const knowledge = rag.retrieve(userMsg);
                const prompt = knowledge.found ? `지식베이스: ${knowledge.context}\n질문: ${userMsg}` : userMsg;

                try {
                    const ollamaRes = await fetch("http://localhost:11434/api/generate", {
                        method: "POST",
                        body: JSON.stringify({
                            model: "qwen3:8b",
                            prompt: prompt,
                            stream: false,
                            system: "너는 UCONAI이다. 정중하게 답하되 마크다운 기호를 절대 쓰지 말고 순수 텍스트로만 답하라."
                        })
                    });
                    const aiResult = await ollamaRes.json();
                    responseText = aiResult.response.replace(/[#*_\-`>()[\]\\=~|]/g, '').trim();
                } catch (e) {
                    responseText = "지능 엔진 연결 실패";
                }
            }

            saveHistory("UCONAI", responseText);
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ answer: responseText }));
        });
        return;
    }

    res.writeHead(404); res.end();
});

server.listen(18081, () => {
    console.log("Bridge running on 18081 with Sync History Support");
});