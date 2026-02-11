// Tool Auto-Discovery System
// Automatically detects and registers available applications and tools

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ToolDiscovery {
    constructor() {
        this.discoveredTools = new Map();
        this.scanPaths = [
            'C:\\Program Files',
            'C:\\Program Files (x86)',
            process.env.LOCALAPPDATA,
            process.env.APPDATA
        ];
        this.knownApps = {
            'EXCEL.EXE': { category: 'office', tool: 'excel' },
            'WINWORD.EXE': { category: 'office', tool: 'word' },
            'POWERPNT.EXE': { category: 'office', tool: 'powerpoint' },
            'Photoshop.exe': { category: 'creative', tool: 'photoshop' },
            'chrome.exe': { category: 'browser', tool: 'chrome' },
            'Code.exe': { category: 'development', tool: 'vscode' },
            'python.exe': { category: 'development', tool: 'python' },
            'node.exe': { category: 'development', tool: 'node' }
        };
    }

    // Scan system for installed applications
    scanSystem() {
        console.log('Starting system scan for tools...');

        // Method 1: Query Windows Registry
        this.scanRegistry();

        // Method 2: Check common installation paths
        this.scanCommonPaths();

        // Method 3: Query running processes
        this.scanRunningProcesses();

        console.log(`Discovery complete: ${this.discoveredTools.size} tools found`);
        return Array.from(this.discoveredTools.values());
    }

    scanRegistry() {
        try {
            const script = `
                $apps = Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* |
                        Select-Object DisplayName, InstallLocation, DisplayVersion |
                        Where-Object { $_.DisplayName -ne $null }
                $apps | ConvertTo-Json -Compress
            `;
            const result = execSync(`powershell -Command "${script}"`, { encoding: 'utf8' });
            const apps = JSON.parse(result || '[]');

            if (Array.isArray(apps)) {
                apps.forEach(app => {
                    if (app.DisplayName && app.InstallLocation) {
                        this.registerDiscoveredApp(app.DisplayName, app.InstallLocation, app.DisplayVersion);
                    }
                });
            }
        } catch (error) {
            console.error('Registry scan error:', error.message);
        }
    }

    scanCommonPaths() {
        const programFiles = 'C:\\Program Files';
        const programFilesX86 = 'C:\\Program Files (x86)';

        [programFiles, programFilesX86].forEach(baseDir => {
            try {
                if (fs.existsSync(baseDir)) {
                    const dirs = fs.readdirSync(baseDir);
                    dirs.slice(0, 50).forEach(dir => { // Limit to first 50 for performance
                        const fullPath = path.join(baseDir, dir);
                        this.checkForExecutables(fullPath, dir);
                    });
                }
            } catch (error) {
                // Skip inaccessible directories
            }
        });
    }

    checkForExecutables(dirPath, appName) {
        try {
            const files = fs.readdirSync(dirPath);
            files.forEach(file => {
                if (file.toLowerCase().endsWith('.exe')) {
                    const exeName = file.toUpperCase();
                    if (this.knownApps[exeName]) {
                        const info = this.knownApps[exeName];
                        this.discoveredTools.set(info.tool, {
                            name: info.tool,
                            category: info.category,
                            executable: path.join(dirPath, file),
                            version: 'detected',
                            source: 'filesystem'
                        });
                    }
                }
            });
        } catch (error) {
            // Skip inaccessible directories
        }
    }

    scanRunningProcesses() {
        try {
            const processes = execSync('tasklist', { encoding: 'utf8' });
            Object.keys(this.knownApps).forEach(exeName => {
                if (processes.includes(exeName)) {
                    const info = this.knownApps[exeName];
                    if (!this.discoveredTools.has(info.tool)) {
                        this.discoveredTools.set(info.tool, {
                            name: info.tool,
                            category: info.category,
                            executable: exeName,
                            version: 'unknown',
                            source: 'running_process'
                        });
                    }
                }
            });
        } catch (error) {
            console.error('Process scan error:', error.message);
        }
    }

    registerDiscoveredApp(name, location, version) {
        // Check if this is a known application
        const lowerName = name.toLowerCase();
        if (lowerName.includes('microsoft office') || lowerName.includes('excel')) {
            this.discoveredTools.set('office', {
                name: 'Microsoft Office',
                category: 'office',
                location: location,
                version: version || 'unknown',
                source: 'registry'
            });
        }
        else if (lowerName.includes('adobe')) {
            this.discoveredTools.set('adobe', {
                name: name,
                category: 'creative',
                location: location,
                version: version || 'unknown',
                source: 'registry'
            });
        }
    }

    // Generate tool metadata for MCP registration
    generateToolMetadata(toolInfo) {
        return {
            name: `${toolInfo.name}_execute`,
            description: `Execute ${toolInfo.name}`,
            category: toolInfo.category,
            parameters: {
                command: { type: "string", required: false },
                args: { type: "array", required: false }
            },
            metadata: toolInfo
        };
    }

    // Auto-register tools with MCP server
    autoRegisterTools(mcpServer) {
        const tools = this.scanSystem();
        let registered = 0;

        tools.forEach(tool => {
            const metadata = this.generateToolMetadata(tool);
            // In a real implementation, this would register with the MCP server
            console.log(`Auto-registered: ${metadata.name} (${tool.category})`);
            registered++;
        });

        return registered;
    }

    // Save discovery results
    saveDiscoveryResults(outputPath) {
        const results = {
            timestamp: new Date().toISOString(),
            total_tools: this.discoveredTools.size,
            tools: Array.from(this.discoveredTools.values())
        };

        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
        return results;
    }
}

module.exports = ToolDiscovery;
