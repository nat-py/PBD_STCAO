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
window.tiposDocData = [
  { id: "1", nombre: "Cedula Nacional" },
  { id: "2", nombre: "Cedula Residente" },
  { id: "3", nombre: "Pasaporte" },
  { id: "4", nombre: "Cedula Juridica" },
  { id: "5", nombre: "Permiso de Trabajo" },
  { id: "6", nombre: "Cedula Extranjera" }
];

window.tiposMonedaData = [
  { id: "1", nombre: "Colones", simbolo: "₡" },
  { id: "2", nombre: "Dolares", simbolo: "$" },
  { id: "3", nombre: "Euros", simbolo: "€" }
];

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

// Intentar cargar desde catalogos.xml (opcional si ya tienes los datos locales arriba)
fetch("catalogos.xml")
  .then(response => response.text())
  .then(xmlStr => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlStr, "text/xml");

    let tempDocs = [];
    xmlDoc.querySelectorAll("Tipo_Doc > TipoDocuIdentidad").forEach(el => {
      tempDocs.push({ id: el.getAttribute("Id"), nombre: el.getAttribute("Nombre") });
    });
    if (tempDocs.length > 0) window.tiposDocData = tempDocs;

    let tempMonedas = [];
    xmlDoc.querySelectorAll("Tipo_Moneda > TipoMoneda").forEach(el => {
      tempMonedas.push({ id: el.getAttribute("Id"), nombre: el.getAttribute("Nombre"), simbolo: el.getAttribute("Simbolo") });
    });
    if (tempMonedas.length > 0) window.tiposMonedaData = tempMonedas;

    let tempParentescos = [];
    xmlDoc.querySelectorAll("Parentezcos > Parentezco").forEach(el => {
      tempParentescos.push({ id: el.getAttribute("Id"), nombre: el.getAttribute("Nombre") });
    });
    if (tempParentescos.length > 0) window.parentezcosData = tempParentescos;

    let tempCuentas = [];
    xmlDoc.querySelectorAll("Tipo_Cuenta_Ahorros > TipoCuentaAhorro").forEach(el => {
      tempCuentas.push({
        id: el.getAttribute("Id"),
        nombre: el.getAttribute("Nombre"),
        idTipoMoneda: el.getAttribute("IdTipoMoneda") || "1",
        saldoMinimo: el.getAttribute("SaldoMinimo") || "0.00",
        multaSaldoMin: el.getAttribute("MultaSaldoMin") || "0.00",
        cargoAnual: el.getAttribute("CargoAnual") || "0",
        numRetirosHumano: el.getAttribute("NumRetirosHumano") || "0",
        numRetirosAutomatico: el.getAttribute("NumRetirosAutomatico") || "0",
        comisionHumano: el.getAttribute("comisionHumano") || "0",
        comisionAutomatico: el.getAttribute("comisionAutomatico") || "0",
        interes: el.getAttribute("interes") || "0"
      });
    });
    if (tempCuentas.length > 0) window.tiposCuentasData = tempCuentas;

    renderAllCatalogos();
  })
  .catch(err => {
    console.log("Usando datos locales por defecto para catálogos.");
    renderAllCatalogos();
  });

function renderAllCatalogos() {
  renderSimpleList("container-tipo-doc", window.tiposDocData, "tiposDocData");
  renderSimpleList("container-tipo-moneda", window.tiposMonedaData, "tiposMonedaData");
  renderSimpleList("container-parentezcos", window.parentezcosData, "parentezcosData");
  renderAccordionCuentas();
}

// Renderizador para listas simples
function renderSimpleList(containerId, lista, nombreVariable) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  lista.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "catalog-row mb-2";

    if (modoEdicionCatalogos) {
      row.innerHTML = `
        <button type="button" class="btn-remove-catalog" title="Eliminar" onclick="eliminarItemSimple('${nombreVariable}', ${index})">
          <i class="bi bi-dash-lg"></i>
        </button>
        <div class="catalog-input-edit w-100">
          <input type="text" value="${item.nombre}" onchange="actualizarItemSimple('${nombreVariable}', ${index}, 'nombre', this.value)">
        </div>
      `;
    } else {
      row.innerHTML = `<div class="catalog-label-display"><span>${item.nombre}</span></div>`;
    }
    container.appendChild(row);
  });

  if (modoEdicionCatalogos) {
    const btnAdd = document.createElement("div");
    btnAdd.className = "catalog-row-add";
    btnAdd.innerHTML = `<i class="bi bi-plus-lg"></i> <span>Agregar elemento</span>`;
    btnAdd.addEventListener("click", () => agregarItemSimple(nombreVariable));
    container.appendChild(btnAdd);
  }
}

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
window.actualizarItemSimple = function(nombreVar, index, campo, valor) {
  window[nombreVar][index][campo] = valor.trim();
};

window.eliminarItemSimple = function(nombreVar, index) {
  window[nombreVar].splice(index, 1);
  renderAllCatalogos();
};

window.agregarItemSimple = function(nombreVar) {
  const lista = window[nombreVar];
  const nuevoId = lista.length > 0 ? Math.max(...lista.map(x => parseInt(x.id) || 0)) + 1 : 1;
  lista.push({ id: nuevoId.toString(), nombre: "Nuevo Elemento" });
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
  btnEditCatalogos.addEventListener("click", () => {
    if (!modoEdicionCatalogos) {
      modoEdicionCatalogos = true;
      btnEditCatalogos.innerHTML = `<i class="bi bi-check-lg me-1"></i> Guardar Cambios`;
      btnEditCatalogos.className = "btn btn-success text-white";
    } else {
      modoEdicionCatalogos = false;
      btnEditCatalogos.innerHTML = `<i class="bi bi-pencil me-1"></i> Editar Catálogos`;
      btnEditCatalogos.className = "btn btn-secondary text-white";
      
      console.log("Catálogos guardados:", {
        tiposDoc: window.tiposDocData,
        tiposMoneda: window.tiposMonedaData,
        parentezcos: window.parentezcosData,
        tiposCuentas: window.tiposCuentasData
      });
      mostrarAlertaBootstrap("¡Todos los catálogos se han guardado con éxito!", "success");
    }
    renderAllCatalogos();
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