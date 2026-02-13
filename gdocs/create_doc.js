const fs = require('fs');
const { google } = require('googleapis');
const readline = require('readline');

const SCOPES = ['https://www.googleapis.com/auth/documents'];
const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = './client_secret_2_616611367543-jq7kvt57m0r4tu5982ht9mqrgat6lk8d.apps.googleusercontent.com.json';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function authorize() {
  const content = fs.readFileSync(CREDENTIALS_PATH);
  const credentials = JSON.parse(content);
  const { client_secret, client_id } = credentials.installed;

  // 🔥 redirect_uri 강제 OOB 방식 사용
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    'urn:ietf:wg:oauth:2.0:oob'
  );

  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    return createDoc(oAuth2Client);
  } else {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });

    console.log('\nAuthorize this app by visiting this URL:\n');
    console.log(authUrl);
    console.log('\n');

    rl.question('Paste the authorization code here: ', (code) => {
      oAuth2Client.getToken(code, (err, token) => {
        if (err) {
          console.error('Error retrieving access token', err);
          return;
        }

        oAuth2Client.setCredentials(token);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
        console.log('\nToken stored to', TOKEN_PATH, '\n');

        createDoc(oAuth2Client);
      });
    });
  }
}

async function createDoc(auth) {
  const docs = google.docs({ version: 'v1', auth });

  const res = await docs.documents.create({
    requestBody: {
      title: 'UCONAI 자동 생성 문서',
    },
  });

  const documentId = res.data.documentId;
  console.log('\nDocument created successfully!');
  console.log('Document ID:', documentId);
  console.log('Open URL: https://docs.google.com/document/d/' + documentId + '\n');

  await docs.documents.batchUpdate({
    documentId,
    requestBody: {
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text:
              'UCONAI에서 생성한 자동 문서입니다.\n\nWorld ESG Forum 자동화 테스트 성공.\n\nGoogle Docs API 연결 완료.',
          },
        },
      ],
    },
  });

  console.log('Content inserted successfully.\n');
}

authorize();
