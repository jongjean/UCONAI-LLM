const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");
const { spawn } = require("child_process");
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG_PATH = path.join(__dirname, '../config/mcp_servers.json');

// --- Helper: Load Config ---
function loadConfig() {
    try {
        const data = fs.readFileSync(CONFIG_PATH, 'utf8');
        return JSON.parse(data).mcpServers || {};
    } catch (e) {
        console.error("Failed to load mcp_servers.json", e);
        return {};
    }
}

// --- Helper: Launch Server ---
async function connectToServer(name, config) {
    if (config.disabled) {
        console.log(`[MCP] Server '${name}' is disabled.`);
        return null;
    }

    console.log(`[MCP] Connecting to '${name}'...`);

    // Spawn Process
    const process = spawn(config.command, config.args, {
        env: { ...process.env, ...config.env },
        stdio: ['pipe', 'pipe', 'inherit'] // MCP uses stdio
    });

    const transport = new StdioClientTransport({
        source: process.stdout,
        sink: process.stdin
    });

    const client = new Client({
        name: "uconai-client",
        version: "1.0.0"
    }, {
        capabilities: {}
    });

    try {
        await client.connect(transport);
        console.log(`[MCP] Connected to '${name}' successfully.`);

        // List Available Tools
        const tools = await client.listTools();
        console.log(`[MCP] Tools from '${name}':`, tools.tools.map(t => t.name).join(', '));

        return { name, client, process };
    } catch (e) {
        console.error(`[MCP] Failed to connect to '${name}':`, e);
        return null;
    }
}

// --- Main ---
async function main() {
    console.log("=== UCONAI MCP Orchestrator Start ===");
    const servers = loadConfig();
    const connections = [];

    for (const [name, config] of Object.entries(servers)) {
        const conn = await connectToServer(name, config);
        if (conn) connections.push(conn);
    }

    console.log(`=== MCP Initialization Complete. ${connections.length} servers active. ===`);

    // Keep alive
    setInterval(() => { }, 10000);
}

main().catch(console.error);
