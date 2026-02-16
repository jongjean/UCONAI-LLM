// UCONAI-LLM Phase 8.2: Audit Logger
// Records critical system events for security and accountability.

const fs = require('fs');
const path = require('path');

const AUDIT_FILE = path.join(__dirname, '../../UCONAI-LLM/logs/audit.log');

class AuditLogger {
    constructor() {
        this.ensureLogDir();
    }

    ensureLogDir() {
        const logDir = path.dirname(AUDIT_FILE);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    log(event) {
        const entry = {
            timestamp: new Date().toISOString(),
            ...event
        };

        const logLine = JSON.stringify(entry) + '\n';

        try {
            fs.appendFileSync(AUDIT_FILE, logLine);
            // Also log to console for dev visibility
            if (event.level === 'WARN' || event.level === 'ERROR' || event.level === 'CRITICAL') {
                console.error(`[AUDIT] ${event.level}: ${event.message}`);
            } else {
                console.log(`[AUDIT] ${event.message}`);
            }
        } catch (e) {
            console.error("Audit Log Failed:", e);
        }
    }

    // Convenience methods
    logAccess(ip, intent, allowed, reason) {
        this.log({
            type: "ACCESS_CONTROL",
            level: allowed ? "INFO" : "WARN",
            ip: ip,
            intent: intent,
            allowed: allowed,
            reason: reason,
            message: `Access ${allowed ? 'Granted' : 'Denied'} for '${intent}' from ${ip}`
        });
    }

    logExecution(taskType, success, details) {
        this.log({
            type: "EXECUTION",
            level: success ? "INFO" : "ERROR",
            task: taskType,
            success: success,
            details: details,
            message: `Task '${taskType}' ${success ? 'completed' : 'failed'}`
        });
    }

    logSystem(component, message, level = "INFO") {
        this.log({
            type: "SYSTEM",
            level: level,
            component: component,
            message: message
        });
    }
}

module.exports = AuditLogger;
