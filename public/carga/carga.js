document.addEventListener("DOMContentLoaded", () => {

  // 1. IMPORTAR XML (DRAG & DROP Y EXPLORADOR)
  const dropZone = document.getElementById("dropZoneXml");
  const fileInput = document.getElementById("fileInputXml");
  const fileInfo = document.getElementById("fileInfo");

  dropZone.addEventListener("click", () => fileInput.click());

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    if (e.dataTransfer.files.length > 0) {
      validarYProcesarArchivo(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      validarYProcesarArchivo(e.target.files[0]);
    }
  });

  function validarYProcesarArchivo(file) {
    if (file.type === "text/xml" || file.name.endsWith(".xml")) {
      fileInfo.innerText = `Archivo: ${file.name}, listo para ser procesado`;
      validarCatalogoYNoCatalogo(file);
    } else {
      // Reemplazo de alert por Bootstrap alert
      mostrarAlertaBootstrap("Por favor, seleccione únicamente un archivo en formato XML.", "danger");
      fileInput.value = "";
    }
  }
  
  async function validarCatalogoYNoCatalogo(file) {
    const reader = new FileReader();

    reader.onload = async function (e) {
      const contenidoXML = e.target.result;
      
      try {
          const respuesta = await fetch('/api/carga/catalogos', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ xmlData: contenidoXML })
          });
          const resultado = await respuesta.json();
          if (!respuesta.ok) {
              // Reemplazo de alert por Bootstrap alert
              mostrarAlertaBootstrap(resultado.message, "danger");
              return;
          }
          
          // Reemplazo de alert por Bootstrap alert (éxito)
          mostrarAlertaBootstrap("Archivo procesado correctamente.", "success");

          // Mandar a login tras un breve momento para que se alcance a ver la alerta
          setTimeout(() => {
              window.location.href = "/login/login.html";
          }, 1500);

      } catch (error) {
          console.error("Error:", error);
          mostrarAlertaBootstrap("Ocurrió un error al procesar la solicitud.", "danger");
      }
    };
    reader.readAsText(file);
  }

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

  // Auto-cerrar la alerta después de 4 segundos
  setTimeout(() => {
    alertDiv.classList.remove("show");
    setTimeout(() => alertDiv.remove(), 300);
  }, 4000);
}