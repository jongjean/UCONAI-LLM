const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const fs = require('fs');
const path = require('path');

// --- Mock Excel Engine (CSV Handler) ---
const EXCEL_ROOT = 'C:\\UCONAI-LLM\\data\\excel';

function ensureDir() {
    if (!fs.existsSync(EXCEL_ROOT)) fs.mkdirSync(EXCEL_ROOT, { recursive: true });
}

function readCsv(filename) {
    const filePath = path.join(EXCEL_ROOT, filename);
    if (!fs.existsSync(filePath)) return "File not found.";
    return fs.readFileSync(filePath, 'utf8');
}

function appendCsv(filename, rowData) {
    const filePath = path.join(EXCEL_ROOT, filename);
    const line = rowData.join(',') + '\n';
    fs.appendFileSync(filePath, line);
    return `Appended 1 row to ${filename}`;
}

// --- MCP Server Setup ---
const server = new Server(
    { name: "excel-commander", version: "1.0.0" },
    { capabilities: { tools: {} } }
);

// 1. List Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "read_sheet",
                description: "Read contents of an Excel/CSV file",
                inputSchema: {
                    type: "object",
                    properties: {
                        filename: { type: "string", description: "Name of the file (e.g. sales.csv)" }
                    },
                    required: ["filename"]
                }
            },
            {
                name: "append_row",
                description: "Add a new row of data to a file",
                inputSchema: {
                    type: "object",
                    properties: {
                        filename: { type: "string" },
                        data: { type: "array", items: { type: "string" }, description: "Array of cell values" }
                    },
                    required: ["filename", "data"]
                }
            }
        ]
    };
});

// 2. Call Tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    ensureDir();
    const { name, arguments: args } = request.params;

    try {
        if (name === "read_sheet") {
            const content = readCsv(args.filename);
            return { content: [{ type: "text", text: content }] };
        }
        if (name === "append_row") {
            const result = appendCsv(args.filename, args.data);
            return { content: [{ type: "text", text: result }] };
        }
        return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
    } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
});

// --- Start Server ---
async function run() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Excel Commander MCP running on stdio");
}

run().catch(console.error);
