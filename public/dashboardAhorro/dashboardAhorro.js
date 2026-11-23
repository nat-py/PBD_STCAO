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

  // 2. Recibir usuario, enviar estados de cuenta y beneficiarios
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const usuarioActual = urlParams.get('usuario');
  const numCuenta = urlParams.get('numCuenta');

  const usuarioHeader = document.getElementById('usuarioHeader');
  if (usuarioActual && numCuenta) {
    usuarioHeader.textContent = usuarioActual;
    recibirEstadosCuentaAPI();
    recibirBeneficiariosAPI();
    recibirPerfilAPI();
  } else {
    usuarioHeader.textContent = "Usuario no encontrado";
  }

  function formatearFecha(fechaStr) {
    if (!fechaStr) return '';
    return fechaStr.substring(0, 10).replace(/-/g, '/');
  }

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
          const tr = document.createElement('tr');
          tr.style.cursor = 'pointer'; 

          tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${formatearFecha(cuenta.fechaIni)}</td>
            <td>${formatearFecha(cuenta.fechaFin)}</td>
            <td>${cuenta.saldoIni}</td>
            <td>${cuenta.saldoMini}</td>
            <td>${cuenta.saldoFin}</td>
            <td>${cuenta.interesesAcumulados}</td>
            <td>${cuenta.cantidadRetiros}</td>
            <td>${cuenta.cantidadDepositos}</td>
            <td>${cuenta.cantidadSinpeEntrantes}</td>
            <td>${cuenta.cantidadSinpeSalientes}</td>
          `;
          tbody.appendChild(tr);
          tr.addEventListener('click', () => {
            registrarEstado();
            modalProceso.show();
          });
        });
      }
    } catch (error) {
      console.error('Error al recibir estados de cuenta:', error);
    }
  }

  // Seguimiento de estado de cuenta
  async function registrarEstado() {
    try {
      await fetch('/api/ahorro/registrar_estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: usuarioActual })
      });
    } catch (error) {
      console.error('Error al obtener la bitácora de estados de cuenta:', error);
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

  document.querySelectorAll('.tipo-movimiento').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      tipoMovimientoActual = item.getAttribute('data-tipo');
      configurarModalMovimiento(tipoMovimientoActual);
      modalMovimiento.show();
    });
  });

  function configurarModalMovimiento(tipo) {
    let titulo = '';
    let htmlForm = '';

    switch (tipo) {
      case 'retiro-persona':
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
    }

    modalMovimientoTitulo.textContent = titulo;
    modalMovimientoCuerpo.innerHTML = htmlForm;
  }

  btnEjecutarMovimiento.addEventListener('click', () => {
    // Aquí puedes realizar la llamada a tu API respectiva según el tipoMovimientoActual
    mostrarAlertaBootstrap(`Movimiento (${tipoMovimientoActual}) registrado con éxito.`, 'success');
    modalMovimiento.hide();
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
      container.innerHTML = `<p class="text-center text-muted">No hay beneficiarios asociados a esta cuenta.</p>`;
      return;
    }

    beneficiarios.forEach((b, index) => {
      const col = document.createElement('div');
      col.className = 'col-md-4 position-relative';

      let botonesLateralesHTML = '';
      if (beneficiarios.length < 3) {
        if (index === 0) {
          botonesLateralesHTML += `<button class="btn btn-outline position-absolute top-50 shadow-sm" style="z-index:5; left: -30px;" title="Agregar a la izquierda" onclick="agregarBeneficiario(${index})"> <i class="bi bi-person-plus"></i></button>`;
        }
        if (index === beneficiarios.length - 1) {
          botonesLateralesHTML += `<button class="btn btn-outline position-absolute top-50 shadow-sm" style="z-index:5; right: -30px;" title="Agregar a la derecha" onclick="agregarBeneficiario(${index + 1})"> <i class="bi bi-person-plus"></i></button>`;
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
      nDoc: tiposDocumento.length > 0 ? (tiposDocumento[0].nombre || tiposDocumento[0]) : '',
      doc: '',
      nombre: '',
      parentesco: parentescos.length > 0 ? (parentescos[0].nombre || parentescos[0]) : '',
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


  // ==========================================
  // 5. GESTIÓN DE MI PERFIL
  // ==========================================
  let perfilData = {
  };
  let modoEdicionPerfil = false;
  const perfilContainer = document.getElementById('perfil-info-container');
  const btnToggleEditPerfil = document.getElementById('btn-toggle-edit-perfil');

  async function recibirPerfilAPI() {
    try {
      const response = await fetch('/api/ahorro/perfil_usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: usuarioActual })
      });
      const data = await response.json();

      if (data.success && data.perfil) {
        perfilData = {
          tipoDoc: data.perfil.tipoDoc || "1",
          documento: data.perfil.documento || "",
          nombre: data.perfil.nombre || "",
          fechaNacimiento: formatearFecha(data.perfil.fechaNacimiento) || "",
          email: data.perfil.email || "",
          telefono1: data.perfil.telefono1 || "",
          telefono2: data.perfil.telefono2 || ""
        };
      } else {
        console.error(data.message || 'No se encontraron datos del perfil');
        perfilData = { tipoDoc: "", documento: "", nombre: "", fechaNacimiento: "", email: "", telefono1: "", telefono2: "" };
      }
      renderPerfil();
    } catch (error) {
      console.error('Error al recibir perfil:', error);
      renderPerfil();
    }
  }

  function renderPerfil() {
    if (!perfilContainer) return;
    perfilContainer.innerHTML = '';

    let opcionesTiposDoc = tiposDocumento.map(t => {
      let idTipo = t.id !== undefined ? t.id : t; 
      let nombreTipo = t.nombre;
      let seleccionado = (String(perfilData.tipoDoc) === String(idTipo)) ? 'selected' : '';
      return `<option value="${idTipo}" ${seleccionado}>${nombreTipo}</option>`;
    }).join('');

    if (!modoEdicionPerfil) {
      let nombreTipoDocActual = "Cédula Nacional";
      tiposDocumento.forEach(t => {
        if (String(t.id) === String(perfilData.tipoDoc)) nombreTipoDocActual = t.nombre;
      });

      perfilContainer.innerHTML = `
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted">Tipo de Documento de Identidad:</label>
          <p class="form-control-plaintext border bg-light px-3 py-2 rounded">${nombreTipoDocActual}</p>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted">Documento de Identidad:</label>
          <p class="form-control-plaintext border bg-light px-3 py-2 rounded">${perfilData.documento}</p>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted">Nombre Completo:</label>
          <p class="form-control-plaintext border bg-light px-3 py-2 rounded">${perfilData.nombre}</p>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted">Fecha de Nacimiento:</label>
          <p class="form-control-plaintext border bg-light px-3 py-2 rounded">${perfilData.fechaNacimiento}</p>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted">Correo Electrónico (Email):</label>
          <p class="form-control-plaintext border bg-light px-3 py-2 rounded">${perfilData.email}</p>
        </div>
        <div class="col-md-3">
          <label class="form-label small fw-bold text-muted">Teléfono 1:</label>
          <p class="form-control-plaintext border bg-light px-3 py-2 rounded">${perfilData.telefono1}</p>
        </div>
        <div class="col-md-3">
          <label class="form-label small fw-bold text-muted">Teléfono 2:</label>
          <p class="form-control-plaintext border bg-light px-3 py-2 rounded">${perfilData.telefono2}</p>
        </div>
      `;
    } else {
      perfilContainer.innerHTML = `
        <div class="col-md-6">
          <label class="form-label small fw-bold">Tipo de Documento de Identidad:</label>
          <select class="form-select" id="inputPerfilTipoDoc">
            ${opcionesTiposDoc}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold">Documento de Identidad:</label>
          <input type="text" class="form-control" id="inputPerfilDoc" value="${perfilData.documento}">
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold">Nombre Completo:</label>
          <input type="text" class="form-control" id="inputPerfilNombre" value="${perfilData.nombre}">
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold">Fecha de Nacimiento:</label>
          <input type="date" class="form-control" id="inputPerfilFecha" value="${perfilData.fechaNacimiento.replace(/\//g, '-')}">
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold">Correo Electrónico (Email):</label>
          <input type="email" class="form-control" id="inputPerfilEmail" value="${perfilData.email}">
        </div>
        <div class="col-md-3">
          <label class="form-label small fw-bold">Teléfono 1:</label>
          <input type="text" class="form-control" id="inputPerfilTel1" value="${perfilData.telefono1}">
        </div>
        <div class="col-md-3">
          <label class="form-label small fw-bold">Teléfono 2:</label>
          <input type="text" class="form-control" id="inputPerfilTel2" value="${perfilData.telefono2}">
        </div>
      `;
    }
  }

  btnToggleEditPerfil.addEventListener('click', async () => {
    if (!modoEdicionPerfil) {
      modoEdicionPerfil = true;
      btnToggleEditPerfil.textContent = 'Guardar Cambios';
      btnToggleEditPerfil.className = 'btn btn-success text-white';
      renderPerfil();
    } else {
      // Capturar datos editados
      perfilData.tipoDoc = document.getElementById('inputPerfilTipoDoc').value;
      perfilData.documento = document.getElementById('inputPerfilDoc').value.trim();
      perfilData.nombre = document.getElementById('inputPerfilNombre').value.trim();
      perfilData.fechaNacimiento = document.getElementById('inputPerfilFecha').value;
      perfilData.email = document.getElementById('inputPerfilEmail').value.trim();
      perfilData.telefono1 = document.getElementById('inputPerfilTel1').value.trim();
      perfilData.telefono2 = document.getElementById('inputPerfilTel2').value.trim();

      if (!perfilData.documento || !perfilData.nombre || !perfilData.email || !perfilData.telefono1) {
        mostrarAlertaBootstrap('Por favor, complete los campos obligatorios del perfil.', 'danger');
        return;
      }

      try {
        const response = await fetch('/api/ahorro/editar_perfil', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ perfil: perfilData, usuario: usuarioActual })
        });
        const data = await response.json();
        if (data && data.success === false) {
          mostrarAlertaBootstrap('Error al actualizar el perfil en el servidor.', 'danger');
          return;
        }
      } catch (error) {
        console.error('Error al guardar perfil:', error);
      }

      mostrarAlertaBootstrap('¡Perfil actualizado con éxito!', 'success');
      modoEdicionPerfil = false;
      btnToggleEditPerfil.textContent = 'Editar Perfil';
      btnToggleEditPerfil.className = 'btn btn-secondary text-white';
      renderPerfil();
    }
  });


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