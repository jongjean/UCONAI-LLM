/**
 * M4-3.1 Sandbox Validation Test
 * 
 * Objective: Verify SecureFS policy enforcement without disturbing Core.
 */
const SecureFS = require('./modules/secure-fs');
const assert = require('assert');

async function test() {
    console.log("=== M4-3.1 SANDBOX UNIT TEST ===\n");
    let passed = 0;
    let failed = 0;

    // Helper
    async function expect(name, promise, shouldSucceed, expectedError = null) {
        try {
            await promise;
            if (shouldSucceed) {
                console.log(`✅ [PASS] ${name}`);
                passed++;
            } else {
                console.error(`❌ [FAIL] ${name} - Expected failure but succeeded`);
                failed++;
            }
        } catch (e) {
            if (!shouldSucceed && (!expectedError || e.message.includes(expectedError))) {
                console.log(`✅ [PASS] ${name} - Blocked as expected (${e.message})`);
                passed++;
            } else {
                console.error(`❌ [FAIL] ${name} - Unexpected error: ${e.message}`);
                failed++;
            }
        }
    }

    // 1. Valid Access
    await expect('Read Valid File', SecureFS.readFile('test/config.json'), true);
    await expect('Write Valid File', SecureFS.writeFile('test/output.txt', 'Hello Sandbox'), true);

    // 2. Path Traversal
    await expect('Block Traversal (..)', SecureFS.readFile('../config/security-policy.js'), false, 'escapes sandbox root');

    // 3. Root Escape (Absolute Path)
    await expect('Block Absolute Path Escape', SecureFS.readFile('C:\\Windows\\System32\\drivers\\etc\\hosts'), false, 'escapes sandbox root');

    // 4. Forbidden Pattern
    await expect('Block .env check', SecureFS.readFile('test/.env'), false, 'Forbidden pattern');

    // 5. Invalid Extension (M4-3.1 Check)
    await expect('Block .exe extension', SecureFS.writeFile('test/malware.exe', 'BINARY'), false, 'Extension \'.exe\' not allowed');

    // 6. Atomic Write & Rollback (M4-3.2)
    console.log('\n[M4-3.2 Atomic Test]');

    // Step 1: Initial Write
    await SecureFS.writeFile('test/atomic.txt', 'VERSION_1');
    const v1 = await SecureFS.readFile('test/atomic.txt');
    if (v1 === 'VERSION_1') console.log('✅ [PASS] Atomic Write V1');
    else console.error('❌ [FAIL] Atomic Write V1');

    // Step 2: Overwrite (Trigger Backup)
    await SecureFS.writeFile('test/atomic.txt', 'VERSION_2');
    const v2 = await SecureFS.readFile('test/atomic.txt');

    // Check Backup
    try {
        const backup = await SecureFS.readFile('test/atomic.txt.bak');
        if (backup === 'VERSION_1') console.log('✅ [PASS] Backup Created (V1)');
        else console.error('❌ [FAIL] Backup Content Mismatch');
    } catch (e) { console.error('❌ [FAIL] Backup Missing'); }

    // Step 3: Rollback
    await SecureFS.rollback('test/atomic.txt');
    const restored = await SecureFS.readFile('test/atomic.txt');
    if (restored === 'VERSION_1') console.log('✅ [PASS] Rollback Successful');
    else console.error(`❌ [FAIL] Rollback Failed (Got: ${restored})`);

    console.log(`\n[Summary] Passed: ${passed} | Failed: ${failed}`);
}

test();
