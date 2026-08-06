# Guía para operadores — Turnos Calendly → Planilla

Esta planilla se carga **sola** cuando alguien agenda un turno en Calendly.  
No hace falta copiar datos a mano.

Para que siga funcionando, hay reglas simples. Si se rompen, los turnos dejan de aparecer (o aparecen mal).

---

## Qué hace el sistema (en una frase)

Cada vez que una persona reserva en Calendly, se agrega **una fila nueva** al final de la planilla con: turno, nombre, teléfono, día y hora.

---

## Reglas de oro (no romper)

### 1. No renombres estos encabezados

En la **primera fila** de la hoja principal deben existir exactamente estos nombres:

| Encabezado (dejar así) |
|------------------------|
| `Turno` |
| `Nombre` |
| `Telefono` |
| `Dia` |
| `Hora` |

**No cambiar** a cosas como:

- `Teléfono` (con acento)
- `Día` (con acento)
- `Cliente` en lugar de `Nombre`
- `Fecha` en lugar de `Dia`
- `Horario` en lugar de `Hora`

Si necesitás otros títulos para leer mejor, pedile al equipo técnico que adapte el sistema. **No los cambies vos en la planilla.**

### 2. No borres ni muevas la primera fila (encabezados)

Esa fila es la “llave” para que el sistema sepa en qué columna poner cada dato.

### 3. Trabajá siempre sobre la primera hoja (pestaña)

El sistema escribe en la **primera pestaña** del archivo.  
Si reordenás las pestañas y otra hoja queda primera, los datos pueden ir al lugar equivocado.

### 4. No bloquees / protejas la hoja de forma que impida escribir

Si hay protección de celdas o de hoja, asegurate de que la cuenta automática del sistema (Service Account de Google) siga pudiendo **editar**.  
Si no sabés si está compartida: consultá con desarrollo antes de cambiar permisos o dueños del archivo.

### 5. Podés editar o borrar filas de datos

Sí está permitido:

- Corregir un nombre o teléfono a mano
- Borrar filas de prueba (`TEST…`)
- Agregar columnas **nuevas** a la derecha (con otro nombre), siempre que **no** toques las 5 columnas de arriba

Evitar:

- Insertar columnas **en el medio** de `Turno / Nombre / Telefono / Dia / Hora` si eso desplaza o renombra esos encabezados
- Filtrar/ocultar de forma permanente la fila 1

### 6. No crees un archivo “copia” y esperes que siga actualizándose solo

Si hacés “Archivo → Hacer una copia”, la copia **no** recibe los turnos nuevos.  
El sistema sigue escribiendo en el spreadsheet original (el que tiene el ID configurado).

---

## Cómo saber si está funcionando

1. Agendá un turno de prueba en Calendly (o pedile a alguien que lo haga).
2. Abrí la planilla y buscá una fila nueva con ese nombre / teléfono / horario.
3. Si no aparece en unos minutos, avisá a desarrollo.

También podés mirar si siguen entrando turnos reales día a día. Si un día “deja de llenarse”, no asumas que Calendly falló: puede ser un cambio en encabezados o permisos.

---

## Checklist rápido si “dejó de funcionar”

Antes de avisar, revisá:

- [ ] ¿Los encabezados siguen siendo exactamente `Turno`, `Nombre`, `Telefono`, `Dia`, `Hora`?
- [ ] ¿La primera pestaña del archivo sigue siendo la hoja de turnos?
- [ ] ¿No se cambió el archivo por una copia nueva?
- [ ] ¿Alguien quitó permisos de edición del archivo?
- [ ] ¿Hay turnos nuevos reales en Calendly que deberían haber llegado?

Si todo eso está bien y aun así no llegan filas → contactar a desarrollo.

---

## Qué pedirle a desarrollo (cuando haga falta)

- Cambiar nombres de columnas (porque negocio los necesita distintos)
- Apuntar a otra planilla o a otra pestaña
- Recuperar turnos viejos que no se grabaron
- Revisar el servidor / webhook de Calendly

---

## Resumen en 4 líneas

1. Los turnos se cargan solos desde Calendly.  
2. No renombres `Turno`, `Nombre`, `Telefono`, `Dia`, `Hora`.  
3. No toques la primera fila ni pongas otra hoja como primera.  
4. Si no llegan filas nuevas, usá el checklist y avisá a desarrollo.
