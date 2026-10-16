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
        alert('¡Inicio de sesión exitoso!');

        if (resultado.isAdmin) {
          window.location.href = '/dashboardAdmin/dashboardAdmin.html';
        } else {
          window.location.href = `/lista_cuentas/listaCuentas.html?usuario=${usuario}`;
        }
      } else {
        errorGeneral.classList.remove('d-none');
        alert('Usuario o contraseña incorrectos');

      }
      
    } catch (error) {
      console.error('Error:', error);
      errorGeneral.classList.remove('d-none');
    }

  }, false)
})()