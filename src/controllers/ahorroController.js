const ahorroService = require('../services/ahorroService');
const bitacoraService = require('../services/bitacora');

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
  const { numCuenta } = req.body;

  try {
    const beneficiarios = await ahorroService.beneficiariosAsociadosCuenta(numCuenta);
    res.status(200).json({ message: 'Beneficiarios listados correctamente', beneficiarios: beneficiarios, success: true });
  } catch (error) {
    console.error('Error al obtener los beneficiarios asociados a la cuenta:', error);
    res.status(500).json({ error: 'Error al obtener los beneficiarios asociados a la cuenta' });
  }
}

async function eliminarBeneficiario(req, res) {
  const { usuario } = req.body;
  const valorDocuIdentidad = req.query.valorDocuIdentidad;
  try {
    const outFlagError = await ahorroService.eliminarBeneficiario(valorDocuIdentidad);
    bitacoraService.registrarBitacora('Eliminar beneficiario', usuario, req.ip);
    res.status(200).json({ message: 'Beneficiario eliminado correctamente', success: true });
  } catch (error) {
    console.error('Error al eliminar el beneficiario:', error);
    res.status(500).json({ error: 'Error al eliminar el beneficiario' });
  }
}

async function tablaParentescoActivo(req, res) {
  try {
    const parentescos = await ahorroService.tablaParentescoActivo();
    res.status(200).json({ message: 'Parentescos listados correctamente', parentescos: parentescos, success: true });
  } catch (error) {
    console.error('Error al obtener los parentescos activos:', error);
    res.status(500).json({ error: 'Error al obtener los parentescos activos' });
  } 
}

async function tablaTipoDocuIdentidadActivo(req, res) {
  try {
    const tiposDocumento = await ahorroService.tablaTipoDocuIdentidadActivo();
    res.status(200).json({ message: 'Tipos de documento listados correctamente', tiposDocumento: tiposDocumento, success: true });
  } catch (error) {
    console.error('Error al obtener los tipos de documento activos:', error);
    res.status(500).json({ error: 'Error al obtener los tipos de documento activos' });
  }
} 

async function registrarSalir(req, res) {
  try {
    const { usuario} = req.body;
    bitacoraService.registrarBitacora('Logout', usuario, req.ip);
    res.status(200).json({ message: 'Bitácora de estados de cuenta obtenida correctamente', success: true });
  } catch (error) {
    console.error('Error al registrar en la bitácora:', error);
  }
}

async function registrarEstado(req, res) {
  try {
    const { usuario } = req.body;
    bitacoraService.registrarBitacora('Consultar estado de cuenta', usuario, req.ip);
    res.status(200).json({ message: 'Bitácora de estados de cuenta obtenida correctamente', success: true });
  } catch (error) {
    console.error('Error al obtener la bitácora de estados de cuenta:', error);
    res.status(500).json({ error: 'Error al obtener la bitácora de estados de cuenta' });
  }
}

async function insertarBeneficiario(req, res) {
  const { usuario, beneficiario } = req.body;
  try {
    const result = await ahorroService.insertarBeneficiario(beneficiario.cuentaAsociada, beneficiario.valorDoc, beneficiario.idParentesco, beneficiario.porcentaje);
    console.log('Resultado de la inserción del beneficiario:', result);
    bitacoraService.registrarBitacora('Insertar beneficiario', usuario, req.ip);
    res.status(200).json({ message: 'Beneficiario insertado correctamente', success: true });
  } catch (error) {
    console.error('Error al insertar el beneficiario:', error);
    res.status(500).json({ error: 'Error al insertar el beneficiario' });
  }
}

module.exports = { 
  top8_EstadoCuenta_AsociadoCuenta, 
  beneficiariosAsociadosCuenta, 
  eliminarBeneficiario, 
  tablaParentescoActivo, 
  tablaTipoDocuIdentidadActivo, 
  registrarSalir,
  insertarBeneficiario,
  registrarEstado 
};