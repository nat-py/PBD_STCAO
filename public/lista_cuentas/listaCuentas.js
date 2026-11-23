document.addEventListener("DOMContentLoaded", () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const usuarioActual = urlParams.get("usuario");

  const h2 = document.getElementById("bienvenida");
  const usuarioHeader = document.getElementById("usuarioHeader");

  const contenedorPrincipal = document.getElementById("contenedorPrincipalCuentas");
  const colPanelNuevaCuenta = document.getElementById("colPanelNuevaCuenta");
  const btnToggleNuevaCuenta = document.getElementById("btnToggleNuevaCuenta");
  const btnCerrarPanelCuenta = document.getElementById("btnCerrarPanelCuenta");
  const btnCancelarNuevaCuenta = document.getElementById("btnCancelarNuevaCuenta");

  const encabezadoTabla = document.getElementById("encabezadoTablaCuentas");
  const cuerpoTabla = document.getElementById("cuerpoTablaCuentas");
  const selectTipoCuenta = document.getElementById("tipoCuenta");
  const inputDocPropietario = document.getElementById("docPropietario");
  const inputNombrePropietarioInfo = document.getElementById("nombrePropietarioInfo");
  const formNuevaCuenta = document.getElementById("formNuevaCuenta");

  let cuentasListado = [];
  let panelAbierto = false;
  let timeoutOcultarPanel = null;
  let timeoutBusquedaDoc = null;

  const clientesConocidos = {
    "112345678": "Paco Pacal",
    "209876543": "María Fernanda Solís"
  };

  let tiposCuentaCatalogo = [
    {
      id: "1",
      nombre: "Ahorro Básico",
      saldoMinimo: "5000.00",
      multaSaldoMinimo: "1000.00",
      cargoMensual: "0.00",
      numRetirosHumano: "4",
      numRetirosAutomatico: "6",
      comisionCajeroHumano: "250.00",
      comisionCajeroAutomatico: "150.00",
      montoMaxSinpeDiario: "500000.00",
      comisionSinpe: "0.00",
      tasaInteresAnual: "3.50"
    },
    {
      id: "2",
      nombre: "Ahorro Navideño",
      saldoMinimo: "10000.00",
      multaSaldoMinimo: "2500.00",
      cargoMensual: "500.00",
      numRetirosHumano: "2",
      numRetirosAutomatico: "2",
      comisionCajeroHumano: "300.00",
      comisionCajeroAutomatico: "200.00",
      montoMaxSinpeDiario: "250000.00",
      comisionSinpe: "0.00",
      tasaInteresAnual: "6.00"
    }
  ];

  if (usuarioActual) {
    h2.textContent = `¡Bienvenido de nuevo, ${usuarioActual}!`;
    usuarioHeader.textContent = usuarioActual;
    recibirCuentas();
    cargarTiposCuenta();
  } else {
    h2.textContent = "No se encontró ningún usuario.";
    usuarioHeader.textContent = "Usuario no encontrado";
    renderTablaCuentas();
  }

  async function cargarTiposCuenta() {
    try {
      const response = await fetch("/api/admin/tablaTipoCuentaAhorroActivo");
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.tiposCuentas) && data.tiposCuentas.length > 0) {
          tiposCuentaCatalogo = data.tiposCuentas.map((t) => ({
            id: String(t.id),
            nombre: t.nombre,
            saldoMinimo: t.saldoMinimo ?? "0.00",
            multaSaldoMinimo: t.multaSaldoMinimo ?? t.multaSaldoMin ?? "0.00",
            cargoMensual: t.cargoMensual ?? t.cargoAnual ?? "0.00",
            numRetirosHumano: t.numRetirosHumano ?? "0",
            numRetirosAutomatico: t.numRetirosAutomatico ?? "0",
            comisionCajeroHumano: t.comisionCajeroHumano ?? t.comisionHumano ?? "0.00",
            comisionCajeroAutomatico: t.comisionCajeroAutomatico ?? t.comisionAutomatico ?? "0.00",
            montoMaxSinpeDiario: t.montoMaxSinpeDiario ?? "0.00",
            comisionSinpe: t.comisionSinpe ?? "0.00",
            tasaInteresAnual: t.tasaInteresAnual ?? t.interes ?? "0.00"
          }));
        }
      }
    } catch (error) {
      console.warn("Usando catálogo local de tipos de cuenta:", error);
    }
    poblarSelectTiposCuenta();
  }

  function poblarSelectTiposCuenta() {
    selectTipoCuenta.innerHTML = `<option value="">Seleccione un tipo...</option>`;
    tiposCuentaCatalogo.forEach((tipo) => {
      const option = document.createElement("option");
      option.value = tipo.id;
      option.textContent = tipo.nombre;
      selectTipoCuenta.appendChild(option);
    });
  }

  function actualizarCamposInformativos(idTipoSeleccionado) {
    const tipo = tiposCuentaCatalogo.find((t) => String(t.id) === String(idTipoSeleccionado));

    document.getElementById("infoSaldoMinimo").value = tipo ? tipo.saldoMinimo : "";
    document.getElementById("infoMultaSaldoMinimo").value = tipo ? tipo.multaSaldoMinimo : "";
    document.getElementById("infoCargoMensual").value = tipo ? tipo.cargoMensual : "";
    document.getElementById("infoNumRetirosHumano").value = tipo ? tipo.numRetirosHumano : "";
    document.getElementById("infoNumRetirosAuto").value = tipo ? tipo.numRetirosAutomatico : "";
    document.getElementById("infoComisionHumano").value = tipo ? tipo.comisionCajeroHumano : "";
    document.getElementById("infoComisionAuto").value = tipo ? tipo.comisionCajeroAutomatico : "";
    document.getElementById("infoMontoMaxSinpe").value = tipo ? tipo.montoMaxSinpeDiario : "";
    document.getElementById("infoComisionSinpe").value = tipo ? tipo.comisionSinpe : "";
    document.getElementById("infoTasaInteres").value = tipo ? tipo.tasaInteresAnual : "";
  }

  async function autocompletarNombrePropietario(docValor) {
    const limpio = docValor.trim();
    if (!limpio) {
      inputNombrePropietarioInfo.value = "";
      return;
    }

    const cuentaCoincidente = cuentasListado.find(
      (c) => String(c.valorDocuIdentidad ?? c.docPropietario ?? "").trim() === limpio
    );
    if (cuentaCoincidente && cuentaCoincidente.nombreDueno) {
      inputNombrePropietarioInfo.value = cuentaCoincidente.nombreDueno;
      return;
    }

    if (clientesConocidos[limpio]) {
      inputNombrePropietarioInfo.value = clientesConocidos[limpio];
      return;
    }

    try {
      const response = await fetch("/api/lista_cuentas/buscar_propietario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valorDocuIdentidad: limpio })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.nombre) {
          inputNombrePropietarioInfo.value = data.nombre;
          return;
        }
      }
    } catch (_) {
      // Sin respuesta del backend en este entorno
    }

    inputNombrePropietarioInfo.value = "";
  }

  inputDocPropietario.addEventListener("input", (e) => {
    clearTimeout(timeoutBusquedaDoc);
    const valor = e.target.value;
    timeoutBusquedaDoc = setTimeout(() => {
      autocompletarNombrePropietario(valor);
    }, 200);
  });
  inputDocPropietario.addEventListener("blur", (e) => {
    clearTimeout(timeoutBusquedaDoc);
    autocompletarNombrePropietario(e.target.value);
  });

  selectTipoCuenta.addEventListener("change", (e) => {
    actualizarCamposInformativos(e.target.value);
  });

  function alternarPanelNuevaCuenta(forzarEstado = null) {
    panelAbierto = typeof forzarEstado === "boolean" ? forzarEstado : !panelAbierto;

    if (timeoutOcultarPanel) {
      clearTimeout(timeoutOcultarPanel);
      timeoutOcultarPanel = null;
    }

    if (panelAbierto) {
      btnToggleNuevaCuenta.classList.add("d-none");
      colPanelNuevaCuenta.classList.remove("d-none");
      void colPanelNuevaCuenta.offsetWidth;
      requestAnimationFrame(() => {
        contenedorPrincipal.classList.add("panel-abierto");
        colPanelNuevaCuenta.classList.add("visible");
      });
    } else {
      contenedorPrincipal.classList.remove("panel-abierto");
      colPanelNuevaCuenta.classList.remove("visible");
      timeoutOcultarPanel = setTimeout(() => {
        colPanelNuevaCuenta.classList.add("d-none");
        btnToggleNuevaCuenta.classList.remove("d-none");
      }, 420);
    }

    renderTablaCuentas();
  }

  btnToggleNuevaCuenta.addEventListener("click", () => alternarPanelNuevaCuenta(true));
  btnCerrarPanelCuenta.addEventListener("click", () => alternarPanelNuevaCuenta(false));
  btnCancelarNuevaCuenta.addEventListener("click", () => {
    formNuevaCuenta.reset();
    inputNombrePropietarioInfo.value = "";
    actualizarCamposInformativos("");
    alternarPanelNuevaCuenta(false);
  });

  async function recibirCuentas() {
    try {
      const response = await fetch("/api/lista_cuentas/lista_cuentas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ usuario: usuarioActual })
      });
      const data = await response.json();

      if (data.success && Array.isArray(data.cuentas)) {
        cuentasListado = data.cuentas;
      }
    } catch (error) {
      console.error("Error al recibir cuentas:", error);
    } finally {
      renderTablaCuentas();
    }
  }

  function renderTablaCuentas() {
    if (panelAbierto) {
      encabezadoTabla.innerHTML = `
        <th>#</th>
        <th>Número de Cuenta</th>
        <th>Dueño</th>
        <th>Saldo</th>
      `;
    } else {
      encabezadoTabla.innerHTML = `
        <th>#</th>
        <th>Número de Cuenta</th>
        <th>Tipo de Cuenta</th>
        <th>Dueño</th>
        <th>Saldo</th>
      `;
    }

    cuerpoTabla.innerHTML = "";

    if (cuentasListado.length === 0) {
      const colspan = panelAbierto ? 4 : 5;
      cuerpoTabla.innerHTML = `
        <tr>
          <td colspan="${colspan}" class="text-center text-muted py-3">No hay cuentas registradas.</td>
        </tr>
      `;
      return;
    }

    cuentasListado.forEach((cuenta, index) => {
      const tr = document.createElement("tr");
      tr.style.cursor = "pointer";

      if (panelAbierto) {
        tr.innerHTML = `
          <td>${index + 1}</td>
          <td class="fw-semibold">${cuenta.numCuenta}</td>
          <td>${cuenta.nombreDueno}</td>
          <td class="fw-bold">${cuenta.saldo}</td>
        `;
      } else {
        tr.innerHTML = `
          <td>${index + 1}</td>
          <td class="fw-semibold">${cuenta.numCuenta}</td>
          <td>${cuenta.nombreTipoCuenta}</td>
          <td>${cuenta.nombreDueno}</td>
          <td class="fw-bold">${cuenta.saldo}</td>
        `;
      }

      tr.addEventListener("click", () => {
        window.location.href = `/dashboardAhorro/dashboardAhorro.html?numCuenta=${encodeURIComponent(cuenta.numCuenta)}&usuario=${encodeURIComponent(usuarioActual || "")}`;
      });

      cuerpoTabla.appendChild(tr);
    });
  }

  formNuevaCuenta.addEventListener("submit", async (e) => {
    e.preventDefault();

    const idTipoCuenta = selectTipoCuenta.value;
    const docPropietario = inputDocPropietario.value.trim();
    const nombrePropietario = inputNombrePropietarioInfo.value.trim();
    const saldo = document.getElementById("saldoInicial").value.trim();

    if (!idTipoCuenta || !docPropietario || saldo === "") {
      mostrarAlertaBootstrap("Por favor, complete todos los campos obligatorios para crear la cuenta.", "warning");
      return;
    }

    const tipoObj = tiposCuentaCatalogo.find((t) => String(t.id) === String(idTipoCuenta));
    const nombreDuenoFinal = nombrePropietario || usuarioActual || docPropietario;

    const payload = {
      usuario: usuarioActual,
      idTipoCuenta,
      nombreTipoCuenta: tipoObj ? tipoObj.nombre : "",
      docPropietario,
      nombrePropietario: nombreDuenoFinal,
      saldo,
      parametrosInformativos: {
        saldoMinimo: document.getElementById("infoSaldoMinimo").value,
        multaSaldoMinimo: document.getElementById("infoMultaSaldoMinimo").value,
        cargoMensual: document.getElementById("infoCargoMensual").value,
        numRetirosCajeroHumano: document.getElementById("infoNumRetirosHumano").value,
        numRetirosCajeroAutomatico: document.getElementById("infoNumRetirosAuto").value,
        comisionCajeroHumano: document.getElementById("infoComisionHumano").value,
        comisionCajeroAutomatico: document.getElementById("infoComisionAuto").value,
        montoMaxSinpeDiario: document.getElementById("infoMontoMaxSinpe").value,
        comisionSinpe: document.getElementById("infoComisionSinpe").value,
        tasaInteresAnual: document.getElementById("infoTasaInteres").value
      }
    };

    let numCuentaGenerado = "";

    try {
      const response = await fetch("/api/lista_cuentas/crear_cuenta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || data.error || "No se pudo crear la cuenta.");
      }

      numCuentaGenerado = data.numCuenta;
    } catch (error) {
      console.error("Error creando cuenta:", error);
      mostrarAlertaBootstrap(error.message, "danger");
      return;
    }

    formNuevaCuenta.reset();
    inputNombrePropietarioInfo.value = "";
    actualizarCamposInformativos("");
    alternarPanelNuevaCuenta(false);
    await recibirCuentas();
  });

  // Salir
  const salirBtn = document.getElementById("salir");
  salirBtn.addEventListener("click", () => {
    fetch("/api/lista_cuentas/salir", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ usuario: usuarioActual })
    }).finally(() => {
      window.location.href = "../login/login.html";
    });
  });
});