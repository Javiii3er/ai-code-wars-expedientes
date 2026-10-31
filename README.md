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

### 1.6 Supuestos
- **S1.** Un solo usuario por navegador; los datos viven en el `localStorage` de ese navegador.
- **S2.** La actividad exigida para cerrar puede haberse registrado en `Abierto` o en `En seguimiento`.
- **S3.** La búsqueda no distingue mayúsculas/minúsculas y acepta coincidencias parciales.
- **S4.** La hora usada es la del equipo donde se ejecuta la app.
- **S5.** Al guardar, se eliminan los espacios al inicio y al final de los textos.

---

## 2. Equipo y responsabilidades

| Integrante | Rol principal | Responsabilidades |
|---|---|---|
| Javier Rivera | Coordinación / integración | Repositorio, integración de aportes, README, commits de hitos. |
| _Integrante 2_ | Lógica y datos | Modelo de datos, reglas de estado, persistencia. |
| _Integrante 3_ | Interfaz | Formularios, listado, detalle, mensajes. |
| _Integrante 4_ | Pruebas | Recorridos de comprobación y registro de resultados. |
| _Integrante 5_ | Decisiones con IA | Revisión crítica de propuestas de IA y tabla de decisiones. |

### Forma de integrar los aportes
- Rama principal `main`; cambios pequeños y frecuentes.
- Antes de cada `push`: `git pull`, abrir la app y verificar que nada se rompió.
- Archivos separados por responsabilidad (`storage.js`, `app.js`, `styles.css`) para evitar conflictos.
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
│   └── styles.css    # Estilos
├── js/
│   ├── storage.js    # Lectura/escritura en localStorage
│   └── app.js        # Reglas del negocio y manejo de la interfaz
└── README.md
```

- **Presentación:** `index.html` + `css/styles.css`.
- **Lógica:** `js/app.js` (validaciones, transiciones de estado, historial, búsqueda).
- **Persistencia:** `js/storage.js` guarda todo en `localStorage` como JSON.

**Stack:** HTML5, CSS3, JavaScript (sin frameworks). **IDE:** Visual Studio 2022 (Abrir → Carpeta).

---

## 4. Requisitos y ejecución
- Requisito: un navegador moderno (Chrome, Edge o Firefox).
- Ejecutar: abrir `index.html` con doble clic, o desde Visual Studio 2022 con **Ver en el explorador**.
- Los datos se conservan en el navegador al recargar o volver a abrir la app. Para empezar de cero, borrar los datos del sitio en el navegador.

---

## 5. Decisiones y uso razonado de la IA
_Pendiente: se completará durante el desarrollo._

| # | Decisión o necesidad | Aporte de la IA | Decisión del equipo y razón | Cómo se comprobó |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

## 6. Lista de comprobación
_Pendiente: se completará al probar._

| Recorrido | Resultado observado | Estado |
|---|---|---|
| 1. Apertura | | |
| 2. Consulta | | |
| 3. Seguimiento y cierre | | |
| Persistencia al recargar | | |

---

## 7. Expedientes de demostración
_Pendiente._

## 8. Limitaciones conocidas
_Pendiente._

## 9. Recursos externos
- Asistente de IA (Claude) para análisis, diseño, código y revisión, según lo declarado en la sección 5.
