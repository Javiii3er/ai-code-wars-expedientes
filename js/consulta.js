// listado con identificador, persona, responsable y estado;
// búsqueda por identificador o nombre/alias; detalle con historial.
//
//  app.js: datos, buscarExpedientePorId, formatearFecha, escaparHtml, ESTADOS.
// Llama a seguimiento.js: renderAcciones(expediente, contenedor).

// Texto actual del buscador. Se guarda aquí para no perderlo al redibujar.
let textoBusqueda = "";

// Clase CSS según el estado del expediente.
function claseEstado(estado) {
    if (estado === ESTADOS.ABIERTO) return "estado-abierto";
    if (estado === ESTADOS.SEGUIMIENTO) return "estado-seguimiento";
    return "estado-cerrado";
}

// Devuelve los expedientes cuyo id o persona contienen el texto (S3: sin
// distinguir mayúsculas/minúsculas, coincidencia parcial). Texto vacío = todos.
function buscarExpedientes(texto) {
    const consulta = (texto || "").trim().toLowerCase();
    if (!consulta) return datos.expedientes;
    return datos.expedientes.filter(
        (exp) =>
            exp.id.toLowerCase().includes(consulta) ||
            exp.persona.toLowerCase().includes(consulta)
    );
}

// Dibuja (o vuelve a dibujar) el buscador y la tabla en #seccion-listado.
// Si no hay resultados, debe informarlo con un mensaje claro.
// Se llama al cargar la página, después de abrir un expediente y después de
// cualquier cambio de seguimiento.
function actualizarListado() {
    const seccion = document.getElementById("seccion-listado");

    // El buscador se crea una sola vez: así el campo conserva el foco y el
    // texto mientras la persona escribe, aunque la tabla se redibuje.
    if (!document.getElementById("buscador-expedientes")) {
        const buscador = document.createElement("div");
        buscador.className = "campo buscador";
        buscador.innerHTML =
            '<label for="buscador-expedientes">Buscar por identificador o persona</label>' +
            '<input type="search" id="buscador-expedientes" autocomplete="off" ' +
            'placeholder="Ej.: EXP-0001 o parte del nombre">' +
            '<div id="resultado-listado"></div>';
        seccion.appendChild(buscador);

        buscador.querySelector("input").addEventListener("input", (evento) => {
            textoBusqueda = evento.target.value;
            actualizarListado();
        });
    }

    const campo = document.getElementById("buscador-expedientes");
    if (campo.value !== textoBusqueda) campo.value = textoBusqueda;

    const contenedor = document.getElementById("resultado-listado");
    const resultados = buscarExpedientes(textoBusqueda);

    if (datos.expedientes.length === 0) {
        contenedor.innerHTML =
            '<p class="sin-resultados">Todavía no hay expedientes. Abra el primero con el formulario de arriba.</p>';
        return;
    }

    if (resultados.length === 0) {
        contenedor.innerHTML =
            `<p class="sin-resultados">No se encontraron expedientes para «${escaparHtml(textoBusqueda.trim())}».</p>`;
        return;
    }

    const filas = resultados
        .map(
            (exp) =>
                "<tr>" +
                `<td>${escaparHtml(exp.id)}</td>` +
                `<td>${escaparHtml(exp.persona)}</td>` +
                `<td>${escaparHtml(exp.responsable)}</td>` +
                `<td><span class="etiqueta-estado ${claseEstado(exp.estado)}">${escaparHtml(exp.estado)}</span></td>` +
                `<td><button type="button" class="boton boton-secundario" data-id="${escaparHtml(exp.id)}" ` +
                `aria-label="Ver detalle del expediente ${escaparHtml(exp.id)}">Ver detalle</button></td>` +
                "</tr>"
        )
        .join("");

    contenedor.innerHTML =
        '<p class="conteo-resultados" aria-live="polite">' +
        `${resultados.length} de ${datos.expedientes.length} expediente(s)</p>` +
        '<div class="tabla-contenedor"><table class="tabla-expedientes">' +
        "<thead><tr>" +
        '<th scope="col">Identificador</th><th scope="col">Persona</th>' +
        '<th scope="col">Responsable</th><th scope="col">Estado</th>' +
        '<th scope="col"><span class="solo-lectores">Acciones</span></th>' +
        "</tr></thead>" +
        `<tbody>${filas}</tbody></table></div>`;

    contenedor.querySelectorAll("button[data-id]").forEach((boton) => {
        boton.addEventListener("click", () => mostrarDetalle(boton.dataset.id));
    });
}

