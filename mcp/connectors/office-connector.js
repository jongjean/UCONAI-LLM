// Office 365 MCP Connector
// Provides integration with Excel, Word, PowerPoint

const fs = require('fs');
const { execSync } = require('child_process');

class OfficeMCPConnector {
    constructor() {
        this.supportedApps = ['excel', 'word', 'powerpoint'];
        this.tools = new Map();
        this.initializeTools();
    }

    initializeTools() {
        // Excel Tools
        this.registerTool({
            name: "excel_open",
            description: "Open an Excel file",
            app: "excel",
            parameters: {
                path: { type: "string", required: true }
            },
            handler: this.excelOpen.bind(this)
        });

        this.registerTool({
            name: "excel_read_cell",
            description: "Read value from specific cell",
            app: "excel",
            parameters: {
                path: { type: "string", required: true },
                sheet: { type: "string", required: false, default: "Sheet1" },
                cell: { type: "string", required: true }
            },
            handler: this.excelReadCell.bind(this)
        });

        this.registerTool({
            name: "excel_write_cell",
            description: "Write value to specific cell",
            app: "excel",
            parameters: {
                path: { type: "string", required: true },
                sheet: { type: "string", required: false, default: "Sheet1" },
                cell: { type: "string", required: true },
                value: { type: "string", required: true }
            },
            handler: this.excelWriteCell.bind(this)
        });

        // PowerPoint Tools
        this.registerTool({
            name: "ppt_create",
            description: "Create a new PowerPoint presentation",
            app: "powerpoint",
            parameters: {
                path: { type: "string", required: true },
                title: { type: "string", required: true }
            },
            handler: this.pptCreate.bind(this)
        });

        // Word Tools
        this.registerTool({
            name: "word_create",
            description: "Create a new Word document",
            app: "word",
            parameters: {
                path: { type: "string", required: true },
                content: { type: "string", required: true }
            },
            handler: this.wordCreate.bind(this)
        });
    }

    registerTool(tool) {
        this.tools.set(tool.name, tool);
    }

    // Excel Handlers (using COM automation via PowerShell)
    async excelOpen(params) {
        try {
            const script = `
                $excel = New-Object -ComObject Excel.Application
                $excel.Visible = $true
                $workbook = $excel.Workbooks.Open('${params.path}')
                @{ success = $true; message = "Excel opened" } | ConvertTo-Json
            `;
            const result = execSync(`powershell -Command "${script}"`, { encoding: 'utf8' });
            return JSON.parse(result);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async excelReadCell(params) {
        try {
            const script = `
                $excel = New-Object -ComObject Excel.Application
                $workbook = $excel.Workbooks.Open('${params.path}')
                $sheet = $workbook.Worksheets.Item('${params.sheet || 'Sheet1'}')
                $value = $sheet.Range('${params.cell}').Text
                $workbook.Close($false)
                $excel.Quit()
                @{ success = $true; value = $value } | ConvertTo-Json
            `;
            const result = execSync(`powershell -Command "${script}"`, { encoding: 'utf8' });
            return JSON.parse(result);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async excelWriteCell(params) {
        try {
            const script = `
                $excel = New-Object -ComObject Excel.Application
                $workbook = $excel.Workbooks.Open('${params.path}')
                $sheet = $workbook.Worksheets.Item('${params.sheet || 'Sheet1'}')
                $sheet.Range('${params.cell}').Value2 = '${params.value}'
                $workbook.Save()
                $workbook.Close($false)
                $excel.Quit()
                @{ success = $true; message = "Cell updated" } | ConvertTo-Json
            `;
            const result = execSync(`powershell -Command "${script}"`, { encoding: 'utf8' });
            return JSON.parse(result);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async pptCreate(params) {
        try {
            const script = `
                $ppt = New-Object -ComObject PowerPoint.Application
                $ppt.Visible = $true
                $presentation = $ppt.Presentations.Add()
                $slide = $presentation.Slides.Add(1, 1)
                $slide.Shapes.Title.TextFrame.TextRange.Text = '${params.title}'
                $presentation.SaveAs('${params.path}')
                $presentation.Close()
                $ppt.Quit()
                @{ success = $true; message = "PowerPoint created" } | ConvertTo-Json
            `;
            const result = execSync(`powershell -Command "${script}"`, { encoding: 'utf8' });
            return JSON.parse(result);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async wordCreate(params) {
        try {
            const script = `
                $word = New-Object -ComObject Word.Application
                $doc = $word.Documents.Add()
                $doc.Content.Text = '${params.content}'
                $doc.SaveAs('${params.path}')
                $doc.Close()
                $word.Quit()
                @{ success = $true; message = "Word document created" } | ConvertTo-Json
            `;
            const result = execSync(`powershell -Command "${script}"`, { encoding: 'utf8' });
            return JSON.parse(result);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    getTools() {
        return Array.from(this.tools.values());
    }

    async executeTool(toolName, parameters) {
        if (!this.tools.has(toolName)) {
            return { success: false, error: `Tool '${toolName}' not found` };
        }
        const tool = this.tools.get(toolName);
        return await tool.handler(parameters);
    }
}

module.exports = OfficeMCPConnector;
