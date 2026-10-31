// Parte 2 – Reabrir expediente (Javier).
// Cerrado -> En seguimiento con motivo obligatorio. Conserva datos, actividades
// y todos los cierres previos; registra el evento en el historial.
//
// Se carga después de seguimiento.js y agrega el formulario de reapertura a
// renderAcciones sin modificar ese archivo.

// R10: solo desde Cerrado; motivo no vacío ni de solo espacios.
// La regla se valida aquí (lógica), no solo en la interfaz.
function reabrirExpediente(expediente, motivo) {
  if (!expediente) {
    return { ok: false, error: "El expediente no existe." };
  }
  if (expediente.estado !== ESTADOS.CERRADO) {
    return {
      ok: false,
      error: `Solo se puede reabrir un expediente Cerrado. Este está "${expediente.estado}".`
    };
  }
  const motivoLimpio = limpiar(motivo);
  if (!motivoLimpio) {
    return { ok: false, error: "El motivo de reapertura es obligatorio; no puede quedar vacío ni con solo espacios." };
  }

  // Conservar el cierre actual en la lista de cierres anteriores (no se reemplaza).
  expediente.cierresAnteriores = expediente.cierresAnteriores || [];
  expediente.cierresAnteriores.push({
    fecha: expediente.fechaCierre,
    motivo: expediente.motivoCierre
  });

  const fecha = ahora();
  expediente.estado = ESTADOS.SEGUIMIENTO;
  expediente.motivoCierre = null;
  expediente.fechaCierre = null;
  expediente.historial.push({
    tipo: "cambio_estado",
    fecha,
    descripcion: "Expediente reabierto",
    estadoAnterior: ESTADOS.CERRADO,
    estadoNuevo: ESTADOS.SEGUIMIENTO,
    motivo: motivoLimpio
  });

  if (!guardarDatos()) {
    return { ok: false, error: "No se pudo guardar la reapertura en el navegador." };
  }
  return { ok: true };
}

// Todos los cierres del expediente (anteriores + el actual si está cerrado).
function obtenerCierres(expediente) {
  const cierres = [...(expediente.cierresAnteriores || [])];
  if (expediente.estado === ESTADOS.CERRADO && expediente.fechaCierre) {
    cierres.push({ fecha: expediente.fechaCierre, motivo: expediente.motivoCierre });
  }
  return cierres;
}

function dibujarFormularioReapertura(expediente, contenedor) {
  const caja = document.createElement("form");
  caja.className = "form-reapertura";
  caja.noValidate = true;
  caja.innerHTML = `
    <h3>Reabrir expediente</h3>
    <p class="ayuda">Use esta opción si se recibió información nueva después del cierre. El historial y los cierres anteriores se conservan.</p>
    <div class="campo">
      <label for="motivo-reapertura">Motivo de reapertura *</label>
      <textarea id="motivo-reapertura" name="motivo" rows="2" maxlength="500"></textarea>
      <p class="error-campo" id="error-motivo-reapertura"></p>
    </div>
    <button type="submit" class="boton boton-primario">Reabrir expediente</button>
  `;

  caja.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const campo = caja.elements.motivo;
    const error = caja.querySelector("#error-motivo-reapertura");
    error.textContent = "";
    campo.classList.remove("invalido");

    const resultado = reabrirExpediente(expediente, campo.value);
    if (!resultado.ok) {
      error.textContent = resultado.error;
      campo.classList.add("invalido");
      campo.focus();
      mostrarMensaje(resultado.error, "error");
      return;
    }
    mostrarMensaje(`Expediente ${expediente.id} reabierto. Estado: En seguimiento.`, "exito");
    mostrarDetalle(expediente.id);
    actualizarListado();
  });

  contenedor.appendChild(caja);
}

function dibujarCierresAnteriores(expediente, contenedor) {
  const anteriores = expediente.cierresAnteriores || [];
  if (anteriores.length === 0) return;
  const lista = anteriores
    .map((c, i) => `<li>Cierre ${i + 1}: ${escaparHtml(formatearFecha(c.fecha))} – ${escaparHtml(c.motivo)}</li>`)
    .join("");
  contenedor.insertAdjacentHTML(
    "beforeend",
    `<div class="cierres-anteriores"><h3>Cierres anteriores</h3><ul>${lista}</ul></div>`
  );
}

// Extiende renderAcciones de seguimiento.js.
const renderAccionesBase = renderAcciones;
renderAcciones = function (expediente, contenedor) {
  renderAccionesBase(expediente, contenedor);
  dibujarCierresAnteriores(expediente, contenedor);
  if (expediente.estado === ESTADOS.CERRADO) {
    dibujarFormularioReapertura(expediente, contenedor);
  }
};
