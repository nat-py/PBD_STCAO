const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const usuarioActual = urlParams.get('usuario');

document.addEventListener("DOMContentLoaded", () => {

  const salirBtn = document.getElementById('salir');
  salirBtn.addEventListener('click', () => {
    fetch('/api/admin/salir', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ usuario: usuarioActual })
    }).finally(() => {
      window.location.href = '../login/login.html';
    });

  });

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
      if (targetId === "screen-bitacoras") {
        cargarBitacoras();
      }
    });
  });

  // Modal En Proceso Genérico
  const modalEnProceso = new bootstrap.Modal(document.getElementById("modalEnProceso"));
  document.querySelectorAll(".btn-proceso-trigger").forEach(btn => {
    btn.addEventListener("click", () => modalEnProceso.show());
  });

  const btnProcesoOperaciones = document.getElementById("btn-proceso-operaciones");
  btnProcesoOperaciones.addEventListener("click", async () => {
    btnProcesoOperaciones.disabled = true;
    const textoOriginal = btnProcesoOperaciones.innerHTML;
    btnProcesoOperaciones.innerHTML = '<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span> Procesando...';

    try {
      const response = await fetch("/api/admin/procesoOperaciones", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo ejecutar el proceso batch de operaciones.");
      }

      const errores = [
        ["outFlagErrorInsercion", "Se produjo un error al insertar las operaciones."],
        ["outFlagErrorMovimientos", "Se produjo un error al procesar los movimientos."],
        ["outFlagErrorEstadosCuenta", "Se produjo un error al actualizar los estados de cuenta."]
      ];
      if (!data.resultado || typeof data.resultado !== "object") {
        throw new Error("La respuesta del proceso batch no contiene sus indicadores de resultado.");
      }

      const erroresEncontrados = errores.filter(([flag]) => {
        const valor = data.resultado[flag];
        if (![true, false, 0, 1].includes(valor)) {
          throw new Error(`No se recibió un valor válido para ${flag}.`);
        }
        return valor === true || valor === 1;
      });

      if (erroresEncontrados.length > 0) {
        erroresEncontrados.forEach(([, mensaje]) => mostrarAlertaBootstrap(mensaje, "danger"));
      } else {
        mostrarAlertaBootstrap("El proceso batch de operaciones se ejecutó correctamente.", "success");
      }
    } catch (error) {
      console.error("Error al ejecutar el proceso batch de operaciones:", error);
      mostrarAlertaBootstrap(error.message, "danger");
    } finally {
      btnProcesoOperaciones.disabled = false;
      btnProcesoOperaciones.innerHTML = textoOriginal;
    }
  });

  // 2. CARGA Y GESTIÓN DE BITÁCORAS
  let bitacorasData = [];
  const tablaBitacorasBody = document.getElementById("tabla-bitacoras-body");
  const modalBitacora = new bootstrap.Modal(document.getElementById("modalBitacoraDetalle"));

  function cargarBitacoras() {
    fetch('/api/admin/bitacora')
      .then(response => {
        if (!response.ok) {
          throw new Error("No se pudo recargar la bitácora");
        }
        return response.json();
      })
      .then(data => {
        bitacorasData = data;
        renderBitacoras(bitacorasData);
      })
      .catch(err => console.error("Error cargando bitácoras:", err));
  }

  cargarBitacoras();

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
    if (tipo === "todo") {
      renderBitacoras(bitacorasData);
      return;
    }

    const ahora = new Date();
    const inicioDelDia = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const inicioDeLaSemana = new Date(inicioDelDia);
    const diaDeLaSemana = inicioDeLaSemana.getDay() || 7;
    inicioDeLaSemana.setDate(inicioDeLaSemana.getDate() - diaDeLaSemana + 1);

    const filtrados = bitacorasData.filter(item => {
      const fechaRegistro = convertirFechaBitacora(item.fyh);
      if (!fechaRegistro) {
        return false;
      }

      if (tipo === "especifica" && valor) {
        return item.fyh.startsWith(valor);
      }

      if (tipo === "hora") {
        return fechaRegistro >= new Date(ahora.getTime() - 60 * 60 * 1000)
          && fechaRegistro <= ahora;
      }
      if (tipo === "dia") {
        return fechaRegistro >= inicioDelDia && fechaRegistro <= ahora;
      }
      if (tipo === "semana") {
        return fechaRegistro >= inicioDeLaSemana && fechaRegistro <= ahora;
      }
      if (tipo === "mes") {
        return fechaRegistro.getFullYear() === ahora.getFullYear()
          && fechaRegistro.getMonth() === ahora.getMonth();
      }
      if (tipo === "año") {
        return fechaRegistro.getFullYear() === ahora.getFullYear();
      }

      return true;
    });

    renderBitacoras(filtrados);
  }

  function convertirFechaBitacora(fechaTexto) {
    if (typeof fechaTexto !== "string") {
      return null;
    }

    const partes = fechaTexto.match(
      /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/
    );
    if (!partes) {
      return null;
    }

    const fecha = new Date(
      Number(partes[1]),
      Number(partes[2]) - 1,
      Number(partes[3]),
      Number(partes[4]),
      Number(partes[5]),
      Number(partes[6] || 0)
    );

    return Number.isNaN(fecha.getTime()) ? null : fecha;
  }

  // Mostrar Modal según tipo de operación
  function mostrarModalBitacora(item) {
    const tituloModal = document.getElementById("modalBitacoraTitulo");
    const contenidoModal = document.getElementById("modalBitacoraContenido");

    tituloModal.innerText = `Detalle de Operación: ${item.operacion}`;

    const operacionesSimples = ["Login", "Logout", "Consultar estado de cuenta"];
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
        <h6 class="fw-bold text-muted mb-2">Cambios Registrados:</h6>
        <div class="diff-scroll-container">
          <div class="row">
            <div class="col-6 border-end">
              <span class="badge bg-danger mb-2">Anterior</span>
              <pre class="small text-muted bg-white p-2 rounded">${JSON.stringify(item.detalles?.anterior || {}, null, 2)}</pre>
            </div>
            <div class="col-6">
              <span class="badge bg-success mb-2">Nuevo</span>
              <pre class="small text-muted bg-white p-2 rounded">${JSON.stringify(item.detalles?.nuevo || {}, null, 2)}</pre>
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

  async function cargarCuentas() {
    try {
      const response = await fetch("/api/admin/tablaCuentaAhorroActivo");
      if (!response.ok) {
        throw new Error("Error al obtener las cuentas de ahorro activas");
      }
      const data = await response.json();
      cuentasData = data.cuentas || [];
      renderCuentas(cuentasData);
    } catch (error) {
      console.error("Error cargando cuentas:", error);
    }
  }

  cargarCuentas();

  function renderCuentas(data) {
    tablaCuentasBody.innerHTML = "";
    if (data.length === 0) {
      tablaCuentasBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">No se encontraron cuentas</td></tr>`;
      return;
    }

    data.forEach(item => {
      const tr = document.createElement("tr");
      tr.className = "clickable-row";
      tr.innerHTML = `
        <td>${item.valorDocuIdentidad}</td>
        <td class="fw-bold">${item.nombrePropietario || "No disponible"}</td>
        <td class="fw-bold">${item.numCuenta}</td>
        <td><span class="badge bg-primary">${item.idTipoCuenta}</span></td>
        <td>${item.fechaCreacion}</td>
        <td>${item.saldo}</td>
      `;
      // Al hacer clic modal y luego dashboard
      tr.addEventListener("click", () => {
              abrirModalCuentaAhorro(item, "cuentas");
      });
      tablaCuentasBody.appendChild(tr);
    });
  }

  inputBusquedaCuentas.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filtradas = cuentasData.filter(c =>
      [c.valorDocuIdentidad, c.nombrePropietario, c.idTipoCuenta, c.numCuenta, c.fechaCreacion, c.saldo]
        .some(valor => String(valor ?? "").toLowerCase().includes(query))
    );
    renderCuentas(filtradas);
  });






  
