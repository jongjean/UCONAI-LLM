const readline = require("readline");
const {
  loadCredentials,
  buildOAuthClient,
  readTokenIfExists,
  saveToken,
  getAuthUrl,
  setToken,
} = require("../lib/google_auth");

async function main() {
  const credentials = loadCredentials();
  const oAuth2Client = buildOAuthClient(credentials);

  const token = readTokenIfExists();
  if (token) {
    console.log("Token already exists. No auth needed.");
    process.exit(0);
  }

  const url = getAuthUrl(oAuth2Client);
  console.log("\nOpen this URL in your browser:\n");
  console.log(url);
  console.log("\nPaste the authorization code here:");

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question("> ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, tokenObj) => {
      if (err) {
        console.error("Token exchange failed:", err.message || err);
        process.exit(1);
      }
      setToken(oAuth2Client, tokenObj);
      saveToken(tokenObj);
      console.log("\nToken saved OK.\n");
      process.exit(0);
    });
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
