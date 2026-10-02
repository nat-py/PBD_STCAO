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

  // 2. Lógica de Beneficiarios Dinámicos (Plantilla de hasta 3 beneficiarios)
  let modoEdicion = false;
  
  // Datos base iniciales (2 beneficiarios)
  let beneficiarios = [
    {
      id: 1,
      nombre: 'Paco Pacal',
      parentesco: 'Hermano',
      fechaNacimiento: '2006-08-07',
      telefono1: '88888888',
      telefono2: '70707070',
      email: 'paco@gmail.com',
      porcentaje: 60
    },
    {
      id: 2,
      nombre: 'Maria Pacal',
      parentesco: 'Madre',
      fechaNacimiento: '1980-05-12',
      telefono1: '81111111',
      telefono2: '72222222',
      email: 'maria@gmail.com',
      porcentaje: 40
    }
  ];

  const container = document.getElementById('beneficiarios-container');
  const btnToggleEdit = document.getElementById('btn-toggle-edit');

  function renderBeneficiarios() {
    container.innerHTML = '';

    beneficiarios.forEach((b, index) => {
      const col = document.createElement('div');
      col.className = 'col-md-4 position-relative';

      // Botones de inserción lateral si el límite es menor a 3
      let botonesLateralesHTML = '';
      if (beneficiarios.length < 3) {
        if (index === 0) {
          botonesLateralesHTML += `<button class="btn btn-outline position-absolute top-50 shadow-sm" style="z-index:5; left: -50px;" title="Agregar a la izquierda" onclick="agregarBeneficiario(${index})"> <i class="bi bi-person-plus"></i></button>`;
        }
        if (index === beneficiarios.length - 1) {
          botonesLateralesHTML += `<button class="btn btn-outline position-absolute top-50 shadow-sm" style="z-index:5; right: -50px;" title="Agregar a la derecha" onclick="agregarBeneficiario(${index + 1})"> <i class="bi bi-person-plus"></i></button>`;
        }
      }

      if (!modoEdicion) {
        // Vista Normal (Slider disabled)
        col.innerHTML = `
          ${botonesLateralesHTML}
          <div class="card shadow-sm p-3 border-0 h-100">
            <h5 class="text-secondary fw-bold mb-3">Beneficiario ${index + 1}</h5>
            <p class="mb-1"><strong>Nombre:</strong> ${b.nombre}</p>
            <p class="mb-1"><strong>Parentesco:</strong> ${b.parentesco}</p>
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
        // Vista Editable (Inputs, selector, email, barra habilitada y basurero de eliminar)
        col.innerHTML = `
          ${botonesLateralesHTML}
          <div class="card shadow-sm p-3 border-primary h-100 position-relative">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="text-primary fw-bold m-0">Beneficiario ${index + 1}</h5>
              <button class="btn btn-outline-danger btn-sm border-0" onclick="eliminarBeneficiario(${index})" title="Eliminar beneficiario">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                  <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
                </svg>
              </button>
            </div>
            
            <div class="mb-2">
              <label class="form-label small fw-bold">Nombre:</label>
              <input type="text" class="form-control form-control-sm" value="${b.nombre}" onchange="actualizarDato(${index}, 'nombre', this.value)">
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Parentesco:</label>
              <select class="form-select form-select-sm" onchange="actualizarDato(${index}, 'parentesco', this.value)">
                <option value="Hermano" ${b.parentesco === 'Hermano' ? 'selected' : ''}>Hermano</option>
                <option value="Madre" ${b.parentesco === 'Madre' ? 'selected' : ''}>Madre</option>
                <option value="Padre" ${b.parentesco === 'Padre' ? 'selected' : ''}>Padre</option>
                <option value="Cónyuge" ${b.parentesco === 'Cónyuge' ? 'selected' : ''}>Cónyuge</option>
                <option value="Hijo/a" ${b.parentesco === 'Hijo/a' ? 'selected' : ''}>Hijo/a</option>
              </select>
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Fecha Nacimiento:</label>
              <input type="date" class="form-control form-control-sm" value="${b.fechaNacimiento}" onchange="actualizarDato(${index}, 'fechaNacimiento', this.value)">
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
              <input type="range" class="form-range" min="0" max="100" value="${b.porcentaje}" oninput="document.getElementById('val-range-${index}').innerText = this.value + '%'" onchange="actualizarDato(${index}, 'porcentaje', this.value)">
            </div>
          </div>
        `;
      }

      container.appendChild(col);
    });
  }

  // Botón para alternar modo edición
  btnToggleEdit.addEventListener('click', () => {
    modoEdicion = !modoEdicion;
    btnToggleEdit.textContent = modoEdicion ? 'Guardar Cambios' : 'Editar Beneficiarios';
    btnToggleEdit.className = modoEdicion ? 'btn btn-success text-white' : 'btn btn-secondary text-white';
    renderBeneficiarios();
  });

  // Funciones globales auxiliares para interactuar con la plantilla
  window.agregarBeneficiario = function(index) {
    if (beneficiarios.length >= 3) return;
    const nuevo = {
      id: Date.now(),
      nombre: 'Nuevo Beneficiario',
      parentesco: 'Hermano',
      fechaNacimiento: '2010-01-01',
      telefono1: '00000000',
      telefono2: '00000000',
      email: 'correo@gmail.com',
      porcentaje: 0
    };
    beneficiarios.splice(index, 0, nuevo);
    renderBeneficiarios();
  };

  window.eliminarBeneficiario = function(index) {
    if (confirm('¿Quieres eliminar este beneficiario?')) {
      beneficiarios.splice(index, 1);
      renderBeneficiarios();
    }
  };

  window.actualizarDato = function(index, campo, valor) {
    beneficiarios[index][campo] = valor;
  };

  // Render inicial
  renderBeneficiarios();
});