const Planner = require('./modules/planner');

async function test() {
    console.log("=== Phase 6: M6-3 Self-Reflection Test ===\n");

    const job = {
        action: 'plan_task',
        args: { path: 'important_data.csv' },
        user_id: 2,
        memory_context: "[FAILED] Action: read_file | Note: Access denied to important_data.csv last time. Need to query_knowledge for correct permissions."
    };

    // Mock LLM to see what prompt it receives
    const llmMock = {
        generateLocal: async (prompt) => {
            console.log("--- LLM PROMPT (With Memory) ---");
            console.log(prompt);
            console.log("-------------------------------\n");

            // Mocking AI response that adjusts plan based on memory
            return JSON.stringify({
                schema_version: "1.0",
                goal: "Consult knowledge base due to previous failure",
                steps: [
                    { id: "step_1", tool: "query_knowledge", args: { query: "important_data.csv access" }, expected: {} }
                ],
                max_steps: 2
            });
        }
    };

    const result = await Planner.generatePlan(job, llmMock);
    console.log("--- FINAL REFLECTED PLAN ---");
    console.log(JSON.stringify(result.plan, null, 2));
}

test();
