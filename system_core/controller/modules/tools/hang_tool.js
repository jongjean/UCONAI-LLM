/**
 * UCONAI Chaos Tool: Hang
 * Purpose: Simulates a tool that hangs indefinitely or for a long period to test C9 and Health Guard.
 */
module.exports = async function (args) {
    const duration = args.duration || 30000;
    const isSync = args.sync || false;

    if (isSync) {
        console.log(`[CHAOS] Synchronous Hang for ${duration}ms (Blocking Event Loop)...`);
        const start = Date.now();
        while (Date.now() - start < duration) {
            // Busy wait - strictly blocking
        }
        return { status: 'OK', message: 'Sync hang finished' };
    } else {
        console.log(`[CHAOS] Asynchronous Hang for ${duration}ms...`);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ status: 'OK', message: 'Async hang finished' });
            }, duration);
        });
    }
};
