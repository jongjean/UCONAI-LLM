const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const gdocsService = require('./gdocs_service');

const app = express();
const PORT = 18082;

app.use(cors());
app.use(bodyParser.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'UCONAI-GDOCS-API' });
});

/**
 * Endpoint to create a document based on type
 * POST /api/create
 * Body: { type: 'word' | 'excel' | 'ppt' | 'google' | 'gsheet' | 'gslide', title: string, content?: string }
 */
app.post('/api/create', async (req, res) => {
    const { type, title, content } = req.body;
    console.log(`[GDOCS_API] Create Request: ${type} - ${title}`);

    try {
        let result;
        const finalTitle = title || `UCONAI_${type.toUpperCase()}_${new Date().toLocaleDateString()}`;

        switch (type) {
            case 'google':
            case 'word': // Fallback for Word as Google Doc in this context if desired, or handle separately
                result = await gdocsService.createDoc(finalTitle, content || 'UCONAI Intelligence 자동 생성 문서입니다.');
                break;
            case 'gsheet':
            case 'excel':
                result = await gdocsService.createSheet(finalTitle);
                break;
            case 'gslide':
            case 'ppt':
                result = await gdocsService.createSlide(finalTitle);
                break;
            default:
                return res.status(400).json({ success: false, error: 'Unsupported document type' });
        }

        res.json({ success: true, ...result });
    } catch (err) {
        console.error('[GDOCS_API] Error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 UCONAI Google Documents API Server running on port ${PORT}`);
    console.log(`Check health at http://localhost:${PORT}/health\n`);
});
