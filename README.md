# Expedientes – Bufete Popular (AI Code Wars 2026)

Prototipo de aplicación web para organizar expedientes, registrar actividades y consultar su estado e historial.
Proyecto de la competencia **AI Code Wars – Tech Day UMG Boot Camp, 5.ª edición** (31 de octubre de 2026).

> Caso, reglas y datos **ficticios**. La aplicación no brinda asesoría jurídica.

---

## 1. Ficha de análisis

### 1.1 Problema
El Bufete Popular atiende a personas de escasos recursos y necesita saber, para cada caso, **quién lo solicitó, de qué trata, quién lo atiende, en qué estado está y qué se ha hecho**. Sin un registro ordenado se pierde el historial y no se sabe qué casos siguen pendientes.

### 1.2 Usuario
- **Personal del bufete** (estudiante practicante o asesor responsable) que abre expedientes, registra actividades y cambia su estado.
- Uso desde un navegador, sin inicio de sesión (no se exige autenticación).

### 1.3 Prioridades (en orden)
1. **Apertura** de expedientes con validación de campos obligatorios.
2. **Consulta**: listado, búsqueda por identificador o persona, detalle e historial.
3. **Actividades** e **historial cronológico** que distinga actividades de cambios de estado.
4. **Estados y cierre** con sus reglas (Abierto → En seguimiento → Cerrado).
5. **Persistencia** al recargar (localStorage).
6. Mensajes claros de confirmación y error.
7. Opcionales solo si sobra tiempo: categoría, tipo de actividad, filtro por estado.

### 1.4 Datos principales

**Expediente**
| Campo | Origen | Notas |
|---|---|---|
| `id` | Automático | Único, legible (p. ej. `EXP-0001`). |
| `persona` | Usuario | Nombre ficticio o alias. Obligatorio. |
| `asunto` | Usuario | Descripción breve. Obligatorio. |
| `responsable` | Usuario | Obligatorio. |
| `categoria` | Usuario | Opcional: civil, familiar o laboral. |
| `estado` | Automático | `Abierto` al crear. |
| `fechaApertura` | Automático | Fecha y hora. |
| `motivoCierre`, `fechaCierre` | Al cerrar | Se conservan. |
| `historial` | Automático | Lista de entradas (ver abajo). |

**Entrada de historial** (cada una independiente, nunca se sobrescribe)
| Campo | Notas |
|---|---|
| `tipo` | `apertura`, `actividad` o `cambio_estado`. |
| `fecha` | Fecha y hora automáticas. |
| `descripcion` | Texto de la actividad o del cambio. |
| `estadoAnterior` / `estadoNuevo` | Solo en cambios de estado. |
| `motivo` | Solo en el cierre. |

### 1.5 Reglas
- **R1.** Persona, asunto y responsable son obligatorios; se rechazan vacíos o solo espacios, indicando qué campo corregir.
- **R2.** El identificador es único y no se repite aunque se recargue la página.
- **R3.** Solo se agregan actividades en estado `Abierto` o `En seguimiento`; la descripción es obligatoria (sin solo espacios).
- **R4.** `Abierto → En seguimiento`: solo por acción explícita del usuario.
- **R5.** `En seguimiento → Cerrado`: requiere **al menos una actividad** y un **motivo de cierre** no vacío.
- **R6.** No hay otras transiciones (p. ej. `Abierto → Cerrado` directo no se permite).
- **R7.** La apertura y cada cambio de estado se guardan automáticamente en el historial.
- **R8.** Un expediente cerrado se puede consultar, pero no admite actividades ni cambios de estado.
- **R9.** No se editan ni eliminan expedientes o actividades.
- **R10 (Parte 2).** `Cerrado → En seguimiento` mediante *Reabrir*, con motivo no vacío. Se conservan los datos, las actividades y todos los cierres previos (fecha y motivo). Se registra un evento en el historial. Se rechaza si el estado es Abierto o En seguimiento. Modifica R8 solo en esta transición: un expediente cerrado sigue sin admitir actividades.

### 1.6 Supuestos
- **S1.** Un solo usuario por navegador; los datos viven en el `localStorage` de ese navegador.
- **S2.** La actividad exigida para cerrar puede haberse registrado en `Abierto` o en `En seguimiento`.
- **S3.** La búsqueda no distingue mayúsculas/minúsculas y acepta coincidencias parciales.
- **S4.** La hora usada es la del equipo donde se ejecuta la app.
- **S5.** Al guardar, se eliminan los espacios al inicio y al final de los textos.

---

## 2. Equipo y responsabilidades

