// Actividades, estados y cierre.
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

const TIPOS_ACTIVIDAD = ["Entrevista", "Llamada", "Gestión", "Otra"];

function registrarCambioEstado(expediente, estadoNuevo, descripcion, motivo) {
  const entrada = {
    tipo: "cambio_estado",
    fecha: ahora(),
    descripcion,
    estadoAnterior: expediente.estado,
    estadoNuevo
  };
  if (motivo) entrada.motivo = motivo;
  expediente.estado = estadoNuevo;
  expediente.historial.push(entrada);
  return entrada;
}

function resultadoGuardado() {
  return guardarDatos()
    ? { ok: true }
    : { ok: false, error: "No se pudieron guardar los cambios en el navegador." };
}

// R3: solo en Abierto o En seguimiento; descripción obligatoria (sin solo espacios).
function agregarActividad(expediente, descripcion, tipoActividad) {
  if (expediente.estado === ESTADOS.CERRADO) {
    return { ok: false, error: "El expediente está Cerrado y no admite nuevas actividades." };
  }
  const texto = limpiar(descripcion);
  if (!texto) {
    return { ok: false, error: "La descripción de la actividad es obligatoria; no puede quedar vacía ni con solo espacios." };
  }
  expediente.historial.push({
    tipo: "actividad",
    fecha: ahora(),
    descripcion: texto,
    tipoActividad: limpiar(tipoActividad)
  });
  return resultadoGuardado();
}

// R4: Abierto -> En seguimiento, por acción explícita del usuario.
function pasarASeguimiento(expediente) {
  if (expediente.estado !== ESTADOS.ABIERTO) {
    return { ok: false, error: `Solo un expediente Abierto puede pasar a En seguimiento. Este está "${expediente.estado}".` };
  }
  registrarCambioEstado(expediente, ESTADOS.SEGUIMIENTO, "Pasa a En seguimiento");
  return resultadoGuardado();
}

// R5: En seguimiento -> Cerrado, con al menos una actividad y motivo no vacío.
// Guarda motivoCierre y fechaCierre en el expediente.
function cerrarExpediente(expediente, motivo) {
  if (expediente.estado !== ESTADOS.SEGUIMIENTO) {
    return { ok: false, error: `Solo se puede cerrar un expediente En seguimiento. Este está "${expediente.estado}".` };
  }
  if (!expediente.historial.some((h) => h.tipo === "actividad")) {
    return { ok: false, error: "Para cerrar debe existir al menos una actividad registrada." };
  }
  const texto = limpiar(motivo);
  if (!texto) {
    return { ok: false, error: "El motivo de cierre es obligatorio; no puede quedar vacío ni con solo espacios." };
  }
  const entrada = registrarCambioEstado(expediente, ESTADOS.CERRADO, "Expediente cerrado", texto);
  expediente.motivoCierre = texto;
  expediente.fechaCierre = entrada.fecha;
  return resultadoGuardado();
}

// Ejecuta una acción, muestra el mensaje y refresca la vista si tuvo éxito.
// Si falla, marca el campo indicado con su error.
function ejecutarAccion(expediente, resultado, mensajeExito, campo, errorCampo) {
  if (!resultado.ok) {
    if (campo && errorCampo) {
      errorCampo.textContent = resultado.error;
      campo.classList.add("invalido");
      campo.setAttribute("aria-invalid", "true");
      campo.focus();
    }
    mostrarMensaje(resultado.error, "error");
    return;
  }
  mostrarMensaje(mensajeExito, "exito");
  mostrarDetalle(expediente.id);
  actualizarListado();
}

// Dibuja dentro de `contenedor` el formulario de actividad y los botones de
// estado que correspondan al estado actual. Si está Cerrado (R8), muestra un
// aviso de que ya no admite actividades. Tras cada acción: mostrarMensaje(...),
// mostrarDetalle(expediente.id) y actualizarListado().
function renderAcciones(expediente, contenedor) {
  if (expediente.estado === ESTADOS.CERRADO) {
    contenedor.insertAdjacentHTML(
      "beforeend",
      `<p class="aviso-cerrado">Expediente cerrado el ${escaparHtml(formatearFecha(expediente.fechaCierre))}. No admite nuevas actividades.</p>`
    );
    return;
  }

  const opciones = TIPOS_ACTIVIDAD.map((t) => `<option value="${t}">${t}</option>`).join("");
  const formActividad = document.createElement("form");
  formActividad.className = "form-accion";
  formActividad.noValidate = true;
  formActividad.innerHTML = `
    <h3>Registrar actividad</h3>
    <div class="campo">
      <label for="descripcion-actividad">Descripción de la actividad *</label>
      <textarea id="descripcion-actividad" name="descripcion" rows="2" maxlength="500"></textarea>
      <p class="error-campo" id="error-descripcion-actividad"></p>
    </div>
    <div class="campo">
      <label for="tipo-actividad">Tipo (opcional)</label>
      <select id="tipo-actividad" name="tipo"><option value="">Sin tipo</option>${opciones}</select>
    </div>
    <button type="submit" class="boton boton-primario">Agregar actividad</button>
  `;
  formActividad.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const campo = formActividad.elements.descripcion;
    ejecutarAccion(
      expediente,
      agregarActividad(expediente, campo.value, formActividad.elements.tipo.value),
      `Actividad registrada en ${expediente.id}.`,
      campo,
      formActividad.querySelector("#error-descripcion-actividad")
    );
  });
  contenedor.appendChild(formActividad);

  if (expediente.estado === ESTADOS.ABIERTO) {
    const caja = document.createElement("div");
    caja.className = "form-accion";
    caja.innerHTML = `
      <h3>Cambiar estado</h3>
      <button type="button" class="boton boton-primario">Pasar a En seguimiento</button>
    `;
    caja.querySelector("button").addEventListener("click", () => {
      ejecutarAccion(expediente, pasarASeguimiento(expediente), `${expediente.id} pasó a En seguimiento.`);
    });
    contenedor.appendChild(caja);
  }

  if (expediente.estado === ESTADOS.SEGUIMIENTO) {
    const formCierre = document.createElement("form");
    formCierre.className = "form-accion";
    formCierre.noValidate = true;
    formCierre.innerHTML = `
      <h3>Cerrar expediente</h3>
      <p class="ayuda">Requiere al menos una actividad registrada y un motivo.</p>
      <div class="campo">
        <label for="motivo-cierre">Motivo de cierre *</label>
        <textarea id="motivo-cierre" name="motivo" rows="2" maxlength="500"></textarea>
        <p class="error-campo" id="error-motivo-cierre"></p>
      </div>
      <button type="submit" class="boton boton-peligro">Cerrar expediente</button>
    `;
    formCierre.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const campo = formCierre.elements.motivo;
      ejecutarAccion(
        expediente,
        cerrarExpediente(expediente, campo.value),
        `Expediente ${expediente.id} cerrado.`,
        campo,
        formCierre.querySelector("#error-motivo-cierre")
      );
    });
    contenedor.appendChild(formCierre);
  }
}
