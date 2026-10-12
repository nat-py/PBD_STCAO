const fs = require('fs');

async function procesarSubidaXml(fileTempPath) {
  let contenidoXML = fs.readFileSync(fileTempPath, 'utf-8');

  const contenidoLimpio = contenidoXML.replace(/<!--[\s\S]*?-->/g, "");

  const catalogoYaExisteEnBD = await tuBaseDeDatos.verificarCatalogo(); 


  if (contenidoLimpio.includes("<Catalogos>")) {
    return { success: true, message: "Catálogo procesado y guardado con éxito" };
  } 
  
  if (contenidoLimpio.includes("<NoCatalogos>")) {
    if (!catalogoYaExisteEnBD) {
      // Al lanzar este error, el controlador lo atrapa arriba
      throw new Error("Primero debe cargar un archivo de catálogo antes de cargar un no catálogo.");
    }

    return { success: true, message: "No catálogo procesado y guardado con éxito" };
  }

  throw new Error("El archivo cargado no tiene la estructura esperada.");
}

module.exports = { procesarSubidaXml };