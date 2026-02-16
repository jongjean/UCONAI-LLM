const fs = require('fs').promises;
const os = require('os');
const path = require('path');
const SecureFS = require('../secure-fs'); // [M4-3.1] Security Wrapper

/**
 * UCONAI Live Toolbox
 * Actual implementations of system commands.
 */
module.exports = {
    /**
     * Get System Status
     */
    async system_status() {
        return {
            status: 'OK',
            data: {
                uptime: os.uptime(),
                platform: os.platform(),
                arch: os.arch(),
                free_mem: os.freemem(),
                total_mem: os.totalmem(),
                load: os.loadavg()
            }
        };
    },

    /**
     * Read File Content (M4-3.1 Sandboxed)
     */
    async read_file(args) {
        try {
            // [M4-3.1] SecureFS handles validation & paths
            const content = await SecureFS.readFile(args.path, args._ctx);

            // Return summary to LLM (Contract C8)
            return {
                status: 'OK',
                data: {
                    path: args.path, // Return user-path, not absolute
                    size: content.length,
                    content: content.substring(0, 5000), // Safety limit for context window
                    is_truncated: content.length > 5000
                }
            };
        } catch (error) {
            return {
                status: 'FAIL',
                reason: `SecureFS Error: ${error.message}`
            };
        }
    },

    /**
     * Write File Content (M4-3.1 Sandboxed + M4-3.2 Atomic)
     * Guard enforces approval.
     */
    async write_file(args) {
        try {
            const { path: filePath, content, _ctx } = args;
            if (!filePath || content === undefined) throw new Error("Missing path or content");

            // [M4-3.2] Atomic Write handles temp file & backup automatically
            // [M4-3.3] Log Transaction if context exists
            const result = await SecureFS.writeAtomic(filePath, content, _ctx);

            return {
                status: 'OK',
                data: {
                    path: filePath,
                    bytes_written: result.size,
                    backup_created: !!result.backup,
                    backup_path: result.backup ? path.basename(result.backup) : null
                }
            };
        } catch (error) {
            return {
                status: 'FAIL',
                reason: `SecureFS Error: ${error.message}`
            };
        }
    },

    /**
     * Chaos Tool: Hang
     */
    async hang_tool(args) {
        return require('./hang_tool')(args);
    },

    /**
     * Chaos Tool: Failure Sim
     */
    async failure_sim_tool(args) {
        return require('./failure_sim_tool')(args);
    },

    /**
     * Rollback File Changes (M4-5)
     */
    async rollback_fs(args) {
        try {
            const { target_job_id } = args;
            if (!target_job_id) throw new Error("Missing target_job_id");

            const result = await SecureFS.rollbackJob(target_job_id);

            return {
                status: 'OK',
                data: {
                    job_id: target_job_id,
                    files_restored: result.changes,
                    summary: `Successfully reverted ${result.changes} file(s).`
                }
            };
        } catch (error) {
            return {
                status: 'FAIL',
                reason: `Rollback Error: ${error.message}`
            };
        }
    },

    /**
     * Index File into Knowledge Base (M6-2 / C14)
     */
    async index_file(args) {
        try {
            const { path: filePath, type, tags, _ctx } = args;
            if (!filePath || !_ctx) throw new Error("Missing path or context");

            // [M4-3.1] Security Wrapper Context
            const content = await SecureFS.readFile(filePath, _ctx);
            const MemoryManager = require('../memory-manager');

            // Normalized ctx (C11)
            const ctx = {
                requestId: _ctx.jobId,
                actorId: _ctx.user_id,
                teamId: _ctx.team_id,
                role: 'SYSTEM',
                abortSignal: _ctx.signal
            };

            const memoryId = await MemoryManager.learn(ctx, {
                jobId: _ctx.jobId,
                type: type || 'DOCUMENT',
                content,
                metadata: { source_path: filePath, tags: tags || [] }
            });

            return {
                status: 'OK',
                data: { path: filePath, memory_id: memoryId, summary: `Indexed ${content.length} chars with SHA-256 isolation.` }
            };
        } catch (error) {
            return { status: 'FAIL', reason: error.message };
        }
    },

    /**
     * Query Tactical Knowledge (M6-2 / C14)
     */
    async query_knowledge(args) {
        try {
            const { query, limit, _ctx } = args;
            if (!query || !_ctx) throw new Error("Missing query or context");

            const MemoryManager = require('../memory-manager');

            // Normalized ctx (C11)
            const ctx = {
                requestId: _ctx.jobId,
                actorId: _ctx.user_id,
                teamId: _ctx.team_id,
                role: 'USER', // Default querying role
                abortSignal: _ctx.signal
            };

            const results = await MemoryManager.search(ctx, query, limit || 5);

            return {
                status: 'OK',
                data: {
                    query,
                    matches: results.length,
                    results: results.map(r => ({
                        content: r.content,
                        hash: r.content_hash,
                        type: r.type,
                        age: r.created_at
                    }))
                }
            };
        } catch (error) {
            return { status: 'FAIL', reason: error.message };
        }
    }
};
