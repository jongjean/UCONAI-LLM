// UCONAI-LLM Phase 7.2: Simple RAG Engine
// Indexes local documentation and retrieves relevant context for AI answers.

const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../../UCONAI-LLM/docs');
const VAULT_ROOT = "C:\\UCONAI-Vault\\context7";
const INDEX_FILE = path.join(__dirname, '../../UCONAI-LLM/data/knowledge_index.json');

class RagEngine {
    constructor() {
        this.index = {};
        this.ensureDataDir();
        this.buildIndex(); // Build on startup
    }

    ensureDataDir() {
        const dataDir = path.dirname(INDEX_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    }

    buildIndex() {
        console.log("[RAG] Building Knowledge Index (Docs + Vault)...");
        this.index = {};

        // 1. Index Local Docs
        if (fs.existsSync(DOCS_DIR)) {
            const files = fs.readdirSync(DOCS_DIR);
            files.forEach(file => {
                if (path.extname(file) === '.md') {
                    const content = fs.readFileSync(path.join(DOCS_DIR, file), 'utf8');
                    this.index[`docs/${file}`] = content;
                }
            });
        }

        // 2. Index Knowledge Vault (raw)
        const rawDir = path.join(VAULT_ROOT, "raw");
        if (fs.existsSync(rawDir)) {
            const projects = fs.readdirSync(rawDir);
            projects.forEach(project => {
                const projectPath = path.join(rawDir, project);
                if (fs.lstatSync(projectPath).isDirectory()) {
                    const files = fs.readdirSync(projectPath);
                    files.forEach(file => {
                        const filePath = path.join(projectPath, file);
                        if (fs.lstatSync(filePath).isFile()) {
                            const content = fs.readFileSync(filePath, 'utf8');
                            this.index[`vault/${project}/${file}`] = content;
                        }
                    });
                }
            });
        }

        // 3. Index System Registry (600+ Apps)
        const registryPath = 'C:\\OpenClaw\\controller\\system-registry.json';
        if (fs.existsSync(registryPath)) {
            try {
                let content = fs.readFileSync(registryPath, 'utf8');
                if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
                const registry = JSON.parse(content);
                // Group apps to keep chunks digestible
                const appSummary = registry.apps.map(app => `${app.name} (${app.id})`).join(', ');
                this.index['system/registry_summary'] = `총 ${registry.apps.length}개의 설치된 앱 요약 목록: ${appSummary}`;

                // Also index individual apps for precise retrieval
                registry.apps.forEach(app => {
                    this.index[`app/${app.id}`] = `앱 이름: ${app.name}, ID: ${app.id}, 경로: ${app.path}, 실행파일: ${app.exec}`;
                });
            } catch (e) { console.error("[RAG] Registry Error:", e); }
        }

        fs.writeFileSync(INDEX_FILE, JSON.stringify({
            generatedAt: new Date().toISOString(),
            count: Object.keys(this.index).length,
            sources: Object.keys(this.index)
        }, null, 2));

        console.log(`[RAG] Indexing Complete. ${Object.keys(this.index).length} documents indexed.`);
    }

    // Searches for keywords in indexed documents
    // Searches for keywords in indexed documents
    retrieve(query) {
        const results = [];
        // Improved tokenizer: split by space and common Korean markers, keep words >= 1 char
        const keywords = query.split(/[\s,._]+/).filter(k => k.length > 0);

        // Add split versions of compound words (e.g., "문서관련" -> "문서", "관련")
        const expandedKeywords = [...keywords];
        keywords.forEach(k => {
            if (k.length > 2) {
                expandedKeywords.push(k.substring(0, 2));
                expandedKeywords.push(k.substring(2));
            }
        });

        // Trigger Broad Search for app-related queries
        const isAppQuery = query.match(/앱|어플|프로그램|소프트웨어|리스트|목록|설치|관련/);

        for (const [filename, content] of Object.entries(this.index)) {
            let score = 0;
            const contentLower = content.toLowerCase();
            const fileLower = filename.toLowerCase();

            expandedKeywords.forEach(k => {
                const kLower = k.toLowerCase();
                if (contentLower.includes(kLower)) score += 2;
                if (fileLower.includes(kLower)) score += 5;
            });

            // Boost registry summary if it's an app query
            if (isAppQuery && filename === 'system/registry_summary') score += 15;

            if (score > 0) {
                results.push({ filename, content, score });
            }
        }

        // Sort by relevance
        results.sort((a, b) => b.score - a.score);

        // Return top snippets (up to 15 for broader context)
        if (results.length > 0) {
            const topResults = results.slice(0, 15);
            const combinedContext = topResults.map(r => `[출처: ${r.filename}]\n${r.content}`).join("\n---\n");

            return {
                found: true,
                count: results.length,
                context: combinedContext.substring(0, 10000)
            };
        }

        return { found: false };
    }
}

module.exports = RagEngine;
