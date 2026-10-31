// Actividades, estados y cierre (Compañera 2).
// Requisitos 3.3 y 3.4; reglas R3–R9 del README.
//
// Usa de app.js: datos, guardarDatos, ahora, limpiar, mostrarMensaje,
// formatearFecha, escaparHtml, ESTADOS.
// Usa de consulta.js: mostrarDetalle(id) y actualizarListado() para refrescar.
//
// Las tres funciones de reglas devuelven { ok: true } o { ok: false, error: "mensaje" }
// y, si todo es válido, agregan la entrada al historial y llaman a guardarDatos().
//
// Formato de entradas del historial:
//   Actividad:       { tipo: "actividad", fecha, descripcion, tipoActividad }
//   Cambio de estado:{ tipo: "cambio_estado", fecha, descripcion, estadoAnterior, estadoNuevo, motivo }

// R3: solo en Abierto o En seguimiento; descripción obligatoria (sin solo espacios).
function agregarActividad(expediente, descripcion, tipoActividad) {
  // TODO Compañera 2
  return { ok: false, error: "Pendiente de implementar" };
}

// R4: Abierto -> En seguimiento, por acción explícita del usuario.
function pasarASeguimiento(expediente) {
  // TODO Compañera 2
  return { ok: false, error: "Pendiente de implementar" };
}

// R5: En seguimiento -> Cerrado, con al menos una actividad y motivo no vacío.
// Guarda motivoCierre y fechaCierre en el expediente.
function cerrarExpediente(expediente, motivo) {
  // TODO Compañera 2
  return { ok: false, error: "Pendiente de implementar" };
}

// Dibuja dentro de `contenedor` el formulario de actividad y los botones de
// estado que correspondan al estado actual. Si está Cerrado (R8), muestra un
// aviso de que ya no admite cambios. Tras cada acción: mostrarMensaje(...),
// mostrarDetalle(expediente.id) y actualizarListado().
function renderAcciones(expediente, contenedor) {
  // TODO Compañera 2
}
