const { sql, poolPromise } = require('../config/conexionBD');
const fs = require('fs');

async function procesarSubidaXml(fileTempPath) {
  let contenidoXML = fs.readFileSync(fileTempPath, 'utf-8');

  
  const catalogoYaExisteEnBD = await tuBaseDeDatos.verificarCatalogo(); 



  if (contenidoXML.includes("<Catalogos>")) {
    const catalogos = procesarCatalogosXML(contenidoXML);
    
    
    return { success: true, message: "Catálogo procesado y guardado con éxito" };
  } 
  if (contenidoXML.includes("<NoCatalogos>")) {
    if (!catalogoYaExisteEnBD) {
      // Al lanzar este error, el controlador lo atrapa arriba
      throw new Error("Primero debe cargar un archivo de catálogo antes de cargar un no catálogo.");
    }

    return { success: true, message: "No catálogo procesado y guardado con éxito" };
  }

  throw new Error("El archivo cargado no tiene la estructura esperada.");
}


function procesarCatalogosXML(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  const resultado = {};

  const categorias = xmlDoc.documentElement.children;

  for (let categoria of categorias) {
    const nombreCategoria = categoria.nodeName;
    const elementos = categoria.children;
    const listaElementos = [];

    for (let el of elementos) {
        const id = el.getAttribute("Id") || el.getAttribute("id");
        const nombre = el.getAttribute("Nombre") || el.getAttribute("nombre");
        listaElementos.push([id, nombre]);
    }

    resultado[nombreCategoria] = listaElementos;
  }
  return resultado;
}

function procesarNoCatalogosXML(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const resultado = {};

    const secciones = xmlDoc.documentElement.children;
    for (let seccion of secciones) {
        const nombreSeccion = seccion.nodeName;
        const elementos = seccion.children;
        const listaElementos = [];

        for (let el of elementos) {
            const atributos = {};
            for (let attr of el.attributes) {
                atributos[attr.name] = attr.value;
            }
            listaElementos.push(atributos);
        }

        resultado[nombreSeccion] = listaElementos;
    }

    return resultado;
}






module.exports = { procesarSubidaXml };