// =========================================================================
  // 3.5 ADMINISTRAR CLIENTES Y MODALES DE CLIENTE / CUENTA
  // =========================================================================
  const tablaClientesBody = document.getElementById("tabla-clientes-body");
  const inputBusquedaClientes = document.getElementById("inputBusquedaClientes");

  const modalDetalleClienteEl = document.getElementById("modalDetalleCliente");
  const modalDetalleCliente = new bootstrap.Modal(modalDetalleClienteEl);
  const btnEditCliente = document.getElementById("btn-edit-cliente");
  const btnEliminarCliente = document.getElementById("btn-eliminar-cliente");

  const modalDetalleCuentaEl = document.getElementById("modalDetalleCuenta");
  const modalDetalleCuenta = new bootstrap.Modal(modalDetalleCuentaEl);
  const btnEditCuenta = document.getElementById("btn-edit-cuenta");
  const btnEliminarCuenta = document.getElementById("btn-eliminar-cuenta");
  const btnVerDetalleCuenta = document.getElementById("btn-ver-detalle-cuenta");

  // Estado actual de los modales
  let clienteSeleccionado = null;
  let modoEdicionCliente = false;
  let clienteOriginalEdicion = null;

  let cuentaSeleccionada = null;
  let modoEdicionCuenta = false;
  let origenModalCuenta = "cuentas"; // "clientes" o "cuentas"

  let clientesData = [];

  // Cargar clientes al entrar en la pestaña
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (link.getAttribute("data-target") === "screen-clientes") {
        cargarClientes();
      }
    });
  });

  async function cargarClientes() {
    try {
      const response = await fetch("/api/admin/personas");
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "No se pudieron cargar las personas");
      }
      clientesData = (data.personas || []).map(persona => ({
        ...persona,
        cuentasAhorro: persona.cuentasAhorro || [],
        cuentasBeneficiario: persona.cuentasBeneficiario || []
      }));
      renderClientes(clientesData);
    } catch (error) {
      console.error("Error cargando clientes:", error);
    }
  }

  cargarClientes();

  function renderClientes(lista) {
    if (!tablaClientesBody) return;
    tablaClientesBody.innerHTML = "";

    if (lista.length === 0) {
      tablaClientesBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">No se encontraron clientes</td></tr>`;
      return;
    }

    lista.forEach(cliente => {
      const tr = document.createElement("tr");
      tr.className = "clickable-row";
      tr.innerHTML = `
        <td class="fw-semibold">${cliente.valorDocuIdentidad}</td>
        <td class="fw-bold text-primary">${cliente.nombre}</td>
        <td class="text-center"><span class="badge bg-primary rounded-pill">${cliente.cuentasAhorro.length}</span></td>
        <td class="text-center"><span class="badge bg-secondary rounded-pill">${cliente.cuentasBeneficiario.length}</span></td>
      `;
      tr.addEventListener("click", () => abrirModalCliente(cliente));
      tablaClientesBody.appendChild(tr);
    });
  }

  if (inputBusquedaClientes) {
    inputBusquedaClientes.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();
      const filtrados = clientesData.filter(c =>
        String(c.valorDocuIdentidad).toLowerCase().includes(q) ||
        String(c.nombre).toLowerCase().includes(q)
      );
      renderClientes(filtrados);
    });
  }

  // --- LÓGICA MODAL CLIENTE ---
  function abrirModalCliente(cliente) {
    clienteSeleccionado = JSON.parse(JSON.stringify(cliente));
    modoEdicionCliente = false;
    actualizarBotonEdicion(btnEditCliente, false);
    renderContenidoModalCliente();
    modalDetalleCliente.show();
  }

  function renderContenidoModalCliente() {
    const infoContainer = document.getElementById("cliente-info-container");
    const cuentasContainer = document.getElementById("cliente-cuentas-lista");
    const benefContainer = document.getElementById("cliente-beneficiario-lista");

    const tiposDoc = window.tiposDocData || [
      { id: "1", nombre: "Cédula Nacional" },
      { id: "2", nombre: "DIMEX" },
      { id: "3", nombre: "Pasaporte" }
    ];

    // 1. Renderizar cabecera de datos personales
    if (modoEdicionCliente) {
      infoContainer.innerHTML = `
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted">Cliente:</label>
          <input type="text" id="edit-cliente-nombre" class="form-control form-control-sm fw-bold" value="${clienteSeleccionado.nombre}">
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted">Tipo Documento de Identidad:</label>
          <select id="edit-cliente-tipo-doc" class="form-select form-select-sm">
            ${tiposDoc.map(td => `
              <option value="${td.id}" ${String(td.id) === String(clienteSeleccionado.idTipoDocuIdentidad) ? "selected" : ""}>
                ${td.nombre}
              </option>
            `).join("")}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted">Documento de Identidad:</label>
          <input type="text" id="edit-cliente-doc" class="form-control form-control-sm" value="${clienteSeleccionado.valorDocuIdentidad}">
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted">Fecha de Nacimiento:</label>
          <input type="date" id="edit-cliente-fecha" class="form-control form-control-sm" value="${clienteSeleccionado.fechaNacimiento}">
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted">Email:</label>
          <input type="email" id="edit-cliente-email" class="form-control form-control-sm" value="${clienteSeleccionado.email || ""}">
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted">Teléfono 1:</label>
          <input type="text" id="edit-cliente-telefono1" class="form-control form-control-sm" value="${clienteSeleccionado.telefono1 || ""}">
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted">Teléfono 2:</label>
          <input type="text" id="edit-cliente-telefono2" class="form-control form-control-sm" value="${clienteSeleccionado.telefono2 || ""}">
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted">Usuario:</label>
          <input type="text" id="edit-cliente-usuario" class="form-control form-control-sm" value="${clienteSeleccionado.usuario || ""}" ${clienteSeleccionado.usuario ? "" : "disabled"}>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted">Contraseña:</label>
          <div class="input-group input-group-sm">
            <input type="password" id="cliente-password" class="form-control" value="" placeholder="Dejar vacía para conservar" ${clienteSeleccionado.usuario ? "" : "disabled"}>
            <button type="button" class="btn btn-outline-secondary" id="toggle-cliente-password" title="Mostrar contraseña">
              <i class="bi bi-eye"></i>
            </button>
          </div>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted">Tipo de Usuario:</label>
          <select id="edit-cliente-es-admin" class="form-select form-select-sm" ${clienteSeleccionado.usuario ? "" : "disabled"}>
            <option value="false" ${!clienteSeleccionado.esAdmin ? "selected" : ""}>Usuario</option>
            <option value="true" ${clienteSeleccionado.esAdmin ? "selected" : ""}>Administrador</option>
          </select>
        </div>
      `;
    } else {
      const docObj = tiposDoc.find(d => String(d.id) === String(clienteSeleccionado.idTipoDocuIdentidad));
      const nombreTipoDoc = docObj ? docObj.nombre : (clienteSeleccionado.tipoDocuNombre || clienteSeleccionado.idTipoDocuIdentidad);

      infoContainer.innerHTML = `
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted mb-1">Cliente:</label>
          <p class="form-control-plaintext form-control-sm border bg-light px-2 rounded fw-bold m-0">${clienteSeleccionado.nombre}</p>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted mb-1">Tipo Documento de Identidad:</label>
          <p class="form-control-plaintext form-control-sm border bg-light px-2 rounded m-0">${nombreTipoDoc}</p>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted mb-1">Documento de Identidad:</label>
          <p class="form-control-plaintext form-control-sm border bg-light px-2 rounded m-0">${clienteSeleccionado.valorDocuIdentidad}</p>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted mb-1">Fecha de Nacimiento:</label>
          <p class="form-control-plaintext form-control-sm border bg-light px-2 rounded m-0">${clienteSeleccionado.fechaNacimiento}</p>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted mb-1">Email:</label>
          <p class="form-control-plaintext form-control-sm border bg-light px-2 rounded m-0">${clienteSeleccionado.email || "No disponible"}</p>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted mb-1">Teléfono 1:</label>
          <p class="form-control-plaintext form-control-sm border bg-light px-2 rounded m-0">${clienteSeleccionado.telefono1 || "No disponible"}</p>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted mb-1">Teléfono 2:</label>
          <p class="form-control-plaintext form-control-sm border bg-light px-2 rounded m-0">${clienteSeleccionado.telefono2 || "No disponible"}</p>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted mb-1">Usuario:</label>
          <p class="form-control-plaintext form-control-sm border bg-light px-2 rounded m-0">${clienteSeleccionado.usuario || "Sin usuario asociado"}</p>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted mb-1">Contraseña:</label>
          <div class="input-group input-group-sm">
            <input type="password" id="cliente-password" class="form-control" value="${clienteSeleccionado.contrasena || ""}" readonly>
            <button type="button" class="btn btn-outline-secondary" id="toggle-cliente-password" title="Mostrar contraseña">
              <i class="bi bi-eye"></i>
            </button>
          </div>
        </div>
      `;
    }

    const togglePassword = document.getElementById("toggle-cliente-password");
    const passwordInput = document.getElementById("cliente-password");
    if (togglePassword && passwordInput) {
      togglePassword.onclick = () => {
        const mostrar = passwordInput.type === "password";
        passwordInput.type = mostrar ? "text" : "password";
        togglePassword.innerHTML = `<i class="bi ${mostrar ? "bi-eye-slash" : "bi-eye"}"></i>`;
        togglePassword.title = mostrar ? "Ocultar contraseña" : "Mostrar contraseña";
      };
    }

    // 2. Renderizar Cuentas de Ahorro (Columna Izquierda)
    cuentasContainer.innerHTML = "";
    if (clienteSeleccionado.cuentasAhorro.length === 0) {
      cuentasContainer.innerHTML = `<p class="text-muted small text-center my-3">Este cliente no posee cuentas de ahorro.</p>`;
    } else {
      clienteSeleccionado.cuentasAhorro.forEach(cuenta => {
        const card = document.createElement("div");
        card.className = "p-3 border rounded bg-white shadow-sm clickable-row d-flex justify-content-between align-items-center";
        card.innerHTML = `
          <div>
            <div class="fw-bold text-primary">#${cuenta.numCuenta}</div>
            <span class="badge bg-secondary">${cuenta.tipoCuentaNombre}</span>
          </div>
          <div class="text-end">
            <span class="text-muted small d-block">Saldo</span>
            <span class="fw-bold text-success">${cuenta.saldo}</span>
          </div>
        `;
        // Al clickear abre el modal de Cuenta de Ahorro
        card.addEventListener("click", () => {
          const cuentaCompleta = {
            ...cuenta,
            valorDocuIdentidad: cuenta.valorDocuIdentidad || clienteSeleccionado.valorDocuIdentidad,
            nombrePropietario: cuenta.nombrePropietario || clienteSeleccionado.nombre
          };
          modalDetalleCliente.hide();
          abrirModalCuentaAhorro(cuentaCompleta, "clientes");
        });
        cuentasContainer.appendChild(card);
      });
    }

    // 3. Renderizar Beneficiario (Columna Derecha)
    benefContainer.innerHTML = "";
    if (clienteSeleccionado.cuentasBeneficiario.length === 0) {
      benefContainer.innerHTML = `<p class="text-muted small text-center my-3">No es beneficiario en ninguna cuenta.</p>`;
    } else {
      clienteSeleccionado.cuentasBeneficiario.forEach((ben, idx) => {
        const card = document.createElement("div");
        card.className = "p-3 border rounded bg-white shadow-sm d-flex justify-content-between align-items-center";
        card.innerHTML = `
          <div class="d-flex align-items-center gap-2">
            ${modoEdicionCliente ? `
              <button type="button" class="btn-remove-catalog" title="Dar de baja como beneficiario" onclick="eliminarBeneficiarioDeCliente(${idx})">
                <i class="bi bi-dash-lg"></i>
              </button>
            ` : ""}
            <div>
              <div class="fw-bold text-dark">Cuenta #${ben.numCuenta}</div>
              <small class="text-muted">Parentesco: <strong>${ben.parentesco}</strong></small>
            </div>
          </div>
          <div class="text-end">
            <span class="badge bg-primary fs-6">${ben.porcentaje}%</span>
          </div>
        `;
        benefContainer.appendChild(card);
      });
    }
  }

  async function guardarCambiosCliente() {
    const personaNueva = {
      ...clienteSeleccionado,
      nombre: document.getElementById("edit-cliente-nombre").value.trim(),
      idTipoDocuIdentidad: document.getElementById("edit-cliente-tipo-doc").value,
      valorDocuIdentidad: document.getElementById("edit-cliente-doc").value.trim(),
      fechaNacimiento: document.getElementById("edit-cliente-fecha").value,
      email: document.getElementById("edit-cliente-email").value.trim(),
      telefono1: document.getElementById("edit-cliente-telefono1").value.trim(),
      telefono2: document.getElementById("edit-cliente-telefono2").value.trim()
    };
    const personaAnterior = clienteOriginalEdicion || JSON.parse(JSON.stringify(clienteSeleccionado));

    const usuarioNuevoNombre = document.getElementById("edit-cliente-usuario").value.trim();
    const claveNueva = document.getElementById("cliente-password").value;
    const esAdminNuevo = document.getElementById("edit-cliente-es-admin").value === "true";
    const usuarioAnterior = {
      idUsuarioObjetivo: personaAnterior.idUsuarioObjetivo,
      usuario: personaAnterior.usuario,
      esAdmin: personaAnterior.esAdmin
    };
    const usuarioNuevo = {
      idUsuarioObjetivo: personaAnterior.idUsuarioObjetivo,
      usuario: usuarioNuevoNombre,
      clave: claveNueva,
      esAdmin: esAdminNuevo
    };

    const cambioPersona =
      personaAnterior.nombre !== personaNueva.nombre ||
      String(personaAnterior.idTipoDocuIdentidad) !== String(personaNueva.idTipoDocuIdentidad) ||
      personaAnterior.valorDocuIdentidad !== personaNueva.valorDocuIdentidad ||
      (personaAnterior.fechaNacimiento || "") !== (personaNueva.fechaNacimiento || "") ||
      (personaAnterior.email || "") !== personaNueva.email ||
      (personaAnterior.telefono1 || "") !== personaNueva.telefono1 ||
      (personaAnterior.telefono2 || "") !== personaNueva.telefono2;

    const cambioUsuario =
      Boolean(personaAnterior.usuario) &&
      (
        personaAnterior.usuario !== usuarioNuevo.usuario ||
        Boolean(personaAnterior.esAdmin) !== esAdminNuevo ||
        claveNueva.trim() !== ""
      );

    if (!cambioPersona && !cambioUsuario) {
      modoEdicionCliente = false;
      actualizarBotonEdicion(btnEditCliente, false);
      renderContenidoModalCliente();
      mostrarAlertaBootstrap("No se realizaron cambios.", "info");
      return;
    }

    try {
      if (cambioPersona) {
        const response = await fetch("/api/admin/editarPersona", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuario: usuarioActual,
            personaAnterior,
            personaNueva
          })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || data.error || "No se pudo actualizar la persona");
      }

      if (cambioUsuario) {
        const response = await fetch("/api/admin/editarUsuario", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuario: usuarioActual,
            usuarioAnterior,
            usuarioNuevo
          })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || data.error || "No se pudo actualizar el usuario");
      }

      const personasResponse = await fetch("/api/admin/personas");
      const personasData = await personasResponse.json();
      if (!personasResponse.ok || !personasData.success) {
        throw new Error(personasData.message || "No se pudo refrescar el cliente");
      }

      clientesData = (personasData.personas || []).map(persona => ({
        ...persona,
        cuentasAhorro: persona.cuentasAhorro || [],
        cuentasBeneficiario: persona.cuentasBeneficiario || []
      }));
      const clienteActualizado = clientesData.find(c => c.id === personaAnterior.id);
      if (clienteActualizado) clienteSeleccionado = JSON.parse(JSON.stringify(clienteActualizado));

      modoEdicionCliente = false;
      clienteOriginalEdicion = null;
      actualizarBotonEdicion(btnEditCliente, false);
      renderContenidoModalCliente();
      renderClientes(clientesData);
      await cargarCuentas();
      mostrarAlertaBootstrap("Datos actualizados correctamente.", "success");
    } catch (error) {
      console.error("Error actualizando persona o usuario:", error);
      mostrarAlertaBootstrap(error.message, "danger");
    }
  }

  // Eliminar beneficiario en modo edición (siguiendo el estilo de catálogos)
  window.eliminarBeneficiarioDeCliente = async function(index) {
    const beneficiario = clienteSeleccionado.cuentasBeneficiario[index];
    if (!beneficiario) return;

    const confirmacion = await confirmarAccionBootstrap({
      titulo: 'Eliminar beneficiario',
      mensaje: `¿Desea eliminar a ${clienteSeleccionado.nombre} como beneficiario de la cuenta #${beneficiario.numCuenta}?`,
      textoConfirmar: 'Eliminar',
      tipoConfirmar: 'danger'
    });
    if (!confirmacion) return;

    try {
      const response = await fetch("/api/admin/eliminarBeneficiarioReasignar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario: usuarioActual,
          beneficiario: {
            numCuenta: beneficiario.numCuenta,
            valorDocuIdentidad: beneficiario.valorDocuIdentidad || clienteSeleccionado.valorDocuIdentidad
          }
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "No se pudo eliminar el beneficiario");
      }

      clienteSeleccionado.cuentasBeneficiario.splice(index, 1);

      const idx = clientesData.findIndex(c => c.id === clienteSeleccionado.id);
      if (idx !== -1) {
        clientesData[idx] = JSON.parse(JSON.stringify(clienteSeleccionado));
      }

      renderContenidoModalCliente();
      renderClientes(clientesData);
      await cargarClientes();
      await cargarCuentas();
      mostrarAlertaBootstrap(data.message, "success");
    } catch (error) {
      console.error("Error eliminando beneficiario:", error);
      mostrarAlertaBootstrap(error.message, "danger");
    }
  };

  if (btnEditCliente) {
    btnEditCliente.addEventListener("click", () => {
      if (!modoEdicionCliente) {
        modoEdicionCliente = true;
        clienteOriginalEdicion = JSON.parse(JSON.stringify(clienteSeleccionado));
        actualizarBotonEdicion(btnEditCliente, true);
        renderContenidoModalCliente();
      } else {
        guardarCambiosCliente();
      }
    });
  }

  if (btnEliminarCliente) {
    btnEliminarCliente.addEventListener("click", async () => {
      if (!clienteSeleccionado) return;

      const confirmacion = await confirmarAccionBootstrap({
        titulo: 'Eliminar cliente',
        mensaje: `¿Desea eliminar a ${clienteSeleccionado.nombre}? Se desactivarán también sus cuentas, usuario y beneficiarios asociados.`,
        textoConfirmar: 'Eliminar',
        tipoConfirmar: 'danger'
      });
      if (!confirmacion) return;

      try {
        const response = await fetch("/api/admin/eliminarPersona", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuario: usuarioActual,
            persona: {
              valorDocuIdentidad: clienteSeleccionado.valorDocuIdentidad
            }
          })
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || data.error || "No se pudo eliminar la persona");
        }

        clientesData = clientesData.filter(
          cliente => cliente.id !== clienteSeleccionado.id
        );
        renderClientes(clientesData);
        await cargarClientes();
        await cargarCuentas();
        modalDetalleCliente.hide();
        mostrarAlertaBootstrap(data.message, "success");
      } catch (error) {
        console.error("Error eliminando persona:", error);
        mostrarAlertaBootstrap(error.message, "danger");
      }
    });
  }

  // --- LÓGICA MODAL UNIFICADO DE CUENTA DE AHORRO ---
  function abrirModalCuentaAhorro(cuenta, origen = "cuentas") {
    cuentaSeleccionada = JSON.parse(JSON.stringify({
      ...cuenta,
      nombrePropietario: cuenta.nombrePropietario || "No disponible"
    }));
    origenModalCuenta = origen;
    modoEdicionCuenta = false;
    actualizarBotonEdicion(btnEditCuenta, false);
    if (btnEliminarCuenta) btnEliminarCuenta.disabled = false;

    document.getElementById("modalCuentaNumeroTitulo").innerText = `Cuenta #${cuentaSeleccionada.numCuenta}`;
    renderContenidoModalCuenta();
    modalDetalleCuenta.show();
  }

  // Si se abrió desde Clientes y se cierra este modal sin ir a dashboardAhorro, vuelve al modal del cliente
  modalDetalleCuentaEl.addEventListener("hidden.bs.modal", () => {
    if (origenModalCuenta === "clientes" && clienteSeleccionado && !navegandoADashboardAhorro) {
      modalDetalleCliente.show();
    }
    navegandoADashboardAhorro = false;
  });

  let navegandoADashboardAhorro = false;

  function renderContenidoModalCuenta() {
    const container = document.getElementById("cuenta-detalle-container");
    const tiposCuentas = window.tiposCuentasData || [
      { id: "1", nombre: "Taca Taca" },
      { id: "2", nombre: "Ahorro Dólares" }
    ];

    const tipoCuentaObj = tiposCuentas.find(
      t => String(t.id) === String(cuentaSeleccionada.idTipoCuenta) || t.nombre === cuentaSeleccionada.idTipoCuenta
    );
    const nombreTipoCuenta = tipoCuentaObj ? tipoCuentaObj.nombre : (cuentaSeleccionada.tipoCuentaNombre || cuentaSeleccionada.idTipoCuenta);

    if (modoEdicionCuenta) {
      container.innerHTML = `
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted">Número de Cuenta:</label>
          <input type="text" id="edit-cuenta-numero" maxlength="10" class="form-control form-control-sm" value="${cuentaSeleccionada.numCuenta}" disabled>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted">Fecha de Creación:</label>
          <input type="date" id="edit-cuenta-fecha" class="form-control form-control-sm" value="${String(cuentaSeleccionada.fechaCreacion || "").slice(0, 10)}">
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted">Cédula Propietario:</label>
          <input type="text" id="edit-cuenta-cedula" class="form-control form-control-sm" value="${cuentaSeleccionada.valorDocuIdentidad || ""}">
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted">Nombre Propietario:</label>
          <p id="edit-cuenta-nombre" class="form-control-plaintext form-control-sm border bg-light px-2 rounded m-0">${cuentaSeleccionada.nombrePropietario || "No disponible"}</p>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted">Tipo de Cuenta:</label>
          <select id="edit-cuenta-tipo" class="form-select form-select-sm">
            ${tiposCuentas.map(tc => `
              <option value="${tc.id}" ${(String(tc.id) === String(cuentaSeleccionada.idTipoCuenta) || tc.nombre === cuentaSeleccionada.idTipoCuenta) ? "selected" : ""}>
                ${tc.nombre}
              </option>
            `).join("")}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted">Saldo:</label>
          <input type="text" id="edit-cuenta-saldo" class="form-control form-control-sm fw-bold text-success" value="${cuentaSeleccionada.saldo}">
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted mb-1">Número de Cuenta:</label>
          <p class="form-control-plaintext form-control-sm border bg-light px-2 rounded fw-bold m-0">${cuentaSeleccionada.numCuenta}</p>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted mb-1">Fecha de Creación:</label>
          <p class="form-control-plaintext form-control-sm border bg-light px-2 rounded m-0">${cuentaSeleccionada.fechaCreacion}</p>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted mb-1">Cédula Propietario:</label>
          <p class="form-control-plaintext form-control-sm border bg-light px-2 rounded m-0">${cuentaSeleccionada.valorDocuIdentidad || "No disponible"}</p>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted mb-1">Nombre Propietario:</label>
          <p class="form-control-plaintext form-control-sm border bg-light px-2 rounded m-0">${cuentaSeleccionada.nombrePropietario || "No disponible"}</p>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted mb-1">Tipo de Cuenta:</label>
          <p class="form-control-plaintext form-control-sm border bg-light px-2 rounded m-0">${nombreTipoCuenta}</p>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted mb-1">Saldo:</label>
          <p class="form-control-plaintext form-control-sm border bg-light px-2 rounded fw-bold text-success m-0">${cuentaSeleccionada.saldo}</p>
        </div>
      `;
    }

    if (modoEdicionCuenta) {
      const inputCedula = document.getElementById("edit-cuenta-cedula");
      const nombrePropietario = document.getElementById("edit-cuenta-nombre");

      const buscarNombrePropietario = () => {
        const cedula = inputCedula.value.trim();
        const persona = clientesData.find(cliente =>
          String(cliente.valorDocuIdentidad || "").trim() === cedula
        );

        if (!cedula) {
          nombrePropietario.textContent = "Ingrese una cédula";
          nombrePropietario.classList.remove("text-danger");
          nombrePropietario.classList.add("text-muted");
          cuentaSeleccionada.nombrePropietario = "";
          return;
        }

        if (persona) {
          nombrePropietario.textContent = persona.nombre || "Nombre no disponible";
          nombrePropietario.classList.remove("text-danger", "text-muted");
          nombrePropietario.classList.add("text-success");
          cuentaSeleccionada.nombrePropietario = persona.nombre || "";
        } else {
          nombrePropietario.textContent = "No existe una persona con esta cédula";
          nombrePropietario.classList.remove("text-success", "text-muted");
          nombrePropietario.classList.add("text-danger");
          cuentaSeleccionada.nombrePropietario = "";
        }
      };

      inputCedula.addEventListener("input", buscarNombrePropietario);
      inputCedula.addEventListener("blur", buscarNombrePropietario);
      buscarNombrePropietario();
    }
  }

  if (btnEditCuenta) {
    btnEditCuenta.addEventListener("click", () => {
      if (!modoEdicionCuenta) {
        modoEdicionCuenta = true;
        actualizarBotonEdicion(btnEditCuenta, true);
        renderContenidoModalCuenta();
      } else {
        guardarCuentaAhorroEditada();
      }
    });
  }

  async function guardarCuentaAhorroEditada() {
        const anterior = JSON.parse(JSON.stringify(cuentaSeleccionada));
        const numCuentaNuevo = document.getElementById("edit-cuenta-numero").value.trim();
        const nuevoTipoId = document.getElementById("edit-cuenta-tipo").value;
        const tipoObj = (window.tiposCuentasData || []).find(t => String(t.id) === String(nuevoTipoId));
        const cedulaNueva = document.getElementById("edit-cuenta-cedula").value.trim();
        const personaNueva = clientesData.find(cliente =>
          String(cliente.valorDocuIdentidad || "").trim() === cedulaNueva
        );

        if (!personaNueva) {
          mostrarAlertaBootstrap("La cédula no coincide con ninguna persona registrada.", "danger");
          return;
        }

        const cuentaNueva = {
          ...cuentaSeleccionada,
          numCuenta: numCuentaNuevo,
          fechaCreacion: document.getElementById("edit-cuenta-fecha").value,
          valorDocuIdentidad: cedulaNueva,
          nombrePropietario: personaNueva.nombre,
          idTipoCuenta: nuevoTipoId,
          tipoCuentaNombre: tipoObj ? tipoObj.nombre : nuevoTipoId,
          saldo: document.getElementById("edit-cuenta-saldo").value.trim()
        };

        if (!cuentaNueva.numCuenta || !cuentaNueva.valorDocuIdentidad ||
            !cuentaNueva.idTipoCuenta || !cuentaNueva.fechaCreacion ||
            !cuentaNueva.saldo) {
          mostrarAlertaBootstrap("Complete todos los campos obligatorios.", "warning");
          return;
        }

        try {
          const response = await fetch("/api/admin/editarCuentaAhorro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              usuario: usuarioActual,
              cuenta: cuentaNueva,
              anterior
            })
          });
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || data.error || "No se pudo editar la cuenta");
          }

          cuentaSeleccionada = cuentaNueva;

        // Sincronizar con cuentasData (tabla de Adm. Cuentas)
        const idxTablaCuentas = cuentasData.findIndex(c => c.numCuenta === anterior.numCuenta);
        if (idxTablaCuentas !== -1) {
          cuentasData[idxTablaCuentas] = { ...cuentasData[idxTablaCuentas], ...cuentaSeleccionada };
          renderCuentas(cuentasData);
        }

        // Sincronizar con clienteSeleccionado si vino desde clientes
        if (clienteSeleccionado) {
          const idxCuentaCliente = clienteSeleccionado.cuentasAhorro.findIndex(c => c.numCuenta === anterior.numCuenta);
          if (idxCuentaCliente !== -1) {
            clienteSeleccionado.cuentasAhorro[idxCuentaCliente] = { ...cuentaSeleccionada };
          }
        }

        document.getElementById("modalCuentaNumeroTitulo").innerText = `Cuenta #${cuentaSeleccionada.numCuenta}`;
        modoEdicionCuenta = false;
        actualizarBotonEdicion(btnEditCuenta, false);
        renderContenidoModalCuenta();
        await cargarCuentas();
        await cargarClientes();
        mostrarAlertaBootstrap("Cuenta de ahorro actualizada correctamente.", "success");
        } catch (error) {
          console.error("Error editando cuenta:", error);
          mostrarAlertaBootstrap(error.message, "danger");
        }
  }

  if (btnEliminarCuenta) {
    btnEliminarCuenta.addEventListener("click", async () => {
      if (!cuentaSeleccionada) return;

      const confirmacion = await confirmarAccionBootstrap({
        titulo: 'Eliminar cuenta',
        mensaje: `¿Desea eliminar la cuenta #${cuentaSeleccionada.numCuenta}?`,
        textoConfirmar: 'Eliminar',
        tipoConfirmar: 'danger'
      });
      if (!confirmacion) return;

      try {
        const cuentaAEliminar = JSON.parse(JSON.stringify(cuentaSeleccionada));
        const response = await fetch("/api/admin/eliminarCuentaAhorro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuario: usuarioActual,
            cuenta: cuentaAEliminar
          })
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || data.error || "No se pudo eliminar la cuenta");
        }

        cuentasData = cuentasData.filter(
          cuenta => cuenta.numCuenta !== cuentaAEliminar.numCuenta
        );
        renderCuentas(cuentasData);

        if (clienteSeleccionado?.cuentasAhorro) {
          clienteSeleccionado.cuentasAhorro =
            clienteSeleccionado.cuentasAhorro.filter(
              cuenta => cuenta.numCuenta !== cuentaAEliminar.numCuenta
            );
        }

        await cargarCuentas();
        await cargarClientes();
        modalDetalleCuenta.hide();
        mostrarAlertaBootstrap(data.message, "success");
      } catch (error) {
        console.error("Error eliminando cuenta:", error);
        mostrarAlertaBootstrap(error.message, "danger");
      }
    });
  }

  // Botón "Ver detalle" -> Redirige a dashboardAhorro con usuario (admin) y numCuenta
  if (btnVerDetalleCuenta) {
    btnVerDetalleCuenta.addEventListener("click", () => {
      navegandoADashboardAhorro = true;
      const parametros = new URLSearchParams({
        usuario: usuarioActual || "",
        numCuenta: cuentaSeleccionada.numCuenta
      });
      window.location.href = `../dashboardAhorro/dashboardAhorro.html?${parametros.toString()}`;
    });
  }

  function actualizarBotonEdicion(boton, editando) {
    if (editando) {
      boton.innerHTML = `<i class="bi bi-check-lg me-1"></i> Guardar`;
      boton.className = "btn btn-success text-white btn-sm";
      if (btnEliminarCuenta) btnEliminarCuenta.disabled = true;
    } else {
      boton.innerHTML = `<i class="bi bi-pencil me-1"></i> Editar`;
      boton.className = "btn btn-secondary text-white btn-sm";
      if (btnEliminarCuenta) btnEliminarCuenta.disabled = false;
    }
  }





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

