document.addEventListener("DOMContentLoaded", () => {
  const btnLecturaDatos = document.getElementById("btn-lectura-datos");
  const btnProcesoOperaciones = document.getElementById("btn-proceso-operaciones-inicial");
  let lecturaCompleta = false;

  btnLecturaDatos.addEventListener("click", async () => {
    btnLecturaDatos.disabled = true;
    const textoOriginal = btnLecturaDatos.innerHTML;
    btnLecturaDatos.innerHTML = '<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span> Leyendo datos...';

    try {
      const respuesta = await fetch('/api/carga/lectura', { method: 'POST' });
      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.message || 'No se pudieron leer los datos iniciales.');
      }

      lecturaCompleta = true;
      btnProcesoOperaciones.classList.remove("d-none");
      mostrarAlertaBootstrap(resultado.message, "success");
    } catch (error) {
      console.error("Error al ejecutar la lectura inicial:", error);
      mostrarAlertaBootstrap(error.message, "danger");
    } finally {
      btnLecturaDatos.disabled = lecturaCompleta;
      btnLecturaDatos.innerHTML = textoOriginal;
    }
  });

  btnProcesoOperaciones.addEventListener("click", async () => {
    btnProcesoOperaciones.disabled = true;
    const textoOriginal = btnProcesoOperaciones.innerHTML;
    btnProcesoOperaciones.innerHTML = '<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span> Procesando operaciones...';

    try {
      const respuesta = await fetch('/api/admin/procesoOperaciones', { method: 'POST' });
      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.message || 'No se pudo ejecutar el proceso de operaciones.');
      }

      const errores = [
        ["outFlagErrorInsercion", "Se produjo un error al insertar las operaciones."],
        ["outFlagErrorMovimientos", "Se produjo un error al procesar los movimientos."],
        ["outFlagErrorEstadosCuenta", "Se produjo un error al actualizar los estados de cuenta."]
      ];
      if (!resultado.resultado || typeof resultado.resultado !== "object") {
        throw new Error("La respuesta del proceso no contiene sus indicadores de resultado.");
      }

      const erroresEncontrados = errores.filter(([flag]) => {
        const valor = resultado.resultado[flag];
        if (![true, false, 0, 1].includes(valor)) {
          throw new Error(`No se recibió un valor válido para ${flag}.`);
        }
        return valor === true || valor === 1;
      });

      if (erroresEncontrados.length > 0) {
        erroresEncontrados.forEach(([, mensaje]) => mostrarAlertaBootstrap(mensaje, "danger"));
      } else {
        mostrarAlertaBootstrap("El proceso de operaciones se ejecutó correctamente.", "success");
        setTimeout(() => {
          window.location.href = "/login/login.html";
        }, 1500);
      }
    } catch (error) {
      console.error("Error al ejecutar el proceso de operaciones:", error);
      mostrarAlertaBootstrap(error.message, "danger");
    } finally {
      btnProcesoOperaciones.disabled = false;
      btnProcesoOperaciones.innerHTML = textoOriginal;
    }
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

  // Auto-cerrar la alerta después de 4 segundos
  setTimeout(() => {
    alertDiv.classList.remove("show");
    setTimeout(() => alertDiv.remove(), 300);
  }, 4000);
}