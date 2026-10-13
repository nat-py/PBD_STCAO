const cargaService = require('../services/cargaService');

async function recibirXmlTexto(req, res) {
  try {
    const { xmlData } = req.body; // Viene del JSON.stringify del frontend

    if (!xmlData) {
      return res.status(400).json({ 
        success: false, 
        message: "No se proporcionó contenido XML." 
      });
    }

    // Procesamos el XML a diccionario mediante el servicio
    const datosDiccionario = await cargaService.xmlBD(xmlData);

    return res.status(200).json({
      success: true,
      message: "XML procesado exitosamente en diccionario",
      data: datosDiccionario
    });

  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
}
}

module.exports = { recibirXmlTexto };