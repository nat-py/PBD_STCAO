(() => {
  'use strict';

  // ==========================================
  // 1. LOGIN EXISTENTE
  // ==========================================
  const form = document.querySelector('#formLogin');
  const errorGeneral = document.querySelector('#errorGeneral');

  form.addEventListener('submit', async (event) => {
    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      form.classList.add('was-validated');
      return;
    }

    event.preventDefault();

    const usuario = document.querySelector('#username').value;
    const password = document.querySelector('#password').value;

    try {
      const respuesta = await fetch('/api/login/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ usuario: usuario, contrasena: password })
      });

      const resultado = await respuesta.json();

      if (resultado.success) {
        errorGeneral.classList.add('d-none');
        mostrarAlertaBootstrap('¡Inicio de sesión exitoso!', 'success');

        setTimeout(() => {
          if (resultado.isAdmin) {
            window.location.href = `/dashboardAdmin/dashboardAdmin.html?usuario=${encodeURIComponent(usuario)}`;
          } else {
            window.location.href = `/lista_cuentas/listaCuentas.html?usuario=${encodeURIComponent(usuario)}`;
          }
        }, 1200);
      } else {
        errorGeneral.classList.remove('d-none');
        mostrarAlertaBootstrap('Usuario o contraseña incorrectos', 'danger');
      }
    } catch (error) {
      console.error('Error:', error);
      errorGeneral.classList.remove('d-none');
      mostrarAlertaBootstrap('Ocurrió un error al intentar iniciar sesión.', 'danger');
    }
  }, false);

  // ==========================================
  // 2. REGISTRO CON STEPPER (5 PASOS)
  // ==========================================
  const authCard = document.getElementById('authCard');
  const tabLoginBtn = document.getElementById('tab-login-btn');
  const tabRegistroBtn = document.getElementById('tab-registro-btn');

  let pasoActual = 1;
  const totalPasos = 5;

  let tiposDocCatalogo = [
    { id: '1', nombre: 'Cédula Nacional' },
    { id: '2', nombre: 'DIMEX' },
    { id: '3', nombre: 'Pasaporte' }
  ];

  let tiposCuentaCatalogo = [
    { id: '1', nombre: 'Ahorro Básico' },
    { id: '2', nombre: 'Ahorro Navideño' }
  ];

  let parentescosCatalogo = [
    { id: '1', nombre: 'Hijo(a)' },
    { id: '2', nombre: 'Cónyuge' },
    { id: '3', nombre: 'Padre / Madre' },
    { id: '4', nombre: 'Hermano(a)' }
  ];

  const cuentasNuevasPendientes = [];
  let beneficiarioConfigurado = null;
  let credencialesCuentaValidas = false;

  tabRegistroBtn.addEventListener('shown.bs.tab', () => {
    authCard.style.maxWidth = '560px';
    cargarCatalogosRegistro();
    actualizarStepperUI();
  });

  tabLoginBtn.addEventListener('shown.bs.tab', () => {
    authCard.style.maxWidth = '440px';
  });

  async function cargarCatalogosRegistro() {
    try {
      const [resDoc, resCuentas, resPar] = await Promise.allSettled([
        fetch('/api/admin/tablaTipoDocuIdentidadActivo'),
        fetch('/api/admin/tablaTipoCuentaAhorroActivo'),
        fetch('/api/admin/tablaParentescoActivo')
      ]);

      if (resDoc.status === 'fulfilled' && resDoc.value.ok) {
        const d = await resDoc.value.json();
        if (Array.isArray(d.tiposDocumento) && d.tiposDocumento.length > 0) {
          tiposDocCatalogo = d.tiposDocumento;
        }
      }

      if (resCuentas.status === 'fulfilled' && resCuentas.value.ok) {
        const c = await resCuentas.value.json();
        if (Array.isArray(c.tiposCuentas) && c.tiposCuentas.length > 0) {
          tiposCuentaCatalogo = c.tiposCuentas;
        }
      }

      if (resPar.status === 'fulfilled' && resPar.value.ok) {
        const p = await resPar.value.json();
        if (Array.isArray(p.parentescos) && p.parentescos.length > 0) {
          parentescosCatalogo = p.parentescos;
        }
      }
    } catch (_) {
      // Usa catálogos base si el backend aún no responde
    }

    poblarSelectsRegistro();
  }

  function poblarSelectsRegistro() {
    const selDoc = document.getElementById('regTipoDoc');
    const selCuenta = document.getElementById('regTipoCuenta');
    const selPar = document.getElementById('benParentesco');

    const valorDocPrevio = selDoc.value;
    selDoc.innerHTML = `<option value="">Seleccione tipo...</option>`;
    tiposDocCatalogo.forEach((t) => {
      selDoc.innerHTML += `<option value="${t.id}">${t.nombre}</option>`;
    });
    if (valorDocPrevio) selDoc.value = valorDocPrevio;

    const valorCuentaPrevio = selCuenta.value;
    selCuenta.innerHTML = `<option value="">Seleccione tipo...</option>`;
    tiposCuentaCatalogo.forEach((t) => {
      selCuenta.innerHTML += `<option value="${t.id}">${t.nombre}</option>`;
    });
    if (valorCuentaPrevio) selCuenta.value = valorCuentaPrevio;

    const valorParPrevio = selPar.value;
    selPar.innerHTML = `<option value="">Seleccione parentesco...</option>`;
    parentescosCatalogo.forEach((p) => {
      selPar.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
    });
    if (valorParPrevio) selPar.value = valorParPrevio;
  }

  function irAPaso(nuevoPaso) {
    pasoActual = Math.max(1, Math.min(totalPasos, nuevoPaso));
    actualizarStepperUI();
  }

  function actualizarStepperUI() {
    document.querySelectorAll('.registro-paso').forEach((el, idx) => {
      el.classList.toggle('d-none', idx + 1 !== pasoActual);
    });

    const porcentaje = Math.round((pasoActual / totalPasos) * 100);
    document.getElementById('textoPasoActual').textContent = `Paso ${pasoActual} de ${totalPasos}`;
    document.getElementById('porcentajeProgreso').textContent = `${porcentaje}%`;

    const barra = document.getElementById('barraProgresoRegistro');
    barra.style.width = `${porcentaje}%`;
    barra.setAttribute('aria-valuenow', String(porcentaje));

    document.querySelectorAll('#stepperIndicadores .stepper-step').forEach((stepEl) => {
      const n = Number(stepEl.getAttribute('data-step'));
      stepEl.classList.remove('active', 'completed');
      if (n < pasoActual) {
        stepEl.classList.add('completed');
      } else if (n === pasoActual) {
        stepEl.classList.add('active');
      }
    });
  }

  // Paso 1 -> 2
  document.getElementById('btnPaso1Siguiente').addEventListener('click', () => {
    const tipoDoc = document.getElementById('regTipoDoc').value.trim();
    const valorDoc = document.getElementById('regValorDoc').value.trim();
    const nombre = document.getElementById('regNombre').value.trim();
    const fechaNac = document.getElementById('regFechaNac').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const tel1 = document.getElementById('regTel1').value.trim();

    if (!tipoDoc || !valorDoc || !nombre || !fechaNac || !email || !tel1) {
      mostrarAlertaBootstrap('Complete los datos personales obligatorios.', 'danger');
      return;
    }

    irAPaso(2);
  });

  // Paso 2 -> 1 y 2 -> 3
  document.getElementById('btnPaso2Anterior').addEventListener('click', () => irAPaso(1));

  document.getElementById('btnPaso2Siguiente').addEventListener('click', () => {
    const usuario = document.getElementById('regUsuario').value.trim();
    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regPasswordConfirm').value;

    if (!usuario || !password) {
      mostrarAlertaBootstrap('Debe ingresar usuario y contraseña.', 'danger');
      return;
    }

    if (password !== passwordConfirm) {
      mostrarAlertaBootstrap('Las contraseñas no coinciden.', 'danger');
      return;
    }

    irAPaso(3);
  });

  // Paso 3: agregar cuentas a la lista pendiente para SP
  document.getElementById('btnAgregarCuentaLista').addEventListener('click', () => {
    const sel = document.getElementById('regTipoCuenta');
    const idTipoCuenta = sel.value;
    const nombreTipoCuenta = sel.options[sel.selectedIndex]?.text || '';
    const saldoInput = document.getElementById('regSaldoCuenta');
    const saldo = saldoInput.value.trim();

    if (!idTipoCuenta || saldo === '' || Number(saldo) < 0) {
      mostrarAlertaBootstrap('Seleccione el tipo de cuenta e ingrese un saldo válido.', 'warning');
      return;
    }

    cuentasNuevasPendientes.push({
      idTipoCuenta,
      nombreTipoCuenta,
      saldo: Number(saldo).toFixed(2)
    });

    sel.value = '';
    saldoInput.value = '';
    renderCuentasPendientes();
  });

  function renderCuentasPendientes() {
    const ul = document.getElementById('listaCuentasPendientes');
    if (cuentasNuevasPendientes.length === 0) {
      ul.innerHTML = `<li class="list-group-item text-muted small text-center py-2">No ha agregado cuentas aún.</li>`;
      return;
    }

    ul.innerHTML = cuentasNuevasPendientes.map((c, idx) => `
      <li class="list-group-item d-flex justify-content-between align-items-center py-2 small">
        <div>
          <span class="fw-bold text-primary">${c.nombreTipoCuenta}</span>
          <span class="text-muted ms-2">Saldo: <strong>${c.saldo}</strong></span>
        </div>
        <button type="button" class="btn btn-sm btn-outline-danger border-0" onclick="quitarCuentaPendiente(${idx})" title="Quitar">
          <i class="bi bi-trash"></i>
        </button>
      </li>
    `).join('');
  }

  window.quitarCuentaPendiente = (index) => {
    cuentasNuevasPendientes.splice(index, 1);
    renderCuentasPendientes();
  };

  document.getElementById('btnPaso3Anterior').addEventListener('click', () => irAPaso(2));
  document.getElementById('btnPaso3Omitir').addEventListener('click', () => {
    cuentasNuevasPendientes.length = 0;
    renderCuentasPendientes();
    irAPaso(4);
  });
  document.getElementById('btnPaso3Siguiente').addEventListener('click', () => {
    const sel = document.getElementById('regTipoCuenta');
    const saldoInput = document.getElementById('regSaldoCuenta');
    if (sel.value && saldoInput.value.trim() !== '') {
      cuentasNuevasPendientes.push({
        idTipoCuenta: sel.value,
        nombreTipoCuenta: sel.options[sel.selectedIndex]?.text || '',
        saldo: Number(saldoInput.value.trim()).toFixed(2)
      });
      sel.value = '';
      saldoInput.value = '';
      renderCuentasPendientes();
    }
    irAPaso(4);
  });

  // Paso 4: validar credenciales de cuenta asociada para beneficiario
  document.getElementById('btnValidarCuentaBeneficiario').addEventListener('click', async () => {
    const numCuenta = document.getElementById('benNumCuenta').value.trim();
    const usuarioCuenta = document.getElementById('benUsuarioCuenta').value.trim();
    const passwordCuenta = document.getElementById('benPasswordCuenta').value;

    if (!numCuenta || !usuarioCuenta || !passwordCuenta) {
      mostrarAlertaBootstrap('Ingrese número de cuenta, usuario y contraseña asociados.', 'danger');
      return;
    }

    let valida = false;
    try {
      const resp = await fetch('/api/login/validar_cuenta_beneficiario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numCuenta,
          usuario: usuarioCuenta,
          contrasena: passwordCuenta
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        valida = Boolean(data.success);
        if (valida) {
          const disponible = Number(data.porcentajeDisponible);
          const cantidad = Number(data.cantidadBeneficiariosActivos || 0);
          if (Number.isFinite(disponible) && disponible >= 0) {
            if (cantidad >= 3) {
              document.getElementById('benPorcentaje').disabled = true;
              document.getElementById('benParentesco').disabled = true;
              document.getElementById('benCredencialesOk').classList.remove('alert-success');
              document.getElementById('benCredencialesOk').classList.add('alert-danger');
              document.getElementById('benCredencialesOk').textContent =
                'Esta cuenta ya tiene los 3 beneficiarios permitidos.';
              document.getElementById('benCamposAsignacion').classList.add('d-none');
              credencialesCuentaValidas = false;
            } else {
              document.getElementById('benPorcentaje').disabled = false;
              document.getElementById('benParentesco').disabled = false;
              document.getElementById('benCredencialesOk').classList.remove('alert-danger');
              document.getElementById('benCredencialesOk').classList.add('alert-success');
              document.getElementById('benCamposAsignacion').classList.remove('d-none');

              if (cantidad === 0) {
                document.getElementById('benPorcentaje').value = '100';
                document.getElementById('benPorcentaje').min = '100';
                document.getElementById('benPorcentaje').max = '100';
                document.getElementById('benPorcentaje').placeholder = '100';
              } else {
                document.getElementById('benPorcentaje').value = '';
                document.getElementById('benPorcentaje').min = '1';
                document.getElementById('benPorcentaje').max = '99';
                document.getElementById('benPorcentaje').placeholder = 'Ej: 30';
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error al validar beneficiario:', error);
      valida = false;
    }

    if (!valida) {
      credencialesCuentaValidas = false;
      document.getElementById('benPorcentaje').disabled = false;
      document.getElementById('benParentesco').disabled = false;
      document.getElementById('benCredencialesOk').classList.add('d-none');
      document.getElementById('benCamposAsignacion').classList.add('d-none');
      mostrarAlertaBootstrap('Los datos de la cuenta o credenciales no son válidos.', 'danger');
      return;
    }

    credencialesCuentaValidas = true;
    document.getElementById('benCredencialesOk').classList.remove('d-none');
    document.getElementById('benCamposAsignacion').classList.remove('d-none');
    mostrarAlertaBootstrap('Cuenta y credenciales verificadas.', 'success');
  });

  document.getElementById('btnPaso4Anterior').addEventListener('click', () => irAPaso(3));
  document.getElementById('btnPaso4Omitir').addEventListener('click', () => {
    beneficiarioConfigurado = null;
    finalizarProcesoRegistro();
  });

  document.getElementById('btnFinalizarRegistro').addEventListener('click', () => {
    const numCuenta = document.getElementById('benNumCuenta').value.trim();
    const usuarioCuenta = document.getElementById('benUsuarioCuenta').value.trim();
    const passwordCuenta = document.getElementById('benPasswordCuenta').value;
    const idParentesco = document.getElementById('benParentesco').value;
    const porcentaje = Number(document.getElementById('benPorcentaje').value);

    if (!numCuenta || !usuarioCuenta || !passwordCuenta || !credencialesCuentaValidas) {
      mostrarAlertaBootstrap('Valide primero la cuenta y las credenciales asociadas, o pulse Omitir.', 'warning');
      return;
    }

    if (!idParentesco || !porcentaje || porcentaje <= 0 || porcentaje > 100) {
      mostrarAlertaBootstrap('Seleccione un parentesco y un porcentaje válido (1 a 100).', 'warning');
      return;
    }

    beneficiarioConfigurado = {
      numCuenta,
      usuarioAsociado: usuarioCuenta,
      contrasenaAsociada: passwordCuenta,
      idParentesco,
      porcentaje
    };

    finalizarProcesoRegistro();
  });

  async function finalizarProcesoRegistro() {
    const persona = {
      TipoDocuIdentidad: document.getElementById('regTipoDoc').value.trim(),
      Nombre: document.getElementById('regNombre').value.trim(),
      ValorDocumentoIdentidad: document.getElementById('regValorDoc').value.trim(),
      FechaNacimiento: document.getElementById('regFechaNac').value.trim(),
      Email: document.getElementById('regEmail').value.trim(),
      telefono1: document.getElementById('regTel1').value.trim(),
      telefono2: document.getElementById('regTel2').value.trim()
    };

    const credenciales = {
      usuario: document.getElementById('regUsuario').value.trim(),
      contrasena: document.getElementById('regPassword').value
    };

    const payload = {
      persona,
      usuario: credenciales,
      cuentasNuevas: cuentasNuevasPendientes,
      beneficiario: beneficiarioConfigurado
    };

    try {
      const resp = await fetch('/api/login/registrar_usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (!resp.ok || data.success === false) {
        mostrarAlertaBootstrap(data.message || data.error || 'No se pudo completar el registro.', 'danger');
        return;
      }
      if (data.cuentasCreadas?.length) {
        document.getElementById('mensajeFinalRegistro').textContent =
          `Usuario "${credenciales.usuario}" creado correctamente con ${data.cuentasCreadas.length} cuenta(s). Redirigiendo a sus cuentas...`;
      }
    } catch (err) {
      console.error('Error al finalizar el registro:', err);
      mostrarAlertaBootstrap('No se pudo completar el registro. Verifique la conexión e inténtelo nuevamente.', 'danger');
      return;
    }

    irAPaso(5);
    document.getElementById('mensajeFinalRegistro').textContent =
      `Usuario "${credenciales.usuario}" creado correctamente. Redirigiendo a sus cuentas...`;

    const irCuentas = () => {
      window.location.href = `/lista_cuentas/listaCuentas.html?usuario=${encodeURIComponent(credenciales.usuario)}`;
    };

    document.getElementById('btnIrListaCuentas').onclick = irCuentas;
    setTimeout(irCuentas, 1500);
  }
})();

// Función auxiliar para mostrar alertas flotantes de Bootstrap en la esquina inferior derecha
function mostrarAlertaBootstrap(mensaje, tipo = "success") {
  let alertContainer = document.getElementById("bootstrap-alert-container");
  if (!alertContainer) {
    alertContainer = document.createElement("div");
    alertContainer.id = "bootstrap-alert-container";
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

  setTimeout(() => {
    alertDiv.classList.remove("show");
    setTimeout(() => alertDiv.remove(), 300);
  }, 4000);
}