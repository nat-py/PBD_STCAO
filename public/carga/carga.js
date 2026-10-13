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
      alert("Por favor, seleccione únicamente un archivo en formato XML.");
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
              alert(resultado.message);
              return;
          }
          
          alert("Archivo procesado correctamente.");
      } catch (error) {
          console.error("Error:", error);
      }
    };
    reader.readAsText(file);
  }

});