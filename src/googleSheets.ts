import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import dotenv from "dotenv";


dotenv.config();

const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID || "";

const credentials = JSON.parse(
  Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT!, "base64").toString("utf8")
);
console.log(credentials, "me llega aca la contraseña");
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
