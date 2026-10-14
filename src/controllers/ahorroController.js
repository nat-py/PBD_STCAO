const ahorroService = require('../services/ahorroService');

async function top8_EstadoCuenta_AsociadoCuenta(req, res) {
    const { numCuenta } = req.body;

  try {
    const estadosCuenta = await ahorroService.top8_EstadoCuenta_AsociadoCuenta(numCuenta);
    res.status(200).json({ message: 'Cuentas listadas correctamente', cuentas: estadosCuenta, success: true });
  } catch (error) {
    console.error('Error al obtener el top 8 del estado de cuenta:', error);
    res.status(500).json({ error: 'Error al obtener el top 8 del estado de cuenta' });
  }
}

async function beneficiariosAsociadosCuenta(req, res) {
  console.log('Número de cuenta recibido en el controlador:', numCuenta);
}

async function eliminarBeneficiario(req, res) {
  const valorDocuIdentidad = req.query.valorDocuIdentidad;
  console.log('Valor de documento de identidad recibido en el controlador:', valorDocuIdentidad); 
}

module.exports = { top8_EstadoCuenta_AsociadoCuenta, beneficiariosAsociadosCuenta, eliminarBeneficiario };