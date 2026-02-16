/**
 * M4-4.2 QuotaManager Unit Test
 * 
 * Objective: Verify daily job limit enforcement using SQLite.
 */
const sqlite3 = require('sqlite3').verbose();
const QuotaManager = require('./modules/quota-manager');
const assert = require('assert');

// Setup independent test DB
const db = new sqlite3.Database(':memory:');

async function test() {
    console.log("=== M4-4.2 QUOTA DB TEST ===\n");
    let passed = 0;
    let failed = 0;

    function expect(name, actual, expected) {
        if (actual === expected) {
            console.log(`✅ [PASS] ${name}`);
            passed++;
        } else {
            console.error(`❌ [FAIL] ${name} - Expected ${expected}, Got ${actual}`);
            failed++;
        }
    }

    try {
        // 1. Init
        QuotaManager.init(db);

        // Wait for table creation (init is async but fire-and-forget in code, usually fast enough)
        await new Promise(r => setTimeout(r, 500));

        // 2. GUEST Quota Test (Limit: 10)
        console.log('[Test] GUEST Quota (Limit: 10)');
        for (let i = 1; i <= 10; i++) {
            const allowed = await QuotaManager.checkAndIncrement('GUEST');
            if (allowed) process.stdout.write('.');
            else {
                console.error(`\n❌ [FAIL] Blocked prematurely at request ${i}`);
                failed++;
            }
        }
        console.log(' (10 requests sent)');

        // 11th Request should fail
        const blocked = await QuotaManager.checkAndIncrement('GUEST');
        expect('11th GUEST request blocked', blocked, false);

        // Check stored count
        const count = await QuotaManager.getUsage('GUEST');
        expect('GUEST usage count', count, 10);


        // 3. DEV Quota Test (Limit: 100) - Should be independent
        console.log('\n[Test] DEV Quota (Limit: 100)');
        const devAllowed = await QuotaManager.checkAndIncrement('DEV');
        expect('First DEV request allowed', devAllowed, true);

        const devCount = await QuotaManager.getUsage('DEV');
        expect('DEV usage count', devCount, 1);

        // 4. ADMIN Quota Test (Unlimited)
        console.log('\n[Test] ADMIN Quota (Unlimited)');
        const adminAllowed = await QuotaManager.checkAndIncrement('ADMIN');
        expect('ADMIN request allowed', adminAllowed, true);

        // Usage for ADMIN might be 0 or null depending on implementation
        // Since getUsage queries the table, and ADMIN likely doesn't insert into table (return true early)
        // Let's check code:
        // if (!rolePolicy || !rolePolicy.quotas) return true; // No quota = allowed (e.g. ADMIN)
        // So ADMIN does NOT track usage in DB.
        const adminCount = await QuotaManager.getUsage('ADMIN');
        expect('ADMIN usage tracked?', adminCount, 0);

    } catch (e) {
        console.error('Test Crashed:', e);
        failed++;
    }

    console.log(`\n[Summary] Passed: ${passed} | Failed: ${failed}`);
}

test();