// Genera el HTML de una entrada del historial. Las actividades y los cambios
// de estado se distinguen por etiqueta y por clase CSS (según entrada.tipo).
function htmlEntradaHistorial(entrada) {
    const etiquetas = {
        apertura: "Apertura",
        actividad: "Actividad",
        cambio_estado: "Cambio de estado"
    };
    const tipo = etiquetas[entrada.tipo] ? entrada.tipo : "actividad";
    let detalle = "";

    if (tipo === "actividad") {
        const subtipo = entrada.tipoActividad ? ` (${escaparHtml(entrada.tipoActividad)})` : "";
        detalle = `<p>${escaparHtml(entrada.descripcion)}${subtipo}</p>`;
    } else if (tipo === "cambio_estado") {
        detalle =
            `<p>${escaparHtml(entrada.estadoAnterior)} → <strong>${escaparHtml(entrada.estadoNuevo)}</strong></p>` +
            (entrada.motivo ? `<p>Motivo: ${escaparHtml(entrada.motivo)}</p>` : "");
    } else {
        detalle = `<p>${escaparHtml(entrada.descripcion)}</p>`;
    }

    return (
        `<li class="entrada entrada-${tipo.replace("_", "-")}">` +
        `<span class="etiqueta-entrada">${etiquetas[tipo]}</span>` +
        `<time datetime="${escaparHtml(entrada.fecha)}">${escaparHtml(formatearFecha(entrada.fecha))}</time>` +
        detalle +
        "</li>"
    );
}

// Muestra #seccion-detalle con los datos del expediente, su historial en orden
// cronológico (distinguiendo actividades de cambios de estado) y, al final, un
// <div id="acciones-expediente"> donde se llama a renderAcciones(exp, div).
function mostrarDetalle(id) {
    const exp = buscarExpedientePorId(id);
    const seccion = document.getElementById("seccion-detalle");
    if (!exp) return;

    // Se conserva el <h2> y se reconstruye el resto.
    while (seccion.children.length > 1) seccion.removeChild(seccion.lastChild);

    const cierre = exp.fechaCierre
        ? `<dt>Fecha de cierre</dt><dd>${escaparHtml(formatearFecha(exp.fechaCierre))}</dd>` +
        `<dt>Motivo de cierre</dt><dd>${escaparHtml(exp.motivoCierre)}</dd>`
        : "";

    // Orden cronológico: de la entrada más antigua a la más reciente.
    const historial = exp.historial
        .map((entrada, indice) => ({ entrada, indice }))
        .sort(
            (a, b) =>
                new Date(a.entrada.fecha) - new Date(b.entrada.fecha) || a.indice - b.indice
        )
        .map((par) => htmlEntradaHistorial(par.entrada))
        .join("");

    const cuerpo = document.createElement("div");
    cuerpo.innerHTML =
        '<dl class="datos-expediente">' +
        `<dt>Identificador</dt><dd>${escaparHtml(exp.id)}</dd>` +
        `<dt>Persona solicitante</dt><dd>${escaparHtml(exp.persona)}</dd>` +
        `<dt>Asunto</dt><dd>${escaparHtml(exp.asunto)}</dd>` +
        `<dt>Responsable</dt><dd>${escaparHtml(exp.responsable)}</dd>` +
        `<dt>Categoría</dt><dd>${exp.categoria ? escaparHtml(exp.categoria) : "Sin categoría"}</dd>` +
        `<dt>Estado</dt><dd><span class="etiqueta-estado ${claseEstado(exp.estado)}">${escaparHtml(exp.estado)}</span></dd>` +
        `<dt>Fecha de apertura</dt><dd>${escaparHtml(formatearFecha(exp.fechaApertura))}</dd>` +
        cierre +
        "</dl>" +
        '<h3 class="titulo-historial">Historial</h3>' +
        `<ol class="historial">${historial}</ol>` +
        '<div id="acciones-expediente"></div>';
    seccion.appendChild(cuerpo);

    // Compañera 2 dibuja aquí el formulario de actividades y los cambios de estado.
    if (typeof renderAcciones === "function") {
        renderAcciones(exp, document.getElementById("acciones-expediente"));
    }

    seccion.hidden = false;
    seccion.scrollIntoView({ behavior: "smooth", block: "start" });
}