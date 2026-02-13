const fs = require("fs");
const path = require("path");
require("dotenv").config();
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/documents"];

function loadCredentials() {
  const p = process.env.GOOGLE_CREDENTIALS_PATH;
  if (!p) throw new Error("GOOGLE_CREDENTIALS_PATH missing in .env");
  if (!fs.existsSync(p)) throw new Error("Credentials file not found: " + p);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function loadTokenPath() {
  const p = process.env.GOOGLE_TOKEN_PATH;
  if (!p) throw new Error("GOOGLE_TOKEN_PATH missing in .env");
  return p;
}

function buildOAuthClient(credentials) {
  const installed = credentials.installed || credentials.web;
  if (!installed) throw new Error("Invalid credentials JSON (missing installed/web)");
  const { client_id, client_secret, redirect_uris } = installed;
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}

function getAuthUrl(oAuth2Client) {
  return oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
}

function setToken(oAuth2Client, tokenObj) {
  oAuth2Client.setCredentials(tokenObj);
}

function readTokenIfExists() {
  const tokenPath = loadTokenPath();
  if (!fs.existsSync(tokenPath)) return null;
  return JSON.parse(fs.readFileSync(tokenPath, "utf8"));
}

function saveToken(tokenObj) {
  const tokenPath = loadTokenPath();
  const dir = path.dirname(tokenPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(tokenPath, JSON.stringify(tokenObj, null, 2));
}

module.exports = {
  loadCredentials,
  buildOAuthClient,
  readTokenIfExists,
  saveToken,
  getAuthUrl,
  setToken,
};
