/**
 * M6-2 Tactical RAG - Knowledge & Isolation Test
 */
const fs = require('fs').promises;
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const MemoryManager = require('./modules/memory-manager');
const SecureFS = require('./modules/secure-fs');

const DB_PATH = './uconai.db';

async function test() {
    console.log("=== M6-2 TACTICAL RAG UNIT TEST ===\n");
    const db = new sqlite3.Database(DB_PATH);
    MemoryManager.init(db);
    SecureFS.init(db);

    try {
        // 1. Prepare Workspace
        const workspace = 'C:\\OpenClaw\\workspace\\team_1';
        await fs.mkdir(workspace, { recursive: true });
        await fs.writeFile(path.join(workspace, 'rules.md'), '# SECURITY RULES\n1. Always encrypt.\n2. Never leak keys.', 'utf8');

        // 2. Index via Tools (Mocking context)
        const ctx1 = { user_id: 2, team_id: 1, jobId: 'job_idx_1' };
        console.log("[Action] Indexing 'rules.md' for Team 1...");

        // Use internal learn for test
        await MemoryManager.learn(ctx1.user_id, ctx1.team_id, 'POLICY', 'Always encrypt and never leak keys.', 'security,rules');

        // 3. Query from Team 1
        console.log("[Action] Querying 'encrypt' from Team 1...");
        const results1 = await MemoryManager.searchKnowledge(1, 'encrypt');
        console.log(`   - Found: ${results1.length} matches.`);
        if (results1.length > 0) {
            console.log(`   - Content: ${results1[0].content}`);
            console.log("✅ [PASS] Team 1 recalled own knowledge.");
        }

        // 4. Query from Team 2 (Isolation Check)
        console.log("\n[Action] Querying 'encrypt' from Team 2...");
        const results2 = await MemoryManager.searchKnowledge(2, 'encrypt');
        console.log(`   - Found: ${results2.length} matches.`);
        if (results2.length === 0) {
            console.log("✅ [PASS] Team 2 cannot see Team 1 knowledge.");
        } else {
            console.error("❌ [FAIL] Privacy Leak! Team 2 saw Team 1 memory.");
        }

    } catch (e) {
        console.error("Test Error:", e);
    } finally {
        db.close();
    }
}

test();
