// UCONAI-LLM Phase 8.1: Gatekeeper (Security Policy Enforcer)
// Enforces sovereign zone rules and access policies.

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const POLICY_FILE = path.join(__dirname, '../../UCONAI-LLM/config/sovereign_zones.yaml');

class Gatekeeper {
    constructor() {
        this.policy = this.loadPolicy();
        this.zones = this.policy ? this.policy.zones : {};
    }

    loadPolicy() {
        try {
            if (fs.existsSync(POLICY_FILE)) {
                return yaml.load(fs.readFileSync(POLICY_FILE, 'utf8'));
            }
            console.error("Policy File Not Found:", POLICY_FILE);
            return null;
        } catch (e) {
            console.error("Policy Load Failed:", e);
            return null;
        }
    }

    identifyZone(ip) {
        // Normalize IPv6 localhost
        if (ip === "::1" || ip === "::ffff:127.0.0.1") ip = "127.0.0.1";

        if (this.zones.imperial_core && this.zones.imperial_core.allowed_ips.includes(ip)) {
            return "imperial_core";
        }
        return "public_sector";
    }

    checkAccess(ip, intentType) {
        if (!this.policy) return { allowed: true, reason: "No Policy Loaded" }; // Fail open (or closed depending on reqs)

        const zoneName = this.identifyZone(ip);
        const zoneConfig = this.zones[zoneName];

        if (!zoneConfig) {
            return { allowed: false, reason: "Zone Identification Failed" };
        }

        // Check if the intent type is within the allowed scopes of the zone
        // Simple mapping: intent.type -> scope keyword
        const scope = this.mapIntentToScope(intentType);
        console.log(`[Gatekeeper Debug] IP: ${ip}, Zone: ${zoneName}, Scope: ${scope}, AllowedScopes: ${JSON.stringify(zoneConfig.scopes)}`);

        if (zoneConfig.scopes.includes(scope) || zoneConfig.scopes.includes("*")) {
            return { allowed: true, zone: zoneName, role: zoneConfig.auth_level };
        }

        return {
            allowed: false,
            reason: `Action '${scope}' denied in zone '${zoneName}' (Auth: ${zoneConfig.auth_level})`
        };
    }

    mapIntentToScope(intentType) {
        if (!intentType) return "chat";
        if (intentType === "restart") return "restart";
        if (intentType.includes("vision") || intentType.includes("capture")) return "vision";
        if (intentType.includes("rpa") || intentType.includes("click")) return "rpa";
        if (intentType.includes("status")) return "status_check";
        if (intentType.includes("report")) return "report_generation";
        return "chat"; // Default safe scope
    }
}

module.exports = Gatekeeper;
