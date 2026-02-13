const { google } = require("googleapis");
const {
  loadCredentials,
  buildOAuthClient,
  readTokenIfExists,
  setToken,
} = require("../lib/google_auth");

function getArg(name, def = "") {
  const idx = process.argv.indexOf("--" + name);
  if (idx === -1) return def;
  const v = process.argv[idx + 1];
  return v ?? def;
}

async function main() {
  const title = getArg("title", "UCONAI 자동 생성 문서");
  const body = getArg("body", "UCONAI에서 생성한 자동 문서입니다.");

  const credentials = loadCredentials();
  const oAuth2Client = buildOAuthClient(credentials);

  const token = readTokenIfExists();
  if (!token) {
    console.error("No token found. Run: node .\\cmd\\gdoc_auth.js");
    process.exit(1);
  }

  setToken(oAuth2Client, token);

  const docs = google.docs({ version: "v1", auth: oAuth2Client });

  const res = await docs.documents.create({
    requestBody: { title },
  });

  const documentId = res.data.documentId;
  console.log("Document created:", documentId);
  console.log("Open:", "https://docs.google.com/document/d/" + documentId);

  await docs.documents.batchUpdate({
    documentId,
    requestBody: {
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: body + "\n",
          },
        },
      ],
    },
  });

  console.log("Content inserted.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
