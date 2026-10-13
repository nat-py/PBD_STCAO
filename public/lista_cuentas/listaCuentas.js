document.addEventListener("DOMContentLoaded", () => {
  
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const usuarioActual = urlParams.get('usuario');

  const h2 = document.getElementById('bienvenida');
  
  if (usuarioActual) {
      h2.textContent = `¡Bienvenido de nuevo, ${usuarioActual}!`;
  } else {
      h2.textContent = "No se encontró ningún usuario.";
  }

  console.log("Usuario actual:", usuarioActual);

});