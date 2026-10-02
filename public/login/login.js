(() => {
  'use strict'

  const form = document.querySelector('.needs-validation')
  const errorGeneral = document.querySelector('#errorGeneral')

  form.addEventListener('submit', event => {
    
    if (!form.checkValidity()) {
      event.preventDefault()
      event.stopPropagation()
      form.classList.add('was-validated')
      errorGeneral.classList.add('d-none')
      return;
    }

    event.preventDefault() 

    const usuarioIngresado = document.querySelector('#username').value;
    const passwordIngresado = document.querySelector('#password').value;

    // A aquí harías tu validación real (contra una base de datos o datos fijos de prueba)
    const usuarioCorrecto = "admin";
    const passwordCorrecto = "123456";

    if (usuarioIngresado === usuarioCorrecto && passwordIngresado === passwordCorrecto) {
      errorGeneral.classList.add('d-none');
      alert('¡Inicio de sesión exitoso!');
    } else {
      
      errorGeneral.classList.remove('d-none');
    }

    form.classList.add('was-validated')
  }, false)
})()