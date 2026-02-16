/**
 * Role-Based Access Control Policy (M4-4.1)
 * 
 * Defines allowed and forbidden actions for each user role.
 * Applied by ToolGuard during plan validation.
 */

module.exports = {
    roles: {
        ADMIN: {
            description: 'Full System Access',
            allowedModules: ['*'], // Wildcard
            allowedTools: ['*'],
            forbiddenTools: []
        },
        DEV: {
            description: 'Application Developer (Sandboxed)',
            quotas: { maxStepsPerJob: 20, maxDailyJobs: 100 },
            allowedModules: ['file', 'system'],
            allowedTools: [
                'read_file',
                'write_file',
                'system_status',
                'list_dir'
            ],
            forbiddenTools: [
                'execute_command', // Cannot spawn processes
                'terminate_process'
            ]
        },
        GUEST: {
            description: 'Read-only Access',
            quotas: { maxStepsPerJob: 5, maxDailyJobs: 10 },
            allowedModules: ['file', 'system'],
            allowedTools: [
                'read_file',
                'system_status',
                'list_dir'
            ],
            forbiddenTools: [
                'write_file', // No modifications
                'execute_command',
                'terminate_process'
            ]
        }
    },

    // Enforce default role if not specified
    defaultRole: 'DEV'
};
