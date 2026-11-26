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
  const { numCuenta } = req.body;

  try {
    const beneficiarios = await ahorroService.beneficiariosAsociadosCuenta(numCuenta);
    res.status(200).json({ message: 'Beneficiarios listados correctamente', beneficiarios: beneficiarios, success: true });
  } catch (error) {
    console.error('Error al obtener los beneficiarios asociados a la cuenta:', error);
    res.status(500).json({ error: 'Error al obtener los beneficiarios asociados a la cuenta' });
  }
}

async function personaAsociadaUsuario(req, res) {
  const { usuario } = req.body;

  console.log('usuario recibido en personaAsociadaUsuario:', usuario);

  try {
    if (!usuario) {
      return res.status(400).json({ message: 'El usuario es requerido', success: false });
    }

    const result = await ahorroService.personaAsociadaUsuario(usuario);

    if (!result.outFlagExisteUsuario) {
      return res.status(404).json({ message: 'El usuario no existe', success: false });
    }

    if (result.outFlagDatosInaccesibles || !result.persona) {
      return res.status(404).json({ message: 'No hay datos personales asociados al usuario', success: false });
    }

    return res.status(200).json({
      success: true,
      perfil: {
        tipoDoc: result.persona.tipoDocuIdentidad,
        documento: result.persona.valorDocuIdentidad,
        nombre: result.persona.nombre,
        fechaNacimiento: result.persona.fechaNacimiento,
        email: result.persona.email,
        telefono1: result.persona.telefono1,
        telefono2: result.persona.telefono2
      }
    });
  } catch (error) {
    console.error('Error al obtener el perfil del usuario:', error);
    return res.status(500).json({ error: 'Error al obtener el perfil del usuario', success: false });
  }
}

