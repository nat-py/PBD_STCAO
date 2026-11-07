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
        parentescos = dataParentescos.parentescos; // Ajusta según la propiedad que devuelva tu BD (ej. descripcion o nombre)
      }
      if (dataTiposDoc.success) {
        tiposDocumento = dataTiposDoc.tiposDocumento; // Ajusta según la propiedad que devuelva tu BD
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

  //seguimiento de estado de cuenta
  async function registrarEstado() {
    try {
      const response = await fetch('/api/ahorro/registrar_estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: usuarioActual})
      });
    } catch (error) {
      console.error('Error al obtener la bitácora de estados de cuenta:', error);
    }
  }

  let beneficiarios = [];
  let beneficiariosOriginales = [];

  // Obtener beneficiarios
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


  // eliminar beneficiario
  async function eliminarBeneficiarioAPI(valorDocuIdentidad) {
    try {
      const response = await fetch(`/api/ahorro/eliminar_beneficiario?valorDocuIdentidad=${encodeURIComponent(valorDocuIdentidad)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: usuarioActual })
      });
      const data = await response.json();
      if (data.success) {
        alert('Beneficiario eliminado correctamente.');
        recibirBeneficiariosAPI();
      } else {
        alert('Error al eliminar beneficiario: ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error al eliminar beneficiario:', error);
      alert('Error al eliminar beneficiario. Por favor, inténtelo de nuevo.');
    }
  }

  // Lógica de Beneficiarios Dinámicos
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
        // Vista Normal

        //obtener el nombre del parentesco y tipo de documento usando su ID
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
        // Vista Editable con Selects dinámicos para Tipos de Documento y Parentescos
        const esUnico = beneficiarios.length === 1;

        // Construir opciones de Tipos de Documento usando su ID como value
        let opcionesTiposDoc = tiposDocumento.map(t => {
          let idTipo = t.id !== undefined ? t.id : t; 
          let nombreTipo = t.nombre;
          let seleccionado = (String(b.nDoc) === String(idTipo)) ? 'selected' : '';
          return `<option value="${idTipo}" ${seleccionado}>${nombreTipo}</option>`;
        }).join('');

        // Construir opciones de Parentescos usando su ID como value
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                    <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
                  </svg>
                </button>` : ''}
            </div>
            
            <div class="mb-2">
              <label class="form-label small fw-bold">Tipo Documento:</label>
              <select class="form-select form-select-sm" onchange="actualizarDato(${index}, 'nDoc', this.value)">
                ${opcionesTiposDoc}
              </select>
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Número Documento:</label>
              <input type="text" class="form-control form-control-sm" value="${b.doc}" onchange="actualizarDato(${index}, 'doc', this.value)">
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Nombre:</label>
              <input type="text" class="form-control form-control-sm" value="${b.nombre}" onchange="actualizarDato(${index}, 'nombre', this.value)">
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Parentesco:</label>
              <select class="form-select form-select-sm" onchange="actualizarDato(${index}, 'parentesco', this.value)">
                ${opcionesParentescos}
              </select>
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Fecha Nacimiento:</label>
              <input type="date" class="form-control form-control-sm" value="${b.fechaNacimiento.replace(/\//g, '-')}" onchange="actualizarDato(${index}, 'fechaNacimiento', this.value)">
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Teléfono 1:</label>
              <input type="text" class="form-control form-control-sm" value="${b.telefono1}" onchange="actualizarDato(${index}, 'telefono1', this.value)">
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Teléfono 2:</label>
              <input type="text" class="form-control form-control-sm" value="${b.telefono2}" onchange="actualizarDato(${index}, 'telefono2', this.value)">
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Email:</label>
              <input type="email" class="form-control form-control-sm" value="${b.email}" onchange="actualizarDato(${index}, 'email', this.value)">
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

  // Lógica de distribución proporcional con enteros exactos
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

    // Ajuste final para asegurar que la suma dé 100 exacto tras el redondeo entero
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

  // Botón para alternar modo edición y validar al guardar
  btnToggleEdit.addEventListener('click', async () => {
    if (!modoEdicion) {
      // estado anterior 
      
      modoEdicion = true;
      btnToggleEdit.textContent = 'Guardar Cambios';
      btnToggleEdit.className = 'btn btn-success text-white';
      renderBeneficiarios();

    } else {

      // no salir si hay campos vacíos
      for (let i = 0; i < beneficiarios.length; i++) {
        let b = beneficiarios[i];
        if (!b.nDoc || !b.doc || !b.nombre || !b.parentesco || !b.fechaNacimiento || !b.telefono1 || !b.email) {
          alert(`Por favor, complete todos los campos obligatorios del Beneficiario ${i + 1} antes de guardar.`);
          return; 
        }
      }

      // validación de porcentajes (Exactamente 100%)
      let sumaTotal = beneficiarios.reduce((acc, b) => acc + b.porcentaje, 0);
      if (sumaTotal < 100) {
        alert(`La suma de los porcentajes es ${sumaTotal}%. Debe sumar exactamente 100% para poder guardar.`);
        return; 
      }
      if (sumaTotal > 100) {
        alert(`La suma de los porcentajes supera el 100% (${sumaTotal}%). Por favor, ajústelo.`);
        return;
      }

      let nuevosBeneficiarios = [];
      let beneficiariosEditados = [];
      
      // revisar si es original, revisa primero si ya existe, despues compara si hay cambios
      beneficiarios.forEach(actual => {
        let original = beneficiariosOriginales.find(orig => orig.doc === actual.doc );
        
        let parentescoID = 0;
        let tipoDocID = 0;

        if (!original) {

          parentescos.forEach(p => {
            if (p.id === actual.parentesco) {
              parentescoID = p.id;
            }
          });

          tiposDocumento.forEach(t => {
            if (t.nombre === actual.nDoc) {
              tipoDocID = t.id;
            }
          });

          nuevosBeneficiarios.push({
            nombreBeneficiario: actual.nombre,
            tipoDoc: tipoDocID,
            valorDoc: actual.doc,
            parentesco: parentescoID,
            fechaNacimiento: actual.fechaNacimiento,
            telefono1: actual.telefono1,
            telefono2: actual.telefono2,
            email: actual.email,
            porcentaje: actual.porcentaje,
            cuentaAsociada: numCuenta
          });
        } else {
          let haCambiado = 
            original.nombre !== actual.nombre ||
            original.nDoc !== actual.nDoc ||
            original.doc !== actual.doc ||
            original.parentesco !== actual.parentesco ||
            original.fechaNacimiento !== actual.fechaNacimiento ||
            original.telefono1 !== actual.telefono1 ||
            original.telefono2 !== actual.telefono2 ||
            original.email !== actual.email ||
            original.porcentaje !== actual.porcentaje;

          if (haCambiado) {
            beneficiariosEditados.push({
              old: {
                nombreBeneficiario: original.nombre,
                tipoDoc: original.nDoc,
                valorDoc: original.doc,
                parentesco: original.parentesco,
                fechaNacimiento: original.fechaNacimiento,
                telefono1: original.telefono1,
                telefono2: original.telefono2,
                email: original.email,
                porcentaje: original.porcentaje,
                cuentaAsociada: numCuenta
              },
              new: {
                nombreBeneficiario: actual.nombre,
                tipoDoc: actual.nDoc,
                valorDoc: actual.doc,
                parentesco: actual.parentesco,
                fechaNacimiento: actual.fechaNacimiento,
                telefono1: actual.telefono1,
                telefono2: actual.telefono2,
                email: actual.email,
                porcentaje: actual.porcentaje,
                cuentaAsociada: numCuenta
              }
            });
          }
        }
      });


      // aqui a backend
      for (let i = 0; i < nuevosBeneficiarios.length; i++) {
        try {
          const response = await fetch('/api/ahorro/insertar_beneficiario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ beneficiario: nuevosBeneficiarios[i], usuario: usuarioActual })
          });
          const data = await response.json();
          if (!data.success) {
            alert(`Error al insertar beneficiario: ${data.error || 'Error desconocido'}`);
          }
        } catch (error) {
          console.error('Error al insertar beneficiario:', error);
        }
      }

      for (let i = 0; i < beneficiariosEditados.length; i++) {
        try {
          let response = '';
          if (beneficiariosEditados[i].old.valorDoc !== beneficiariosEditados[i].new.valorDoc) {
            response = await fetch('/api/ahorro/editar_beneficiario_DocuDiferente', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ beneficiario: beneficiariosEditados[i], usuario: usuarioActual })
            });
          } else {
            response = await fetch('/api/ahorro/editar_beneficiario_DocuIgual', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ beneficiario: beneficiariosEditados[i], usuario: usuarioActual })
            });
          }
          const data = await response.json();
          if (!data.success) {
            alert(`Error al editar beneficiario: ${data.error || 'Error desconocido'}`);
          }
        } catch (error) {
          console.error('Error al editar beneficiario:', error);
        }
      }

      alert('¡Cambios validados y procesados con éxito!');

      modoEdicion = false;
      btnToggleEdit.textContent = 'Editar Beneficiarios';
      btnToggleEdit.className = 'btn btn-secondary text-white';
      renderBeneficiarios();

    }
  });
  
  // Funciones globales auxiliares
  window.agregarBeneficiario = function(index) {
    if (beneficiarios.length >= 3) return;
    
    // 1. Forzar que la pantalla pase a Modo Edición automáticamente
    modoEdicion = true;
    btnToggleEdit.textContent = 'Guardar Cambios';
    btnToggleEdit.className = 'btn btn-success text-white';

    // 2. Repartir porcentajes equitativamente de forma entera
    let nuevoPorcentaje = Math.floor(100 / (beneficiarios.length + 1));
    beneficiarios.forEach(b => b.porcentaje = nuevoPorcentaje);

    // 3. Crear el objeto con TODOS los campos en blanco
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
      porcentaje: 100 - (nuevoPorcentaje * beneficiarios.length) // El sobrante para redondear a 100
    };
    
    beneficiarios.splice(index, 0, nuevo);
    renderBeneficiarios();
  };

  window.eliminarBeneficiario = function(index) {
    if (beneficiarios.length <= 1) {
      alert('Debe haber al menos un beneficiario.');
      return;
    }

    if (confirm('¿Quieres eliminar este beneficiario?')) {
      if (eliminarBeneficiarioAPI(beneficiarios[index].doc)) {

        beneficiarios.splice(index, 1);
      
        if (beneficiarios.length === 1) {
          beneficiarios[0].porcentaje = 100;
        } else {
          let resto = Math.round(100 / beneficiarios.length);
          beneficiarios.forEach(b => b.porcentaje = resto);
          beneficiarios[0].porcentaje += (100 - (resto * beneficiarios.length)); // Ajuste entero de residuo
        }
        
        renderBeneficiarios();
      }
    }
  };

    // salir
  const salirBtn = document.getElementById('salir');
  salirBtn.addEventListener('click', () => {
    window.location.href = '../login/login.html';
    
    fetch('/api/ahorro/salir', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ usuario: usuarioActual })
    });

  });

  window.actualizarDato = function(index, campo, valor) {
    beneficiarios[index][campo] = valor;
  };
});