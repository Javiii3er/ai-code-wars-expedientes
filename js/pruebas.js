// Pruebas de las reglas del enunciado (secciones 3.1–3.5 y reglas R1–R9 del README).
// Trabaja sobre datos temporales y restaura los datos reales al terminar.

const grupos = [];

function grupo(nombre, fn) {
  grupos.push({ nombre, fn });
}

function verificar(condicion, mensaje) {
  if (!condicion) throw new Error(mensaje);
}

// Reinicia los datos en memoria para que cada grupo empiece limpio.
function datosLimpios() {
  datos = { contador: 0, expedientes: [] };
}

function nuevoExpediente(persona = "Ana Prueba") {
  const r = abrirExpediente({ persona, asunto: "Asunto de prueba", responsable: "Lic. Prueba", categoria: "" });
  verificar(r.ok, "No se pudo abrir el expediente de apoyo");
  return r.expediente;
}

// Falla con un mensaje claro si un paso previo de la prueba no funcionó.
function requiere(resultado, paso) {
  verificar(resultado && resultado.ok, `Paso previo falló: no se pudo ${paso}`);
}

function contarTipo(exp, tipo) {
  return exp.historial.filter((h) => h.tipo === tipo).length;
}

// ---------- Recorrido 1: Apertura ----------
grupo("Recorrido 1 – Apertura", (t) => {
  t("Rechaza los tres obligatorios vacíos", () => {
    const r = abrirExpediente({ persona: "", asunto: "", responsable: "" });
    verificar(!r.ok, "Debió rechazarse");
    verificar(r.errores.persona && r.errores.asunto && r.errores.responsable, "Falta el error de algún campo");
  });
  t("Rechaza campos con solo espacios e indica cuáles", () => {
    const r = abrirExpediente({ persona: "   ", asunto: "Válido", responsable: "\t " });
    verificar(!r.ok, "Debió rechazarse");
    verificar(r.errores.persona && r.errores.responsable && !r.errores.asunto, "Errores incorrectos");
  });
  t("Crea dos expedientes con identificadores distintos", () => {
    const a = nuevoExpediente("Ana");
    const b = nuevoExpediente("Luis");
    verificar(a.id !== b.id, `IDs repetidos: ${a.id}`);
  });
  t("Estado inicial Abierto, fecha automática y apertura en historial", () => {
    const e = nuevoExpediente();
    verificar(e.estado === ESTADOS.ABIERTO, `Estado: ${e.estado}`);
    verificar(!isNaN(Date.parse(e.fechaApertura)), "Fecha de apertura inválida");
    verificar(e.historial[0] && e.historial[0].tipo === "apertura", "Falta la apertura en el historial");
  });
  t("Elimina espacios al inicio y final (S5)", () => {
    const e = nuevoExpediente("  Marta  ");
    verificar(e.persona === "Marta", `Guardó "${e.persona}"`);
  });
});

// ---------- Recorrido 2: Consulta ----------
grupo("Recorrido 2 – Consulta y búsqueda", (t) => {
  const a = nuevoExpediente("Ana María");
  nuevoExpediente("Luis Pérez");

  t("Busca por identificador", () => {
    const r = buscarExpedientes(a.id);
    verificar(r.length === 1 && r[0].id === a.id, `Resultados: ${r.length}`);
  });
  t("Busca por identificador sin distinguir mayúsculas (S3)", () => {
    const r = buscarExpedientes(a.id.toLowerCase());
    verificar(r.length === 1 && r[0].id === a.id, `Resultados: ${r.length}`);
  });
  t("Busca por parte del nombre sin distinguir mayúsculas (S3)", () => {
    const r = buscarExpedientes("aNa");
    verificar(r.length === 1 && r[0].persona === "Ana María", `Resultados: ${r.length}`);
  });
  t("Búsqueda sin resultados devuelve lista vacía", () => {
    verificar(buscarExpedientes("zzz-no-existe").length === 0, "Debió devolver 0");
  });
  t("Búsqueda vacía devuelve todos", () => {
    verificar(buscarExpedientes("").length === 2, "Debió devolver 2");
  });
  t("El listado muestra el mensaje de sin resultados en pantalla", () => {
    actualizarListado();
    const seccion = document.getElementById("seccion-listado");
    const campo = seccion.querySelector("input");
    verificar(campo, "No hay campo de búsqueda en #seccion-listado");
    campo.value = "zzz-no-existe";
    campo.dispatchEvent(new Event("input", { bubbles: true }));
    const form = campo.closest("form");
    if (form) form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    verificar(/no se encontr|sin resultados|no hay/i.test(seccion.textContent), "No se informa la búsqueda sin resultados");
  });
  t("El detalle muestra datos e historial", () => {
    mostrarDetalle(a.id);
    const detalle = document.getElementById("seccion-detalle");
    verificar(!detalle.hidden, "#seccion-detalle sigue oculto");
    verificar(detalle.textContent.includes(a.id), "No muestra el identificador");
    verificar(detalle.textContent.includes("Asunto de prueba"), "No muestra el asunto");
    verificar(document.getElementById("acciones-expediente"), "Falta #acciones-expediente");
  });
});

