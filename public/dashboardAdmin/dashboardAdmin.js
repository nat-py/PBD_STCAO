const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const usuarioActual = urlParams.get('usuario');

document.addEventListener("DOMContentLoaded", () => {
  // 1. NAVEGACIÓN ENTRE PANTALLAS (TABS SCREEN-TO-SCREEN)
  const navLinks = document.querySelectorAll("#adminTabs .nav-link");
  const screens = document.querySelectorAll(".admin-screen");

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navLinks.forEach(item => item.classList.remove("active"));
      screens.forEach(screen => screen.classList.remove("active"));

      link.classList.add("active");
      const targetId = link.getAttribute("data-target");
      document.getElementById(targetId).classList.add("active");
    });
  });

  // Modal En Proceso Genérico
  const modalEnProceso = new bootstrap.Modal(document.getElementById("modalEnProceso"));
  document.querySelectorAll(".btn-proceso-trigger").forEach(btn => {
    btn.addEventListener("click", () => modalEnProceso.show());
  });

  // 2. CARGA Y GESTIÓN DE BITÁCORAS
  let bitacorasData = [];
  const tablaBitacorasBody = document.getElementById("tabla-bitacoras-body");
  const modalBitacora = new bootstrap.Modal(document.getElementById("modalBitacoraDetalle"));

  fetch('/api/admin/bitacora')
    .then(response => response.json())
    .then(data => {
      bitacorasData = data;
      renderBitacoras(bitacorasData);
    })
    .catch(err => console.error("Error cargando bitácoras:", err));

  function renderBitacoras(data) {
    tablaBitacorasBody.innerHTML = "";
    if (data.length === 0) {
      tablaBitacorasBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">No hay registros de bitácora</td></tr>`;
      return;
    }

    data.forEach(item => {
      const tr = document.createElement("tr");
      tr.className = "clickable-row";
      tr.innerHTML = `
        <td class="fw-semibold">${item.fechaHora}</td>0
        <td>${item.ip}</td>
        <td><span class="badge bg-secondary">${item.operacion}</span></td>
        <td>${item.usuario}</td>
      `;
      tr.addEventListener("click", () => mostrarModalBitacora(item));
      tablaBitacorasBody.appendChild(tr);
    });
  }

  // Filtrado de Bitácoras
  document.querySelectorAll(".filtro-opcion").forEach(op => {
    op.addEventListener("click", (e) => {
      e.preventDefault();
      const filtro = e.target.getAttribute("data-filtro");
      document.getElementById("dropdownFiltroBitacora").innerText = e.target.innerText;
      aplicarFiltroBitacora(filtro, null);
    });
  });

  document.getElementById("inputFechaEspecifica").addEventListener("change", (e) => {
    const fechaSeleccionada = e.target.value;
    if (fechaSeleccionada) {
      document.getElementById("dropdownFiltroBitacora").innerText = fechaSeleccionada;
      aplicarFiltroBitacora("especifica", fechaSeleccionada);
    }
  });

  function aplicarFiltroBitacora(tipo, valor) {
    let filtrados = [...bitacorasData];
    const ahora = new Date(); // Simulado a 2026

    if (tipo === "dia") {
      filtrados = filtrados.filter(item => item.fyh.startsWith("2026-10-01"));
    } else if (tipo === "especifica" && valor) {
      filtrados = filtrados.filter(item => item.fyh.startsWith(valor));
    }
    // Lógica adicional para hora, semana, mes según formato requerido
    renderBitacoras(filtrados);
  }

  // Mostrar Modal según tipo de operación
  function mostrarModalBitacora(item) {
    const tituloModal = document.getElementById("modalBitacoraTitulo");
    const contenidoModal = document.getElementById("modalBitacoraContenido");

    tituloModal.innerText = `Detalle de Operación: ${item.operacion}`;

    const operacionesSimples = ["login", "logout", "consultaEstadoCuenta"];
    let iconoOperacion = "bi-info-circle-fill text-primary";
    if (item.operacion === "login") iconoOption = "bi-box-arrow-in-right text-success";
    if (item.operacion === "logout") iconoOption = "bi-box-arrow-right text-danger";

    if (operacionesSimples.includes(item.operacion)) {
      contenidoModal.innerHTML = `
        <div class="text-center mb-4">
          <i class="bi bi-shield-check display-4 text-success"></i>
          <h5 class="fw-bold mt-2 text-uppercase">${item.operacion}</h5>
        </div>
        <div class="row g-3 text-center">
          <div class="col-6"><div class="p-2 border rounded bg-white"><strong>Fecha y Hora:</strong><br>${item.fyh}</div></div>
          <div class="col-6"><div class="p-2 border rounded bg-white"><strong>IP:</strong><br>${item.ip}</div></div>
          <div class="col-6"><div class="p-2 border rounded bg-white"><strong>Usuario:</strong><br>${item.usuario}</div></div>
          <div class="col-6"><div class="p-2 border rounded bg-white"><strong>Operación:</strong><br>${item.operacion}</div></div>
        </div>
      `;
    } else {
      // Operaciones complejas: insertarBeneficiario, modificarBeneficiario, borrarBeneficiario
      contenidoModal.innerHTML = `
        <div class="text-center mb-3">
          <i class="bi bi-pencil-square display-5 text-warning"></i>
          <h5 class="fw-bold mt-1 text-uppercase">${item.operacion}</h5>
        </div>
        <div class="row g-2 text-center mb-3">
          <div class="col-3"><div class="p-1 border rounded bg-white small"><strong>Fecha/Hora:</strong><br>${item.fyh}</div></div>
          <div class="col-3"><div class="p-1 border rounded bg-white small"><strong>IP:</strong><br>${item.ip}</div></div>
          <div class="col-3"><div class="p-1 border rounded bg-white small"><strong>Usuario:</strong><br>${item.usuario}</div></div>
          <div class="col-3"><div class="p-1 border rounded bg-white small"><strong>Op:</strong><br>${item.operacion}</div></div>
        </div>
        <h6 class="fw-bold text-muted mb-2">Cambios Registrados (Old vs New):</h6>
        <div class="diff-scroll-container">
          <div class="row">
            <div class="col-6 border-end">
              <span class="badge bg-danger mb-2">Anterior (Old)</span>
              <pre class="small text-muted bg-white p-2 rounded">${JSON.stringify(item.detalles?.old || {}, null, 2)}</pre>
            </div>
            <div class="col-6">
              <span class="badge bg-success mb-2">Nuevo (New)</span>
              <pre class="small text-muted bg-white p-2 rounded">${JSON.stringify(item.detalles?.new || {}, null, 2)}</pre>
            </div>
          </div>
        </div>
      `;
    }
    modalBitacora.show();
  }

  // 3. ADMINISTRAR CUENTAS
  const tablaCuentasBody = document.getElementById("tabla-cuentas-body");
  const inputBusquedaCuentas = document.getElementById("inputBusquedaCuentas");
  let cuentasData = [];

  fetch("cuentas.json")
    .then(response => response.json())
    .then(data => {
      cuentasData = data;
      renderCuentas(cuentasData);
    })
    .catch(err => console.error("Error cargando cuentas:", err));

  function renderCuentas(data) {
    tablaCuentasBody.innerHTML = "";
    if (data.length === 0) {
      tablaCuentasBody.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-3">No se encontraron cuentas</td></tr>`;
      return;
    }

    data.forEach(item => {
      const tr = document.createElement("tr");
      tr.className = "clickable-row";
      tr.innerHTML = `
        <td class="fw-bold">${item.id}</td>
        <td>${item.dueno}</td>
        <td><span class="badge bg-primary">${item.cuentasObjetivo}</span></td>
      `;
      // Al hacer clic redirige a dashboardAhorro
      tr.addEventListener("click", () => {
        window.location.href = "../dashboardAhorro/dashboardAhorro.html";
      });
      tablaCuentasBody.appendChild(tr);
    });
  }

  inputBusquedaCuentas.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filtradas = cuentasData.filter(c => 
      c.dueno.toLowerCase().includes(query) || c.id.toString().includes(query)
    );
    renderCuentas(filtradas);
  });

  // 4. IMPORTAR XML (DRAG & DROP Y EXPLORADOR)
  const dropZone = document.getElementById("dropZoneXml");
  const fileInput = document.getElementById("fileInputXml");
  const fileInfo = document.getElementById("fileInfo");

  dropZone.addEventListener("click", () => fileInput.click());

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    if (e.dataTransfer.files.length > 0) {
      validarYProcesarArchivo(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      validarYProcesarArchivo(e.target.files[0]);
    }
  });

  function validarYProcesarArchivo(file) {
    if (file.type === "text/xml" || file.name.endsWith(".xml")) {
      fileInfo.innerText = `Archivo cargado correctamente: ${file.name}`;
      modalEnProceso.show();
    } else {
      mostrarAlertaBootstrap("Por favor, seleccione únicamente un archivo en formato XML.", "danger");
      fileInput.value = "";
    }
  }

  // 5. EXPORTAR: SELECCIÓN EN CASCADA (PADRE E HIJOS)
  const parentChecks = document.querySelectorAll(".parent-check");
  parentChecks.forEach(parent => {
    const groupId = parent.getAttribute("data-group");
    const container = document.getElementById(groupId);
    if (!container) return;
    const childChecks = container.querySelectorAll(".child-check");

    parent.addEventListener("change", () => {
      childChecks.forEach(child => child.checked = parent.checked);
    });

    childChecks.forEach(child => {
      child.addEventListener("change", () => {
        const allChecked = Array.from(childChecks).every(c => c.checked);
        const someChecked = Array.from(childChecks).some(c => c.checked);
        parent.checked = allChecked;
        parent.indeterminate = someChecked && !allChecked;
      });
    });
  });
});



