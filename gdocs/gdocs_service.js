const fs = require('fs');
const { google } = require('googleapis');
const path = require('path');

const SCOPES = [
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/presentations',
    'https://www.googleapis.com/auth/drive.file'
];

const TOKEN_PATH = 'C:\\UCONAI-Vault\\secrets\\token_gdocs.json';
const CREDENTIALS_PATH = 'C:\\UCONAI-Vault\\secrets\\client_secret_2_616611367543-jq7kvt57m0r4tu5982ht9mqrgat6lk8d.apps.googleusercontent.com.json';

async function getAuthClient() {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
        throw new Error('Google Credentials not found at ' + CREDENTIALS_PATH);
    }
    const content = fs.readFileSync(CREDENTIALS_PATH);
    const credentials = JSON.parse(content);
    const { client_secret, client_id } = credentials.installed;

    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        'urn:ietf:wg:oauth:2.0:oob'
    );

    if (fs.existsSync(TOKEN_PATH)) {
        const token = fs.readFileSync(TOKEN_PATH);
        oAuth2Client.setCredentials(JSON.parse(token));
        return oAuth2Client;
    } else {
        throw new Error('Google Token not found. Please run authorize script first.');
    }
}

/**
 * Create a Google Document
 */
async function createDoc(title, content) {
    const auth = await getAuthClient();
    const docs = google.docs({ version: 'v1', auth });

    const res = await docs.documents.create({
        requestBody: { title }
    });

    const documentId = res.data.documentId;

    if (content) {
        await docs.documents.batchUpdate({
            documentId,
            requestBody: {
                requests: [{
                    insertText: {
                        location: { index: 1 },
                        text: content
                    }
                }]
            }
        });
    }

    return {
        id: documentId,
        url: `https://docs.google.com/document/d/${documentId}`,
        type: 'DOC'
    };
}

/**
 * Create a Google Sheet
 */
async function createSheet(title) {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });

    const res = await sheets.spreadsheets.create({
        requestBody: {
            properties: { title }
        }
    });

    const spreadsheetId = res.data.spreadsheetId;
    return {
        id: spreadsheetId,
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
        type: 'SHEET'
    };
}

/**
 * Create a Google Slide
 */
async function createSlide(title) {
    const auth = await getAuthClient();
    const slides = google.slides({ version: 'v1', auth });

    const res = await slides.presentations.create({
        requestBody: { title }
    });

    const presentationId = res.data.presentationId;
    return {
        id: presentationId,
        url: `https://docs.google.com/presentations/d/${presentationId}`,
        type: 'SLIDE'
    };
}

module.exports = {
    createDoc,
    createSheet,
    createSlide
};
