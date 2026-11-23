(function () {
  'use strict';

  function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = String(value ?? '');
    return div.innerHTML;
  }

  window.mostrarAlertaBootstrap = function (mensaje, tipo = 'success', duracion = 4000) {
    let container = document.getElementById('bootstrap-alert-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'bootstrap-alert-container';
      container.style.cssText =
        'position: fixed; bottom: 20px; right: 20px; z-index: 1080; min-width: 300px; max-width: 420px;';
      document.body.appendChild(container);
    }

    const tiposValidos = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
    const tipoSeguro = tiposValidos.includes(tipo) ? tipo : 'info';
    const iconos = {
      success: 'bi-check-circle-fill',
      danger: 'bi-exclamation-triangle-fill',
      warning: 'bi-exclamation-circle-fill',
      info: 'bi-info-circle-fill',
      primary: 'bi-info-circle-fill',
      secondary: 'bi-info-circle-fill',
      light: 'bi-info-circle-fill',
      dark: 'bi-info-circle-fill'
    };

    const alert = document.createElement('div');
    alert.className = `alert alert-${tipoSeguro} alert-dismissible fade show shadow-lg`;
    alert.setAttribute('role', 'alert');
    alert.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="bi ${iconos[tipoSeguro]} fs-5 me-2"></i>
        <div>${escapeHtml(mensaje)}</div>
      </div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    `;

    container.appendChild(alert);
    window.setTimeout(() => {
      alert.classList.remove('show');
      window.setTimeout(() => alert.remove(), 300);
    }, duracion);
  };

  window.confirmarAccionBootstrap = function ({
    titulo = 'Confirmar acción',
    mensaje = '¿Está seguro de continuar?',
    textoConfirmar = 'Confirmar',
    textoCancelar = 'Cancelar',
    tipoConfirmar = 'danger'
  } = {}) {
    return new Promise((resolve) => {
      const modalId = `bootstrap-confirm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const modal = document.createElement('div');
      modal.className = 'modal fade';
      modal.id = modalId;
      modal.tabIndex = -1;
      modal.setAttribute('aria-hidden', 'true');
      modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${escapeHtml(titulo)}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">${escapeHtml(mensaje)}</div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-confirmar="false">${escapeHtml(textoCancelar)}</button>
              <button type="button" class="btn btn-${tipoConfirmar}" data-confirmar="true">${escapeHtml(textoConfirmar)}</button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      let resuelto = false;

      const finalizar = (confirmado) => {
        if (resuelto) return;
        resuelto = true;
        resolve(confirmado);
      };

      modal.querySelectorAll('[data-confirmar]').forEach((button) => {
        button.addEventListener('click', () => {
          finalizar(button.getAttribute('data-confirmar') === 'true');
          bootstrap.Modal.getInstance(modal)?.hide();
        });
      });

      modal.addEventListener('hidden.bs.modal', () => {
        finalizar(false);
        modal.remove();
      }, { once: true });

      const instancia = new bootstrap.Modal(modal, {
        backdrop: 'static',
        keyboard: true
      });
      instancia.show();
    });
  };
})();
