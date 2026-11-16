(() => {
  'use strict'

  const form = document.querySelector('.needs-validation')
  const errorGeneral = document.querySelector('#errorGeneral')

  form.addEventListener('submit', async event => {
    
    if (!form.checkValidity()) {
      event.preventDefault()
      event.stopPropagation()
      return;
    }

    event.preventDefault() 

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
        // Reemplazo de alert por Bootstrap alert (éxito)
        mostrarAlertaBootstrap('¡Inicio de sesión exitoso!', 'success');

        // Breve pausa para que se alcance a ver la alerta antes de redirigir

        console.log('resultado:', resultado);
        setTimeout(() => {
          if (resultado.isAdmin) {
            window.location.href = `/dashboardAdmin/dashboardAdmin.html?usuario=${usuario}`;
          } else {
            window.location.href = `/lista_cuentas/listaCuentas.html?usuario=${usuario}`;
          }
        }, 1200);

      } else {
        errorGeneral.classList.remove('d-none');
        // Reemplazo de alert por Bootstrap alert (error)
        mostrarAlertaBootstrap('Usuario o contraseña incorrectos', 'danger');
      }
      
    } catch (error) {
      console.error('Error:', error);
      errorGeneral.classList.remove('d-none');
      mostrarAlertaBootstrap('Ocurrió un error al intentar iniciar sesión.', 'danger');
    }

  }, false)
})()

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

  // Auto-cerrar la alerta después de 4 segundos
  setTimeout(() => {
    alertDiv.classList.remove("show");
    setTimeout(() => alertDiv.remove(), 300);
  }, 4000);
}