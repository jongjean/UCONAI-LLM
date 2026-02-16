const crypto = require('crypto');
const fs = require('fs').promises;

/**
 * 🔐 Policy Vault Guard (M7.1.4)
 * Protects Governance DSL from unauthorized modifications.
 */
class PolicyVault {
    constructor() {
        this.checksumFile = 'C:\\OpenClaw\\controller\\.policy_sig';
        this.currentHash = null;
    }

    /**
     * Generate and save a new signature for the policy file
     */
    async sign(content) {
        const hash = crypto.createHash('sha256').update(content).digest('hex');
        await fs.writeFile(this.checksumFile, hash, 'utf8');
        this.currentHash = hash;
        console.log('[Vault] Policy DSL signed successfully.');
    }

    /**
     * Verify the current policy file against the saved signature
     */
    async verify(content) {
        try {
            const hash = crypto.createHash('sha256').update(content).digest('hex');
            const savedHash = await fs.readFile(this.checksumFile, 'utf8');

            if (hash !== savedHash.trim()) {
                throw new Error("E_VAULT_INTEGRITY_FAIL: Policy tampering detected!");
            }
            return true;
        } catch (error) {
            console.error('[CRITICAL] Policy Integrity Failed:', error.message);
            return false;
        }
    }
}

module.exports = new PolicyVault();
