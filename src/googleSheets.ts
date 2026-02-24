import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import dotenv from "dotenv";


dotenv.config();

const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID || "";

const credentials = JSON.parse(
  Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT!, "base64").toString("utf8")
);
console.log(credentials, "me llega aca la contraseña");
console.log(
  "🔑 PRIVATE KEY LENGTH:",
  credentials.private_key?.length
);
const auth = new JWT({
  email: credentials.client_email,
  key: credentials.private_key.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const doc = new GoogleSpreadsheet(GOOGLE_SHEETS_ID, auth);

export async function appendToSheet(data: any) {
  console.log("📄 appendToSheet called");
  await doc.loadInfo();
  console.log("📘 Spreadsheet loaded:", doc.title);
  const sheet = doc.sheetsByIndex[0]; // Usa la primera hoja
  console.log("📗 Using sheet:", sheet.title);

  console.log("🧾 Headers:", sheet.headerValues);
  await sheet.addRow(data);
  console.log("✅ Row added");
}