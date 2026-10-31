// Lógica de la aplicación: datos, reglas del negocio e interfaz.

const CLAVE_DATOS = "bufete-expedientes";

const ESTADOS = {
  ABIERTO: "Abierto",
  SEGUIMIENTO: "En seguimiento",
  CERRADO: "Cerrado"
};

// Estado en memoria: contador para IDs únicos (R2) y lista de expedientes.
let datos = Storage.leer(CLAVE_DATOS, { contador: 0, expedientes: [] });

function guardarDatos() {
  return Storage.guardar(CLAVE_DATOS, datos);
}

function ahora() {
  return new Date().toISOString();
}

function formatearFecha(iso) {
  return new Date(iso).toLocaleString("es-GT", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

// Texto sin espacios al inicio y final (S5); vacío si solo tenía espacios (R1).
function limpiar(texto) {
  return (texto || "").trim();
}

function buscarExpedientePorId(id) {
  return datos.expedientes.find((exp) => exp.id === id) || null;
}

// Escapa texto del usuario antes de insertarlo con innerHTML.
function escaparHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto == null ? "" : String(texto);
  return div.innerHTML;
}

function generarId() {
  datos.contador += 1;
  return "EXP-" + String(datos.contador).padStart(4, "0");
}

// ---------- Reglas del negocio ----------

const NOMBRES_CAMPOS = {
  persona: "Persona solicitante",
  asunto: "Descripción del asunto",
  responsable: "Responsable"
};

// R1: valida los obligatorios y devuelve { campo: mensaje } con los errores.
function validarApertura(entrada) {
  const errores = {};
  for (const campo of Object.keys(NOMBRES_CAMPOS)) {
    if (!limpiar(entrada[campo])) {
      errores[campo] = `${NOMBRES_CAMPOS[campo]} es obligatorio; no puede quedar vacío ni con solo espacios.`;
    }
  }
  return errores;
}

function abrirExpediente(entrada) {
  const errores = validarApertura(entrada);
  if (Object.keys(errores).length > 0) {
    return { ok: false, errores };
  }

  const fecha = ahora();
  const expediente = {
    id: generarId(),
    persona: limpiar(entrada.persona),
    asunto: limpiar(entrada.asunto),
    responsable: limpiar(entrada.responsable),
    categoria: limpiar(entrada.categoria),
    estado: ESTADOS.ABIERTO,
    fechaApertura: fecha,
    motivoCierre: null,
    fechaCierre: null,
    // R7: la apertura queda registrada automáticamente en el historial.
    historial: [
      {
        tipo: "apertura",
        fecha,
        descripcion: "Expediente abierto",
        estadoNuevo: ESTADOS.ABIERTO
      }
    ]
  };

  datos.expedientes.push(expediente);
  if (!guardarDatos()) {
    return { ok: false, errores: { general: "No se pudo guardar el expediente en el navegador." } };
  }
  return { ok: true, expediente };
}

// ---------- Interfaz ----------

function mostrarMensaje(texto, tipo) {
  const caja = document.getElementById("mensaje");
  caja.textContent = texto;
  caja.className = `mensaje ${tipo}`;
  caja.hidden = false;
}

function limpiarErroresFormulario(form) {
  form.querySelectorAll(".error-campo").forEach((p) => (p.textContent = ""));
  form.querySelectorAll(".invalido").forEach((el) => {
    el.classList.remove("invalido");
    el.removeAttribute("aria-invalid");
  });
}

function mostrarErroresFormulario(form, errores) {
  let primero = null;
  for (const [campo, mensaje] of Object.entries(errores)) {
    const control = form.elements[campo];
    const p = document.getElementById(`error-${campo}`);
    if (control && p) {
      p.textContent = mensaje;
      control.classList.add("invalido");
      control.setAttribute("aria-invalid", "true");
      primero = primero || control;
    }
  }
  if (primero) primero.focus();
}

function manejarApertura(evento) {
  evento.preventDefault();
  const form = evento.target;
  limpiarErroresFormulario(form);

  const resultado = abrirExpediente({
    persona: form.elements.persona.value,
    asunto: form.elements.asunto.value,
    responsable: form.elements.responsable.value,
    categoria: form.elements.categoria.value
  });

  if (!resultado.ok) {
    mostrarErroresFormulario(form, resultado.errores);
    mostrarMensaje(
      resultado.errores.general || "Revise los campos marcados en rojo antes de continuar.",
      "error"
    );
    return;
  }

  const exp = resultado.expediente;
  form.reset();
  mostrarMensaje(
    `Expediente ${exp.id} abierto el ${formatearFecha(exp.fechaApertura)} con estado "${exp.estado}".`,
    "exito"
  );
  actualizarListado();
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("form-apertura").addEventListener("submit", manejarApertura);
  actualizarListado();
});
