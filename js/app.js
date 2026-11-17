// ============================================================
//  app.js - Lógica de la aplicación DavanteDent
//  Depende de: cita.js (clase Cita) y cookies.js (guardar/cargar)
// ============================================================

let citas = cargarCitas();
const tbody = document.getElementById("tbodyCitas");
const form = document.getElementById("formCita");

// ------------------------------------------------------------
//  TABLA
// ------------------------------------------------------------
function pintarTabla() {
  tbody.innerHTML = "";

  // Sin citas: una única fila con "dato vacío"
  if (citas.length === 0) {
    const fila = document.createElement("tr");
    const celda = document.createElement("td");
    celda.colSpan = 8;
    celda.className = "vacio";
    celda.textContent = "dato vacío";
    fila.appendChild(celda);
    tbody.appendChild(fila);
    return;
  }

  citas.forEach((cita, i) => {
    const fila = document.createElement("tr");
    fila.dataset.id = cita.id; // id oculto, no se muestra en ninguna columna

    const valores = [
      i + 1, // columna Nº (orden en la tabla)
      cita.fechaTexto,
      `${cita.nombre} ${cita.apellidos}`,
      cita.dni,
      cita.telefono,
      cita.nacimiento,
      cita.observaciones
    ];
    valores.forEach(v => {
      const td = document.createElement("td");
      td.textContent = v;
      fila.appendChild(td);
    });

    const tdAcciones = document.createElement("td");
    ["modificar", "eliminar"].forEach(accion => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = accion === "modificar" ? "Modificar" : "Eliminar";
      btn.className = accion === "eliminar" ? "btn-eliminar" : "btn-modificar";
      btn.dataset.accion = accion;
      btn.dataset.id = cita.id;
      tdAcciones.appendChild(btn);
    });
    fila.appendChild(tdAcciones);

    tbody.appendChild(fila);
  });
}

// ------------------------------------------------------------
//  ELIMINAR Y MODIFICAR
// ------------------------------------------------------------
function eliminarCita(id) {
  citas = citas.filter(c => c.id !== id);
  guardarCitas(citas);

  // Si justo se estaba editando esa cita, se cancela la edición
  if (Number(document.getElementById("idCita").value) === id) {
    limpiarErrores();
    vaciarFormulario();
  }
  pintarTabla();
}

function cargarEnFormulario(id) {
  const guardadas = cargarCitas();            // se lee de la cookie, no del HTML
  const c = guardadas.find(x => x.id === id); // se busca por el id oculto
  if (!c) return;

  limpiarErrores();
  const poner = (campo, valor) => (document.getElementById(campo).value = valor);
  poner("dia", c.dia);
  poner("mes", c.mes);
  poner("anio", c.anio);
  poner("hora", c.hora);
  poner("minuto", c.minuto);
  poner("nombre", c.nombre);
  poner("apellidos", c.apellidos);
  poner("dni", c.dni);
  poner("telefono", c.telefono);
  poner("nacimiento", c.nacimiento);
  poner("observaciones", c.observaciones);

  poner("idCita", c.id); // el campo oculto activa el "modo modificar"
  document.getElementById("btnGuardar").textContent = "Guardar cambios";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Un solo evento para todos los botones de la tabla (delegación de eventos)
tbody.addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  if (btn.dataset.accion === "eliminar") eliminarCita(id);
  if (btn.dataset.accion === "modificar") cargarEnFormulario(id);
});

// ------------------------------------------------------------
//  FORMULARIO: LECTURA Y ERRORES
// ------------------------------------------------------------
function leerFormulario() {
  const v = id => document.getElementById(id).value.trim();
  return {
    dia: v("dia"), mes: v("mes"), anio: v("anio"), hora: v("hora"), minuto: v("minuto"),
    nombre: v("nombre"), apellidos: v("apellidos"), dni: v("dni").toUpperCase(),
    telefono: v("telefono"), nacimiento: v("nacimiento"), observaciones: v("observaciones")
  };
}

function limpiarErrores() {
  document.querySelectorAll(".error").forEach(s => (s.textContent = ""));
  document.querySelectorAll(".invalido").forEach(el => el.classList.remove("invalido"));
}

function marcarError(campos, idError, mensaje) {
  campos.forEach(c => document.getElementById(c).classList.add("invalido"));
  document.getElementById(idError).textContent = mensaje;
}

