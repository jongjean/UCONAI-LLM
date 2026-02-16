/**
 * Security Policy Configuration (M4-3.1 Scoped Sandbox)
 * 
 * Defines allowed paths, forbidden patterns, and file operation limits.
 */
const path = require('path');

module.exports = {
    filesystem: {
        // [C1] Sandbox Root: All tools MUST operate within this directory
        workspaceRoot: path.resolve(__dirname, '../../workspace'),

        // [C2] Forbidden Patterns (Audit trigger)
        dangers: [
            '..',           // Path traversal
            'C:\\Windows',  // System directory
            '/etc',         // Linux System (just in case)
            '.env',         // Secrets
            '.git'          // Version control
        ],

        // [C3] Read/Write Policies
        allowRead: true,
        allowWrite: true,
        maxFileSize: 5 * 1024 * 1024, // 5MB

        // [C4] Safe Extensions (Whitelist)
        allowedExtensions: [
            '.txt', '.md', '.json', '.js', '.log', '.csv', '.html', '.css', '.bak'
        ]
    },

    audit: {
        logDeniedAccess: true, // Log security violations to DB
        alertOnSystemAccess: true
    }
};
