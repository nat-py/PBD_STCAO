document.addEventListener('DOMContentLoaded', () => {

  // 1. Manejo del Modal de Pantalla en Proceso
  const modalProcesoEl = document.getElementById('modalEnProceso');
  const modalProceso = new bootstrap.Modal(modalProcesoEl);

  document.querySelectorAll('.btn-proceso').forEach(element => {
    element.addEventListener('click', (e) => {
      e.preventDefault();
      modalProceso.show();
    });
  });

  // 2. Recibir usuario, enviar estados de cuenta, movimientos y beneficiarios
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const usuarioActual = urlParams.get('usuario');
  const numCuenta = urlParams.get('numCuenta');

  const usuarioHeader = document.getElementById('usuarioHeader');
  if (usuarioActual && numCuenta) {
    usuarioHeader.textContent = usuarioActual;
    recibirMovimientosAPI();
    recibirEstadosCuentaAPI();
    recibirBeneficiariosAPI();
  } else {
    usuarioHeader.textContent = "Usuario no encontrado";
    renderMovimientos();
  }

  function formatearFecha(fechaStr) {
    if (!fechaStr) return '';
    return fechaStr.substring(0, 10).replace(/-/g, '/');
  }

  function normalizarFechaISO(fechaStr) {
    if (!fechaStr) return '';
    return String(fechaStr).substring(0, 10);
  }

  // ==========================================
  // 2B. LISTADO DE MOVIMIENTOS (TOP 5 + VER MÁS + DETALLE)
  // ==========================================
  const contenedorTablaMovimientos = document.getElementById('contenedorTablaMovimientos');
  const encabezadoMovimientos = document.getElementById('encabezadoMovimientos');
  const cuerpoMovimientos = document.getElementById('cuerpoMovimientos');
  const contenedorVerMasMovimientos = document.getElementById('contenedorVerMasMovimientos');
  const btnVerMasMovimientos = document.getElementById('btnVerMasMovimientos');

  const modalDetalleMovimientoEl = document.getElementById('modalDetalleMovimiento');
  const modalDetalleMovimiento = new bootstrap.Modal(modalDetalleMovimientoEl);
  const cuerpoDetalleMovimiento = document.getElementById('cuerpoDetalleMovimiento');

  let movimientos = [];
  let movimientosExpandido = false;
  let saldoActual = null;
  let saldoFlotante = 0;
  const movimientosSesion = [];

  const saldoActualMovimiento = document.getElementById('saldoActualMovimiento');
  const saldoFlotanteMovimiento = document.getElementById('saldoFlotanteMovimiento');
  const listaMovimientosSesion = document.getElementById('listaMovimientosSesion');
  const cantidadMovimientosSesion = document.getElementById('cantidadMovimientosSesion');
  saldoFlotanteMovimiento.textContent = '0.00';

  function formatearMonto(monto) {
    const valor = Number(monto);
    return Number.isFinite(valor) ? valor.toFixed(2) : '--';
  }

  function actualizarSaldoActual(nuevoSaldo) {
    if (nuevoSaldo === null || nuevoSaldo === undefined || nuevoSaldo === '') return;
    saldoActual = Number(nuevoSaldo);
    if (Number.isFinite(saldoActual)) {
      saldoActualMovimiento.textContent = saldoActual.toFixed(2);
    }
  }

  function actualizarSaldoFlotante(monto, esDebito) {
    const valor = Number(monto);
    if (!Number.isFinite(valor)) return;
    saldoFlotante += esDebito ? -Math.abs(valor) : Math.abs(valor);
    saldoFlotanteMovimiento.textContent = saldoFlotante.toFixed(2);
  }

  function renderMovimientosSesion() {
    cantidadMovimientosSesion.textContent = String(movimientosSesion.length);

    if (movimientosSesion.length === 0) {
      listaMovimientosSesion.innerHTML = '<p class="text-muted small text-center mb-0">Sin movimientos nuevos</p>';
      return;
    }

    listaMovimientosSesion.innerHTML = movimientosSesion.map((movimiento) => `
      <div class="border rounded p-2 bg-light">
        <div class="d-flex justify-content-between align-items-center">
          <span class="fw-semibold small">${escaparHTML(movimiento.nombre)}</span>
          <span class="${movimiento.debito ? 'text-danger' : 'text-success'} fw-bold small">
            ${movimiento.debito ? '-' : '+'}${formatearMonto(movimiento.monto)}
          </span>
        </div>
        <div class="text-muted small text-truncate" title="${escaparHTML(movimiento.descripcion)}">${escaparHTML(movimiento.descripcion)}</div>
      </div>
    `).join('');
  }

  async function recibirMovimientosAPI() {
    try {
      const response = await fetch('/api/ahorro/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numCuenta: numCuenta })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.movimientos)) {
          movimientos = data.movimientos;
          if (movimientos.length > 0) {
            actualizarSaldoActual(movimientos[0].nuevoSaldo);
          }
        }
      }
    } catch (error) {
      console.error('Error al recibir movimientos:', error);
    } finally {
      renderMovimientos();
    }
  }

  function mapearDetalleMovimiento(mov) {
    const tipoMov = mov.tipoMovimiento || mov.nombreTipoMovimiento || mov.tipo || 'Movimiento';
    const fecha = formatearFecha(mov.fecha || mov.fechaMovimiento || '');
    const accion = String(mov.accionTipoMovimiento || mov.accion || '').trim().toLowerCase();
    const montoNum = Math.abs(Number(mov.monto ?? mov.saldo ?? 0));
    const esDebito = accion === 'debito' || accion === 'débito';
    const esCredito = accion === 'credito' || accion === 'crédito';
    const montoTexto = Number.isNaN(montoNum)
      ? (mov.monto ?? '')
      : `${esDebito ? '-' : esCredito ? '+' : ''}${montoNum.toFixed(2)}`;
    const idComprobante = mov.idComprobante ?? mov.comprobante ?? 'N/A';
    const cuentaAcreditado = mov.cuentaAcreditado ?? mov.codigoCuenta ?? mov.cuentaDestino ?? 'N/A';
    const descripcion = mov.descripcion ?? mov.detalle ?? 'Sin descripción';

    return {
      tipoMovimiento: tipoMov,
      fecha,
      monto: montoTexto,
      esNegativo: esDebito,
      idComprobante,
      cuentaAcreditado,
      descripcion,
      saldoPosterior: mov.saldoPosterior ?? mov.nuevoSaldo ?? null
    };
  }

  function renderMovimientos() {
    encabezadoMovimientos.innerHTML = movimientosExpandido
      ? `
        <tr>
          <th>Tipo Movimiento</th>
          <th>Monto</th>
          <th>ID Comprobante</th>
          <th>Cuenta Acreditado</th>
          <th>Descripción</th>
        </tr>
      `
      : `
        <tr>
          <th>Tipo Movimiento</th>
          <th>Monto</th>
        </tr>
      `;

    cuerpoMovimientos.innerHTML = '';

    if (!Array.isArray(movimientos) || movimientos.length === 0) {
      contenedorVerMasMovimientos.classList.add('d-none');
      contenedorTablaMovimientos.classList.remove('expandido');
      const colspan = movimientosExpandido ? 5 : 2;
      cuerpoMovimientos.innerHTML = `
        <tr>
          <td colspan="${colspan}" class="text-center text-muted py-4">No hay movimientos</td>
        </tr>
      `;
      return;
    }

    const visibles = movimientosExpandido ? movimientos : movimientos.slice(0, 5);

    if (movimientosExpandido) {
      contenedorTablaMovimientos.classList.add('expandido');
    } else {
      contenedorTablaMovimientos.classList.remove('expandido');
    }

    if (movimientos.length > 5) {
      contenedorVerMasMovimientos.classList.remove('d-none');
      btnVerMasMovimientos.innerHTML = movimientosExpandido
        ? `<i class="bi bi-chevron-up me-1"></i>Ver menos`
        : `<i class="bi bi-chevron-down me-1"></i>Ver más`;
    } else {
      contenedorVerMasMovimientos.classList.add('d-none');
    }

    visibles.forEach((mov) => {
      const detalle = mapearDetalleMovimiento(mov);
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';

      if (movimientosExpandido) {
        tr.innerHTML = `
          <td>
            <div class="fw-semibold">${escaparHTML(detalle.tipoMovimiento)}</div>
            <div class="fecha-movimiento-sub">${escaparHTML(detalle.fecha)}</div>
          </td>
          <td class="${detalle.esNegativo ? 'text-danger' : 'text-success'} fw-bold">${escaparHTML(detalle.monto)}</td>
          <td>${escaparHTML(detalle.idComprobante)}</td>
          <td>${escaparHTML(detalle.cuentaAcreditado)}</td>
          <td>${escaparHTML(detalle.descripcion)}</td>
        `;
      } else {
        tr.innerHTML = `
          <td>
            <div class="fw-semibold">${escaparHTML(detalle.tipoMovimiento)}</div>
            <div class="fecha-movimiento-sub">${escaparHTML(detalle.fecha)}</div>
          </td>
          <td class="${detalle.esNegativo ? 'text-danger' : 'text-success'} fw-bold">${escaparHTML(detalle.monto)}</td>
        `;
      }

      tr.addEventListener('click', () => {
        abrirDetalleMovimiento(detalle);
      });

      cuerpoMovimientos.appendChild(tr);
    });
  }

  function abrirDetalleMovimiento(detalle) {
    cuerpoDetalleMovimiento.innerHTML = `
      <div class="list-group list-group-flush">
        <div class="list-group-item d-flex justify-content-between px-0">
          <span class="text-muted fw-semibold">Tipo de Movimiento:</span>
          <span class="fw-bold">${escaparHTML(detalle.tipoMovimiento)}</span>
        </div>
        <div class="list-group-item d-flex justify-content-between px-0">
          <span class="text-muted fw-semibold">Fecha:</span>
          <span>${escaparHTML(detalle.fecha || 'N/A')}</span>
        </div>
        <div class="list-group-item d-flex justify-content-between px-0">
          <span class="text-muted fw-semibold">Monto:</span>
          <span class="fw-bold text-primary">${escaparHTML(detalle.monto)}</span>
        </div>
        <div class="list-group-item d-flex justify-content-between px-0">
          <span class="text-muted fw-semibold">ID Comprobante:</span>
          <span>${escaparHTML(detalle.idComprobante)}</span>
        </div>
        <div class="list-group-item d-flex justify-content-between px-0">
          <span class="text-muted fw-semibold">Cuenta Acreditado:</span>
          <span>${escaparHTML(detalle.cuentaAcreditado)}</span>
        </div>
        <div class="list-group-item px-0">
          <div class="text-muted fw-semibold mb-1">Descripción:</div>
          <div>${escaparHTML(detalle.descripcion)}</div>
        </div>
        ${detalle.saldoPosterior !== null ? `
          <div class="list-group-item d-flex justify-content-between px-0">
            <span class="text-muted fw-semibold">Saldo Posterior:</span>
            <span class="fw-bold">${escaparHTML(detalle.saldoPosterior)}</span>
          </div>
        ` : ''}
      </div>
    `;
    modalDetalleMovimiento.show();
  }

  btnVerMasMovimientos.addEventListener('click', () => {
    movimientosExpandido = !movimientosExpandido;
    renderMovimientos();
  });

  let parentescos = [];
  let tiposDocumento = [];

  // Obtener parentescos y tipos de documento para los select
  async function obtenerParentescosYTiposDocumentoAPI() {
    try {
      const [parentescosResponse, tiposDocumentoResponse] = await Promise.all([
        fetch('/api/ahorro/parentescos', { method: 'POST' }),
        fetch('/api/ahorro/tipos_documento', { method: 'POST' })
      ]);

      const dataParentescos = await parentescosResponse.json();
      const dataTiposDoc = await tiposDocumentoResponse.json();

      if (dataParentescos.success) {
        parentescos = dataParentescos.parentescos;
      }
      if (dataTiposDoc.success) {
        tiposDocumento = dataTiposDoc.tiposDocumento;
      }

    } catch (error) {
      console.error('Error al obtener parentescos y tipos de documento:', error);
    }
  }

  // ==========================================
  // 2C. ESTADOS DE CUENTA (RESUMEN + DESGLOSE + MOVIMIENTOS DEL ESTADO)
  // ==========================================
  const modalDetalleEstadoCuentaEl = document.getElementById('modalDetalleEstadoCuenta');
  const modalDetalleEstadoCuenta = new bootstrap.Modal(modalDetalleEstadoCuentaEl);
  const cuerpoDetalleEstadoCuenta = document.getElementById('cuerpoDetalleEstadoCuenta');
  const btnVerMovimientosEstado = document.getElementById('btnVerMovimientosEstado');

  const modalMovimientosEstadoEl = document.getElementById('modalMovimientosEstado');
  const modalMovimientosEstado = new bootstrap.Modal(modalMovimientosEstadoEl);
  const tituloMovimientosEstado = document.getElementById('tituloMovimientosEstado');
  const cuerpoMovimientosEstado = document.getElementById('cuerpoMovimientosEstado');

  let estadoCuentaSeleccionado = null;

  async function registrarEventoEstadoCuenta(idTipoOperacion) {
    const response = await fetch('/api/ahorro/registrar_evento_estado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: usuarioActual, idTipoOperacion })
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || data.error || 'No se pudo registrar la operación');
    }
  }

  function mostrarErrorRegistroEstado(error, tipoOperacion) {
    console.error(`Error al registrar la operación ${tipoOperacion} del estado de cuenta:`, error);
    mostrarAlertaBootstrap('No se pudo registrar la consulta del estado de cuenta.', 'danger');
  }

  function abrirDetalleEstadoCuenta(cuenta) {
    estadoCuentaSeleccionado = cuenta;

    cuerpoDetalleEstadoCuenta.innerHTML = `
      <div class="row g-3">
        <div class="col-md-6">
          <div class="p-3 bg-light rounded">
            <div class="small text-muted fw-semibold">Fecha Inicio</div>
            <div class="fw-bold">${escaparHTML(formatearFecha(cuenta.fechaIni) || 'N/A')}</div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="p-3 bg-light rounded">
            <div class="small text-muted fw-semibold">Fecha Fin</div>
            <div class="fw-bold">${escaparHTML(formatearFecha(cuenta.fechaFin) || 'N/A')}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="p-3 bg-light rounded">
            <div class="small text-muted fw-semibold">Saldo Inicial</div>
            <div class="fw-bold">${escaparHTML(cuenta.saldoIni ?? '--')}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="p-3 bg-light rounded">
            <div class="small text-muted fw-semibold">Saldo Mínimo</div>
            <div class="fw-bold">${escaparHTML(cuenta.saldoMini ?? '--')}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="p-3 bg-light rounded">
            <div class="small text-muted fw-semibold">Saldo Final</div>
            <div class="fw-bold text-primary">${escaparHTML(cuenta.saldoFin ?? '--')}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="p-3 bg-light rounded">
            <div class="small text-muted fw-semibold">Interés Acumulado</div>
            <div class="fw-bold text-success">${escaparHTML(cuenta.interesesAcumulados ?? '--')}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="p-3 bg-light rounded">
            <div class="small text-muted fw-semibold">Cant. Retiros</div>
            <div class="fw-bold">${escaparHTML(cuenta.cantidadRetiros ?? 0)}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="p-3 bg-light rounded">
            <div class="small text-muted fw-semibold">Cant. Depósitos</div>
            <div class="fw-bold">${escaparHTML(cuenta.cantidadDepositos ?? 0)}</div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="p-3 bg-light rounded">
            <div class="small text-muted fw-semibold">Cant. SINPE Enviados</div>
            <div class="fw-bold">${escaparHTML(cuenta.cantidadSinpeSalientes ?? 0)}</div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="p-3 bg-light rounded">
            <div class="small text-muted fw-semibold">Cant. SINPE Recibidos</div>
            <div class="fw-bold">${escaparHTML(cuenta.cantidadSinpeEntrantes ?? 0)}</div>
          </div>
        </div>
      </div>
    `;

    modalDetalleEstadoCuenta.show();
  }

  async function obtenerMovimientosDeEstado(cuenta) {
    const fechaIniISO = normalizarFechaISO(cuenta.fechaIni);
    const fechaFinISO = normalizarFechaISO(cuenta.fechaFin);

    try {
      const response = await fetch('/api/ahorro/movimientos_estado_cuenta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numCuenta,
          fechaIni: cuenta.fechaIni,
          fechaFin: cuenta.fechaFin
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.movimientos)) {
          return data.movimientos;
        }
      }
    } catch (_) {
      // Fallback al listado cargado si el endpoint específico no está disponible
    }

    return movimientos.filter((mov) => {
      const fMov = normalizarFechaISO(mov.fecha || mov.fechaMovimiento || '');
      if (!fMov) return false;
      if (fechaIniISO && fMov < fechaIniISO) return false;
      if (fechaFinISO && fMov > fechaFinISO) return false;
      return true;
    });
  }

  btnVerMovimientosEstado.addEventListener('click', async () => {
    if (!estadoCuentaSeleccionado) return;

    registrarEventoEstadoCuenta('8').catch((error) => mostrarErrorRegistroEstado(error, 8));

    const iniTexto = formatearFecha(estadoCuentaSeleccionado.fechaIni);
    const finTexto = formatearFecha(estadoCuentaSeleccionado.fechaFin);
    tituloMovimientosEstado.innerHTML = `
      <i class="bi bi-list-ul me-2"></i>Movimientos del Estado (${escaparHTML(iniTexto)} - ${escaparHTML(finTexto)})
    `;

    cuerpoMovimientosEstado.innerHTML = `
      <div class="text-center text-muted py-4">Cargando movimientos...</div>
    `;

    modalDetalleEstadoCuenta.hide();
    modalMovimientosEstado.show();

    const listaEstado = await obtenerMovimientosDeEstado(estadoCuentaSeleccionado);

    if (!Array.isArray(listaEstado) || listaEstado.length === 0) {
      cuerpoMovimientosEstado.innerHTML = `
        <div class="text-center text-muted py-4">No hay movimientos en este estado de cuenta</div>
      `;
      return;
    }

    cuerpoMovimientosEstado.innerHTML = `
      <table class="table table-hover align-middle bg-white rounded shadow-sm mb-0">
        <thead class="table-light">
          <tr>
            <th>Tipo Movimiento</th>
            <th>Monto</th>
          </tr>
        </thead>
        <tbody id="tbodyMovimientosEstado"></tbody>
      </table>
    `;

    const tbodyEstado = document.getElementById('tbodyMovimientosEstado');
    listaEstado.forEach((mov) => {
      const detalle = mapearDetalleMovimiento(mov);
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.innerHTML = `
        <td>
          <div class="fw-semibold">${escaparHTML(detalle.tipoMovimiento)}</div>
          <div class="fecha-movimiento-sub">${escaparHTML(detalle.fecha)}</div>
        </td>
        <td class="${detalle.esNegativo ? 'text-danger' : 'text-success'} fw-bold">${escaparHTML(detalle.monto)}</td>
      `;
      tr.addEventListener('click', () => {
        modalMovimientosEstado.hide();
        abrirDetalleMovimiento(detalle);
      });
      tbodyEstado.appendChild(tr);
    });
  });

  // Obtener estados de cuenta
  async function recibirEstadosCuentaAPI() {
    try {
      const response = await fetch('/api/ahorro/top8_estado_cuenta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numCuenta: numCuenta })
      });
      const data = await response.json();
      if (data.success) {
        const tbody = document.querySelector('#tablaEstadosCuenta tbody');
        tbody.innerHTML = '';

        data.cuentas.forEach((cuenta, index) => {
          if (index === 0 && saldoActual === null) {
            actualizarSaldoActual(cuenta.saldoFin);
          }

          const tr = document.createElement('tr');
          tr.style.cursor = 'pointer';

          tr.innerHTML = `
            <td>${escaparHTML(formatearFecha(cuenta.fechaIni))}</td>
            <td>${escaparHTML(formatearFecha(cuenta.fechaFin))}</td>
            <td>${escaparHTML(cuenta.saldoMini)}</td>
            <td>${escaparHTML(cuenta.interesesAcumulados)}</td>
          `;
          tbody.appendChild(tr);
          tr.addEventListener('click', () => {
            abrirDetalleEstadoCuenta(cuenta);
            registrarEventoEstadoCuenta('7').catch((error) => mostrarErrorRegistroEstado(error, 7));
          });
        });
      }
    } catch (error) {
      console.error('Error al recibir estados de cuenta:', error);
    }
  }

  // ==========================================
  // 3. GESTIÓN DE MOVIMIENTOS (MODAL DINÁMICO)
  // ==========================================
  const modalMovimientoEl = document.getElementById('modalMovimiento');
  const modalMovimiento = new bootstrap.Modal(modalMovimientoEl);
  const modalMovimientoTitulo = document.getElementById('modalMovimientoTitulo');
  const modalMovimientoCuerpo = document.getElementById('modalMovimientoCuerpo');
  const btnEjecutarMovimiento = document.getElementById('btnEjecutarMovimiento');
  let tipoMovimientoActual = '';
  let idTipoMovimientoActual = null;
  let accionMovimientoActual = '';

  async function recibirTiposMovimientoAPI() {
    const menu = document.querySelector('#dropdownAgregarMovimiento + .dropdown-menu');

    try {
      const response = await fetch('/api/ahorro/tipos_movimiento', { method: 'POST' });
      const data = await response.json();

      if (!response.ok || !data.success || !Array.isArray(data.tiposMovimiento) || data.tiposMovimiento.length === 0) {
        menu.innerHTML = '<li><span class="dropdown-item-text text-muted">No hay movimientos disponibles</span></li>';
        return;
      }

      menu.innerHTML = data.tiposMovimiento.map(tipo => {
        const clave = normalizarTipoMovimiento(tipo.accion || tipo.nombre);
        return `
          <li>
            <a class="dropdown-item tipo-movimiento" href="#" data-id="${escaparHTML(tipo.id)}" data-tipo="${escaparHTML(clave)}" data-nombre="${escaparHTML(tipo.nombre)}" data-accion="${escaparHTML(tipo.accion)}">
              <i class="bi bi-arrow-left-right me-2"></i>${escaparHTML(tipo.nombre)}
            </a>
          </li>
        `;
      }).join('');

      menu.querySelectorAll('.tipo-movimiento').forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          idTipoMovimientoActual = item.getAttribute('data-id');
          tipoMovimientoActual = item.getAttribute('data-tipo');
          accionMovimientoActual = item.getAttribute('data-accion') || '';
          configurarModalMovimiento(tipoMovimientoActual, item.getAttribute('data-nombre'));
          modalMovimiento.show();
        });
      });
    } catch (error) {
      console.error('Error al recibir tipos de movimiento:', error);
      menu.innerHTML = '<li><span class="dropdown-item-text text-danger">Error al cargar movimientos</span></li>';
    }
  }

  function normalizarTipoMovimiento(valor) {
    return String(valor || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function escaparHTML(valor) {
    const div = document.createElement('div');
    div.textContent = String(valor ?? '');
    return div.innerHTML;
  }

  recibirTiposMovimientoAPI();

  function configurarModalMovimiento(tipo, nombreTipo) {
    let titulo = nombreTipo || '';
    let htmlForm = '';

    switch (tipo) {
      case 'retiro-persona':
      case 'retiro-en-persona':
        titulo = 'Retiro en Persona';
        htmlForm = `
          <div class="mb-3">
            <label class="form-label small fw-bold">Monto a retirar:</label>
            <input type="number" step="0.01" class="form-control" id="montoMovimiento" placeholder="0.00">
          </div>
          <div class="mb-3">
            <label class="form-label small fw-bold">Documento de Identidad (Cajero / Ventanilla):</label>
            <input type="text" class="form-control" id="docVentanilla" placeholder="Número de cédula">
          </div>
        `;
        break;
      case 'retiro-cajero':
      case 'retiro-en-cajero':
        titulo = 'Retiro en Cajero Automático';
        htmlForm = `
          <div class="mb-3">
            <label class="form-label small fw-bold">Monto a retirar:</label>
            <input type="number" step="0.01" class="form-control" id="montoMovimiento" placeholder="0.00">
          </div>
          <div class="mb-3">
            <label class="form-label small fw-bold">PIN de Seguridad:</label>
            <input type="password" class="form-control" id="pinCajero" placeholder="****">
          </div>
        `;
        break;
      case 'deposito':
        titulo = 'Realizar Depósito';
        htmlForm = `
          <div class="mb-3">
            <label class="form-label small fw-bold">Monto a depositar:</label>
            <input type="number" step="0.01" class="form-control" id="montoMovimiento" placeholder="0.00">
          </div>
          <div class="mb-3">
            <label class="form-label small fw-bold">Número de Cuenta Destino:</label>
            <input type="text" class="form-control" id="cuentaDestino" value="${numCuenta}" readonly>
          </div>
        `;
        break;
      case 'sinpe':
        titulo = 'Realizar SINPE';
        htmlForm = `
          <div class="mb-3">
            <label class="form-label small fw-bold">Teléfono Destino:</label>
            <input type="text" class="form-control" id="telefonoSinpe" placeholder="88888888">
          </div>
          <div class="mb-3">
            <label class="form-label small fw-bold">Monto:</label>
            <input type="number" step="0.01" class="form-control" id="montoMovimiento" placeholder="0.00">
          </div>
          <div class="mb-3">
            <label class="form-label small fw-bold">Motivo / Detalle:</label>
            <input type="text" class="form-control" id="detalleSinpe" placeholder="Pago de...">
          </div>
        `;
        break;
      case 'transferencia':
        titulo = 'Transferencia Bancaria';
        htmlForm = `
          <div class="mb-3">
            <label class="form-label small fw-bold">Cuenta Destino:</label>
            <input type="text" class="form-control" id="cuentaTransferencia" placeholder="Número de cuenta">
          </div>
          <div class="mb-3">
            <label class="form-label small fw-bold">Monto:</label>
            <input type="number" step="0.01" class="form-control" id="montoMovimiento" placeholder="0.00">
          </div>
          <div class="mb-3">
            <label class="form-label small fw-bold">Descripción:</label>
            <input type="text" class="form-control" id="detalleTransferencia" placeholder="Motivo transferencia">
          </div>
        `;
        break;
      default:
        htmlForm = `
          <div class="mb-3">
            <label class="form-label small fw-bold">Monto:</label>
            <input type="number" step="0.01" class="form-control" id="montoMovimiento" placeholder="0.00">
          </div>
          <div class="mb-3">
            <label class="form-label small fw-bold">Descripción:</label>
            <input type="text" class="form-control" id="detalleMovimiento" placeholder="Detalle del movimiento">
          </div>
        `;
        break;
    }

    modalMovimientoTitulo.textContent = titulo;
    modalMovimientoCuerpo.innerHTML = htmlForm;
  }

  btnEjecutarMovimiento.addEventListener('click', async () => {
    const montoInput = document.getElementById('montoMovimiento');
    const monto = montoInput ? Number(montoInput.value) : 0;

    if (!idTipoMovimientoActual || !Number.isFinite(monto) || monto <= 0) {
      mostrarAlertaBootstrap('Ingrese un monto válido para el movimiento.', 'danger');
      return;
    }

    const detalleInput =
      document.getElementById('detalleSinpe') ||
      document.getElementById('detalleTransferencia') ||
      document.getElementById('detalleMovimiento');
    const descripcion = detalleInput?.value?.trim()
      || document.getElementById('cuentaTransferencia')?.value?.trim()
      || document.getElementById('telefonoSinpe')?.value?.trim()
      || tipoMovimientoActual;

    try {
      const response = await fetch('/api/ahorro/guardar_movimiento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idTipoMovimiento: idTipoMovimientoActual,
          numCuenta,
          monto,
          descripcion,
          idComprobante: null
        })
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        mostrarAlertaBootstrap(data.message || data.error || 'No se pudo guardar el movimiento.', 'danger');
        return;
      }

      actualizarSaldoActual(data.nuevoSaldo);
      const esDebitoSesion = String(accionMovimientoActual).trim().toLowerCase() === 'debito'
        || String(accionMovimientoActual).trim().toLowerCase() === 'débito';
      actualizarSaldoFlotante(monto, esDebitoSesion);
      movimientosSesion.unshift({
        nombre: document.getElementById('modalMovimientoTitulo').textContent,
        monto,
        descripcion,
        debito: esDebitoSesion
      });
      renderMovimientosSesion();

      mostrarAlertaBootstrap(`Movimiento registrado con éxito. Nuevo saldo: ${Number(data.nuevoSaldo).toFixed(2)}`, 'success');
      modalMovimiento.hide();
      await recibirMovimientosAPI();
    } catch (error) {
      console.error('Error al guardar el movimiento:', error);
      mostrarAlertaBootstrap('Error al guardar el movimiento.', 'danger');
    }
  });


  // ==========================================
  // 4. GESTIÓN DE BENEFICIARIOS
  // ==========================================
  let beneficiarios = [];
  let beneficiariosOriginales = [];

  async function recibirBeneficiariosAPI() {
    try {
      const response = await fetch('/api/ahorro/beneficiarios_asociados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numCuenta: numCuenta })
      });
      const data = await response.json();

      await obtenerParentescosYTiposDocumentoAPI();

      if (data.success) {
        beneficiarios = data.beneficiarios.map((b, index) => {
          let parentescoID = 0;
          let tipoDocID = 0;

          parentescos.forEach(p => {
            if (p.nombre === b.nombreParentesco) {
              parentescoID = p.id;
            }
          });

          tiposDocumento.forEach(t => {
            if (t.nombre === b.nombreTipoDocuIdentidad) {
              tipoDocID = t.id;
            }
          });

          return {
            id: index + 1,
            nDoc: tipoDocID,
            doc: b.valorDocuIdentidad,
            nombre: b.nombre,
            parentesco: parentescoID,
            fechaNacimiento: formatearFecha(b.fechaNacimiento),
            telefono1: b.telefono1,
            telefono2: b.telefono2,
            email: b.email,
            porcentaje: Number(b.porcentaje)
          };
        });

        if (beneficiarios.length === 1) {
          beneficiarios[0].porcentaje = 100;
        }
        beneficiariosOriginales = JSON.parse(JSON.stringify(beneficiarios));
        renderBeneficiarios();
      }
    } catch (error) {
      console.error('Error al recibir beneficiarios:', error);
    }
  }

  async function eliminarBeneficiarioAPI(valorDocuIdentidad) {
    try {
      const response = await fetch(`/api/ahorro/eliminar_beneficiario?valorDocuIdentidad=${encodeURIComponent(valorDocuIdentidad)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: usuarioActual, numCuenta: numCuenta })
      });
      const data = await response.json();
      if (data.success) {
        mostrarAlertaBootstrap('Beneficiario eliminado correctamente.', 'success');
        recibirBeneficiariosAPI();
        return true;
      } else {
        mostrarAlertaBootstrap('Error al eliminar beneficiario: ' + (data.error || 'Error desconocido'), 'danger');
        return false;
      }
    } catch (error) {
      console.error('Error al eliminar beneficiario:', error);
      mostrarAlertaBootstrap('Error al eliminar beneficiario. Por favor, inténtelo de nuevo.', 'danger');
      return false;
    }
  }

  let modoEdicion = false;
  const container = document.getElementById('beneficiarios-container');
  const btnToggleEdit = document.getElementById('btn-toggle-edit');

  function renderBeneficiarios() {
    container.innerHTML = '';

    if (beneficiarios.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center">
          <p class="text-muted">No hay beneficiarios asociados a esta cuenta.</p>
          <button class="btn btn-outline-primary shadow-sm" title="Agregar beneficiario" onclick="agregarBeneficiario(0)">
            <i class="bi bi-person-plus me-1"></i>Agregar beneficiario
          </button>
        </div>
      `;
      return;
    }

    beneficiarios.forEach((b, index) => {
      const col = document.createElement('div');
      col.className = 'col-md-4 position-relative';

      let botonesLateralesHTML = '';
      if (beneficiarios.length < 3) {
        if (index === 0) {
          botonesLateralesHTML += `<button class="btn btn-outline position-absolute top-50 shadow-sm" style="z-index:5; left: -55px;" title="Agregar a la izquierda" onclick="agregarBeneficiario(${index})"> <i class="bi bi-person-plus"></i></button>`;
        }
        if (index === beneficiarios.length - 1) {
          botonesLateralesHTML += `<button class="btn btn-outline position-absolute top-50 shadow-sm" style="z-index:5; right: -55px;" title="Agregar a la derecha" onclick="agregarBeneficiario(${index + 1})"> <i class="bi bi-person-plus"></i></button>`;
        }
      }

      if (!modoEdicion) {
        let parentesco = '';
        let tipoDocID = '';

        parentescos.forEach(p => {
          if (p.id === b.parentesco) {
            parentesco = p.nombre;
          }
        });

        tiposDocumento.forEach(t => {
          if (t.id === b.nDoc) {
            tipoDocID = t.nombre;
          }
        });

        col.innerHTML = `
          ${botonesLateralesHTML}
          <div class="card shadow-sm p-3 border-0 h-100">
            <h5 class="text-secondary fw-bold mb-3">Beneficiario ${index + 1}</h5>
            <p class="mb-1"><strong>Tipo Doc:</strong> ${tipoDocID}</p>
            <p class="mb-1"><strong>Documento:</strong> ${b.doc || 'N/A'}</p>
            <p class="mb-1"><strong>Nombre:</strong> ${b.nombre}</p>
            <p class="mb-1"><strong>Parentesco:</strong> ${parentesco}</p>
            <p class="mb-1"><strong>Fecha Nacimiento:</strong> ${b.fechaNacimiento}</p>
            <p class="mb-1"><strong>Teléfono 1:</strong> ${b.telefono1}</p>
            <p class="mb-1"><strong>Teléfono 2:</strong> ${b.telefono2}</p>
            <p class="mb-1"><strong>Email:</strong> ${b.email}</p>
            <div class="mt-3">
              <label class="form-label fw-semibold small">Porcentaje: <span class="text-primary">${b.porcentaje}%</span></label>
              <input type="range" class="form-range" value="${b.porcentaje}" disabled>
            </div>
          </div>
        `;
      } else {
        const esUnico = beneficiarios.length === 1;

        let opcionesTiposDoc = tiposDocumento.map(t => {
          let idTipo = t.id !== undefined ? t.id : t;
          let nombreTipo = t.nombre;
          let seleccionado = (String(b.nDoc) === String(idTipo)) ? 'selected' : '';
          return `<option value="${idTipo}" ${seleccionado}>${nombreTipo}</option>`;
        }).join('');

        let opcionesParentescos = parentescos.map(p => {
          let idParentesco = p.id !== undefined ? p.id : p;
          let nombreParentesco = p.nombre || p.descripcion || p;
          let seleccionado = (String(b.parentesco) === String(idParentesco)) ? 'selected' : '';
          return `<option value="${idParentesco}" ${seleccionado}>${nombreParentesco}</option>`;
        }).join('');

        col.innerHTML = `
          ${botonesLateralesHTML}
          <div class="card shadow-sm p-3 border-primary h-100 position-relative">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="text-primary fw-bold m-0">Beneficiario ${index + 1}</h5>
              ${!esUnico ? `
                <button class="btn btn-outline-danger btn-sm border-0" onclick="eliminarBeneficiario(${index})" title="Eliminar beneficiario">
                  <i class="bi bi-trash-fill"></i>
                </button>` : ''}
            </div>

            <div class="mb-2">
              <label class="form-label small fw-bold">Tipo Documento:</label>
              <select class="form-select form-select-sm" onchange="actualizarDatoBeneficiario(${index}, 'nDoc', this.value)">
                ${opcionesTiposDoc}
              </select>
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Número Documento:</label>
              <input type="text" class="form-control form-control-sm" value="${b.doc}" onchange="actualizarDatoBeneficiario(${index}, 'doc', this.value)" onblur="buscarDatosBeneficiario(${index}, this.value)">
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Nombre:</label>
              <input type="text" class="form-control form-control-sm" value="${b.nombre}" onchange="actualizarDatoBeneficiario(${index}, 'nombre', this.value)">
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Parentesco:</label>
              <select class="form-select form-select-sm" onchange="actualizarDatoBeneficiario(${index}, 'parentesco', this.value)">
                ${opcionesParentescos}
              </select>
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Fecha Nacimiento:</label>
              <input type="date" class="form-control form-control-sm" value="${b.fechaNacimiento.replace(/\//g, '-')}" onchange="actualizarDatoBeneficiario(${index}, 'fechaNacimiento', this.value)">
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Teléfono 1:</label>
              <input type="text" class="form-control form-control-sm" value="${b.telefono1}" onchange="actualizarDatoBeneficiario(${index}, 'telefono1', this.value)">
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Teléfono 2:</label>
              <input type="text" class="form-control form-control-sm" value="${b.telefono2}" onchange="actualizarDatoBeneficiario(${index}, 'telefono2', this.value)">
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Email:</label>
              <input type="email" class="form-control form-control-sm" value="${b.email}" onchange="actualizarDatoBeneficiario(${index}, 'email', this.value)">
            </div>
            <div class="mt-2">
              <label class="form-label fw-semibold small">Porcentaje: <span id="val-range-${index}" class="text-primary">${b.porcentaje}%</span></label>
              <input type="range" class="form-range" min="0" max="100" value="${b.porcentaje}"
                ${esUnico ? 'disabled' : ''}
                oninput="document.getElementById('val-range-${index}').innerText = this.value + '%'"
                onchange="cambiarPorcentaje(${index}, Number(this.value))">
            </div>
          </div>
        `;
      }

      container.appendChild(col);
    });
  }

  window.cambiarPorcentaje = function(indexModificado, nuevoValor) {
    if (beneficiarios.length <= 1) return;

    nuevoValor = Math.round(nuevoValor);
    let valorAntiguo = beneficiarios[indexModificado].porcentaje;
    let diferencia = nuevoValor - valorAntiguo;

    beneficiarios[indexModificado].porcentaje = nuevoValor;

    let otrosIndices = beneficiarios.map((_, i) => i).filter(i => i !== indexModificado);

    if (otrosIndices.length === 1) {
      let otroIndex = otrosIndices[0];
      beneficiarios[otroIndex].porcentaje -= diferencia;

      if (beneficiarios[otroIndex].porcentaje < 0) {
        beneficiarios[indexModificado].porcentaje += beneficiarios[otroIndex].porcentaje;
        beneficiarios[otroIndex].porcentaje = 0;
      } else if (beneficiarios[otroIndex].porcentaje > 100) {
        beneficiarios[indexModificado].porcentaje -= (beneficiarios[otroIndex].porcentaje - 100);
        beneficiarios[otroIndex].porcentaje = 100;
      }
    } else if (otrosIndices.length === 2) {
      let sumaOtros = otrosIndices.reduce((acc, i) => acc + beneficiarios[i].porcentaje, 0);

      if (sumaOtros === 0) {
        let repartir = Math.floor(diferencia / 2);
        beneficiarios[otrosIndices[0]].porcentaje -= repartir;
        beneficiarios[otrosIndices[1]].porcentaje -= (diferencia - repartir);
      } else {
        let restoDiferencia = diferencia;
        otrosIndices.forEach((i, idx) => {
          if (idx === otrosIndices.length - 1) {
            beneficiarios[i].porcentaje -= restoDiferencia;
          } else {
            let proporcion = beneficiarios[i].porcentaje / sumaOtros;
            let reduccion = Math.round(diferencia * proporcion);
            beneficiarios[i].porcentaje -= reduccion;
            restoDiferencia -= reduccion;
          }
        });
      }

      otrosIndices.forEach(i => {
        beneficiarios[i].porcentaje = Math.round(beneficiarios[i].porcentaje);
        if (beneficiarios[i].porcentaje < 0) beneficiarios[i].porcentaje = 0;
        if (beneficiarios[i].porcentaje > 100) beneficiarios[i].porcentaje = 100;
      });
    }

    let sumaActual = beneficiarios.reduce((acc, b) => acc + b.porcentaje, 0);
    if (sumaActual !== 100) {
      let diferenciaTotal = 100 - sumaActual;
      let indiceAjuste = beneficiarios.findIndex((_, i) => i !== indexModificado);
      if (indiceAjuste !== -1) {
        beneficiarios[indiceAjuste].porcentaje += diferenciaTotal;
      }
    }

    renderBeneficiarios();
  };

  btnToggleEdit.addEventListener('click', async () => {
    if (!modoEdicion) {
      modoEdicion = true;
      btnToggleEdit.textContent = 'Guardar Cambios';
      btnToggleEdit.className = 'btn btn-success text-white';
      renderBeneficiarios();
    } else {
      for (let i = 0; i < beneficiarios.length; i++) {
        let b = beneficiarios[i];
        if (!b.nDoc || !b.doc || !b.nombre || !b.parentesco || !b.fechaNacimiento || !b.telefono1 || !b.email) {
          mostrarAlertaBootstrap(`Por favor, complete todos los campos obligatorios del Beneficiario ${i + 1} antes de guardar.`, 'danger');
          return;
        }
      }

      let sumaTotal = beneficiarios.reduce((acc, b) => acc + b.porcentaje, 0);
      if (sumaTotal !== 100) {
        mostrarAlertaBootstrap(`La suma de los porcentajes es ${sumaTotal}%. Debe sumar exactamente 100%.`, 'danger');
        return;
      }

      try {
        for (const beneficiario of beneficiarios) {
          const original = beneficiariosOriginales.find(item => item.id === beneficiario.id);
          if (!original) {
            const response = await fetch('/api/ahorro/insertar_beneficiario', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                usuario: usuarioActual,
                beneficiario: {
                  cuentaAsociada: numCuenta,
                  valorDoc: beneficiario.doc,
                  parentesco: String(beneficiario.parentesco),
                  porcentaje: Number(beneficiario.porcentaje)
                }
              })
            });

            const data = await response.json();
            if (!response.ok || data.success === false) {
              throw new Error(data.message || data.error || 'No se pudo insertar el beneficiario');
            }
            continue;
          }

          const fechaNacimiento = beneficiario.fechaNacimiento.replace(/\//g, '-');
          const beneficiarioPayload = {
            anterior: {
              valorDoc: original.doc
            },
            nuevo: {
              valorDoc: beneficiario.doc,
              nombreBeneficiario: beneficiario.nombre,
              parentesco: String(beneficiario.parentesco),
              porcentaje: Number(beneficiario.porcentaje),
              fechaNacimiento,
              tipoDoc: String(beneficiario.nDoc),
              email: beneficiario.email,
              telefono1: beneficiario.telefono1,
              telefono2: beneficiario.telefono2,
              cuentaAsociada: numCuenta
            }
          };

          const documentoCambio = original.doc !== beneficiario.doc;
          const ruta = documentoCambio
            ? '/api/ahorro/editar_beneficiario_DocuDiferente'
            : '/api/ahorro/editar_beneficiario_DocuIgual';

          const response = await fetch(ruta, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              usuario: usuarioActual,
              beneficiario: beneficiarioPayload
            })
          });

          const data = await response.json();
          if (!response.ok || data.success === false) {
            throw new Error(data.message || data.error || 'No se pudo actualizar el beneficiario');
          }
        }

        mostrarAlertaBootstrap('¡Beneficiarios actualizados con éxito!', 'success');
        modoEdicion = false;
        btnToggleEdit.textContent = 'Editar Beneficiarios';
        btnToggleEdit.className = 'btn btn-secondary text-white';
        await recibirBeneficiariosAPI();
      } catch (error) {
        console.error('Error al actualizar beneficiarios:', error);
        mostrarAlertaBootstrap(error.message, 'danger');
      }
    }
  });

  window.agregarBeneficiario = function(index) {
    if (beneficiarios.length >= 3) return;

    modoEdicion = true;
    btnToggleEdit.textContent = 'Guardar Cambios';
    btnToggleEdit.className = 'btn btn-success text-white';

    let nuevoPorcentaje = Math.floor(100 / (beneficiarios.length + 1));
    beneficiarios.forEach(b => b.porcentaje = nuevoPorcentaje);

    const nuevo = {
      id: Date.now(),
      nDoc: tiposDocumento.length > 0
        ? (tiposDocumento[0].id !== undefined ? tiposDocumento[0].id : tiposDocumento[0])
        : '',
      doc: '',
      nombre: '',
      parentesco: parentescos.length > 0
        ? (parentescos[0].id !== undefined ? parentescos[0].id : parentescos[0])
        : '',
      fechaNacimiento: '',
      telefono1: '',
      telefono2: '',
      email: '',
      porcentaje: 100 - (nuevoPorcentaje * beneficiarios.length)
    };

    beneficiarios.splice(index, 0, nuevo);
    renderBeneficiarios();
  };

  window.eliminarBeneficiario = async function(index) {
    if (beneficiarios.length <= 1) {
      mostrarAlertaBootstrap('Debe haber al menos un beneficiario.', 'warning');
      return;
    }

    const confirmar = await confirmarAccionBootstrap({
      titulo: 'Eliminar beneficiario',
      mensaje: '¿Quieres eliminar este beneficiario?',
      textoConfirmar: 'Eliminar',
      textoCancelar: 'Cancelar',
      tipoConfirmar: 'danger'
    });
    if (confirmar) {
      const eliminado = await eliminarBeneficiarioAPI(beneficiarios[index].doc);
      if (eliminado) {
        beneficiarios.splice(index, 1);
        if (beneficiarios.length === 1) {
          beneficiarios[0].porcentaje = 100;
        } else {
          let resto = Math.round(100 / beneficiarios.length);
          beneficiarios.forEach(b => b.porcentaje = resto);
          beneficiarios[0].porcentaje += (100 - (resto * beneficiarios.length));
        }
        renderBeneficiarios();
      }
    }
  };

  window.actualizarDatoBeneficiario = function(index, campo, valor) {
    beneficiarios[index][campo] = valor;
  };

  window.buscarDatosBeneficiario = async function(index, valorDocuIdentidad) {
    const cedula = String(valorDocuIdentidad || '').trim();
    beneficiarios[index].doc = cedula;

    if (!cedula) {
      return;
    }

    try {
      const response = await fetch('/api/ahorro/buscar_persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valorDocuIdentidad: cedula })
      });
      const data = await response.json();

      if (!response.ok || !data.success || !data.persona) {
        return;
      }

      const persona = data.persona;
      beneficiarios[index].nDoc = persona.tipoDocuIdentidad;
      beneficiarios[index].nombre = persona.nombre || '';
      beneficiarios[index].fechaNacimiento = persona.fechaNacimiento
        ? String(persona.fechaNacimiento).slice(0, 10)
        : '';
      beneficiarios[index].email = persona.email || '';
      beneficiarios[index].telefono1 = persona.telefono1 || '';
      beneficiarios[index].telefono2 = persona.telefono2 || '';

      renderBeneficiarios();
    } catch (error) {
      console.error('Error buscando datos del beneficiario:', error);
    }
  };


  // 6. SALIR Y CERRAR SESIÓN
  const salirBtn = document.getElementById('salir');
  salirBtn.addEventListener('click', () => {
    fetch('/api/ahorro/salir', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ usuario: usuarioActual })
    }).finally(() => {
      window.location.href = '../login/login.html';
    });
  });

});

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