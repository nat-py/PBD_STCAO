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

  //variable temporal para saber si ya se cargó un catálogo, para que no se pueda cargar un no catálogo antes de cargar un catálogo
  let catalogoCargado = false;

  function validarYProcesarArchivo(file) {
    if (file.type === "text/xml" || file.name.endsWith(".xml")) {
      validarCatalogoYNoCatalogo(file);
      fileInfo.innerText = `Archivo: ${file.name}, listo para ser procesado`;
    } else {
      alert("Por favor, seleccione únicamente un archivo en formato XML.");
      fileInput.value = "";
    }
  }
  
  async function validarCatalogoYNoCatalogo(file) {
    const formData = new FormData();
    formData.append('archivoXml', file);
/* 
    try {
      const respuesta = await fetch('/api/carga/catalogos', {
        method: 'POST',
        body: formData
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        alert(resultado.message);
        return;
      }

      console.log("¡Éxito!", resultado.message);
      alert("Archivo procesado y guardado correctamente.");

    } catch (error) {
      console.error("Error al enviar el archivo:", error);
    }
 */  }

});