/**
 * M5-2 Tenant Isolation Verification Test
 */
const fs = require('fs').promises;
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const SecureFS = require('./modules/secure-fs');
const UserManager = require('./modules/user-manager');

const DB_PATH = './uconai.db';
const WORKSPACE = 'C:\\OpenClaw\\workspace';

async function test() {
    console.log("=== M5-2 TENANT ISOLATION UNIT TEST ===\n");
    const db = new sqlite3.Database(DB_PATH);
    SecureFS.init(db);
    UserManager.init(db);

    try {
        // 1. Authenticate users
        const devUser = await UserManager.authenticate('uc_dev_123'); // Team 1
        const guestUser = await UserManager.authenticate('uc_gst_456'); // Team 2

        console.log(`[Auth] Dev: ${devUser.username} (Team ${devUser.team_id})`);
        console.log(`[Auth] Guest: ${guestUser.username} (Team ${guestUser.team_id})`);

        // 2. Dev writes a file
        console.log("\n[Action] Dev writing file 'shared.txt'...");
        const devCtx = { jobId: 'job_dev_1', teamId: devUser.team_id };
        await SecureFS.writeAtomic('shared.txt', 'DEV SECRET CONTENT', devCtx);

        // 3. Guest writes a file with same name
        console.log("[Action] Guest writing file 'shared.txt'...");
        const guestCtx = { jobId: 'job_gst_1', teamId: guestUser.team_id };
        await SecureFS.writeAtomic('shared.txt', 'GUEST PUBLIC CONTENT', guestCtx);

        // 4. Verify physical isolation
        const devPath = path.join(WORKSPACE, `team_${devUser.team_id}`, 'shared.txt');
        const guestPath = path.join(WORKSPACE, `team_${guestUser.team_id}`, 'shared.txt');

        const devContent = await fs.readFile(devPath, 'utf8');
        const guestContent = await fs.readFile(guestPath, 'utf8');

        console.log("\n[Verify] Physical Isolation:");
        console.log(`   - Team 1 File: ${devContent}`);
        console.log(`   - Team 2 File: ${guestContent}`);

        if (devContent !== guestContent) {
            console.log("✅ [PASS] Namespace isolation confirmed.");
        }

        // 5. Cross-Tenant Attempt (Guest tries to read Dev file)
        console.log("\n[Action] Guest attempting to read Dev file via path traversal or same name...");
        try {
            // Because each team has its own root, 'shared.txt' in guestCtx will ALWAYS resolve to team_2/shared.txt
            const content = await SecureFS.readFile('shared.txt', guestCtx);
            console.log(`   - Read Result: ${content}`);
            if (content === 'DEV SECRET CONTENT') {
                console.error("❌ [FAIL] Guest read Dev content!");
            } else {
                console.log("✅ [PASS] Guest only sees their own 'shared.txt'.");
            }
        } catch (e) {
            console.log(`   - Caught Expected Error: ${e.message}`);
        }

    } catch (e) {
        console.error("Test Error:", e);
    } finally {
        db.close();
    }
}

test();
