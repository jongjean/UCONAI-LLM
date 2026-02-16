const Executor = require('./modules/executor');
const sqlite3 = require('sqlite3').verbose();

async function test() {
    console.log("=== Phase 6: M6-4 Adaptive Execution Test ===\n");
    const db = new sqlite3.Database('./uconai.db');
    Executor.init({
        db, Logger: {
            trace: (j, s, m, mt) => console.log(`[LOG] ${s}: ${m}`, mt || ''),
            info: (m) => console.log(`[INFO] ${m}`),
            error: (m) => console.log(`[ERROR] ${m}`)
        }
    });

    const job = {
        job_id: 'job_adaptive_02',
        action: 'plan_task', // Force a simple plan
        args: { path: 'any.txt' },
        user_role: 'DEV',
        team_id: 1
    };

    // We'll manually trigger a loop failure to see if it heals
    // But since _runLoop is called recursively, we can mock the Tools or Planner

    const llmMock = {
        generate: async (prompt, role) => {
            if (role === 'ANALYSIS') {
                return JSON.stringify({
                    root_cause: "Verification failed on empty file",
                    suggestion: "Check system memory",
                    recovery_step: { tool: "system_status", args: {} }
                });
            }
            // Mock a plan that fails verification
            return JSON.stringify({
                schema_version: "1.0",
                goal: "Fail test",
                steps: [{ id: "s1", tool: "system_status", args: {}, expected: { checks: [{ type: "regex_match", regex: "IMPOSSIBLE_VALUE" }] } }],
                max_steps: 1
            });
        },
        generateLocal: async (p) => llmMock.generate(p, 'PLANNER')
    };

    // Replace global LLM for this test
    const OriginalLLM = require('./modules/llm-client');
    require('./modules/llm-client').generate = llmMock.generate;

    console.log("[Action] Starting Adaptive Execution...");
    try {
        await Executor.executeJob(job, {});
    } catch (e) {
        console.log(`[End] Job finished with error: ${e.message}`);
    } finally {
        db.close();
    }
}

test();
