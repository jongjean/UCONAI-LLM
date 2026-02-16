const LLM = require('./llm-client');
const Planner = require('./planner');
const Guard = require('./tool-guard');
const Tools = require('./tools/index');
const fs = require('fs').promises;
const path = require('path');

/**
 * UCONAI Executor v2.6 (Automation Phase)
 * 
 * Implements:
 * - P4.2: Playbook Engine (Pre-defined plans)
 * - C4: Advanced Verification (Regex, fs.stat)
 * - C9: Global Timeout with AbortSignal
 * - C5/C6: Log-based Idempotency
 * - C7/C8: Standardized Spans & Error Codes
 */
class Executor {
    constructor() {
        this.db = null;
        this.Logger = null;
        this.GLOBAL_TIMEOUT_MS = 5 * 60 * 1000; // 5 Minutes
        this.activeControllers = new Map(); // [M5.5] Track active jobs for Kill Hook
    }

    init(context) {
        this.db = context.db;
        this.Logger = context.Logger;
    }

    /**
     * Main Loop with Global Timeout Protection (C9)
     */
    async executeJob(job, policy) {
        if (!this.db || !this.Logger) throw new Error("Executor not initialized");

        const jobId = job.job_id;
        const self = this;
        const controller = new AbortController();
        const { signal } = controller;

        // Register controller for Kill-Switch support
        this.activeControllers.set(jobId, { controller, user_id: job.user_id });

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                controller.abort();
                const err = new Error('E_GLOBAL_TIMEOUT');
                err.code = 'E_GLOBAL_TIMEOUT';
                reject(err);
            }, this.GLOBAL_TIMEOUT_MS);
        });

        const executionPromise = this._runLoop(job, policy, signal);

        try {
            const result = await Promise.race([executionPromise, timeoutPromise]);
            return result;
        } catch (error) {
            if (error.code === 'E_GLOBAL_TIMEOUT') {
                await self._log(jobId, 'TIMEOUT_KILL', 'Global execution timeout reached (5m)');
                await self._set(jobId, 'FAILED_SAFE', { error: 'E_GLOBAL_TIMEOUT', phase: 'TIMEOUT_INTERRUPT' });
                return false;
            }
            throw error;
        } finally {
            this.activeControllers.delete(jobId);
        }
    }

    /**
     * [M5.5] Forcefully abort all jobs for a specific user (Kill Hook)
     */
    abortByUserId(userId) {
        let count = 0;
        for (const [jobId, record] of this.activeControllers.entries()) {
            if (record.user_id === userId) {
                record.controller.abort();
                this.Logger.warn(`Force Aborted Job ${jobId} due to User Termination`);
                count++;
            }
        }
        return count;
    }

    async _runLoop(job, policy, signal) {
        const jobId = job.job_id;
        const self = this;

        try {
            await self._log(jobId, 'EXECUTE_START', `Loop started [${job.action}]`);
            await self._set(jobId, 'EXECUTING', { phase: 'INITIALIZING' });
            let plan = null;

            // 1. Plan Phase
            if (job.action === 'plan_task') {
                const planResult = await Planner.generatePlan(job, LLM);
                if (!planResult.success) throw new Error(`PARSE_ERR: ${planResult.reason}`);
                plan = planResult.plan;
            }
            else if (job.action === 'run_playbook') {
                const playbookName = job.args[0] || job.args.playbook;
                const playbookPath = path.resolve(__dirname, '../playbooks', `${playbookName}.json`);
                try {
                    const raw = await fs.readFile(playbookPath, 'utf8');
                    plan = JSON.parse(raw);
                    await self._log(jobId, 'PLAYBOOK_LOAD', `Loaded ${playbookName}`);
                } catch (e) {
                    throw new Error(`PLAYBOOK_ERR: Failed to load ${playbookName} - ${e.message}`);
                }
            }

            if (!plan) throw new Error("E_NO_PLAN: Action not supported or plan missing");
            self.currentPlan = plan; // [M4-2.1 Gate 3] For context in failure analysis

            // 2. Guard
            const guardReport = Guard.validatePlan(plan, job.user_role || 'DEV');
            if (!guardReport.safe) {
                await self._log(jobId, 'SECURITY_ALERT', guardReport.issues[0]);
                await self._set(jobId, 'BLOCKED', { issues: guardReport.issues });
                return false;
            }

            if (guardReport.requires_approval) {
                await self._log(jobId, 'APPROVAL_HOLD', 'High risk task waiting for approval');
                await self._set(jobId, 'NEEDS_APPROVAL', { plan, guard: guardReport });
                return true;
            }

            // 3. Step Execution Loop
            const stepResults = [];
            const executionLimit = Math.min(plan.max_steps || 3, 10);

            for (let i = 0; i < plan.steps.length; i++) {
                if (signal.aborted) throw new Error('E_SIGNAL_ABORT');

                const step = plan.steps[i];
                if (i >= executionLimit) break;

                const alreadyDone = await self._isDone(jobId, step.id);
                if (alreadyDone) {
                    await self._log(jobId, 'STEP_SKIP', `Step ${step.id} already completed (C5)`);
                    continue;
                }

                // [M6.2.2] Instant Abort Checkpoint
                if (signal && signal.aborted) throw new Error('E_ABORTED_BY_SIGNAL');

                // [M7.1.1] Master Governance Hook (Policy Primacy C15)
                const GCore = require('./governance-core');
                const govCtx = {
                    requestId: jobId,
                    actorId: job.user_id,
                    teamId: job.team_id,
                    role: job.role,
                    abortSignal: signal
                };
                await GCore.authorize(govCtx, step.tool, step.args);

                await self._log(jobId, 'STEP_EXEC', `Calling ${step.tool}`, { step_id: step.id });

                let toolOutput;
                if (typeof Tools[step.tool] === 'function') {
                    // [M4-3.3] Inject Context + [C13] AbortSignal Propagation
                    const toolArgs = {
                        ...step.args,
                        _ctx: { jobId, stepId: step.id, teamId: job.team_id, userId: job.user_id, signal }
                    };
                    toolOutput = await Tools[step.tool](toolArgs);
                } else {
                    toolOutput = { status: 'FAIL', reason: `E_TOOL_NOT_FOUND: ${step.tool}` };
                }

                const verifyResult = await self._verify(step, toolOutput);
                if (verifyResult.status === 'FAIL') {
                    await self._log(jobId, 'VERIFY_FAIL', verifyResult.reason, { step_id: step.id });
                    throw new Error(`E_VERIFY_ERR: ${verifyResult.reason}`);
                }

                await self._log(jobId, 'STEP_DONE', `Step ${step.id} finished successfully`, { step_id: step.id });

                stepResults.push({
                    id: step.id,
                    tool: step.tool,
                    summary: { status: 'OK', hash: 'SHA256_HIDDEN' }
                });
            }

            const finalResult = { plan, steps: stepResults, audit: 'PASS_A' };
            await self._log(jobId, 'EXECUTE_END', 'Final result saved');
            await self._set(jobId, 'COMPLETED', finalResult);
            return true;

        } catch (error) {
            // [C13] Abort Signal Check (E_ABORTED_BY_SIGNAL)
            if (signal && signal.aborted) {
                await self._log(jobId, 'TERMINATED', 'Job aborted by manual signal (Kill Hook)');
                await self._set(jobId, 'ABORTED_ADMIN', { reason: 'E_STOPPED_BY_ADMIN' });
                return false;
            }

            const errCode = error.message.split(':')[0];
            // [M4-2.1 Gate 3] Failure Analysis + [M6-4] Adaptive Recovery
            let analysis = null;
            try {
                if (errCode.includes('VERIFY_ERR') || errCode.includes('TOOL_ERR')) {
                    // [C13] Pass signal to analysis + Budget Limit
                    job._analysisCount = (job._analysisCount || 0) + 1;
                    if (job._analysisCount <= 2) { // [M6-5.5] Max 2 Analysis (Abort Budget)
                        analysis = await self._analyzeFailure(jobId, error, self.currentPlan, signal);

                        // [M6-4] Adaptive Healing (Try once if suggestion is actionable)
                        if (analysis && analysis.recovery_step && !job._isHealing) {
                            await self._log(jobId, 'ADAPTIVE_HEAL', `Attempting recovery: ${analysis.suggestion}`);
                            job._isHealing = true; // [M6-5.5] Cap healing loop to 1 step

                            const healStep = analysis.recovery_step;
                            const toolArgs = { ...healStep.args, _ctx: { jobId, stepId: 'heal_01', teamId: job.team_id, signal } };

                            if (typeof Tools[healStep.tool] === 'function') {
                                const healOutput = await Tools[healStep.tool](toolArgs);
                                if (healOutput.status === 'OK') {
                                    await self._log(jobId, 'RETRY_INIT', 'Retrying failed operation after healing...');
                                    return this._runLoop(job, policy, signal); // Recursive retry once
                                }
                            }
                        }
                    } else {
                        await self._log(jobId, 'ADAPT_SKIP', 'Abort Budget reached. No more failure analysis.');
                    }
                }
            } catch (e) {
                console.error(`[Executor] Adaptive logic failed: ${e.message}`);
            }

            await self._log(jobId, 'ERROR', error.message, { code: errCode, analysis });

            // [M6-2] Reflective Learning: Store Failure Pattern
            if (analysis) {
                const MemoryManager = require('./memory-manager');
                const ctx = { actorId: job.user_id, teamId: job.team_id }; // Lean ctx for internal learn
                await MemoryManager.learn(ctx, {
                    jobId: jobId,
                    type: 'PATTERN',
                    content: `[FAILURE_PATTERN] Error: ${errCode} | Cause: ${analysis.root_cause} | Suggestion: ${analysis.suggestion}`,
                    metadata: { errCode, root_cause: analysis.root_cause, suggestion: analysis.suggestion, original_job: jobId }
                }).catch(e => console.error(`[Executor] Failed to learn pattern: ${e.message}`));
            }

            await self._set(jobId, 'FAILED', { error: error.message, code: errCode });
            throw error;
        }
    }

    /**
     * Advanced Verifier (C4)
     */
    async _verify(step, output) {
        if (!output || output.status !== 'OK') {
            return { status: 'FAIL', reason: output.reason || 'MECHANICAL_FAIL' };
        }

        const expected = step.expected || {};
        const checks = [];

        if (expected.checks && Array.isArray(expected.checks)) {
            checks.push(...expected.checks);
        } else if (expected.type) {
            checks.push({
                type: expected.type,
                regex: expected.regex || expected.text,
                path: expected.path
            });
        }

        for (const check of checks) {
            try {
                const targetPath = check.path || (step.args && step.args.path);

                if (check.type === 'file_exists') {
                    if (!targetPath) return { status: 'FAIL', reason: 'VERIFY_ERR: No path provided for file_exists' };
                    await fs.stat(targetPath);
                } else if (check.type === 'contains_text') {
                    if (!targetPath) return { status: 'FAIL', reason: 'VERIFY_ERR: No path provided for contains_text' };
                    const content = await fs.readFile(targetPath, 'utf8');
                    const pattern = check.regex || check.text;
                    const regex = new RegExp(pattern);
                    if (!regex.test(content)) {
                        return { status: 'FAIL', reason: `EXPECTED_NOT_MET: Pattern '${pattern}' not found in ${targetPath}` };
                    }
                } else if (check.type === 'regex_match') {
                    // Match against output data stringified
                    const content = JSON.stringify(output.data || {});
                    const pattern = check.regex || check.text;
                    const regex = new RegExp(pattern);
                    if (!regex.test(content)) {
                        return { status: 'FAIL', reason: `EXPECTED_NOT_MET: Pattern '${pattern}' not found in tool output` };
                    }
                }
            } catch (e) {
                return { status: 'FAIL', reason: `E_VERIFY_ERR: ${e.message}` };
            }
        }

        return { status: 'OK' };
    }

    async _isDone(jobId, stepId) {
        return new Promise((resolve) => {
            this.db.get(`SELECT id FROM job_logs WHERE job_id = ? AND span_type = 'STEP_DONE' AND message LIKE ? LIMIT 1`,
                [jobId, `%${stepId}%`],
                (err, row) => resolve(!!row)
            );
        });
    }

    async _log(jobId, span, message, meta = {}) {
        return new Promise((resolve) => {
            this.Logger.trace(jobId, span, message, meta);
            setTimeout(resolve, 50);
        });
    }

    async _set(jobId, status, result) {
        return new Promise((resolve, reject) => {
            const errorMsg = (status === 'FAILED_SAFE' && result && result.error) ? result.error : null;
            this.db.run(`UPDATE jobs SET status = ?, result = ?, error = ?, updated_at = CURRENT_TIMESTAMP WHERE job_id = ?`,
                [status, JSON.stringify(result), errorMsg, jobId],
                (err) => err ? reject(err) : resolve()
            );
        });
    }

    /**
     * [M4-2.1 Gate 3] Failure Root Cause Analysis
     * Uses LLM (ANALYSIS Role) to explain why the execution failed.
     */
    async _analyzeFailure(jobId, error, plan, signal = null) {
        if (!this.Logger) return null;
        const self = this;

        const prompt = `ROLE: System Analyst. GOAL: Analyze failure root cause and suggest recovery.
CONTEXT:
- Error: ${error.message}
- Plan Goal: ${plan.goal}
- Steps: ${JSON.stringify(plan.steps)}
- Tools: [read_file, write_file, system_status, query_knowledge]

Provide JSON:
{ 
  "root_cause": "brief string", 
  "suggestion": "what to do next",
  "recovery_step": { "tool": "ToolName", "args": { ... } } | null 
}`;

        try {
            const llm = require('./llm-client');
            const response = await llm.generate(prompt, 'EXECUTOR', 0, signal);
            return JSON.parse(response);
        } catch (e) {
            return null;
        }
    }
}

module.exports = new Executor();
