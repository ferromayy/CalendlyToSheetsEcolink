import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { appendToSheet } from "./googleSheets";

dotenv.config();

console.log("Sheets ID:", process.env.GOOGLE_SHEETS_ID);
console.log("Service Account exists:", !!process.env.GOOGLE_SERVICE_ACCOUNT);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Calendly Webhook Server is running!");
});

function formatPhoneNumber(phone: string): string {
  // Eliminar espacios y guiones
  let cleanedPhone = phone.replace(/[\s-]/g, "");

  // Verificar si el cuarto carácter es un "9"
  if (cleanedPhone.length >= 4 && cleanedPhone[3] !== "9") {
    cleanedPhone = cleanedPhone.slice(0, 3) + "9" + cleanedPhone.slice(3);
  }

  return cleanedPhone;
}

async function handleCalendlyWebhook(req: express.Request, res: express.Response) {
  const eventData = req.body.payload || req.body || {};
  console.log("este es el array que llega");

  const questionsAndAnswers = eventData.questions_and_answers || [];
  const answers = questionsAndAnswers.map(
    (qa: any) => qa.answer || "No answer"
  );
  const startTime = eventData.scheduled_event?.start_time
    ? new Date(eventData.scheduled_event.start_time)
    : null;

  const formattedDate = startTime
    ? `${startTime.getDate()}/${
        startTime.getMonth() + 1
      }/${startTime.getFullYear()}`
    : "0";

  const formattedPhone =
    answers.length > 0 ? formatPhoneNumber(answers[0]) : "0";

  const formattedTime = startTime
    ? new Date(startTime.getTime() - 3 * 60 * 60 * 1000).toLocaleTimeString(
        "es-AR",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }
      )
    : "0";

  console.log("startTime", formattedDate);
  console.log("formattedPhone:", formattedPhone);
  console.log("startTime", formattedTime);

  const rowData = {
    Turno: eventData.scheduled_event?.name.toString() ?? "0",
    Nombre: eventData.name?.toString() ?? "0",
    Telefono: formattedPhone.toString() ?? "0",
    Dia: formattedDate,
    Hora: formattedTime.toString() ?? "0",
  };

  console.log(
    rowData,
    "aca te paso toda la data que deberia llegar a apreadshee"
  );

  await appendToSheet(rowData);

  res.status(200).send("Webhook received");
}

app.post("/webhook/calendly", async (req, res) => {
  try {
    await handleCalendlyWebhook(req, res);
  } catch (error) {
    console.error(
      "Error procesando el webhook:",
      (error as any).message || error
    );
    res.status(500).send("Hubo un error procesando el webhook.");
  }
});

// Calendly puede estar registrado con esta URL; sin esta ruta los hooks no llegan
app.post("/webhook/calendly-v2", async (req, res) => {
  try {
    await handleCalendlyWebhook(req, res);
  } catch (error) {
    console.error(
      "Error procesando el webhook (calendly-v2):",
      (error as any).message || error
    );
    res.status(500).send("Hubo un error procesando el webhook.");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});