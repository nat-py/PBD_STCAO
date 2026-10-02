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

  fetch("bitacoras.json")
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
        <td class="fw-semibold">${item.fyh}</td>
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
      alert("Por favor, seleccione únicamente un archivo en formato XML.");
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