// 6. GESTIÓN DE CONFIGURACIONES DE CATÁLOGOS
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

async function cargarCatalogos() {
  try {
    const [
      documentos,
      documentosTodos,
      monedas,
      monedasTodos,
      parentescos,
      parentescosTodos,
      cuentas
    ] = await Promise.all([
      fetch("/api/admin/tablaTipoDocuIdentidadActivo").then(res => res.json()),
      fetch("/api/admin/tablaTipoDocuIdentidad").then(res => res.json()),
      fetch("/api/admin/tablaTipoMonedaActivo").then(res => res.json()),
      fetch("/api/admin/tablaTipoMoneda").then(res => res.json()),
      fetch("/api/admin/tablaParentescoActivo").then(res => res.json()),
      fetch("/api/admin/tablaParentesco").then(res => res.json()),
      fetch("/api/admin/tablaTipoCuentaAhorroActivo").then(res => res.json())
    ]);

    window.tiposDocData = documentos.tiposDocumento || [];
    window.tiposDocTodosData = documentosTodos.tiposDocumento || [];
    window.tiposMonedaData = monedas.tiposMoneda || [];
    window.tiposMonedaTodosData = monedasTodos.tiposMoneda || [];
    window.parentezcosData = parentescos.parentescos || [];
    window.parentezcosTodosData = parentescosTodos.parentescos || [];
    window.tiposCuentasData = cuentas.tiposCuentas || [];
    renderAllCatalogos();
  } catch (error) {
    console.error("Error al recargar los catálogos:", error);
  }
}

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
              <label class="form-label small fw-bold text-muted">Moneda:</label>
              ${modoEdicionCatalogos ? `
                <select class="form-select form-select-sm" onchange="actualizarCuentaProp(${index}, 'idTipoMoneda', this.value)">
                  ${window.tiposMonedaData.map(moneda => `
                    <option value="${moneda.id}" ${String(moneda.id) === String(cuenta.idTipoMoneda) ? "selected" : ""}>
                      ${moneda.nombre}
                    </option>
                  `).join("")}
                </select>
              ` : `<p class="form-control-plaintext form-control-sm border bg-white px-2 rounded">${obtenerNombreMoneda(cuenta.idTipoMoneda)}</p>`}
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
              ${modoEdicionCatalogos ? `<input type="text" class="form-control form-control-sm" value="${obtenerMultaSaldoMinimo(cuenta)}" onchange="actualizarCuentaProp(${index}, 'multaSaldoMinimo', this.value)">` : `<p class="form-control-plaintext form-control-sm border bg-white px-2 rounded">${obtenerMultaSaldoMinimo(cuenta)}</p>`}
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-bold text-muted">Interés (%):</label>
              ${modoEdicionCatalogos ? `<input type="text" class="form-control form-control-sm" value="${cuenta.interes}" onchange="actualizarCuentaProp(${index}, 'interes', this.value)">` : `<p class="form-control-plaintext form-control-sm border bg-white px-2 rounded">${cuenta.interes}%</p>`}
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-bold text-muted">Comisión Humano:</label>
              ${modoEdicionCatalogos ? `<input type="text" class="form-control form-control-sm" value="${cuenta.comisionHumano}" onchange="actualizarCuentaProp(${index}, 'comisionHumano', this.value)">` : `<p class="form-control-plaintext form-control-sm border bg-white px-2 rounded">${cuenta.comisionHumano}</p>`}
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-bold text-muted">Comisión Automático:</label>
              ${modoEdicionCatalogos ? `<input type="text" class="form-control form-control-sm" value="${obtenerComisionAutomatica(cuenta)}" onchange="actualizarCuentaProp(${index}, 'comisionAutomatico', this.value)">` : `<p class="form-control-plaintext form-control-sm border bg-white px-2 rounded">${obtenerComisionAutomatica(cuenta)}</p>`}
            </div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(itemDiv);
  });
}

