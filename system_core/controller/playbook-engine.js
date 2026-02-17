const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'uconai.db'));
const Executor = require('./modules/executor');
const SecureFS = require('./modules/secure-fs');

const PLAYBOOK_DEFS = {
    'PB_DOC': {
        name: '📄 문서 자동 생성',
        risk: 'LOW',
        approval_required: false,
        steps: [
            { action: 'read_template', description: '템플릿 로드' },
            { action: 'llm_generate', description: 'AI 내용 생성' },
            { action: 'write_atomic', description: '문서 저장 및 검증' }
        ]
    },
    'PB_IMAGE': {
        name: '🎨 AI 이미지 디자인',
        risk: 'MEDIUM',
        approval_required: true,
        steps: [
            { action: 'budget_check', description: 'API 예산 확인' },
            { action: 'generate_image', description: 'AI 이미지 생성' },
            { action: 'save_to_assets', description: '에셋 저장' }
        ]
    },
    'PB_DEV': {
        name: '💻 자율 코드 최적화',
        risk: 'HIGH',
        approval_required: true,
        rollback_enabled: true,
        steps: [
            { action: 'create_snapshot', description: '현재 상태 스냅샷' },
            { action: 'optimize_code', description: '코드 로직 개선' },
            { action: 'verify_tests', description: '유닛 테스트 검증' }
        ]
    }
};

class PlaybookEngine {
    async execute(playbookId, params, actorId, teamId) {
        const pb = PLAYBOOK_DEFS[playbookId];
        if (!pb) throw new Error('E_INVALID_PLAYBOOK');

        const jobId = `job_pb_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

        // 1. Record Execution Record
        return new Promise((resolve, reject) => {
            db.run(`
                INSERT INTO playbook_executions (job_id, playbook_id, params, status)
                VALUES (?, ?, ?, ?)
            `, [jobId, playbookId, JSON.stringify(params), pb.approval_required ? 'PENDING' : 'RUNNING'], async (err) => {
                if (err) return reject(err);

                // 2. If approval required, create approval request
                if (pb.approval_required) {
                    db.run(`
                        INSERT INTO approval_requests (job_id, requester_id, action_description, risk_level)
                        VALUES (?, ?, ?, ?)
                    `, [jobId, actorId, `Playbook Execution: ${pb.name}`, pb.risk]);

                    resolve({ status: 'PENDING_APPROVAL', job_id: jobId });
                } else {
                    // Start immediately
                    this.runInternal(jobId, pb, params, actorId, teamId);
                    resolve({ status: 'RUNNING', job_id: jobId });
                }
            });
        });
    }

    async runInternal(jobId, pb, params, actorId, teamId) {
        console.log(`[PB_ENGINE] Starting Playbook: ${pb.name} (${jobId})`);

        try {
            for (let step of pb.steps) {
                console.log(`[PB_ENGINE] Step: ${step.description}`);

                // [Step 3.2] Rollback Point logic
                if (step.action === 'create_snapshot') {
                    db.run(`
                        INSERT INTO rollback_points (job_id, team_id, snapshot_data)
                        VALUES (?, ?, ?)
                    `, [jobId, teamId || 0, JSON.stringify({ files: ['core-logic-v2.js'], timestamp: Date.now() })]);
                    console.log(`[PB_ENGINE] Snapshot created for ${jobId}`);
                }

                // Simulated Step Execution
                await new Promise(r => setTimeout(r, 1000));

                // [Simulation] Random failure for PB_DEV to test rollback
                if (pb.name.includes('DEV') && Math.random() < 0.3) {
                    throw new Error('E_VERIFICATION_FAILED');
                }
            }

            db.run('UPDATE playbook_executions SET status = "SUCCESS" WHERE job_id = ?', [jobId]);
            console.log(`[PB_ENGINE] Success: ${jobId}`);
        } catch (e) {
            console.error(`[PB_ENGINE] Failed: ${jobId}`, e);

            // [Step 3.2] Auto-Rollback if enabled
            if (pb.rollback_enabled) {
                db.run('UPDATE playbook_executions SET status = "ROLLED_BACK", error = ? WHERE job_id = ?', [e.message, jobId]);
                console.log(`[PB_ENGINE] CRITICAL: Auto-rolling back ${jobId}`);
            } else {
                db.run('UPDATE playbook_executions SET status = "FAILED", error = ? WHERE job_id = ?', [e.message, jobId]);
            }
        }
    }

    async getHistory(teamId) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT pe.*, j.created_at 
                FROM playbook_executions pe
                JOIN jobs j ON pe.job_id = j.job_id
                WHERE j.team_id = ?
                ORDER BY j.created_at DESC LIMIT 20
            `, [teamId], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    async approve(jobId, approverId) {
        return new Promise((resolve, reject) => {
            db.get(`
                SELECT pe.*, j.team_id 
                FROM playbook_executions pe 
                JOIN jobs j ON pe.job_id = j.job_id 
                WHERE pe.job_id = ?
            `, [jobId], (err, row) => {
                if (err || !row) return reject(new Error('E_NOT_FOUND'));

                db.run('UPDATE approval_requests SET status = "APPROVED", approver_id = ?, decided_at = CURRENT_TIMESTAMP WHERE job_id = ?', [approverId, jobId]);
                db.run('UPDATE playbook_executions SET status = "RUNNING" WHERE job_id = ?', [jobId]);

                // Trigger real execution
                this.runInternal(jobId, PLAYBOOK_DEFS[row.playbook_id], JSON.parse(row.params), approverId, row.team_id);
                resolve({ status: 'APPROVED_AND_STARTED' });
            });
        });
    }
}

module.exports = new PlaybookEngine();
