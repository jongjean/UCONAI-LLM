/**
 * M4-5 Rollback Validation Test
 * 
 * Objective: Verify that SecureFS can correctly revert files using transaction logs.
 */
const fs = require('fs').promises;
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const SecureFS = require('./modules/secure-fs');

const DB_PATH = './uconai.db';
const WORKSPACE = 'C:\\OpenClaw\\workspace';
const TEST_FILE = 'rollback_test.txt';
const JOB_ID = 'job_rollback_test_' + Date.now();

async function test() {
    console.log("=== M4-5 ROLLBACK UNIT TEST ===\n");
    const db = new sqlite3.Database(DB_PATH);
    SecureFS.init(db);

    try {
        // 1. Setup - Create Workspace if not exists
        await fs.mkdir(WORKSPACE, { recursive: true });
        const filePath = path.join(WORKSPACE, TEST_FILE);

        // 2. Phase A: Create initial file
        console.log("[Phase A] Creating initial content...");
        await fs.writeFile(filePath, "ORIGINAL CONTENT", 'utf8');

        // 3. Phase B: Overwrite with Transaction Logging
        console.log("[Phase B] Overwriting file (Job: " + JOB_ID + ")...");
        await SecureFS.writeAtomic(TEST_FILE, "MALICIOUS CONTENT", JOB_ID);

        const overwritten = await fs.readFile(filePath, 'utf8');
        console.log("   Current state: " + overwritten);

        // 4. Phase C: Rollback
        console.log("[Phase C] Triggering Rollback...");
        const result = await SecureFS.rollbackJob(JOB_ID);
        console.log(`   Result: ${result.changes} files restored.`);

        // 5. Phase D: Verify
        const restored = await fs.readFile(filePath, 'utf8');
        console.log("   Verifying content: " + restored);

        if (restored === "ORIGINAL CONTENT") {
            console.log("\n✅ [PASS] Rollback successful! Content integrity restored.");
        } else {
            console.error("\n❌ [FAIL] Rollback failed. Content mismatch.");
        }

    } catch (e) {
        console.error("Test Error:", e);
    } finally {
        db.close();
    }
}

test();