// configuraciones 

// ==========================================
// 6. GESTIÓN DE CONFIGURACIONES DE CATÁLOGOS
// ==========================================

// Definimos los catálogos en el ámbito global para que las funciones onclick los encuentren sin problema
window.tiposDocTodosData = [];

window.tiposDocData = [
  { id: "1", nombre: "Cedula Nacional" },
  { id: "2", nombre: "Cedula Residente" },
  { id: "3", nombre: "Pasaporte" },
  { id: "4", nombre: "Cedula Juridica" },
  { id: "5", nombre: "Permiso de Trabajo" },
  { id: "6", nombre: "Cedula Extranjera" }
];

window.tiposMonedaTodosData = [];

window.tiposMonedaData = [
  { id: "1", nombre: "Colones", simbolo: "₡" },
  { id: "2", nombre: "Dolares", simbolo: "$" },
  { id: "3", nombre: "Euros", simbolo: "€" }
];

window.parentezcosTodosData = [];

window.parentezcosData = [
  { id: "1", nombre: "Padre" },
  { id: "2", nombre: "Madre" },
  { id: "3", nombre: "Hijo" },
  { id: "4", nombre: "Hija" },
  { id: "5", nombre: "Hermano" },
  { id: "6", nombre: "Hermana" },
  { id: "7", nombre: "amigo" },
  { id: "8", nombre: "amiga" }
];