// ---------- Recorrido 3: Seguimiento y cierre ----------
grupo("Recorrido 3 – Seguimiento y cierre", (t) => {
  t("Rechaza actividad vacía o de solo espacios", () => {
    const e = nuevoExpediente();
    verificar(!agregarActividad(e, "   ", "").ok, "Aceptó una actividad vacía");
    verificar(contarTipo(e, "actividad") === 0, "Se guardó la actividad inválida");
    requiere(agregarActividad(e, "Válida", ""), "agregar una actividad válida");
  });
  t("Agrega actividad en estado Abierto como entrada independiente", () => {
    const e = nuevoExpediente();
    verificar(agregarActividad(e, "Primera entrevista", "").ok, "No agregó la actividad");
    verificar(agregarActividad(e, "Llamada de seguimiento", "").ok, "No agregó la segunda");
    verificar(contarTipo(e, "actividad") === 2, "No hay 2 entradas de actividad");
    const act = e.historial.find((h) => h.tipo === "actividad");
    verificar(!isNaN(Date.parse(act.fecha)), "La actividad no tiene fecha válida");
  });
  t("No permite cerrar directamente desde Abierto (R6)", () => {
    const e = nuevoExpediente();
    requiere(agregarActividad(e, "Actividad", ""), "agregar actividad");
    verificar(!cerrarExpediente(e, "Motivo").ok, "Cerró desde Abierto");
    verificar(e.estado === ESTADOS.ABIERTO, `Estado cambió a ${e.estado}`);
  });
  t("Pasa de Abierto a En seguimiento y lo registra (R4, R7)", () => {
    const e = nuevoExpediente();
    verificar(pasarASeguimiento(e).ok, "No cambió de estado");
    verificar(e.estado === ESTADOS.SEGUIMIENTO, `Estado: ${e.estado}`);
    const c = e.historial.find((h) => h.tipo === "cambio_estado");
    verificar(c && c.estadoAnterior === ESTADOS.ABIERTO && c.estadoNuevo === ESTADOS.SEGUIMIENTO, "Cambio de estado mal registrado");
  });
  t("Rechaza cierre sin actividades previas (R5)", () => {
    const e = nuevoExpediente();
    requiere(pasarASeguimiento(e), "pasar a En seguimiento");
    verificar(!cerrarExpediente(e, "Motivo válido").ok, "Cerró sin actividades");
    verificar(e.estado === ESTADOS.SEGUIMIENTO, "El estado cambió");
  });
  t("Rechaza cierre con motivo vacío o de solo espacios (R5)", () => {
    const e = nuevoExpediente();
    requiere(pasarASeguimiento(e), "pasar a En seguimiento");
    requiere(agregarActividad(e, "Actividad", ""), "agregar actividad");
    verificar(!cerrarExpediente(e, "   ").ok, "Cerró sin motivo");
    verificar(e.estado === ESTADOS.SEGUIMIENTO, "El estado cambió");
  });
  t("Cierra con actividad y motivo; guarda fecha y motivo", () => {
    const e = nuevoExpediente();
    pasarASeguimiento(e);
    agregarActividad(e, "Actividad", "");
    verificar(cerrarExpediente(e, "  Caso resuelto  ").ok, "No cerró");
    verificar(e.estado === ESTADOS.CERRADO, `Estado: ${e.estado}`);
    verificar(e.motivoCierre === "Caso resuelto", `Motivo: "${e.motivoCierre}"`);
    verificar(!isNaN(Date.parse(e.fechaCierre)), "Sin fecha de cierre");
    verificar(contarTipo(e, "cambio_estado") === 2, "Faltan cambios de estado en el historial");
  });
  t("Cerrado no admite actividades ni cambios de estado (R8)", () => {
    const e = nuevoExpediente();
    requiere(pasarASeguimiento(e), "pasar a En seguimiento");
    requiere(agregarActividad(e, "Actividad", ""), "agregar actividad");
    requiere(cerrarExpediente(e, "Resuelto"), "cerrar el expediente");
    const largo = e.historial.length;
    verificar(!agregarActividad(e, "Nueva", "").ok, "Aceptó actividad en cerrado");
    verificar(!pasarASeguimiento(e).ok, "Cambió de estado estando cerrado");
    verificar(!cerrarExpediente(e, "Otra vez").ok, "Volvió a cerrar");
    verificar(e.historial.length === largo, "El historial cambió");
  });
  t("La vista de acciones se dibuja en cada estado sin errores", () => {
    const e = nuevoExpediente();
    for (const paso of [() => {}, () => pasarASeguimiento(e), () => { agregarActividad(e, "A", ""); cerrarExpediente(e, "M"); }]) {
      paso();
      const div = document.createElement("div");
      renderAcciones(e, div);
      verificar(div.innerHTML.trim() !== "", `No dibujó nada en estado ${e.estado}`);
    }
  });
});

