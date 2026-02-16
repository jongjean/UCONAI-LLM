/**
 * Tool Guard Policies (Sprint 2: Read-Only Phase)
 * 
 * Contract C2: Parameter Policy
 * - Whitelist Tool Names
 * - Validate Arguments (Path/Command)
 * - Assess Risk Level
 */

module.exports = {
    // Allowed Tools (Whitelist)
    'system_status': {
        risk: 'LOW',
        requires_approval: false,
        allowed_args: {} // No restrictions
    },

    'read_file': {
        risk: 'MEDIUM',
        requires_approval: false,
        allowed_roots: [
            'C:\\OpenClaw\\logs',
            'C:\\OpenClaw\\data',
            'C:\\OpenClaw\\controller'
        ],
        forbidden_patterns: [
            /\.\./g,           // Path traversal
            /System32/i,       // Windows system folder
            /passwd/i,         // Unix password file
            /\.exe$/i,         // Executable files
            /\.dll$/i,         // Dynamic libraries
            /Program Files/i   // Program installation folder
        ]
    },

    // HIGH RISK TOOLS (Disabled in Sprint 2)
    'write_file': {
        risk: 'CRITICAL',
        requires_approval: true,
        enabled: true,
        allowed_roots: [
            'C:\\OpenClaw\\logs',
            'C:\\OpenClaw\\data',
            'C:\\OpenClaw\\controller'
        ],
        forbidden_patterns: [
            /\.\./g,
            /System32/i,
            /\.exe$/i,
            /\.dll$/i
        ]
    },

    'delete_file': {
        risk: 'HIGH',
        requires_approval: true,
        enabled: false
    },

    'execute_command': {
        risk: 'CRITICAL',
        requires_approval: true,
        enabled: false
    },

    'hang_tool': {
        risk: 'LOW',
        requires_approval: false, // For soak testing conveniently
        enabled: true
    },

    'failure_sim_tool': {
        risk: 'MEDIUM',
        requires_approval: false,
        enabled: true
    }
};
