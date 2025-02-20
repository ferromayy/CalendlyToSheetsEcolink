import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { appendToSheet } from "./googleSheets";

dotenv.config();

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

app.post("/webhook/calendly", async (req, res) => {
  try {
    const eventData = req.body.payload || {};
    console.log("este es el array que llega");

    const questionsAndAnswers = eventData.questions_and_answers || [];
    const answers = questionsAndAnswers.map(
      (qa: any) => qa.answer || "No answer"
    );
    const startTime = eventData.scheduled_event?.start_time
      ? new Date(eventData.scheduled_event.start_time)
      : null;

      const formattedDate = startTime
      ? `${startTime.getDate()}/${startTime.getMonth() + 1}/${startTime.getFullYear()}`
      : "0";
    
    // const formattedPhone =
    //   answers.length > 0
    //     ? answers[0].replace(/[\s-]/g, "") // Elimina espacios y guiones
    //     : "0";

    const formattedPhone =
      answers.length > 0 ? formatPhoneNumber(answers[0]) : "0";

    // const formattedPhone =
    //   answers.length > 0 ? formatPhoneNumber(answers[0]) : "0";

    const formattedTime = startTime
      ? startTime.toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : "0";

    console.log("startTime", formattedDate);
    console.log("formattedPhone:", formattedPhone);
    console.log("startTime", formattedTime);

    const rowData = {
      Turno: eventData.scheduled_event?.name.toString() ?? "0",
      Nombre: eventData.name?.toString() ?? "0",
      Telefono: formattedPhone.toString() ?? "0",
      //hacer logica para dividir y que ingrese con mismo formato
      Dia: formattedDate,
      Hora: formattedTime.toString() ?? "0",
    };

    console.log(
      rowData,
      "aca te paso toda la data que deberia llegar a apreadshee"
    );

    // Guardar en Google Sheets
    await appendToSheet(rowData);

    res.status(200).send("Webhook received");
  } catch (error) {
    console.error(
      "Error procesando el webhook:",
      (error as any).message || error
    );
    res.status(500).send("Hubo un error procesando el webhook.");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
