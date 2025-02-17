import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID || "";

const credentialsPath = path.join(__dirname, "../google-service-account.json");

const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));
const auth = new JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const doc = new GoogleSpreadsheet(GOOGLE_SHEETS_ID, auth);

export async function appendToSheet(data: any) {
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0]; // Usa la primera hoja
  await sheet.addRow(data);
}
