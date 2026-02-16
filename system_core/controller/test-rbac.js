/**
 * M4-4.1 RBAC Validation Test
 * 
 * Objective: Verify Role-Based Access Control logic in ToolGuard.
 */
const guard = require('./modules/tool-guard'); // Already instantiated

function createPlan(tool) {
    let args = {};
    if (tool === 'read_file' || tool === 'write_file') args = { path: __filename, content: 'test' };
    if (tool === 'execute_command') args = { command: 'echo hello' };

    return {
        steps: [
            { id: '1', tool: tool, args: args }
        ]
    };
}

function createMultiStepPlan(count) {
    const steps = [];
    for (let i = 0; i < count; i++) {
        steps.push({ id: `${i + 1}`, tool: 'system_status', args: {} });
    }
    return { steps };
}

function test() {
    console.log("=== M4-4.1 RBAC UNIT TEST ===\n");
    let passed = 0;
    let failed = 0;

    function assert(name, condition, result) {
        if (condition) {
            console.log(`✅ [PASS] ${name}`);
            passed++;
        } else {
            console.error(`❌ [FAIL] ${name}`);
            if (result && result.issues) console.error('   Issues:', result.issues);
            else if (result) console.error('   Result:', result);
            failed++;
        }
    }

    try {
        // 1. DEV Role (Default)
        const devPlan1 = createPlan('read_file');
        const r1 = guard.validatePlan(devPlan1, 'DEV');
        assert('DEV can read_file', r1.safe === true, r1);

        const devPlan2 = createPlan('execute_command');
        const r2 = guard.validatePlan(devPlan2, 'DEV');
        assert('DEV cannot execute_command', r2.safe === false && r2.issues[0].includes('Access Denied'), r2);

        // 2. GUEST Role
        const guestPlan1 = createPlan('read_file');
        const r3 = guard.validatePlan(guestPlan1, 'GUEST');
        assert('GUEST can read_file', r3.safe === true, r3);

        const guestPlan2 = createPlan('write_file');
        const r4 = guard.validatePlan(guestPlan2, 'GUEST');
        assert('GUEST cannot write_file', r4.safe === false && r4.issues[0].includes('Access Denied'), r4);

        // 3. ADMIN Role
        const adminTest = createPlan('system_status');
        const rAdmin = guard.validatePlan(adminTest, 'ADMIN');
        assert('ADMIN can system_status', rAdmin.safe === true, rAdmin);

        // 4. Invalid Role Fallback
        const badPlan = createPlan('read_file');
        const rDefault = guard.validatePlan(badPlan, 'HACKER');
        assert('Invalid Role -> Default (DEV)', rDefault.safe === true, rDefault);

        // 5. Quota (M4-4.2)
        const guestExcess = createMultiStepPlan(6);
        const rQuotaFail = guard.validatePlan(guestExcess, 'GUEST');
        assert('Quota: GUEST max 5 steps', rQuotaFail.safe === false && rQuotaFail.issues[0].includes('Quota Exceeded'), rQuotaFail);

        const guestOk = createMultiStepPlan(5);
        const rQuotaPass = guard.validatePlan(guestOk, 'GUEST');
        assert('Quota: GUEST 5 steps OK', rQuotaPass.safe === true, rQuotaPass);

    } catch (e) {
        console.error('Test Crashed:', e);
        failed++;
    }

    console.log(`\n[Summary] Passed: ${passed} | Failed: ${failed}`);
}

test();
