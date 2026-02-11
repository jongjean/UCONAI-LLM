const http = require('http');
const fs = require('fs');
const { execSync } = require('child_process');
const OfficeMCPConnector = require('./connectors/office-connector');

class MCPServer {
    constructor(port = 18083) {
        this.port = port;
        this.tools = new Map();
        this.officeConnector = new OfficeMCPConnector();
        this.initializeTools();
        this.registerOfficeTools();
        this.registerVisionTools();
        this.registerRPATools();
    }

    registerRPATools() {
        this.registerTool({
            name: "mouse_click",
            description: "Move mouse to coordinates and click",
            parameters: {
                x: { type: "number", required: true },
                y: { type: "number", required: true }
            },
            handler: this.mouseClick.bind(this)
        });

        this.registerTool({
            name: "type_text",
            description: "Send keystrokes to the active window",
            parameters: {
                text: { type: "string", required: true }
            },
            handler: this.typeText.bind(this)
        });
    }

    async mouseClick(params) {
        try {
            const scriptPath = "C:\\UCONAI-LLM\\scripts\\vision\\RPA-Controller.ps1";
            const output = execSync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}" click ${params.x} ${params.y}`, { encoding: 'utf8' });
            return { success: true, message: output.trim() };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async typeText(params) {
        try {
            const scriptPath = "C:\\UCONAI-LLM\\scripts\\vision\\RPA-Controller.ps1";
            // Escape special chars for SendKeys if needed, but for now simple string
            const output = execSync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}" type "${params.text}"`, { encoding: 'utf8' });
            return { success: true, message: output.trim() };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    registerVisionTools() {
        this.registerTool({
            name: "capture_screen",
            description: "Capture the primary screen and return file path",
            parameters: {},
            handler: this.captureScreen.bind(this)
        });

        this.registerTool({
            name: "analyze_ui",
            description: "Perform visual analysis on a captured screen",
            parameters: {
                path: { type: "string", required: true }
            },
            handler: this.analyzeUI.bind(this)
        });
    }

    async captureScreen() {
        try {
            const scriptPath = "C:\\UCONAI-LLM\\scripts\\vision\\Vision-Engine.ps1";
            const output = execSync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}" capture`, { encoding: 'utf8' });
            return JSON.parse(output);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async analyzeUI(params) {
        try {
            const scriptPath = "C:\\UCONAI-LLM\\scripts\\vision\\Vision-Engine.ps1";
            const output = execSync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}" analyze "${params.path}"`, { encoding: 'utf8' });
            return JSON.parse(output);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    registerOfficeTools() {
        const officeTools = this.officeConnector.getTools();
        officeTools.forEach(tool => {
            this.tools.set(tool.name, {
                ...tool,
                handler: async (params) => await this.officeConnector.executeTool(tool.name, params)
            });
            console.log(`✓ Office tool registered: ${tool.name}`);
        });
    }

    initializeTools() {
        // File System Tools
        this.registerTool({
            name: "read_file",
            description: "Read contents of a file",
            parameters: {
                path: { type: "string", required: true }
            },
            handler: this.readFile.bind(this)
        });

        this.registerTool({
            name: "write_file",
            description: "Write content to a file",
            parameters: {
                path: { type: "string", required: true },
                content: { type: "string", required: true }
            },
            handler: this.writeFile.bind(this)
        });

        this.registerTool({
            name: "list_directory",
            description: "List files in a directory",
            parameters: {
                path: { type: "string", required: true }
            },
            handler: this.listDirectory.bind(this)
        });

        // System Tools
        this.registerTool({
            name: "execute_command",
            description: "Execute a PowerShell command",
            parameters: {
                command: { type: "string", required: true }
            },
            handler: this.executeCommand.bind(this)
        });

        // Information Tools
        this.registerTool({
            name: "get_system_info",
            description: "Get current system information",
            parameters: {},
            handler: this.getSystemInfo.bind(this)
        });
    }

    registerTool(tool) {
        this.tools.set(tool.name, tool);
        console.log(`✓ Tool registered: ${tool.name}`);
    }

    // Tool Handlers
    async readFile(params) {
        try {
            const content = fs.readFileSync(params.path, 'utf8');
            return { success: true, content, size: content.length };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async writeFile(params) {
        try {
            fs.writeFileSync(params.path, params.content, 'utf8');
            return { success: true, bytes_written: params.content.length };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async listDirectory(params) {
        try {
            const files = fs.readdirSync(params.path);
            const details = files.map(file => {
                const stats = fs.statSync(`${params.path}\\${file}`);
                return {
                    name: file,
                    type: stats.isDirectory() ? 'directory' : 'file',
                    size: stats.size
                };
            });
            return { success: true, files: details, count: files.length };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async executeCommand(params) {
        try {
            const output = execSync(params.command, { encoding: 'utf8' });
            return { success: true, output };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getSystemInfo() {
        try {
            const info = {
                platform: process.platform,
                node_version: process.version,
                memory: process.memoryUsage(),
                uptime: process.uptime()
            };
            return { success: true, info };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // HTTP Server
    start() {
        const server = http.createServer(async (req, res) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }

            if (req.url === '/tools' && req.method === 'GET') {
                const toolList = Array.from(this.tools.values()).map(t => ({
                    name: t.name,
                    description: t.description,
                    parameters: t.parameters
                }));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ tools: toolList }));
                return;
            }

            if (req.url === '/execute' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', async () => {
                    try {
                        const { tool, parameters } = JSON.parse(body);

                        if (!this.tools.has(tool)) {
                            res.writeHead(404, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: `Tool '${tool}' not found` }));
                            return;
                        }

                        const toolDef = this.tools.get(tool);
                        const result = await toolDef.handler(parameters);

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(result));
                    } catch (error) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: error.message }));
                    }
                });
                return;
            }

            res.writeHead(404);
            res.end('Not Found');
        });

        server.listen(this.port, () => {
            console.log(`UCONAI MCP Server listening on port ${this.port}`);
            console.log(`Tools available: ${this.tools.size}`);
        });
    }
}

// Start server
const server = new MCPServer(18083);
server.start();

module.exports = MCPServer;