// ---------- Persistencia ----------
grupo("Persistencia al recargar (3.5)", (t) => {
  t("Expediente cerrado y su historial quedan guardados", () => {
    const e = nuevoExpediente();
    requiere(pasarASeguimiento(e), "pasar a En seguimiento");
    requiere(agregarActividad(e, "Actividad", ""), "agregar actividad");
    requiere(cerrarExpediente(e, "Resuelto"), "cerrar el expediente");
    const guardado = Storage.leer(CLAVE_DATOS, null);
    const copia = guardado && guardado.expedientes.find((x) => x.id === e.id);
    verificar(copia, "No está en localStorage");
    verificar(copia.estado === ESTADOS.CERRADO && copia.historial.length === e.historial.length, "Lo guardado no coincide");
  });
  t("El contador se guarda para no repetir IDs (R2)", () => {
    nuevoExpediente();
    const guardado = Storage.leer(CLAVE_DATOS, null);
    verificar(guardado.contador === datos.contador, "Contador no guardado");
  });
});

// ---------- Ejecución ----------
function ejecutar() {
  const respaldo = localStorage.getItem(CLAVE_DATOS);
  const contenedor = document.getElementById("resultados");
  let total = 0;
  let correctas = 0;

  try {
    for (const g of grupos) {
      datosLimpios();
      const filas = [];
      const t = (nombre, fn) => {
        total++;
        try {
          fn();
          correctas++;
          filas.push(`<tr><td class="ok">✔ Cumple</td><td>${escaparHtml(nombre)}</td><td></td></tr>`);
        } catch (error) {
          filas.push(`<tr><td class="falla">✘ Falla</td><td>${escaparHtml(nombre)}</td><td class="detalle">${escaparHtml(error.message)}</td></tr>`);
        }
      };
      try {
        g.fn(t);
      } catch (error) {
        total++;
        filas.push(`<tr><td class="falla">✘ Falla</td><td>Preparación del grupo</td><td class="detalle">${escaparHtml(error.message)}</td></tr>`);
      }
      contenedor.insertAdjacentHTML(
        "beforeend",
        `<div class="grupo"><h3>${escaparHtml(g.nombre)}</h3><table><thead><tr><th>Resultado</th><th>Prueba</th><th>Detalle</th></tr></thead><tbody>${filas.join("")}</tbody></table></div>`
      );
    }
  } finally {
    // Restaurar los datos reales de la aplicación.
    if (respaldo === null) localStorage.removeItem(CLAVE_DATOS);
    else localStorage.setItem(CLAVE_DATOS, respaldo);
  }

  const resumen = document.getElementById("resumen");
  resumen.textContent = `${correctas} de ${total} pruebas cumplen.`;
  resumen.className = `resumen ${correctas === total ? "ok" : "falla"}`;
}

document.addEventListener("DOMContentLoaded", ejecutar);
