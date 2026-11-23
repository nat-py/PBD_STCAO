const listaService = require('../services/listaCuentasService');

async function listaCuentas(req, res) {
  try {
    const { usuario } = req.body;

    const cuentas = await listaService.innerJoin_ListarCuentas(usuario);
    res.status(200).json({ message: 'Cuentas listadas correctamente', cuentas, success: true });

  } catch (error) {
    console.error('Error al validar usuario:', error);
    res.status(500).json({ message: 'Error al validar usuario'});
  }
}

async function buscarPersonaPorCedula(req, res) {
  const { valorDocuIdentidad } = req.body;

  try {
    if (!valorDocuIdentidad?.trim()) {
      return res.status(400).json({
        message: 'La cedula es requerida',
        success: false
      });
    }

    const persona = await listaService.buscarPersonaPorCedula(valorDocuIdentidad.trim());
    if (!persona) {
      return res.status(404).json({
        message: 'No se encontro una persona con esa cedula',
        success: false
      });
    }

    return res.status(200).json({
      message: 'Persona encontrada correctamente',
      success: true,
      persona,
      nombre: persona.nombre
    });
  } catch (error) {
    console.error('Error al buscar persona por cedula:', error);
    return res.status(500).json({
      error: 'Error al buscar persona por cedula',
      success: false
    });
  }
}

async function crearCuentaAhorro(req, res) {
  const { usuario, docPropietario, idTipoCuenta, saldo } = req.body;

  try {
    if (!docPropietario?.trim() || !idTipoCuenta) {
      return res.status(400).json({
        message: 'La cedula y el tipo de cuenta son requeridos',
        success: false
      });
    }

    const saldoInicial = Number(saldo);
    if (!Number.isFinite(saldoInicial) || saldoInicial < 0) {
      return res.status(400).json({
        message: 'El saldo inicial debe ser un numero valido',
        success: false
      });
    }

    const result = await listaService.crearCuentaAhorro(
      usuario,
      req.ip,
      docPropietario.trim(),
      idTipoCuenta,
      saldoInicial
    );

    if (result.outFlagError) {
      return res.status(400).json({
        message: 'La persona o el tipo de cuenta no existen',
        success: false
      });
    }

    return res.status(200).json({
      message: 'Cuenta de ahorro creada correctamente',
      success: true,
      numCuenta: result.outNumCuentaGenerado
    });
  } catch (error) {
    console.error('Error al crear la cuenta de ahorro:', error);
    return res.status(500).json({
      error: 'Error al crear la cuenta de ahorro',
      success: false
    });
  }
}

module.exports = {
  listaCuentas,
  buscarPersonaPorCedula,
  crearCuentaAhorro
};


