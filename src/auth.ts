import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
import { existsSync, readFileSync, writeFileSync } from "fs";
dotenv.config();

const tokenPath = "token.json";

export const oauth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

export function getAuthUrl() {
  const scope = process.env.GOOGLE_SCOPE || "https://www.googleapis.com/auth/drive.readonly";
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope
  });
}

export async function initToken() {
  if (existsSync(tokenPath)) {
    const data = JSON.parse(readFileSync(tokenPath, "utf8"));
    oauth2Client.setCredentials(data);
    return true;
  }
  return false;
}

export async function exchangeCode(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
  return tokens;
}
