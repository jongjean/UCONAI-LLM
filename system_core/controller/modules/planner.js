/**
 * UCONAI Planner v1.1 (Phase 4.2 Observability Foundation)
 * 
 * Objective: Convert natural language into structured execution plans.
 * Safety: Strict JSON Schema validation with retry budget.
 * 
 * Enhancements:
 * - Pass 'PLANNER' context to LLM for metrics tracking
 * - Record planner_latency_ms for performance analysis
 */

const Ajv = require('ajv');

// [Contract C1] Fixed JSON Schema v1.0
const PLAN_SCHEMA = {
    type: "object",
    required: ["schema_version", "goal", "steps", "max_steps"],
    properties: {
        schema_version: {
            type: "string",
            enum: ["1.0"]
        },
        goal: {
            type: "string",
            minLength: 1,
            maxLength: 500
        },
        steps: {
            type: "array",
            minItems: 1,
            maxItems: 10, // Safety limit
            items: {
                type: "object",
                required: ["id", "tool", "args", "expected"],
                properties: {
                    id: { type: "string" },
                    tool: { type: "string" },
                    args: { type: "object" },
                    expected: {
                        type: "object",
                        additionalProperties: true,
                        properties: {
                            checks: {
                                type: "array",
                                items: {
                                    type: "object",
                                    required: ["type"],
                                    properties: {
                                        type: { type: "string" },
                                        path: { type: "string" },
                                        regex: { type: "string", maxLength: 200 }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        max_steps: {
            type: "integer",
            minimum: 1,
            maximum: 10
        }
    }
};

const ajv = new Ajv();
const validatePlan = ajv.compile(PLAN_SCHEMA);

class Planner {
    constructor() {
        this.MAX_RETRIES = 2;
    }

    /**
     * Generate execution plan from user request
     * @param {Object} job - { module, action, args, chat_history }
     * @param {Object} llmClient - LLM Client instance
     * @returns {Promise<Object>} - Validated plan or error
     */
    async generatePlan(job, llmClient, attempt = 1) {
        const prompt = this._buildPrompt(job);
        const plannerStartTime = Date.now();

        try {
            // [Phase 4.2 Observability] Pass PLANNER context
            const rawResponse = await llmClient.generateLocal(prompt, 'PLANNER');
            const plannerLatency = Date.now() - plannerStartTime;

            // Extract JSON from response (LLM might wrap it in markdown)
            const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in LLM response');
            }

            const plan = JSON.parse(jsonMatch[0]);

            // Validate against schema
            const valid = validatePlan(plan);
            if (!valid) {
                const errors = validatePlan.errors.map(e => `${e.instancePath} ${e.message}`).join(', ');
                console.error(`[Planner] SCHEMA FAIL: ${errors} | RAW: ${jsonMatch[0]}`);
                throw new Error(`Schema validation failed: ${errors}`);
            }

            console.log(`[Planner] Plan generated in ${plannerLatency}ms (attempt ${attempt})`);

            return {
                success: true,
                plan,
                meta: {
                    planner_latency_ms: plannerLatency,
                    llm_attempt: attempt,
                    llm_context: 'PLANNER'
                }
            };

        } catch (error) {
            // Retry logic
            if (attempt <= this.MAX_RETRIES) {
                console.warn(`[Planner] Attempt ${attempt} failed: ${error.message}. Retrying...`);
                return this.generatePlan(job, llmClient, attempt + 1);
            }

            // Final failure
            const plannerLatency = Date.now() - plannerStartTime;
            return {
                success: false,
                error: 'PARSE_ERR',
                reason: `Failed after ${this.MAX_RETRIES} attempts: ${error.message}`,
                meta: {
                    error_code: error.code || 'E_PLANNER_FAIL',
                    llm_context: 'PLANNER',
                    llm_attempt: attempt,
                    planner_latency_ms: plannerLatency
                }
            };
        }
    }

    _buildPrompt(job) {
        // [M4-2.2] Optimized Prompt + [M6-3] Memory Reflection (Hardened)
        const memorySection = job.memory_context ? `\nMEMORY (Isolated/Verified): \n${job.memory_context}` : '';

        return `ROLE: Enterprise Task Planner (Security & Cost Focused).
GOAL: Create a secure, auditable, and cost-effective execution plan.
CONSTRAINTS: 
- Tool Usage: Prioritize efficiency. Max 5 steps (Safety Limit).
- Memory Reflection: You MUST adapt to past FAILURE PATTERNS.
- Knowledge Grounding: Use ONLY verified information with SHA-256 hashes. If no hash, state "unverified".
- Token Economy: Do not request unnecessary data. Cap context to relevant segments (Top-K=5).

TOOLS: [read_file, write_file, system_status, query_knowledge, index_file]
${memorySection}

INSTRUCTION: 
1. Review MEMORY for any 'FAILURE_PATTERN'. If found, plan an alternative or a fix.
2. Focus on the requested Action/Module with zero-touch precision.

SCHEMA:
{
  "schema_version": "1.0",
  "goal": "Description of intent",
  "steps": [{ 
    "id": "s_1", 
    "tool": "ToolName", 
    "args": { ... }, 
    "expected": { "checks": [{"type": "file_exists", "path": "test.log"}] } 
  }],
  "max_steps": 5
}

REQUEST:
Module: ${job.module}
Action: ${job.action}
Args: ${JSON.stringify(job.args)}

OUTPUT JSON:`;
    }
}

module.exports = new Planner();
