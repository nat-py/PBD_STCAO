const xmlService = require('../services/cargaService');

async function subirXml(req, res) {
  try {
    // Validar si multer realmente recibió un archivo
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No se subió ningún archivo." });
    }

    // El controlador le pasa el archivo al Servicio y espera el resultado
    const resultado = await xmlService.subirXml(req.file.path);

    // Si todo salió bien, responde al cliente
    return res.status(200).json(resultado);

  } catch (error) {
    // Si el Servicio lanzó un error (ej: "Primero debe cargar un catálogo"), 
    return res.status(400).json({ success: false, message: error.message });
  }
}

module.exports = { subirXml };