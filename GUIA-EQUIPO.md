# Guía del equipo – cómo trabajar con su IA

Esta guía explica a cada integrante **qué le toca**, **cómo preparar su computadora** y **qué escribirle a su IA** para que entienda el contexto.

---

## 0. Preparación (una sola vez)

1. Aceptar la invitación al repositorio (correo o https://github.com/notifications).
2. Configurar Git con **su** nombre y el correo de **su** cuenta de GitHub:
   ```
   git config --global user.name "Nombre Apellido"
   git config --global user.email "correo-de-su-cuenta@ejemplo.com"
   ```
3. Clonar:
   ```
   git clone https://github.com/Javiii3er/ai-code-wars-expedientes.git
   ```
4. Abrir en Visual Studio 2022: **Archivo → Abrir → Carpeta** → `ai-code-wars-expedientes`.
5. Ver la app: clic derecho en `index.html` → **Ver en el explorador**.

## Comprobar su parte automáticamente

Abran `pruebas.html` igual que `index.html`. Ahí se ejecutan las comprobaciones de las reglas, en verde las que cumplen y en rojo las que fallan, con el motivo. No borra los expedientes guardados.
- Karla: debe pasar todo el bloque **Recorrido 2 – Consulta y búsqueda**.
- Nahomi: debe pasar todo el bloque **Recorrido 3 – Seguimiento y cierre** y **Persistencia**.

Si una prueba falla y creen que la prueba está mal, avisen a Javier. No modifiquen `js/pruebas.js`.

## Reglas de trabajo

- **Solo editar sus propios archivos** (ver tabla). Así no hay conflictos.
- **Antes de empezar y antes de cada push:** ventana *Git Changes* → **Pull**.
- **Commits pequeños y frecuentes**, formato `tipo: descripción` (`feat:`, `fix:`, `style:`).
- **Revisar y entender todo lo que proponga la IA.** El jurado puede preguntarle a cualquiera cómo funciona su parte.
- **Datos siempre ficticios.** La app no da asesoría jurídica.

| Integrante | Le toca | Archivos que puede editar |
|---|---|---|
| Karla (Compañera 1) | Listado, búsqueda, detalle e historial | `js/consulta.js`, `css/consulta.css` |
| Nahomi (Compañera 2) | Actividades, estados y cierre | `js/seguimiento.js`, `css/seguimiento.css` |
| Javier | Apertura, integración, README, pruebas | `js/app.js`, `index.html`, `css/styles.css`, `README.md` |

Si necesitan cambiar un archivo que no es suyo, avisen primero en el grupo.

---

## 1. Karla (Compañera 1) – Consulta, búsqueda y detalle

### Prompt para su IA (copiar y pegar completo)

> Estoy en una competencia universitaria (AI Code Wars, UMG) y se permite usar IA. Trabajamos en equipo una app web **sin frameworks** (HTML, CSS y JavaScript puro) para que el Bufete Popular organice **expedientes ficticios**. Los datos se guardan en `localStorage`. Te adjunto `README.md` (reglas R1–R9 y supuestos S1–S5), `index.html`, `js/app.js` y `js/consulta.js`.
>
> **Mi tarea:** implementar las 3 funciones de `js/consulta.js` sin cambiar sus nombres:
> 1. `buscarExpedientes(texto)`: filtra `datos.expedientes` por **id o persona**, sin distinguir mayúsculas/minúsculas y con coincidencia parcial. Si el texto está vacío, devuelve todos.
> 2. `actualizarListado()`: dibuja dentro de `#seccion-listado` (sin borrar su `<h2>`) un campo de búsqueda y una tabla con **identificador, persona, responsable y estado**. Cada fila tiene un botón "Ver detalle" que llama a `mostrarDetalle(id)`. Si no hay resultados, muestra un mensaje claro como "No se encontraron expedientes para «texto»". El texto de búsqueda no debe perderse al redibujar.
> 3. `mostrarDetalle(id)`: muestra `#seccion-detalle` (quitar `hidden`) con todos los datos del expediente (id, persona, asunto, responsable, categoría, estado, fecha de apertura y, si existe, fecha y motivo de cierre). Debajo va el **historial en orden cronológico**, con las **actividades visualmente distintas de los cambios de estado** (etiqueta o color según `entrada.tipo`: `"apertura"`, `"actividad"` o `"cambio_estado"`). Al final, un `<div id="acciones-expediente">` donde llamas a `renderAcciones(expediente, div)`, que implementa mi compañera en `seguimiento.js`. Haz scroll hasta el detalle.
>
> **Restricciones:**
> - Solo modificar `js/consulta.js` y `css/consulta.css`.
> - Usar lo que ya existe en `app.js`: `datos`, `buscarExpedientePorId`, `formatearFecha`, `escaparHtml`, `ESTADOS`.
> - Pasar **todo texto del usuario por `escaparHtml()`** si usas `innerHTML`.
> - Interfaz clara y en español, con etiquetas accesibles. Reutilizar las clases `.tarjeta`, `.boton` y `.boton-primario` y las variables CSS de `styles.css`.
>
> Explícame el código parte por parte para poder defenderlo ante el jurado.

### Cómo comprobar su parte
- [ ] Al cargar la página se ven los expedientes existentes.
- [ ] Buscar `EXP-0001` lo encuentra; buscar parte de un nombre (`ana`) también.
- [ ] Buscar algo inexistente muestra el mensaje de "sin resultados".
- [ ] "Ver detalle" muestra todos los datos y el historial con la apertura.
- [ ] Al abrir un expediente nuevo, aparece en la tabla sin recargar.

### Commits sugeridos
- `feat: listado de expedientes`
- `feat: búsqueda por identificador o persona`
- `feat: detalle e historial del expediente`
- `style: estilos del listado y del historial`

---

## 2. Nahomi (Compañera 2) – Actividades, estados y cierre

### Prompt para su IA (copiar y pegar completo)

> Estoy en una competencia universitaria (AI Code Wars, UMG) y se permite usar IA. Trabajamos en equipo una app web **sin frameworks** (HTML, CSS y JavaScript puro) para que el Bufete Popular organice **expedientes ficticios**. Los datos se guardan en `localStorage`. Te adjunto `README.md` (reglas R1–R9 y supuestos S1–S5), `index.html`, `js/app.js` y `js/seguimiento.js`.
>
> **Mi tarea:** implementar las 4 funciones de `js/seguimiento.js` sin cambiar sus nombres ni el formato de las entradas del historial que está en los comentarios del archivo.
>
> **Reglas obligatorias:**
> - `agregarActividad(expediente, descripcion, tipoActividad)`: solo si el estado es `Abierto` o `En seguimiento`. La descripción es obligatoria y no puede ser solo espacios (usar `limpiar()`). El tipo es opcional. Cada actividad es una **entrada nueva** en `expediente.historial`, con fecha `ahora()`.
> - `pasarASeguimiento(expediente)`: solo de `Abierto` a `En seguimiento`. Agrega una entrada `cambio_estado` con `estadoAnterior` y `estadoNuevo`.
> - `cerrarExpediente(expediente, motivo)`: solo desde `En seguimiento`. Requiere **al menos una entrada `tipo === "actividad"`** y un motivo no vacío ni de solo espacios. Guarda `estado`, `motivoCierre` y `fechaCierre`, y agrega la entrada `cambio_estado` con el motivo.
> - No existen otras transiciones (por ejemplo, `Abierto → Cerrado` directo no está permitido).
> - Un expediente `Cerrado` **no admite** actividades ni cambios de estado.
> - Las tres funciones devuelven `{ ok: true }` o `{ ok: false, error: "mensaje claro en español" }` y llaman a `guardarDatos()` solo si todo es válido.
>
> `renderAcciones(expediente, contenedor)` dibuja dentro de `contenedor`:
> - Si está Abierto o En seguimiento: un formulario para agregar actividad (descripción obligatoria; tipo opcional, por ejemplo Entrevista, Llamada, Gestión u Otra).
> - Si está Abierto: un botón "Pasar a En seguimiento".
> - Si está En seguimiento: un campo "Motivo de cierre" y un botón "Cerrar expediente".
> - Si está Cerrado: un aviso de que el expediente está cerrado y ya no admite cambios.
>
> Después de cada acción: `mostrarMensaje(texto, "exito" | "error")`. Si la acción tuvo éxito, `mostrarDetalle(expediente.id)` y `actualizarListado()`. Los errores de campo se muestran junto al campo, igual que en el formulario de apertura (`.campo`, `.error-campo`, `.invalido`).
>
> **Restricciones:**
> - Solo modificar `js/seguimiento.js` y `css/seguimiento.css`.
> - Usar lo que ya existe en `app.js`: `datos`, `guardarDatos`, `ahora`, `limpiar`, `mostrarMensaje`, `formatearFecha`, `escaparHtml`, `ESTADOS`.
> - Pasar todo texto del usuario por `escaparHtml()` si usas `innerHTML`.
>
> Explícame el código parte por parte para poder defenderlo ante el jurado.

### Cómo comprobar su parte
- [ ] Agregar actividad con descripción vacía o de espacios → error.
- [ ] Agregar actividad válida → aparece en el historial.
- [ ] Pasar a En seguimiento → aparece el cambio de estado en el historial.
- [ ] Cerrar **sin actividades** → error. Cerrar **sin motivo** → error.
- [ ] Cerrar con actividad y motivo → estado Cerrado, con fecha y motivo visibles.
- [ ] Ya cerrado: no se pueden agregar actividades ni cambiar el estado.
- [ ] Recargar la página: todo sigue guardado.

### Commits sugeridos
- `feat: registro de actividades`
- `feat: cambio de estado a En seguimiento`
- `feat: cierre de expediente con motivo`
- `fix: ...` (lo que encuentren al probar)

---

## 3. Para todas: aporte a la tabla de decisiones con IA

El README necesita **3 decisiones** donde se usó la IA. Propuesta: **una por integrante**. Al terminar su parte, cada una envía a Javier por el grupo (no editen el README, para evitar conflictos):

| Decisión o necesidad | Aporte de la IA | Qué aceptaron, modificaron o descartaron y por qué | Cómo lo comprobaron |
|---|---|---|---|
| Ej.: cómo mostrar el historial distinguiendo actividades y estados | La IA propuso … | Aceptamos … pero cambiamos … porque … | Probamos … y observamos … |

**Importante:** el puntaje valora la **revisión crítica**. Anoten algo que la IA propuso y que **ustedes corrigieron o descartaron**, y por qué.