function obtenerNombreMoneda(idMoneda) {
  const moneda = window.tiposMonedaData.find(
    item => String(item.id) === String(idMoneda)
  );
  return moneda ? moneda.nombre : idMoneda;
}

function obtenerMultaSaldoMinimo(cuenta) {
  return cuenta.multaSaldoMinimo ?? cuenta.multaSaldoMin ?? "";
}

function obtenerComisionAutomatica(cuenta) {
  return cuenta.comisionAutomatico ?? cuenta.comisionAutomatica ?? "";
}

// Funciones Globales expuestas en window para manipulación correcta de los eventos onclick
window.actualizarItemCatalogo = function(nombreVar, index, campo, valor) {
  const item = window[nombreVar][index];
  if (!item._nuevo && !item._anterior) {
    item._anterior = JSON.parse(JSON.stringify(item));
  }
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

    await cargarCatalogos();

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
  const cuenta = window.tiposCuentasData[index];
  if (!cuenta._nuevo && !cuenta._anterior) {
    cuenta._anterior = JSON.parse(JSON.stringify(cuenta));
  }
  cuenta[propiedad] = valor.trim();
  if (!cuenta._nuevo) {
    cuenta._modificado = true;
  }
};

window.eliminarCuentaAhorro = async function(index) {
  const cuenta = window.tiposCuentasData[index];

  if (cuenta._nuevo) {
    window.tiposCuentasData.splice(index, 1);
    renderAllCatalogos();
    return;
  }

  try {
    const response = await fetch("/api/admin/eliminarTipoCuentaAhorro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario: usuarioActual, tipoCuenta: cuenta })
    });
    const resultado = await response.json();

    if (!response.ok || !resultado.success) {
      throw new Error(resultado.message || "No se pudo eliminar el tipo de cuenta de ahorro");
    }

    window.tiposCuentasData.splice(index, 1);
    await cargarCatalogos();
    mostrarAlertaBootstrap("Tipo de cuenta de ahorro eliminado correctamente", "success");
  } catch (error) {
    console.error("Error al eliminar el tipo de cuenta de ahorro:", error);
    mostrarAlertaBootstrap(error.message, "danger");
  }
};

