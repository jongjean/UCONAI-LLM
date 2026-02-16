const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class JobManager {
    constructor(vaultPath = 'C:\\UCONAI-Vault') {
        this.vaultPath = vaultPath;
        this.jobsPath = path.join(this.vaultPath, 'jobs');
        this.activeJobs = new Map();

        if (!fs.existsSync(this.jobsPath)) {
            fs.mkdirSync(this.jobsPath, { recursive: true });
        }
    }

    createJob(type, params) {
        const jobId = crypto.randomBytes(8).toString('hex');
        const jobDir = path.join(this.jobsPath, jobId);
        fs.mkdirSync(jobDir);

        const job = {
            id: jobId,
            type,
            params,
            status: 'pending',
            progress: 0,
            startTime: new Date().toISOString(),
            endTime: null,
            result: null,
            error: null,
            logs: []
        };

        this.activeJobs.set(jobId, job);
        this.saveJob(job);
        return jobId;
    }

    getJob(jobId) {
        if (this.activeJobs.has(jobId)) {
            return this.activeJobs.get(jobId);
        }
        // Try loading from disk
        const jobFile = path.join(this.jobsPath, jobId, 'result.json');
        if (fs.existsSync(jobFile)) {
            return JSON.parse(fs.readFileSync(jobFile, 'utf8'));
        }
        return null;
    }

    updateJob(jobId, updates) {
        const job = this.getJob(jobId);
        if (!job) return;

        Object.assign(job, updates);

        if (updates.log) {
            const timestamp = new Date().toLocaleTimeString();
            const logEntry = `[${timestamp}] ${updates.log}`;
            job.logs.push(logEntry);

            // Append to physical log file
            const logFile = path.join(this.jobsPath, jobId, 'runs.log');
            fs.appendFileSync(logFile, logEntry + '\n');
        }

        if (job.status === 'completed' || job.status === 'failed') {
            job.endTime = new Date().toISOString();
            this.activeJobs.delete(jobId);
        }

        this.saveJob(job);
    }

    saveJob(job) {
        const jobFile = path.join(this.jobsPath, job.id, 'result.json');
        fs.writeFileSync(jobFile, JSON.stringify(job, null, 2));
    }

    listActiveJobs() {
        return Array.from(this.activeJobs.values());
    }
}

module.exports = new JobManager();
