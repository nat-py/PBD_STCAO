document.addEventListener("DOMContentLoaded", () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const usuarioActual = urlParams.get('usuario');

  const h2 = document.getElementById('bienvenida');
  const usuarioHeader = document.getElementById('usuarioHeader');
  
  if (usuarioActual) {
    h2.textContent = `¡Bienvenido de nuevo, ${usuarioActual}!`;
    usuarioHeader.textContent = usuarioActual;
    recibirCuentas();
  } else {
    h2.textContent = "No se encontró ningún usuario.";
    usuarioHeader.textContent = "Usuario no encontrado";
  }

  async function recibirCuentas() {
    try {
      const response = await fetch('/api/lista_cuentas/lista_cuentas', {
        method: 'POST', // post es cuando
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ usuario: usuarioActual })
      });
      const data = await response.json();
      
      if (data.success) {
        
        const tbody = document.querySelector('table tbody');
        tbody.innerHTML = '';

        data.cuentas.forEach((cuenta, index) => {
          const tr = document.createElement('tr');
          
          tr.style.cursor = 'pointer'; 

          tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${cuenta.numCuenta}</td>
            <td>${cuenta.nombreTipoCuenta}</td>
            <td>${cuenta.nombreDueno}</td>
            <td>${cuenta.saldo}</td>
          `;

          tr.addEventListener('click', () => {
            window.location.href = `/dashboardAhorro/dashboardAhorro.html?numCuenta=${cuenta.numCuenta}&usuario=${usuarioActual}`;
          });
          
          tbody.appendChild(tr);
        });
      }
    } catch (error) {
      console.error('Error al recibir cuentas:', error);
    }
  }
});