window.tiposCuentasData = [
  {
    id: "1", nombre: "Proletario", idTipoMoneda: "1", saldoMinimo: "25000.00",
    multaSaldoMin: "3000.00", cargoAnual: "5000", numRetirosHumano: "5",
    numRetirosAutomatico: "8", comisionHumano: "300", comisionAutomatico: "300", interes: "10"
  },
  {
    id: "2", nombre: "Profesional", idTipoMoneda: "1", saldoMinimo: "50000.00",
    multaSaldoMin: "3000.00", cargoAnual: "15000", numRetirosHumano: "5",
    numRetirosAutomatico: "8", comisionHumano: "500", comisionAutomatico: "500", interes: "15"
  },
  {
    id: "3", nombre: "Exclusivo", idTipoMoneda: "1", saldoMinimo: "100000.00",
    multaSaldoMin: "3000.00", cargoAnual: "30000", numRetirosHumano: "5",
    numRetirosAutomatico: "8", comisionHumano: "1000", comisionAutomatico: "1000", interes: "20"
  }
];

let modoEdicionCatalogos = false;
const btnEditCatalogos = document.getElementById("btn-edit-catalogos");

// Cargar catálogos desde la base de datos
Promise.all([
  fetch("/api/admin/tablaTipoDocuIdentidadActivo").then(response => {
    if (!response.ok) throw new Error("Error al obtener tipos de documento");
    return response.json();
  }),

  fetch("/api/admin/tablaTipoDocuIdentidad").then(response => {
  if (!response.ok) throw new Error("Error al obtener todos los tipos de documento");
  return response.json();
}),

  fetch("/api/admin/tablaTipoMonedaActivo").then(response => {
    if (!response.ok) throw new Error("Error al obtener tipos de moneda");
    return response.json();
  }),

  fetch("/api/admin/tablaTipoMoneda").then(response => {
  if (!response.ok) throw new Error("Error al obtener todos los tipos de moneda");
  return response.json();
}),

  fetch("/api/admin/tablaParentescoActivo").then(response => {
    if (!response.ok) throw new Error("Error al obtener parentescos");
    return response.json();
  }),

  fetch("/api/admin/tablaParentesco").then(response => {
  if (!response.ok) throw new Error("Error al obtener todos los parentescos");
  return response.json();
}),

  fetch("/api/admin/tablaTipoCuentaAhorroActivo").then(response => {
    if (!response.ok) throw new Error("Error al obtener tipos de cuenta");
    return response.json();
  })
])
.then(([documentos, documentosTodos, monedas, monedasTodos, parentescos, parentescosTodos, cuentas]) => {

  window.tiposDocData = documentos.tiposDocumento;
  window.tiposDocTodosData = documentosTodos.tiposDocumento;

  window.tiposMonedaData = monedas.tiposMoneda;
  window.tiposMonedaTodosData = monedasTodos.tiposMoneda;

  window.parentezcosData = parentescos.parentescos;
  window.parentezcosTodosData = parentescosTodos.parentescos;

  window.tiposCuentasData = cuentas.tiposCuentas;

  renderAllCatalogos();
})
.catch(error => {
  console.error("Error al cargar los catálogos desde la base de datos:", error);
  renderAllCatalogos();
});