function vaciarFormulario() {
  form.reset();
  document.getElementById("idCita").value = "";
  document.getElementById("btnGuardar").textContent = "Guardar cita";
}

// ------------------------------------------------------------
//  VALIDACIÓN
// ------------------------------------------------------------
function esEntero(txt) {
  return /^\d+$/.test(txt);
}

function validar(d) {
  let correcto = true;

  // --- Fecha de la cita ---
  const partes = ["dia", "mes", "anio", "hora", "minuto"];
  const vacios = partes.filter(p => !esEntero(d[p]));
  if (vacios.length > 0) {
    marcarError(vacios, "error-fecha", "Rellena día, mes, año, hora y minuto con números enteros.");
    correcto = false;
  } else {
    const dia = +d.dia, mes = +d.mes, anio = +d.anio, hora = +d.hora, minuto = +d.minuto;
    const f = new Date(anio, mes - 1, dia, hora, minuto);
    const existe = f.getFullYear() === anio && f.getMonth() === mes - 1 &&
                   f.getDate() === dia && f.getHours() === hora && f.getMinutes() === minuto;
    if (!existe || anio < 2000 || anio > 2100) {
      marcarError(partes, "error-fecha", "La fecha u hora no es válida (por ejemplo, 31/02 no existe).");
      correcto = false;
    }
  }

  // --- Nombre y apellidos ---
  const soloLetras = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]{2,}$/;
  if (!soloLetras.test(d.nombre)) {
    marcarError(["nombre"], "error-nombre", "El nombre solo puede tener letras (mínimo 2).");
    correcto = false;
  }
  if (!soloLetras.test(d.apellidos)) {
    marcarError(["apellidos"], "error-apellidos", "Los apellidos solo pueden tener letras (mínimo 2).");
    correcto = false;
  }

  // --- DNI: 8 números + letra correcta ---
  const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
  if (!/^\d{8}[A-Z]$/.test(d.dni) || letras[+d.dni.slice(0, 8) % 23] !== d.dni[8]) {
    marcarError(["dni"], "error-dni", "DNI no válido: 8 números y la letra correcta (ej. 12345678Z).");
    correcto = false;
  }

  // --- Teléfono: 9 dígitos, empieza por 6, 7, 8 o 9 ---
  if (!/^[6-9]\d{8}$/.test(d.telefono)) {
    marcarError(["telefono"], "error-telefono", "El teléfono debe tener 9 números y no puede contener letras.");
    correcto = false;
  }

  // --- Fecha de nacimiento ---
  const nac = new Date(d.nacimiento);
  if (d.nacimiento === "" || isNaN(nac) || nac > new Date() || nac.getFullYear() < 1900) {
    marcarError(["nacimiento"], "error-nacimiento", "Indica una fecha de nacimiento válida y que no sea futura.");
    correcto = false;
  }

  // --- Observaciones (opcionales, limitadas por el tamaño de la cookie) ---
  if (d.observaciones.length > 100) {
    marcarError(["observaciones"], "error-observaciones", "Las observaciones no pueden superar los 100 caracteres.");
    correcto = false;
  }

  return correcto;
}

// ------------------------------------------------------------
//  ENVÍO DEL FORMULARIO (crear o modificar)
// ------------------------------------------------------------
form.addEventListener("submit", e => {
  e.preventDefault();
  limpiarErrores();

  const datos = leerFormulario();
  if (!validar(datos)) return; // hay errores: no se crea nada y no se borra el formulario

  const idEditando = Number(document.getElementById("idCita").value);
  const i = idEditando ? citas.findIndex(c => c.id === idEditando) : -1;

  const nuevas = [...citas];
  if (i !== -1) {
    // modo modificar: se conserva el id original
    nuevas[i] = new Cita({ ...datos, id: idEditando });
  } else {
    nuevas.push(new Cita(datos)); // el id se genera con Date.now()
  }

  // Si no cabe en la cookie, se avisa y no se pierde nada de lo escrito
  if (!guardarCitas(nuevas)) {
    alert("No hay espacio en la cookie del navegador para guardar más citas.");
    return;
  }

  citas = nuevas;
  pintarTabla();
  vaciarFormulario();
});

// ------------------------------------------------------------
//  ARRANQUE
// ------------------------------------------------------------
pintarTabla();