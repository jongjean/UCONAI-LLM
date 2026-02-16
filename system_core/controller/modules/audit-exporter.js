const crypto = require('crypto');

/**
 * 📝 Governance Compliance Reporter (M7.4.3)
 * Generates audit-ready reports documenting decisions, evidence, and results.
 */
class AuditExporter {
    constructor() {
        this.db = null;
    }

    init(db) {
        this.db = db;
    }

    /**
     * Generate a Governance Compliance Report for a team
     */
    async generateReport(teamId) {
        if (!this.db) throw new Error("E_AUDIT_DB_NOT_INIT");

        const history = await this._getHistory(teamId);
        const riskSummary = await this._getRiskSummary(teamId);

        let previousHash = 'ANCHOR_v3.3_ROOT';
        let sequence = 0;

        // [M7.4.3.1] Construct Logical Proof Chain (Audit v3.3 Chaining)
        const proofChain = history.map(h => {
            sequence++;
            const payload = `${sequence}|${h.created_at}|${h.action}|${h.result}|${h.status}`;
            const currentHash = crypto.createHash('sha256')
                .update(previousHash + payload)
                .digest('hex');

            previousHash = currentHash; // Update for next chain link

            return {
                seq: sequence,
                timestamp: h.created_at,
                action: h.action,
                evidence_hash: currentHash,
                status: h.status
            };
        });

        const report = {
            report_id: `GOV_AUDIT_${teamId}_${Date.now()}`,
            timestamp: new Date().toISOString(),
            subject: `Team ID: ${teamId}`,
            summary: {
                total_actions: history.length,
                risk_level: riskSummary.current_score > 80 ? 'CRITICAL' : 'STABLE',
                avg_risk_score: riskSummary.current_score,
                final_anchor: previousHash
            },
            proof_chain: proofChain
        };

        return report;
    }

    async _getHistory(teamId) {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM jobs WHERE team_id = ? ORDER BY created_at DESC LIMIT 50`, [teamId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    }

    async _getRiskSummary(teamId) {
        const RiskEvaluator = require('./risk-calc');
        return {
            current_score: await RiskEvaluator.calculateScore(teamId)
        };
    }
}

module.exports = new AuditExporter();