function renderAllCatalogos() {
  renderAccordionCatalogo(
    "accordionTipoDoc",
    "container-btn-add-tipo-doc",
    window.tiposDocData,
    "tiposDocData",
    "documento"
  );

  renderAccordionCatalogo(
    "accordionTipoMoneda",
    "container-btn-add-moneda",
    window.tiposMonedaData,
    "tiposMonedaData",
    "moneda"
  );

  renderAccordionCatalogo(
    "accordionParentescos",
    "container-btn-add-parentesco",
    window.parentezcosData,
    "parentezcosData",
    "parentesco"
  );

  renderAccordionCuentas();
}

// Renderizador para tipo docu, tipo moneda y parentesco
function renderAccordionCatalogo(containerId, containerBtnAddId, lista, nombreVariable, tipoCatalogo) {
  const container = document.getElementById(containerId);
  const containerBtnAdd = document.getElementById(containerBtnAddId);

  if (!container) return;

  container.innerHTML = "";
  if (containerBtnAdd) containerBtnAdd.innerHTML = "";

  if (modoEdicionCatalogos && containerBtnAdd) {
    let textoAgregar = "";
    let iconoAgregar = "";

    if (tipoCatalogo === "documento") {
      textoAgregar = "Agregar Documento";
      iconoAgregar = "bi-card-heading";
    } else if (tipoCatalogo === "moneda") {
      textoAgregar = "Agregar Moneda";
      iconoAgregar = "bi-currency-exchange";
    } else if (tipoCatalogo === "parentesco") {
      textoAgregar = "Agregar Parentesco";
      iconoAgregar = "bi-people";
    }

    containerBtnAdd.innerHTML = `
      <button class="btn btn-sm btn-outline-primary fw-bold"
              onclick="agregarItemCatalogo('${nombreVariable}', '${tipoCatalogo}')">
        <i class="bi ${iconoAgregar} me-1"></i> ${textoAgregar}
      </button>
    `;
  }

  lista.forEach((item, index) => {
    const accordionId = `${tipoCatalogo}Collapse${index}`;

    const itemDiv = document.createElement("div");
    itemDiv.className = "accordion-item border mb-2 rounded shadow-sm overflow-hidden";

    let headerContent = "";

    if (modoEdicionCatalogos) {
      headerContent = `
        <div class="d-flex align-items-center gap-2 w-100 pe-3">
          <button type="button"
                  class="btn-remove-catalog"
                  title="Eliminar"
                  onclick="eliminarItemCatalogo('${nombreVariable}', ${index})">
            <i class="bi bi-dash-lg"></i>
          </button>

          <input type="text"
                 class="form-control form-control-sm fw-bold"
                 value="${item.nombre}"
                 onchange="actualizarItemCatalogo('${nombreVariable}', ${index}, 'nombre', this.value)"
                 onclick="event.stopPropagation()">

          <button class="accordion-button collapsed p-2 bg-transparent shadow-none"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#${accordionId}"
                  aria-expanded="false"
                  style="width: 40px;">
          </button>
        </div>
      `;
    } else {
      headerContent = `
        <button class="accordion-button collapsed fw-bold text-primary"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#${accordionId}"
                aria-expanded="false">
          <i class="bi ${tipoCatalogo === "documento" ? "bi-card-heading" :
                         tipoCatalogo === "moneda" ? "bi-currency-exchange" :
                         "bi-people"} me-2"></i>
          ${item.nombre}
        </button>
      `;
    }

    let campos = "";

    if (tipoCatalogo === "documento") {
      campos = `
        <div class="col-md-12">
          <label class="form-label small fw-bold text-muted">ID:</label>
          ${
            modoEdicionCatalogos
              ? `<input type="text"
                        class="form-control form-control-sm"
                        value="${item.id}"
                        onchange="actualizarItemCatalogo('${nombreVariable}', ${index}, 'id', this.value)">`
              : `<p class="form-control-plaintext form-control-sm border bg-white px-2 rounded">
                  ${item.id}
                 </p>`
          }
        </div>
      `;
    }

    if (tipoCatalogo === "moneda") {
      campos = `
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted">ID:</label>
          ${
            modoEdicionCatalogos
              ? `<input type="text"
                        class="form-control form-control-sm"
                        value="${item.id}"
                        onchange="actualizarItemCatalogo('${nombreVariable}', ${index}, 'id', this.value)">`
              : `<p class="form-control-plaintext form-control-sm border bg-white px-2 rounded">
                  ${item.id}
                 </p>`
          }
        </div>

        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted">Símbolo:</label>
          ${
            modoEdicionCatalogos
              ? `<input type="text"
                        class="form-control form-control-sm"
                        value="${item.simbolo}"
                        onchange="actualizarItemCatalogo('${nombreVariable}', ${index}, 'simbolo', this.value)">`
              : `<p class="form-control-plaintext form-control-sm border bg-white px-2 rounded">
                  ${item.simbolo}
                 </p>`
          }
        </div>
      `;
    }

    if (tipoCatalogo === "parentesco") {
      campos = `
        <div class="col-md-12">
          <label class="form-label small fw-bold text-muted">ID:</label>
          ${
            modoEdicionCatalogos
              ? `<input type="text"
                        class="form-control form-control-sm"
                        value="${item.id}"
                        onchange="actualizarItemCatalogo('${nombreVariable}', ${index}, 'id', this.value)">`
              : `<p class="form-control-plaintext form-control-sm border bg-white px-2 rounded">
                  ${item.id}
                 </p>`
          }
        </div>
      `;
    }

    itemDiv.innerHTML = `
      <h2 class="accordion-header" id="heading-${tipoCatalogo}-${index}">
        ${headerContent}
      </h2>

      <div id="${accordionId}"
           class="accordion-collapse collapse"
           aria-labelledby="heading-${tipoCatalogo}-${index}"
           data-bs-parent="#${containerId}">

        <div class="accordion-body bg-light">
          <div class="row g-3">
            ${campos}
          </div>
        </div>

      </div>
    `;

    container.appendChild(itemDiv);
  });
};