window.agregarCuentaAhorro = function() {
  const lista = window.tiposCuentasData;
  const nuevoId = lista.length > 0 ? Math.max(...lista.map(x => parseInt(x.id) || 0)) + 1 : 1;
  lista.push({
    id: nuevoId.toString(),
    nombre: "Nueva Cuenta",
    idTipoMoneda: "1",
    saldoMinimo: "10000.00",
    multaSaldoMinimo: "2000.00",
    cargoAnual: "5000",
    numRetirosHumano: "5",
    numRetirosAutomatico: "8",
    comisionHumano: "300",
    comisionAutomatico: "300",
    interes: "12",
    _nuevo: true
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
                  },
                  anterior: tipoDocuIdentidad._anterior || null
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
                  },
                  anterior: tipoDocuIdentidad._anterior || null
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
            delete tipoDocuIdentidad._anterior;

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
                  },
                  anterior: tipoMoneda._anterior || null
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
                  },
                  anterior: tipoMoneda._anterior || null
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
            delete tipoMoneda._anterior;

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
                  },
                  anterior: parentesco._anterior || null
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
                  },
                  anterior: parentesco._anterior || null
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
            delete parentesco._anterior;

          } catch (error) {
            console.error("ERROR dentro del guardado:", error);
            throw error;
          }
        }

        for (const tipoCuenta of window.tiposCuentasData) {
          if (!tipoCuenta._nuevo && !tipoCuenta._modificado) {
            continue;
          }

          const datosTipoCuenta = {
            id: tipoCuenta.id,
            nombre: tipoCuenta.nombre,
            idTipoMoneda: tipoCuenta.idTipoMoneda,
            saldoMinimo: tipoCuenta.saldoMinimo,
            multaSaldoMinimo: obtenerMultaSaldoMinimo(tipoCuenta),
            cargoAnual: tipoCuenta.cargoAnual,
            numRetirosHumano: tipoCuenta.numRetirosHumano,
            numRetirosAutomatico: tipoCuenta.numRetirosAutomatico,
            comisionHumano: tipoCuenta.comisionHumano,
            comisionAutomatico: tipoCuenta.comisionAutomatico,
            interes: tipoCuenta.interes
          };

          try {
            const endpoint = tipoCuenta._nuevo
              ? "/api/admin/insertarTipoCuentaAhorro"
              : "/api/admin/editarTipoCuentaAhorro";
            const response = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                usuario: usuarioActual,
                tipoCuenta: datosTipoCuenta,
                anterior: tipoCuenta._anterior || null
              })
            });
            const resultado = await response.json();

            if (!response.ok || !resultado.success) {
              throw new Error(
                resultado.message || "No se pudo guardar el tipo de cuenta de ahorro"
              );
            }

            Object.assign(tipoCuenta, datosTipoCuenta);
            delete tipoCuenta._nuevo;
            delete tipoCuenta._modificado;
            delete tipoCuenta._anterior;
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

        await cargarCatalogos();

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