async function eliminarBeneficiario(req, res) {
  const { usuario, numCuenta } = req.body;
  const valorDocuIdentidad = req.query.valorDocuIdentidad;
  try {
    if (!numCuenta) {
      return res.status(400).json({ message: 'El número de cuenta es requerido', success: false });
    }

    const outFlagError = await ahorroService.eliminarBeneficiario(
      usuario,
      req.ip,
      numCuenta,
      valorDocuIdentidad
    );

    if (outFlagError === true) {
      return res.status(404).json({ message: 'El beneficiario no existe o no se pudo eliminar', success: false });
    }

    return res.status(200).json({ message: 'Beneficiario eliminado correctamente', success: true });
  } catch (error) {
    console.error('Error al eliminar el beneficiario:', error);
    return res.status(500).json({ error: 'Error al eliminar el beneficiario', success: false });
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

async function obtenerTiposMovimientoActivos(req, res) {
  try {
    const tiposMovimiento = await ahorroService.obtenerTiposMovimientoActivos();
    res.status(200).json({
      message: 'Tipos de movimiento listados correctamente',
      tiposMovimiento,
      success: true
    });
  } catch (error) {
    console.error('Error al obtener los tipos de movimiento activos:', error);
    res.status(500).json({ error: 'Error al obtener los tipos de movimiento activos', success: false });
  }
}

async function movimientosCuentaUltimos4Meses(req, res) {
  const { numCuenta } = req.body;

  if (!numCuenta) {
    return res.status(400).json({
      message: 'El numero de cuenta es requerido',
      success: false
    });
  }

  try {
    const movimientos = await ahorroService.movimientosCuentaUltimos4Meses(numCuenta);
    return res.status(200).json({
      message: 'Movimientos listados correctamente',
      movimientos,
      success: true
    });
  } catch (error) {
    console.error('Error al obtener los movimientos de la cuenta:', error);
    return res.status(500).json({
      error: 'Error al obtener los movimientos de la cuenta',
      success: false
    });
  }
}

async function guardarMovimiento(req, res) {
  const { idTipoMovimiento, numCuenta, monto, descripcion, idComprobante } = req.body;

  if (!idTipoMovimiento || !numCuenta || monto === undefined || monto === null || !String(descripcion || '').trim()) {
    return res.status(400).json({
      message: 'Tipo de movimiento, cuenta, monto y descripcion son requeridos',
      success: false
    });
  }

  try {
    const montoNumerico = Number(monto);
    if (!Number.isFinite(montoNumerico) || montoNumerico <= 0) {
      return res.status(400).json({
        message: 'El monto debe ser mayor que cero',
        success: false
      });
    }

    const resultado = await ahorroService.guardarMovimiento(
      idTipoMovimiento,
      numCuenta,
      montoNumerico,
      String(descripcion).trim().slice(0, 50),
      idComprobante || null
    );

    if (resultado.flagError) {
      let message = 'No se pudo guardar el movimiento';

      if (resultado.flagTipoMovimientoNoExiste) {
        message = 'El tipo de movimiento no existe o esta inactivo';
      } else if (resultado.flagAccionInvalida) {
        message = 'La accion del tipo de movimiento no es Credito ni Debito';
      } else if (resultado.flagMontoInvalido) {
        message = 'El monto debe ser mayor que cero';
      } else if (resultado.flagCuentaNoExiste) {
        message = 'La cuenta no existe o esta inactiva';
      } else if (resultado.flagSaldoInsuficiente) {
        message = 'Saldo insuficiente para realizar el movimiento';
      }

      return res.status(400).json({
        message,
        success: false,
        errorCode: {
          tipoMovimientoNoExiste: resultado.flagTipoMovimientoNoExiste,
          accionInvalida: resultado.flagAccionInvalida,
          montoInvalido: resultado.flagMontoInvalido,
          cuentaNoExiste: resultado.flagCuentaNoExiste,
          saldoInsuficiente: resultado.flagSaldoInsuficiente
        }
      });
      
    }

    return res.status(200).json({
      message: 'Movimiento guardado correctamente',
      nuevoSaldo: resultado.nuevoSaldo,
      success: true
    });
  } catch (error) {
    console.error('Error al guardar el movimiento:', error);
    return res.status(500).json({
      error: 'Error al guardar el movimiento',
      success: false
    });
  }
}

async function registrarEventoEstadoCuenta(req, res) {
  const { usuario, idTipoOperacion } = req.body;

  if (!usuario?.trim()) {
    return res.status(400).json({
      message: 'El usuario es requerido',
      success: false
    });
  }

  const tipoOperacion = String(idTipoOperacion || '');
  if (!['7', '8'].includes(tipoOperacion)) {
    return res.status(400).json({
      message: 'El tipo de operación debe ser 7 u 8',
      success: false
    });
  }

  try {
    const resultado = await ahorroService.registrarEventoEstadoCuenta(
      usuario.trim(),
      tipoOperacion,
      req.ip
    );

    if (resultado.usuarioNoExiste) {
      return res.status(404).json({
        message: 'El usuario no existe',
        success: false
      });
    }

    return res.status(200).json({
      message: 'Evento de estado de cuenta registrado correctamente',
      idEventLog: resultado.idEventLog,
      success: true
    });
  } catch (error) {
    console.error('Error al registrar el evento del estado de cuenta:', error);
    return res.status(500).json({
      error: 'Error al registrar el evento del estado de cuenta',
      success: false
    });
  }
}

async function insertarBeneficiario(req, res) {
  const { usuario, beneficiario } = req.body;

  console.log('beneficiario recibido en insertarBeneficiario:', beneficiario);

  try {
    const outFlagError = await ahorroService.insertarBeneficiario(
      usuario,
      req.ip,
      beneficiario.cuentaAsociada,
      beneficiario.valorDoc,
      beneficiario.parentesco,
      beneficiario.porcentaje
    );
    

    if (outFlagError === true) {
      return res.status(409).json({
        message: 'El beneficiario ya existe o no se pudo insertar',
        success: false
      });
    }

    res.status(200).json({ message: 'Beneficiario insertado correctamente', success: true });
  } catch (error) {
    console.error('Error al insertar el beneficiario:', error);
    res.status(500).json({ error: 'Error al insertar el beneficiario' });
  }
}

async function editarBeneficiarioDocuDiferente(req, res) {
  const { usuario, beneficiario } = req.body;
  try {
    const result = await ahorroService.editarBeneficiarioDocuDiferente(usuario, req.ip, beneficiario.anterior.valorDoc, beneficiario.nuevo.valorDoc, beneficiario.nuevo.nombreBeneficiario,
      beneficiario.nuevo.parentesco, beneficiario.nuevo.porcentaje, beneficiario.nuevo.fechaNacimiento, beneficiario.nuevo.tipoDoc, beneficiario.nuevo.email,
      beneficiario.nuevo.telefono1, beneficiario.nuevo.telefono2, beneficiario.nuevo.cuentaAsociada);

    if (result.outFlagDocuIdentidadRepetido) {
      return res.status(409).json({ message: 'El nuevo documento de identidad ya existe', success: false });
    }
    if (result.outFlagError) {
      return res.status(500).json({ message: 'Error al editar el beneficiario', success: false });
    }
    if (!result.outFlagExistePersona || !result.outFlagExisteBeneficiario ||
        !result.outFlagExisteParentesco || !result.outFlagExisteTipoDocuIdentidad) {
      return res.status(400).json({ message: 'No se pudieron validar todos los datos del beneficiario', success: false });
    }

    return res.status(200).json({ message: 'Beneficiario editado correctamente (documento diferente)', success: true });
  } catch (error) {
    console.error('Error al editar el beneficiario (documento diferente):', error);
    res.status(500).json({ error: 'Error al editar el beneficiario (documento diferente)', success: false });
  }
}

async function editarBeneficiarioDocuIgual(req, res) {
  const { usuario, beneficiario } = req.body;
  try { 

    const result = await ahorroService.editarBeneficiarioDocuIgual(usuario, req.ip, beneficiario.anterior.valorDoc, beneficiario.nuevo.nombreBeneficiario, beneficiario.nuevo.parentesco,
      beneficiario.nuevo.porcentaje, beneficiario.nuevo.fechaNacimiento, beneficiario.nuevo.tipoDoc, beneficiario.nuevo.email,
      beneficiario.nuevo.telefono1, beneficiario.nuevo.telefono2, beneficiario.nuevo.cuentaAsociada);

    if (result.outFlagError) {
      return res.status(500).json({ message: 'Error al editar el beneficiario', success: false });
    }
    if (!result.outFlagExistePersona || !result.outFlagExisteBeneficiario ||
        !result.outFlagExisteParentesco || !result.outFlagExisteTipoDocuIdentidad) {
      return res.status(400).json({ message: 'No se pudieron validar todos los datos del beneficiario', success: false });
    }

    return res.status(200).json({ message: 'Beneficiario editado correctamente (documento igual)', success: true });

  } catch (error) {
    console.error('Error al editar el beneficiario (documento igual):', error);
    res.status(500).json({ error: 'Error al editar el beneficiario (documento igual)' });
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

    const persona = await ahorroService.buscarPersonaPorCedula(valorDocuIdentidad.trim());
    if (!persona) {
      return res.status(404).json({
        message: 'No se encontro una persona con esa cedula',
        success: false
      });
    }

    return res.status(200).json({
      message: 'Persona encontrada correctamente',
      success: true,
      persona
    });
  } catch (error) {
    console.error('Error al buscar persona por cedula:', error);
    return res.status(500).json({
      error: 'Error al buscar persona por cedula',
      success: false
    });
  }
}

module.exports = { 
  top8_EstadoCuenta_AsociadoCuenta, 
  beneficiariosAsociadosCuenta, 
  personaAsociadaUsuario,
  eliminarBeneficiario, 
  tablaParentescoActivo, 
  tablaTipoDocuIdentidadActivo,
  obtenerTiposMovimientoActivos,
  movimientosCuentaUltimos4Meses,
  guardarMovimiento,
  insertarBeneficiario,
  editarBeneficiarioDocuDiferente,
  editarBeneficiarioDocuIgual,
  buscarPersonaPorCedula,
  registrarEventoEstadoCuenta
};