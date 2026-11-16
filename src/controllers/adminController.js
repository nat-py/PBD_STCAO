const adminService = require('../services/adminService');
const bitacoraService = require('../services/bitacora');

async function editarTipoDocuIdentidad(req, res) {
  const { usuario, tipoDocuIdentidad } = req.body;
  try {
    const result = await adminService.modificarTipoDocuIdentidad(tipoDocuIdentidad.id, 
                                                                tipoDocuIdentidad.nombre);

    if (result === true) {
        return res.status(400).json({message: 'No se pudo editar el tipo de documento de identidad',success: false});
    }
    bitacoraService.registrarBitacora('Actualizar tipo de documento de identidad', usuario, req.ip, tipoDocuIdentidad);
    res.status(200).json({ message: 'Tipo de documento de identidad editado correctamente', success: true });
  } catch (error) {
    console.error('Error al editar el tipo de documento de identidad:', error);
    res.status(500).json({ error: 'Error al editar el tipo de documento de identidad' });
  }
}

async function editarTipoMoneda(req, res) {
  const { usuario, tipoMoneda } = req.body;
  try {
    const result = await adminService.modificarTipoMoneda(tipoMoneda.id, 
                                                        tipoMoneda.nombre, 
                                                        tipoMoneda.simbolo);
    if (result === true) {
        return res.status(400).json({message: 'No se pudo editar el tipo de moneda',success: false});
    }
    bitacoraService.registrarBitacora('Actualizar tipo de moneda', usuario, req.ip, tipoMoneda);
    res.status(200).json({ message: 'Tipo de moneda editado correctamente', success: true });
  } catch (error) {
    console.error('Error al editar el tipo de moneda:', error);
    res.status(500).json({ error: 'Error al editar el tipo de moneda' });
  }
}

async function editarParentesco(req, res) {
  const { usuario, parentesco } = req.body;
  try {
    const result = await adminService.modificarParentesco(parentesco.id, 
                                                        parentesco.nombre);
                                                        
    if (result === true) {
        return res.status(400).json({message: 'No se pudo editar el parentesco',success: false});
    }
    bitacoraService.registrarBitacora('Actualizar parentesco', usuario, req.ip, parentesco);
    res.status(200).json({ message: 'Parentesco editado correctamente', success: true });
  } catch (error) {
    console.error('Error al editar parentesco:', error);
    res.status(500).json({ error: 'Error al editar parentesco' });
  }
}

async function eliminarTipoDocuIdentidad(req, res) {
  const { usuario, tipoDocuIdentidad } = req.body;
  try {
    const result = await adminService.eliminarTipoDocuIdentidad(tipoDocuIdentidad.id);
    console.log('Personas recibidas:', result.personas);
    if (result.outFlagError === true) {
        return res.status(400).json({message: 'No se pudo eliminar el tipo de documento de identidad',success: false});
    }
    bitacoraService.registrarBitacora('Eliminar tipo de documento de identidad', usuario, req.ip, tipoDocuIdentidad);
    res.status(200).json({ message: 'Tipo de documento de identidad eliminado correctamente', success: true, personas: result.personas });
  } catch (error) {
    console.error('Error al eliminar el tipo de documento de identidad:', error);
    res.status(500).json({ error: 'Error al eliminar el tipo de documento de identidad' });
  }
}

async function eliminarTipoMoneda(req, res) {
  const { usuario, tipoMoneda } = req.body;
  try {
    const result = await adminService.eliminarTipoMoneda(tipoMoneda.id);
    console.log('Tipos de Cuenta recibidos:', result.tiposCuenta);
    if (result.outFlagError === true) {
        return res.status(400).json({message: 'No se pudo eliminar el tipo de moneda', success: false});
    }
    bitacoraService.registrarBitacora('Eliminar tipo de moneda', usuario, req.ip, tipoMoneda);
    res.status(200).json({ message: 'Tipo de moneda eliminado correctamente', success: true, tiposCuenta: result.tiposCuenta });
  } catch (error) {
    console.error('Error al eliminar el tipo de moneda:', error);
    res.status(500).json({ error: 'Error al eliminar el tipo de moneda' });
  }
}

async function eliminarParentesco(req, res) {
  const { usuario, parentesco } = req.body;
  try {
    const result = await adminService.eliminarParentesco(parentesco.id);
    console.log('Beneficiarios recibidos:', result.beneficiarios);
    if (result.outFlagError === true) {
        return res.status(400).json({message: 'No se pudo eliminar el parentesco', success: false});
    }
    bitacoraService.registrarBitacora('Eliminar parentesco', usuario, req.ip, parentesco);
    res.status(200).json({ message: 'Parentesco eliminado correctamente', success: true, beneficiarios: result.beneficiarios });
  } catch (error) {
    console.error('Error al eliminar el parentesco:', error);
    res.status(500).json({ error: 'Error al eliminar el parentesco' });
  }
}

async function tablaTipoDocuIdentidadActivo(req, res) {
  try {
    const tiposDocumento = await adminService.tablaTipoDocuIdentidadActivo();
    
    res.status(200).json({
      message: 'Tipos de documento listados correctamente',
      tiposDocumento: tiposDocumento,
      success: true
    });
  } catch (error) {
    console.error('Error al obtener los tipos de documento activos:', error);
    res.status(500).json({
      error: 'Error al obtener los tipos de documento activos'
    });
  }
}

async function tablaTipoMonedaActivo(req, res) {
  try {
    const tiposMoneda = await adminService.tablaTipoMonedaActivo();

    res.status(200).json({
      message: 'Tipos de moneda listados correctamente',
      tiposMoneda: tiposMoneda,
      success: true
    });
  } catch (error) {
    console.error('Error al obtener los tipos de moneda activos:', error);
    res.status(500).json({
      error: 'Error al obtener los tipos de moneda activos'
    });
  }
}

async function tablaParentescoActivo(req, res) {
  try {
    const parentescos = await adminService.tablaParentescoActivo();

    res.status(200).json({
      message: 'Parentescos listados correctamente',
      parentescos: parentescos,
      success: true
    });
  } catch (error) {
    console.error('Error al obtener los parentescos activos:', error);
    res.status(500).json({
      error: 'Error al obtener los parentescos activos'
    });
  }
}

async function tablaTipoCuentaAhorroActivo(req, res) {
  try {
    const tiposCuentas = await adminService.tablaTipoCuentaAhorroActivo();

    res.status(200).json({
      message: 'Tipos de cuenta de ahorro listados correctamente',
      tiposCuentas: tiposCuentas,
      success: true
    });
  } catch (error) {
    console.error('Error al obtener los tipos de cuenta de ahorro activos:', error);
    res.status(500).json({
      error: 'Error al obtener los tipos de cuenta de ahorro activos'
    });
  }
}

module.exports = {
    editarTipoDocuIdentidad,
    editarTipoMoneda,
    editarParentesco,
    eliminarTipoDocuIdentidad,
    eliminarTipoMoneda,
    eliminarParentesco,
    tablaTipoDocuIdentidadActivo,
    tablaTipoMonedaActivo,
    tablaParentescoActivo,
    tablaTipoCuentaAhorroActivo
};