// Renderizador para Cuentas de Ahorro en Acordeón
function renderAccordionCuentas() {
  const container = document.getElementById("accordionCuentasAhorro");
  const containerBtnAdd = document.getElementById("container-btn-add-cuenta");
  if (!container) return;
  
  container.innerHTML = "";
  if (containerBtnAdd) containerBtnAdd.innerHTML = "";

  if (modoEdicionCatalogos && containerBtnAdd) {
    containerBtnAdd.innerHTML = `
      <button class="btn btn-sm btn-outline-primary fw-bold" onclick="agregarCuentaAhorro()">
        <i class="bi bi-plus-circle me-1"></i> Agregar Cuenta
      </button>`;
  }

  window.tiposCuentasData.forEach((cuenta, index) => {
    const accordionId = `cuentaCollapse${index}`;
    const itemDiv = document.createElement("div");
    itemDiv.className = "accordion-item border mb-2 rounded shadow-sm overflow-hidden";

    let headerContent = "";
    if (modoEdicionCatalogos) {
      headerContent = `
        <div class="d-flex align-items-center gap-2 w-100 pe-3">
          <button type="button" class="btn-remove-catalog" title="Eliminar Cuenta" onclick="eliminarCuentaAhorro(${index})">
            <i class="bi bi-dash-lg"></i>
          </button>
          <input type="text" class="form-control form-control-sm fw-bold" value="${cuenta.nombre}" onchange="actualizarCuentaProp(${index}, 'nombre', this.value)" onclick="event.stopPropagation()">
          <button class="accordion-button collapsed p-2 bg-transparent shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#${accordionId}" aria-expanded="false" style="width: 40px;"></button>
        </div>
      `;
    } else {
      headerContent = `
        <button class="accordion-button collapsed fw-bold text-primary" type="button" data-bs-toggle="collapse" data-bs-target="#${accordionId}" aria-expanded="false">
          <i class="bi bi-piggy-bank me-2"></i> ${cuenta.nombre}
        </button>
      `;
    }

    itemDiv.innerHTML = `
      <h2 class="accordion-header" id="heading${index}">
        ${headerContent}
      </h2>
      <div id="${accordionId}" class="accordion-collapse collapse" aria-labelledby="heading${index}" data-bs-parent="#accordionCuentasAhorro">
        <div class="accordion-body bg-light">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label small fw-bold text-muted">Moneda (ID):</label>
              ${modoEdicionCatalogos ? `<input type="text" class="form-control form-control-sm" value="${cuenta.idTipoMoneda}" onchange="actualizarCuentaProp(${index}, 'idTipoMoneda', this.value)">` : `<p class="form-control-plaintext form-control-sm border bg-white px-2 rounded">${cuenta.idTipoMoneda}</p>`}
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-bold text-muted">Cargo Anual:</label>
              ${modoEdicionCatalogos ? `<input type="text" class="form-control form-control-sm" value="${cuenta.cargoAnual}" onchange="actualizarCuentaProp(${index}, 'cargoAnual', this.value)">` : `<p class="form-control-plaintext form-control-sm border bg-white px-2 rounded">${cuenta.cargoAnual}</p>`}
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-bold text-muted">Saldo Mínimo:</label>
              ${modoEdicionCatalogos ? `<input type="text" class="form-control form-control-sm" value="${cuenta.saldoMinimo}" onchange="actualizarCuentaProp(${index}, 'saldoMinimo', this.value)">` : `<p class="form-control-plaintext form-control-sm border bg-white px-2 rounded">${cuenta.saldoMinimo}</p>`}
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-bold text-muted">Retiros (Humano/Auto):</label>
              <div class="input-group input-group-sm">
                ${modoEdicionCatalogos ? `
                  <input type="text" class="form-control" value="${cuenta.numRetirosHumano}" onchange="actualizarCuentaProp(${index}, 'numRetirosHumano', this.value)">
                  <input type="text" class="form-control" value="${cuenta.numRetirosAutomatico}" onchange="actualizarCuentaProp(${index}, 'numRetirosAutomatico', this.value)">
                ` : `<p class="form-control-plaintext form-control-sm border bg-white px-2 rounded w-100">${cuenta.numRetirosHumano} / ${cuenta.numRetirosAutomatico}</p>`}
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-bold text-muted">Multa Saldo Mínimo:</label>
              ${modoEdicionCatalogos ? `<input type="text" class="form-control form-control-sm" value="${cuenta.multaSaldoMin}" onchange="actualizarCuentaProp(${index}, 'multaSaldoMin', this.value)">` : `<p class="form-control-plaintext form-control-sm border bg-white px-2 rounded">${cuenta.multaSaldoMin}</p>`}
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-bold text-muted">Interés (%):</label>
              ${modoEdicionCatalogos ? `<input type="text" class="form-control form-control-sm" value="${cuenta.interes}" onchange="actualizarCuentaProp(${index}, 'interes', this.value)">` : `<p class="form-control-plaintext form-control-sm border bg-white px-2 rounded">${cuenta.interes}%</p>`}
            </div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(itemDiv);
  });
}

// Funciones Globales expuestas en window para manipulación correcta de los eventos onclick
window.actualizarItemCatalogo = function(nombreVar, index, campo, valor) {
  const item = window[nombreVar][index];
  item[campo] = valor.trim();
  if (!item._nuevo) {
    item._modificado = true;
  }
};

window.eliminarItemCatalogo = async function(nombreVar, index) {

  const item = window[nombreVar][index];

  let url = "";
  let nombreCatalogo = "";
  let nombreDependencias = "";
  let datosDependencias = [];

  if (nombreVar === "tiposDocData") {
    url = "/api/admin/eliminarTipoDocuIdentidad";
    nombreCatalogo = "tipo de documento de identidad";
    nombreDependencias = "personas";
  } 
  else if (nombreVar === "tiposMonedaData") {
    url = "/api/admin/eliminarTipoMoneda";
    nombreCatalogo = "tipo de moneda";
    nombreDependencias = "tiposCuenta";
  } 
  else if (nombreVar === "parentezcosData") {
    url = "/api/admin/eliminarParentesco";
    nombreCatalogo = "parentesco";
    nombreDependencias = "beneficiarios";
  }

  try {

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        usuario: usuarioActual,
        [nombreVar === "tiposDocData"
          ? "tipoDocuIdentidad"
          : nombreVar === "tiposMonedaData"
          ? "tipoMoneda"
          : "parentesco"]: item
      })
    });

    const resultado = await response.json();

    if (!response.ok || !resultado.success) {
      throw new Error(
        resultado.message || `No se pudo eliminar el ${nombreCatalogo}`
      );
    }

    datosDependencias = resultado[nombreDependencias] || [];

    // Eliminarlo del arreglo local solamente después
    // de que el backend confirme la eliminación.
    window[nombreVar].splice(index, 1);

    renderAllCatalogos();

    mostrarResultadoEliminacion(
      nombreCatalogo,
      item,
      datosDependencias
    );

  } catch (error) {

    console.error(`Error al eliminar ${nombreCatalogo}:`, error);

    mostrarAlertaBootstrap(
      `No se pudo eliminar el ${nombreCatalogo}.`,
      "danger"
    );
  }
};

function formatearNombreColumna(nombre) {

  return nombre
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, letra => letra.toUpperCase());
};

function mostrarResultadoEliminacion(nombreCatalogo, item, dependencias) {

  const modalElement = document.getElementById("modalEliminarCatalogo");
  const titulo = document.getElementById("modalEliminarCatalogoTitulo");
  const contenido = document.getElementById("modalEliminarCatalogoContenido");

  titulo.textContent = "Eliminación realizada correctamente";

  let html = `
    <div class="text-center mb-4">
      <i class="bi bi-check-circle-fill text-success display-5"></i>

      <h5 class="fw-bold mt-3">
        ${nombreCatalogo.charAt(0).toUpperCase() + nombreCatalogo.slice(1)}
        eliminado correctamente
      </h5>

      <p class="text-muted mb-0">
        El elemento <strong>${item.nombre}</strong> fue eliminado correctamente.
      </p>
    </div>
  `;

  if (dependencias.length === 0) {

    html += `
      <div class="alert alert-light border text-center mb-0">
        <i class="bi bi-info-circle me-2"></i>
        Este elemento no estaba siendo utilizado por ningún registro.
      </div>
    `;

  } else {

    html += `
      <div class="alert alert-warning">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        Este elemento estaba siendo utilizado por
        <strong>${dependencias.length}</strong>
        registro${dependencias.length === 1 ? "" : "s"}.
      </div>

      <h6 class="fw-bold text-muted mb-2">
        Registros relacionados:
      </h6>

      <div class="table-responsive">
        <table class="table table-sm table-bordered align-middle mb-0">
          <thead class="table-light">
            <tr>
    `;

    const columnas = Object.keys(dependencias[0]);

    columnas.forEach(columna => {
      html += `
        <th>${formatearNombreColumna(columna)}</th>
      `;
    });

    html += `
            </tr>
          </thead>
          <tbody>
    `;

    dependencias.forEach(dependencia => {

      html += `<tr>`;

      columnas.forEach(columna => {
        html += `
          <td>${dependencia[columna] ?? ""}</td>
        `;
      });

      html += `</tr>`;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;
  }

  contenido.innerHTML = html;

  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  modal.show();
};

window.agregarItemCatalogo = function(nombreVar, tipoCatalogo) {
  const lista = window[nombreVar];

  let nuevoId;

  if (tipoCatalogo === "documento") {
    const idsExistentes = window.tiposDocTodosData.map(x => parseInt(x.id) || 0);

    nuevoId = idsExistentes.length > 0
      ? Math.max(...idsExistentes) + 1
      : 1;
  } else if (tipoCatalogo === "moneda") {
    const idsExistentes = window.tiposMonedaTodosData.map(x => parseInt(x.id) || 0);

    nuevoId = idsExistentes.length > 0
      ? Math.max(...idsExistentes) + 1
      : 1;
  } else if (tipoCatalogo === "parentesco") {
      const idsExistentes = window.parentezcosTodosData.map(x => parseInt(x.id) || 0);

      nuevoId = idsExistentes.length > 0
        ? Math.max(...idsExistentes) + 1
        : 1;
  } else {
    nuevoId = lista.length > 0
      ? Math.max(...lista.map(x => parseInt(x.id) || 0)) + 1
      : 1;
  }

  if (tipoCatalogo === "moneda") {
  lista.push({
    id: nuevoId.toString(),
    nombre: "Nueva Moneda",
    simbolo: "$",
    _nuevo: true
  });

  window.tiposMonedaTodosData.push({
    id: nuevoId.toString(),
    nombre: "Nueva Moneda",
    simbolo: "$"
  });
} else if (tipoCatalogo === "documento") {
  lista.push({
    id: nuevoId.toString(),
    nombre: "Nuevo Documento",
    _nuevo: true
  });

  window.tiposDocTodosData.push({
  id: nuevoId.toString(),
  nombre: "Nuevo Documento"
  });
} else if (tipoCatalogo === "parentesco") {
  lista.push({
    id: nuevoId.toString(),
    nombre: "Nuevo Parentesco",
    _nuevo: true
  });

  window.parentezcosTodosData.push({
    id: nuevoId.toString(),
    nombre: "Nuevo Parentesco"
  });
}

  renderAllCatalogos();
};

window.actualizarCuentaProp = function(index, propiedad, valor) {
  window.tiposCuentasData[index][propiedad] = valor.trim();
};

window.eliminarCuentaAhorro = function(index) {
  window.tiposCuentasData.splice(index, 1);
  renderAllCatalogos();
};

window.agregarCuentaAhorro = function() {
  const lista = window.tiposCuentasData;
  const nuevoId = lista.length > 0 ? Math.max(...lista.map(x => parseInt(x.id) || 0)) + 1 : 1;
  lista.push({
    id: nuevoId.toString(),
    nombre: "Nueva Cuenta",
    idTipoMoneda: "1",
    saldoMinimo: "10000.00",
    multaSaldoMin: "2000.00",
    cargoAnual: "5000",
    numRetirosHumano: "5",
    numRetirosAutomatico: "8",
    comisionHumano: "300",
    comisionAutomatico: "300",
    interes: "12"
  });
  renderAllCatalogos();
};

// Botón Principal de Editar / Guardar Cambios
if (btnEditCatalogos) {
  btnEditCatalogos.addEventListener("click", async () => {
    if (!modoEdicionCatalogos) {
      modoEdicionCatalogos = true;
      btnEditCatalogos.innerHTML = `<i class="bi bi-check-lg me-1"></i> Guardar Cambios`;
      btnEditCatalogos.className = "btn btn-success text-white";

      renderAllCatalogos();
} else {

      try {
        for (const tipoDocuIdentidad of window.tiposDocData) {

          if (!tipoDocuIdentidad._nuevo && !tipoDocuIdentidad._modificado) {
            continue;
          }

          try {
            let response;
            if (tipoDocuIdentidad._nuevo) {
              response = await fetch("/api/admin/insertarTipoDocuIdentidad", {
                method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({
                  usuario: usuarioActual,
                  tipoDocuIdentidad: {
                    id: tipoDocuIdentidad.id,
                    nombre: tipoDocuIdentidad.nombre
                  }
                })
              });
            } else {
              response = await fetch("/api/admin/editarTipoDocuIdentidad", {
                method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({
                  usuario: usuarioActual,
                  tipoDocuIdentidad: {
                    id: tipoDocuIdentidad.id,
                    nombre: tipoDocuIdentidad.nombre
                  }
                })
              });
            }

            const resultado = await response.json();

            if (!response.ok || !resultado.success) {
              throw new Error(
                resultado.message || "No se pudo guardar un tipo de documento de identidad"
              );
            }

            if (tipoDocuIdentidad._nuevo) {
              delete tipoDocuIdentidad._nuevo;
            }

            if (tipoDocuIdentidad._modificado) {
              delete tipoDocuIdentidad._modificado;
            }

          } catch (error) {
            console.error("ERROR dentro del guardado:", error);
            throw error;
          }
        }

        for (const tipoMoneda of window.tiposMonedaData) {

          if (!tipoMoneda._nuevo && !tipoMoneda._modificado) {
            continue;
          }

          try {
            let response;

            if (tipoMoneda._nuevo) {
              response = await fetch("/api/admin/insertarTipoMoneda", {
                method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({
                  usuario: usuarioActual,
                  tipoMoneda: {
                    id: tipoMoneda.id,
                    nombre: tipoMoneda.nombre,
                    simbolo: tipoMoneda.simbolo
                  }
                })
              });
            } else {
              response = await fetch("/api/admin/editarTipoMoneda", {
                method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({
                  usuario: usuarioActual,
                  tipoMoneda: {
                    id: tipoMoneda.id,
                    nombre: tipoMoneda.nombre,
                    simbolo: tipoMoneda.simbolo
                  }
                })
              });
            }

            const resultado = await response.json();

            if (!response.ok || !resultado.success) {
              throw new Error(
                resultado.message || "No se pudo guardar un tipo de moneda"
              );
            }
            
            if (tipoMoneda._nuevo) {
              delete tipoMoneda._nuevo;
            }

            if (tipoMoneda._modificado) {
              delete tipoMoneda._modificado;
            }

          } catch (error) {
            console.error("ERROR dentro del guardado:", error);
            throw error;
          }
        }

        for (const parentesco of window.parentezcosData) {
      
          if (!parentesco._nuevo && !parentesco._modificado) {
            continue;
          }

          try {
            let response;

            if (parentesco._nuevo) {
              response = await fetch("/api/admin/insertarParentesco", {
                method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({
                  usuario: usuarioActual,
                  parentesco: {
                    id: parentesco.id,
                    nombre: parentesco.nombre
                  }
                })
              });
            } else {
              response = await fetch("/api/admin/editarParentesco", {
                method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({
                  usuario: usuarioActual,
                  parentesco: {
                    id: parentesco.id,
                    nombre: parentesco.nombre
                  }
                })
              });
            }

            const resultado = await response.json();

            if (!response.ok || !resultado.success) {
              throw new Error(
                resultado.message || "No se pudo guardar un parentesco"
              );
            }
            
            if (parentesco._nuevo) {
              delete parentesco._nuevo;
            }

            if (parentesco._modificado) {
              delete parentesco._modificado;
            }

          } catch (error) {
            console.error("ERROR dentro del guardado:", error);
            throw error;
          }
        }

        modoEdicionCatalogos = false;
        btnEditCatalogos.innerHTML = `<i class="bi bi-pencil me-1"></i> Editar Catálogos`;
        btnEditCatalogos.className = "btn btn-secondary text-white";

        mostrarAlertaBootstrap(
          "¡Los cambios se han guardado con éxito!",
          "success"
        );

        renderAllCatalogos();

      } catch (error) {

        console.error("Error al guardar los cambios:", error);

        mostrarAlertaBootstrap(
          "No se pudieron guardar los cambios.",
          "danger"
        );
      }
    }
  });
}

// alerta boostrap

// Función auxiliar para mostrar alertas flotantes de Bootstrap en la esquina inferior derecha
function mostrarAlertaBootstrap(mensaje, tipo = "success") {
  // Contenedor flotante para las alertas (si no existe, lo crea)
  let alertContainer = document.getElementById("bootstrap-alert-container");
  if (!alertContainer) {
    alertContainer = document.createElement("div");
    alertContainer.id = "bootstrap-alert-container";
    // CAMBIO AQUÍ: bottom y right en lugar de top
    alertContainer.style.cssText = "position: fixed; bottom: 20px; right: 20px; z-index: 1080; min-width: 300px;";
    document.body.appendChild(alertContainer);
  }

  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${tipo} alert-dismissible fade show shadow-lg`;
  alertDiv.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="bi ${tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} fs-5 me-2"></i>
      <div>${mensaje}</div>
    </div>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  alertContainer.appendChild(alertDiv);

  // Auto-cerrar la alerta después de 4 segundos
  setTimeout(() => {
    alertDiv.classList.remove("show");
    setTimeout(() => alertDiv.remove(), 300);
  }, 4000);
}