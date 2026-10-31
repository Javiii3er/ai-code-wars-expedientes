// Consulta y búsqueda (Compañera 1).
// Requisito 3.2: listado con identificador, persona, responsable y estado;
// búsqueda por identificador o nombre/alias; detalle con historial.
//
// Usa de app.js: datos, buscarExpedientePorId, formatearFecha, escaparHtml, ESTADOS.
// Llama a seguimiento.js: renderAcciones(expediente, contenedor).

// Devuelve los expedientes cuyo id o persona contienen el texto (S3: sin
// distinguir mayúsculas/minúsculas, coincidencia parcial). Texto vacío = todos.
function buscarExpedientes(texto) {
  // TODO Compañera 1
  return datos.expedientes;
}

// Dibuja (o vuelve a dibujar) el buscador y la tabla en #seccion-listado.
// Si no hay resultados, debe informarlo con un mensaje claro.
// Se llama al cargar la página, después de abrir un expediente y después de
// cualquier cambio de seguimiento.
function actualizarListado() {
  // TODO Compañera 1
}

// Muestra #seccion-detalle con los datos del expediente, su historial en orden
// cronológico (distinguiendo actividades de cambios de estado) y, al final, un
// <div id="acciones-expediente"> donde se llama a renderAcciones(exp, div).
function mostrarDetalle(id) {
  // TODO Compañera 1
}
