/**
 * UCONAI Failure Sim Tool
 * Purpose: Manually trigger specific FS errors to test Executor/Guard resilience.
 */
module.exports = async function (args) {
    const errorCode = args.error || 'ENOSPC';
    console.log(`[CHAOS] Simulating Error: ${errorCode}`);

    const err = new Error(`Simulated Error: ${errorCode}`);
    err.code = errorCode;
    throw err;
};