| Integrante | Carné | Rol principal | Responsabilidades | Archivos |
|---|---|---|---|---|
| Javier Rivera | 1790-22-10552 | Coordinación, apertura e integración | Repositorio, apertura de expedientes, integración de aportes, README, pruebas finales y commits de hitos. | `js/app.js`, `js/storage.js`, `index.html`, `css/styles.css`, `README.md` |
| Karla Waleska Rodríguez Arévalo | 1790-22-9763 | Consulta | Listado, búsqueda por identificador o persona, detalle e historial cronológico. | `js/consulta.js`, `css/consulta.css` |
| Nahomi Suseth López Andrade | 1790-23-21320 | Seguimiento | Registro de actividades, cambios de estado y cierre con sus reglas (R3–R8). | `js/seguimiento.js`, `css/seguimiento.css` |

Las tres integrantes aportan una de las tres decisiones con IA (sección 5) y comprueban su propia parte; Javier ejecuta los recorridos completos.

### Forma de integrar los aportes
- Rama principal `main`; cambios pequeños y frecuentes desde la cuenta de GitHub de cada integrante.
- Antes de empezar y antes de cada `push`: `git pull`, abrir la app y verificar que nada se rompió.
- Cada integrante edita solo sus archivos; los módulos se comunican mediante funciones acordadas (ver `GUIA-EQUIPO.md`).
- Quien integra revisa que el código incorporado (incluido el generado con IA) se entienda y funcione.

### Convención de commits
Formato: `tipo: descripción breve en español`.

| Tipo | Uso |
|---|---|
| `docs` | README, ficha, decisiones, resultados de pruebas. |
| `chore` | Estructura base y configuración. |
| `feat` | Nueva funcionalidad. |
| `fix` | Corrección de errores. |
| `style` | Cambios visuales sin cambiar la lógica. |
| `test` | Registro de comprobaciones. |

**Hitos exigidos:** (1) Inicio – ficha y responsabilidades. (2) Avances durante el desarrollo. (3) Entrega final 9:30 a. m.

---

## 3. Arquitectura

Aplicación web estática, sin servidor ni compilación.

```
ai-code-wars-expedientes/
├── index.html        # Estructura de la interfaz
├── css/
│   ├── styles.css    # Estilos generales
│   ├── consulta.css  # Estilos de listado y detalle
│   └── seguimiento.css
├── js/
│   ├── storage.js    # Lectura/escritura en localStorage
│   ├── app.js        # Datos compartidos, utilidades y apertura
│   ├── consulta.js   # Listado, búsqueda, detalle e historial
│   └── seguimiento.js# Actividades, estados y cierre
├── pruebas.html      # Comprobaciones automáticas (js/pruebas.js)
├── GUIA-EQUIPO.md    # Reparto de trabajo y prompts de IA
└── README.md
```

- **Presentación:** `index.html` + hojas de estilo por módulo.
- **Lógica:** `app.js` (apertura y utilidades), `consulta.js` (búsqueda y vistas), `seguimiento.js` (reglas de estado e historial).
- **Persistencia:** `js/storage.js` guarda todo en `localStorage` como JSON.

**Stack:** HTML5, CSS3, JavaScript (sin frameworks). **IDE:** Visual Studio 2022 (Abrir → Carpeta).

---

## 4. Requisitos y ejecución

**Requisitos:** un navegador moderno (Chrome, Edge o Firefox). No requiere instalar dependencias, servidor ni base de datos.

**Ejecutar (cualquiera de estas opciones):**
1. Abrir `index.html` con doble clic.
2. En Visual Studio 2022: **Archivo → Abrir → Carpeta**, clic derecho en `index.html` → **Ver en el explorador**.
3. Con Python instalado, desde la carpeta del proyecto: `python -m http.server 5500` y abrir `http://localhost:5500`.

**Datos:** se guardan en `localStorage` del navegador y se conservan al recargar o cerrar y volver a abrir.
Cada navegador y cada forma de abrir la app (archivo o `localhost`) guarda sus datos por separado, por lo que se debe usar **siempre la misma**.
Para empezar de cero: herramientas de desarrollador (F12) → *Application* → *Local Storage* → borrar la clave `bufete-expedientes`.

---

## 5. Decisiones y uso razonado de la IA
Herramienta usada: Claude (asistente de IA). Cada integrante registró una decisión de su parte.

