# Calendly → Google Sheets (Ecolink)

Servidor Express que recibe webhooks de Calendly y agrega cada reserva como una fila en Google Sheets.

> Guía para operadores (sin código): ver [`GUIA_OPERADOR.md`](./GUIA_OPERADOR.md).

## Qué hace

Cuando alguien agenda un turno en Calendly:

1. Calendly envía un `POST` al servidor.
2. La app normaliza teléfono, fecha y hora (formato Argentina).
3. Escribe una fila en la **primera hoja** del spreadsheet configurado.

```
Calendly (webhook)
  → Render (Express)
  → Google Sheets (append row)
```

No hace polling a Calendly. No maneja cancelaciones ni reprogramaciones: solo agrega filas.

## Stack

- Node.js + TypeScript
- Express
- `google-spreadsheet` + Service Account (JWT)
- Deploy: [Render](https://calendlytosheetsecolink.onrender.com)

## Estructura

```
src/
  index.ts         # Servidor Express + handlers de webhook
  googleSheets.ts  # Auth Google + appendToSheet
```

## Rutas

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/webhook/calendly` | Webhook principal |
| `POST` | `/webhook/calendly-v2` | Misma lógica (URL alternativa ya registrada en Calendly) |

URL de producción:

- Health: `https://calendlytosheetsecolink.onrender.com/`
- Webhook: `https://calendlytosheetsecolink.onrender.com/webhook/calendly`
- Webhook v2: `https://calendlytosheetsecolink.onrender.com/webhook/calendly-v2`

## Columnas del Sheet (importante)

La app escribe con estas claves exactas (deben coincidir con los **encabezados de la fila 1** de la primera hoja):

| Columna | Origen |
|---------|--------|
| `Turno` | Nombre del evento Calendly |
| `Nombre` | Nombre del invitee |
| `Telefono` | Primera respuesta del formulario (Q&A), normalizada |
| `Dia` | Fecha del turno (`D/M/YYYY`) |
| `Hora` | Hora ART (UTC − 3h, formato `HH:mm`) |

Si el equipo renombra esos encabezados, hay que actualizar el código en `src/index.ts` (`rowData`) o restaurar los nombres.

Supuesto: la **primera pregunta** del formulario de Calendly es el teléfono.

## Variables de entorno

Crear `.env` en local (no se commitea) y configurarlas también en Render:

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto HTTP (default `3000`; Render lo setea solo) |
| `GOOGLE_SHEETS_ID` | ID del spreadsheet de Google |
| `GOOGLE_SERVICE_ACCOUNT` | JSON de la Service Account **codificado en Base64** |

### Service Account

1. Crear una Service Account en Google Cloud con acceso a Google Sheets.
2. Descargar el JSON de credenciales.
3. Codificarlo en Base64:

```bash
base64 -i credentials.json | tr -d '\n'
```

4. Pegar ese string en `GOOGLE_SERVICE_ACCOUNT`.
5. Compartir el spreadsheet con el `client_email` de la Service Account (permiso de editor).

## Desarrollo local

```bash
npm install
cp .env.example .env   # completar con valores reales
npm run dev            # nodemon + ts-node
```

Build / producción:

```bash
npm run build   # genera dist/
npm start       # node dist/index.js
```

## Webhook de Calendly

Los webhooks se gestionan por API (o desde Integraciones → API & Webhooks, según el plan).

Organización usada históricamente:

```
https://api.calendly.com/organizations/555c4ebc-3c1c-4941-bac4-35ee06491673
```

Listar subscriptions (con un Personal Access Token de Calendly):

```bash
curl --request GET \
  --url "https://api.calendly.com/webhook_subscriptions?organization=https://api.calendly.com/organizations/555c4ebc-3c1c-4941-bac4-35ee06491673&scope=organization" \
  --header "Authorization: Bearer TU_TOKEN" \
  --header "Content-Type: application/json"
```

Evento esperado: `invitee.created` (como mínimo).

Crear subscription (ejemplo):

```bash
curl --request POST \
  --url https://api.calendly.com/webhook_subscriptions \
  --header "Authorization: Bearer TU_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "url": "https://calendlytosheetsecolink.onrender.com/webhook/calendly",
    "events": ["invitee.created"],
    "organization": "https://api.calendly.com/organizations/555c4ebc-3c1c-4941-bac4-35ee06491673",
    "scope": "organization"
  }'
```

## Cómo probar

### 1. Health check

```bash
curl https://calendlytosheetsecolink.onrender.com/
# Esperado: Calendly Webhook Server is running!
```

### 2. Webhook fake (sin usar Calendly)

```bash
curl -X POST https://calendlytosheetsecolink.onrender.com/webhook/calendly \
  -H "Content-Type: application/json" \
  -d '{
    "event": "invitee.created",
    "payload": {
      "name": "TEST Debug",
      "questions_and_answers": [
        { "question": "Telefono", "answer": "+54 11 1234-5678" }
      ],
      "scheduled_event": {
        "name": "Recoleccion TEST",
        "start_time": "2026-08-10T15:00:00.000000Z"
      }
    }
  }'
```

- Si responde `200 Webhook received` → el servidor escribió en Sheets.
- Si responde `500` → error de Google (credenciales, permisos o encabezados).
- Revisar que aparezca la fila en la planilla y borrarla después.

### 3. Reserva real en Calendly

Agendar un turno de prueba y verificar la fila + los logs en Render.

## Diagnóstico rápido

| Síntoma | Qué chequear |
|---------|----------------|
| No llegan filas nuevas | Webhook activo en Calendly + logs en Render |
| Health check falla | Servicio caído o dormido en Render (plan free) |
| `500` al POST | `GOOGLE_SERVICE_ACCOUNT`, `GOOGLE_SHEETS_ID`, share del Sheet |
| Data en columnas raras | Encabezados renombrados; deben coincidir con `Turno/Nombre/Telefono/Dia/Hora` |
| Teléfono mal formateado | La 1ª pregunta del formulario debe ser el teléfono |

## Limitaciones conocidas

- Sin validación de firma/secret del webhook de Calendly.
- Sin manejo de `invitee.canceled` ni reprogramaciones.
- Zona horaria fija: −3h (Argentina); no usa IANA timezone.
- Solo escribe en `sheetsByIndex[0]` (primera pestaña).
- Render free puede “dormir” el servicio; el primer request tras inactividad puede tardar más.

## Deploy (Render)

1. Repo: `https://github.com/ferromayy/CalendlyToSheetsEcolink.git`
2. Build: `npm install && npm run build`
3. Start: `npm start`
4. Env vars: `GOOGLE_SHEETS_ID`, `GOOGLE_SERVICE_ACCOUNT`

Tras cambios en código: push a `main` y verificar que Render redeploye. Confirmar con health check + POST de test.
