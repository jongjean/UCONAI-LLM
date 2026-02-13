/**
 * UCONAI 2.0 - Standard Context7 Connector (v2.2)
 * Implementation of the 3-Tier Pipeline: Pull -> Sync -> Index
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import 'dotenv/config'; // Load .env for CONTEXT7_TOKEN

class Context7Connector {
    constructor(configPath) {
        this.configPath = configPath;
        this.config = null;
    }

    async init() {
        const configData = await fs.readFile(this.configPath, 'utf8');
        this.config = JSON.parse(configData);

        // Ensure Vault directories exist
        const dirs = ['raw', 'meta', 'index'];
        for (const dir of dirs) {
            await fs.mkdir(path.join(this.config.vaultRoot, dir), { recursive: true });
        }

        console.log(`[Connector] Vault initialized at: ${this.config.vaultRoot}`);
    }

    /**
     * Helper: Generate SHA256 Hash
     */
    generateHash(content) {
        return crypto.createHash('sha256').update(content).digest('hex');
    }

    /**
     * Phase 1: Pull (Full Snapshot)
     * Fetches all documents and saves them to the Vault 'raw' folder.
     */
    async pull(projectPath) {
        console.log(`[P1: Pull] Starting snapshot for project: ${projectPath}`);

        const token = process.env[this.config.tokenEnv];
        if (!token) {
            console.error(`[Error] Auth Token missing in ${this.config.tokenEnv}`);
            return;
        }

        // --- Mocking API Call for Structure ---
        // In real implementation, this would be a fetch() call to context7.com/api/...

        const projectKey = projectPath.replace(/\//g, '_').replace(/^_+/, '');
        const projectMetaDir = path.join(this.config.vaultRoot, 'meta', projectKey);
        const projectRawDir = path.join(this.config.vaultRoot, 'raw', projectKey);

        await fs.mkdir(projectMetaDir, { recursive: true });
        await fs.mkdir(projectRawDir, { recursive: true });

        console.log(`[P1] Ready to receive data into ${projectRawDir}`);

        // Final Output: manifest.json update
        const manifest = {
            project: projectPath,
            last_synced_at: new Date().toISOString(),
            documents: []
        };

        await fs.writeFile(
            path.join(projectMetaDir, 'manifest.json'),
            JSON.stringify(manifest, null, 2)
        );

        console.log(`[P1] Manifest established at: ${projectKey}/manifest.json`);
    }

    /**
     * Phase 2: Sync (Incremental Update)
     * Compares local hashes with remote and updates only changed files.
     */
    async sync(projectPath) {
        console.log(`[P2: Sync] Checking for updates on ${projectPath}...`);
        // Logic: Read manifest -> Compare with Remote API -> Fetch selection
    }

    /**
     * Phase 3: Index (Intelligence)
     * Prepares data for LLM consumption (Markdown transformation, Vectorizing).
     */
    async index(projectPath) {
        console.log(`[P3: Index] Building search index for ${projectPath}...`);
    }
}

// Logic to run based on command line or environment
const run = async () => {
    // Robust path resolution for ESM
    const scriptDir = path.dirname(new URL(import.meta.url).pathname).substring(process.platform === 'win32' ? 1 : 0);
    const configPath = path.join(scriptDir, 'context7.config.json');

    const connector = new Context7Connector(configPath);
    await connector.init();

    // Default action (example)
    const project = process.argv[2] || '/ucon/master-plan';
    await connector.pull(project);
};

run().catch(err => console.error(`[Critical Error] ${err.message}`));