| # | Decisión o necesidad | Aporte de la IA | Decisión del equipo y razón | Cómo se comprobó |
|---|---|---|---|---|
| 1 | **Identificador único de cada expediente** (Javier). Debía ser automático, no repetirse y ser fácil de buscar. | Propuso un contador guardado junto con los datos para generar `EXP-0001`, `EXP-0002`… Se compararon alternativas: `Date.now()` y `crypto.randomUUID()`. | **Aceptado el contador.** Se descartó `Date.now()` porque dos aperturas en el mismo milisegundo pueden repetir el ID, y el UUID porque es largo y difícil de dictar o buscar. El contador se guarda en `localStorage` para que no se reinicie al recargar (R2). Se mantiene el formato de 4 dígitos. | Se crearon 2 expedientes (`EXP-0001`, `EXP-0002`), se recargó la página y el siguiente fue `EXP-0003`: no se repitió. |
| 2 | **Parte 2: Reabrir expediente** (Javier). Cerrado → En seguimiento con motivo obligatorio, sin perder cierres previos. **Impacto:** modifica R8, que prohibía cambiar el estado de un cerrado; el modelo guardaba un solo `motivoCierre`/`fechaCierre`, que un segundo cierre habría sobrescrito. | Propuso dos opciones: (a) convertir el cierre en una lista `cierres[]`, cambiando el código de cierre ya repartido; o (b) al reabrir, mover el cierre actual a `cierresAnteriores[]` y registrar un evento `cambio_estado` con motivo. También propuso agregar la acción en un archivo nuevo que extiende `renderAcciones`. | **Elegimos (b)** porque no obliga a cambiar `seguimiento.js`, que otra integrante estaba desarrollando en paralelo, y evita conflictos. La regla se valida en `reabrirExpediente()` (lógica), no solo en la interfaz, como pide el enunciado. Se agregó `obtenerCierres()` para listar todos los cierres. | `pruebas.html`, bloque *Recorrido 4*: rechaza motivo vacío o de espacios; rechaza reabrir en Abierto o En seguimiento; al reabrir conserva ID, datos, actividades y el cierre previo y registra un evento con fecha, motivo y transición. |
| 3 | | | | |

---

## 6. Lista de comprobación
Pruebas manuales en el navegador. Fecha: 31/10/2026.

Además, `pruebas.html` ejecuta 23 comprobaciones automáticas de las reglas, agrupadas por recorrido. Usa datos temporales y restaura los expedientes guardados al terminar. Se abre igual que `index.html`. La automatización es un apoyo; el enunciado no la exige.

| Recorrido | Pasos y resultado observado | Estado |
|---|---|---|
| 1. Apertura | Enviar el formulario vacío mostró 3 errores, uno por campo obligatorio. Persona y responsable con solo espacios: rechazados con error en esos 2 campos; el asunto válido no se marcó. Dos aperturas válidas generaron `EXP-0001` y `EXP-0002` con estado *Abierto*, fecha y hora, y la entrada "Expediente abierto" en el historial. Los espacios al inicio y al final se eliminan al guardar. | Cumple |
| 2. Consulta | El listado muestra identificador, persona, responsable y estado. Buscar `EXP-0001`, `exp-0001` o parte del nombre (`aNa`) encuentra el expediente correcto; un texto inexistente muestra «No se encontraron expedientes para…». *Ver detalle* muestra todos los datos y el historial en orden cronológico, con apertura, actividades y cambios de estado en colores y etiquetas distintos. `pruebas.html`: 7/7. | Cumple |
| 3. Seguimiento y cierre | _Pendiente: se probará al integrar `seguimiento.js`._ | — |
| 4. Reapertura y trazabilidad | Lógica de reapertura verificada: rechaza motivo vacío o de espacios y reaperturas en Abierto o En seguimiento; reabre a En seguimiento conservando ID, datos, actividades y el cierre anterior, con evento en el historial. _Pendiente: flujo completo de segundo cierre y recarga al integrar `seguimiento.js`._ | Parcial |
| Persistencia al recargar | Tras recargar, los expedientes creados siguen en `localStorage` y el contador continúa (`EXP-0003`). Falta repetirla con actividades y cierre. | Parcial |

---

## 7. Expedientes de demostración
_Pendiente._

## 8. Limitaciones conocidas
- Los datos viven solo en el navegador donde se crearon; no se comparten entre equipos ni entre navegadores.
- Borrar los datos de navegación elimina los expedientes. No hay copia de seguridad ni exportación.
- No se pueden editar ni eliminar expedientes o actividades (no se exige).
- Sin autenticación: cualquiera con acceso al navegador puede ver y registrar información.
- La fecha y hora dependen del reloj del equipo.

## 9. Recursos externos
- Asistente de IA (Claude) para análisis, diseño, código y revisión, según lo declarado en la sección 5.
- No se usaron bibliotecas ni frameworks externos.
