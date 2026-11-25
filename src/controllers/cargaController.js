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

async function leerDatos(req, res) {
  try {
    const outFlagError = await cargaService.leerDatos();

    if (outFlagError === true || outFlagError === 1) {
      return res.status(400).json({
        success: false,
        message: 'No se pudieron leer los datos desde el repositorio en la nube.'
      });
    }

    if (outFlagError !== false && outFlagError !== 0) {
      throw new Error('El procedimiento no devolvió un indicador de error válido.');
    }

    return res.status(200).json({
      success: true,
      message: 'Los datos iniciales se leyeron correctamente.'
    });
  } catch (error) {
    console.error('Error al ejecutar la lectura inicial de datos:', error);
    return res.status(500).json({
      success: false,
      message: 'Ocurrió un error al leer los datos iniciales.'
    });
  }
}

module.exports = { recibirXmlTexto, leerDatos };