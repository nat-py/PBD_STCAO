const adminService = require('../services/adminService');
const bitacoraService = require('../services/bitacora');

async function insertarTipoDocuIdentidad(req, res) {
  const { usuario, tipoDocuIdentidad } = req.body;
  try {
    const result = await adminService.insertarTipoDocuIdentidad(tipoDocuIdentidad.id, 
                                                                tipoDocuIdentidad.nombre);

    if (result === true) {
        return res.status(400).json({message: 'No se pudo ingresar el tipo de documento de identidad',success: false});
    }
    bitacoraService.registrarBitacora('Ingresar tipo de documento de identidad', usuario, req.ip, tipoDocuIdentidad);
    res.status(200).json({ message: 'Tipo de documento de identidad ingresado correctamente', success: true });
  } catch (error) {
    console.error('Error al ingresar el tipo de documento de identidad:', error);
    res.status(500).json({ error: 'Error al ingresar el tipo de documento de identidad' });
  }
}

async function insertarTipoMoneda(req, res) {
  const { usuario, tipoMoneda } = req.body;
  try {
    const result = await adminService.insertarTipoMoneda(tipoMoneda.id, 
                                                        tipoMoneda.nombre, 
                                                        tipoMoneda.simbolo);
    if (result === true) {
        return res.status(400).json({message: 'No se pudo ingresar el tipo de moneda',success: false});
    }
    bitacoraService.registrarBitacora('Ingresar tipo de moneda', usuario, req.ip, tipoMoneda);
    res.status(200).json({ message: 'Tipo de moneda ingresado correctamente', success: true });
  } catch (error) {
    console.error('Error al ingresar el tipo de moneda:', error);
    res.status(500).json({ error: 'Error al ingresar el tipo de moneda' });
  }
}

async function insertarParentesco(req, res) {
  const { usuario, parentesco } = req.body;
  try {
    const result = await adminService.insertarParentesco(parentesco.id, 
                                                        parentesco.nombre);
                                                        
    if (result === true) {
        return res.status(400).json({message: 'No se pudo ingresar el parentesco',success: false});
    }

    bitacoraService.registrarBitacora('Ingresar parentesco', usuario, req.ip, parentesco);
    res.status(200).json({ message: 'Parentesco ingresado correctamente', success: true });
  } catch (error) {
    console.error('Error al ingresar parentesco:', error);
    res.status(500).json({ error: 'Error al ingresar parentesco' });
  }
}

async function insertarTipoCuentaAhorro(req, res) {
  const { usuario, tipoCuenta } = req.body;
  try {
    const result = await adminService.insertarTipoCuentaAhorro(
      tipoCuenta.id, tipoCuenta.nombre, tipoCuenta.idTipoMoneda,
      tipoCuenta.saldoMinimo, tipoCuenta.multaSaldoMinimo, tipoCuenta.cargoAnual,
      tipoCuenta.numRetirosHumano, tipoCuenta.numRetirosAutomatico,
      tipoCuenta.comisionHumano, tipoCuenta.comisionAutomatico, tipoCuenta.interes
    );

    if (result === true) {
      return res.status(400).json({
        message: 'No se pudo ingresar el tipo de cuenta de ahorro',
        success: false
      });
    }

    bitacoraService.registrarBitacora('Ingresar tipo de cuenta de ahorro', usuario, req.ip, tipoCuenta);
    res.status(200).json({ message: 'Tipo de cuenta de ahorro ingresado correctamente', success: true });
  } catch (error) {
    console.error('Error al ingresar el tipo de cuenta de ahorro:', error);
    res.status(500).json({ error: 'Error al ingresar el tipo de cuenta de ahorro' });
  }
}

async function editarTipoDocuIdentidad(req, res) {
  const { usuario, tipoDocuIdentidad, anterior } = req.body;
  try {
    const result = await adminService.modificarTipoDocuIdentidad(tipoDocuIdentidad.id, 
                                                                tipoDocuIdentidad.nombre);

    if (result === true) {
        return res.status(400).json({message: 'No se pudo editar el tipo de documento de identidad',success: false});
    }
    bitacoraService.registrarBitacora('Actualizar tipo de documento de identidad', usuario, req.ip, {
      anterior: anterior || null,
      nuevo: tipoDocuIdentidad
    });
    res.status(200).json({ message: 'Tipo de documento de identidad editado correctamente', success: true });
  } catch (error) {
    console.error('Error al editar el tipo de documento de identidad:', error);
    res.status(500).json({ error: 'Error al editar el tipo de documento de identidad' });
  }
}

async function editarTipoMoneda(req, res) {
  const { usuario, tipoMoneda, anterior } = req.body;
  try {
    const result = await adminService.modificarTipoMoneda(tipoMoneda.id, 
                                                        tipoMoneda.nombre, 
                                                        tipoMoneda.simbolo);
    if (result === true) {
        return res.status(400).json({message: 'No se pudo editar el tipo de moneda',success: false});
    }
    bitacoraService.registrarBitacora('Actualizar tipo de moneda', usuario, req.ip, {
      anterior: anterior || null,
      nuevo: tipoMoneda
    });
    res.status(200).json({ message: 'Tipo de moneda editado correctamente', success: true });
  } catch (error) {
    console.error('Error al editar el tipo de moneda:', error);
    res.status(500).json({ error: 'Error al editar el tipo de moneda' });
  }
}

async function editarParentesco(req, res) {
  const { usuario, parentesco, anterior } = req.body;
  try {
    const result = await adminService.modificarParentesco(parentesco.id, 
                                                        parentesco.nombre);
                                                        
    if (result === true) {
        return res.status(400).json({message: 'No se pudo editar el parentesco',success: false});
    }

    bitacoraService.registrarBitacora('Actualizar parentesco', usuario, req.ip, {
      anterior: anterior || null,
      nuevo: parentesco
    });
    res.status(200).json({ message: 'Parentesco editado correctamente', success: true });
  } catch (error) {
    console.error('Error al editar parentesco:', error);
    res.status(500).json({ error: 'Error al editar parentesco' });
  }
}

async function editarTipoCuentaAhorro(req, res) {
  const { usuario, tipoCuenta, anterior } = req.body;
  try {
    const result = await adminService.modificarTipoCuentaAhorro(
      tipoCuenta.id, tipoCuenta.nombre, tipoCuenta.idTipoMoneda,
      tipoCuenta.saldoMinimo, tipoCuenta.multaSaldoMinimo, tipoCuenta.cargoAnual,
      tipoCuenta.numRetirosHumano, tipoCuenta.numRetirosAutomatico,
      tipoCuenta.comisionHumano, tipoCuenta.comisionAutomatico, tipoCuenta.interes
    );

    if (result === true) {
      return res.status(400).json({
        message: 'No se pudo editar el tipo de cuenta de ahorro',
        success: false
      });
    }

    bitacoraService.registrarBitacora('Actualizar tipo de cuenta de ahorro', usuario, req.ip, {
      anterior: anterior || null,
      nuevo: tipoCuenta
    });
    res.status(200).json({ message: 'Tipo de cuenta de ahorro editado correctamente', success: true });
  } catch (error) {
    console.error('Error al editar el tipo de cuenta de ahorro:', error);
    res.status(500).json({ error: 'Error al editar el tipo de cuenta de ahorro' });
  }
}

async function eliminarTipoDocuIdentidad(req, res) {
  const { usuario, tipoDocuIdentidad } = req.body;
  try {
    const result = await adminService.eliminarTipoDocuIdentidad(tipoDocuIdentidad.id);
    if (result.outFlagError === true) {
        return res.status(400).json({message: 'No se pudo eliminar el tipo de documento de identidad',success: false});
    }
    bitacoraService.registrarBitacora('Eliminar tipo de documento de identidad', usuario, req.ip, {
      anterior: tipoDocuIdentidad,
      nuevo: null
    });
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
    if (result.outFlagError === true) {
        return res.status(400).json({message: 'No se pudo eliminar el tipo de moneda', success: false});
    }
    bitacoraService.registrarBitacora('Eliminar tipo de moneda', usuario, req.ip, {
      anterior: tipoMoneda,
      nuevo: null
    });
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
    if (result.outFlagError === true) {
        return res.status(400).json({message: 'No se pudo eliminar el parentesco', success: false});
    }

    bitacoraService.registrarBitacora('Eliminar parentesco', usuario, req.ip, {
      anterior: parentesco,
      nuevo: null
    });
    res.status(200).json({ message: 'Parentesco eliminado correctamente', success: true, beneficiarios: result.beneficiarios });
  } catch (error) {
    console.error('Error al eliminar el parentesco:', error);
    res.status(500).json({ error: 'Error al eliminar el parentesco' });
  }
}

async function eliminarTipoCuentaAhorro(req, res) {
  const { usuario, tipoCuenta } = req.body;
  try {
    const result = await adminService.eliminarTipoCuentaAhorro(tipoCuenta.id);

    if (result.outFlagError === true) {
      return res.status(400).json({
        message: 'No se pudo eliminar el tipo de cuenta de ahorro',
        success: false
      });
    }

    bitacoraService.registrarBitacora('Eliminar tipo de cuenta de ahorro', usuario, req.ip, {
      anterior: tipoCuenta,
      nuevo: null
    });
    res.status(200).json({
      message: 'Tipo de cuenta de ahorro eliminado correctamente',
      success: true,
      cuentas: result.cuentas
    });
  } catch (error) {
    console.error('Error al eliminar el tipo de cuenta de ahorro:', error);
    res.status(500).json({ error: 'Error al eliminar el tipo de cuenta de ahorro' });
  }
}

async function tablaTipoDocuIdentidad(req, res) {
  try {
    const tiposDocumento = await adminService.tablaTipoDocuIdentidad();
    
    res.status(200).json({
      message: 'Tipos de documento listados correctamente',
      tiposDocumento: tiposDocumento,
      success: true
    });
  } catch (error) {
    console.error('Error al obtener los tipos de documento:', error);
    res.status(500).json({
      error: 'Error al obtener los tipos de documento'
    });
  }
}

async function tablaTipoMoneda(req, res) {
  try {
    const tiposMoneda = await adminService.tablaTipoMoneda();

    res.status(200).json({
      message: 'Tipos de moneda listados correctamente',
      tiposMoneda: tiposMoneda,
      success: true
    });
  } catch (error) {
    console.error('Error al obtener los tipos de moneda:', error);
    res.status(500).json({
      error: 'Error al obtener los tipos de moneda'
    });
  }
}

async function tablaParentesco(req, res) {
  try {
    const parentescos = await adminService.tablaParentesco();

    res.status(200).json({
      message: 'Parentescos listados correctamente',
      parentescos: parentescos,
      success: true
    });
  } catch (error) {
    console.error('Error al obtener los parentescos:', error);
    res.status(500).json({
      error: 'Error al obtener los parentescos'
    });
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

async function tablaCuentaAhorroActivo(req, res) {
  try {
    const cuentas = await adminService.tablaCuentaAhorroActivo();

    res.status(200).json({
      message: 'Cuentas de ahorro listadas correctamente',
      cuentas: cuentas,
      success: true
    });
  } catch (error) {
    console.error('Error al obtener las cuentas de ahorro activas:', error);
    res.status(500).json({
      error: 'Error al obtener las cuentas de ahorro activas'
    });
  }
}

async function administrarPersonas(req, res) {
  try {
    const personas = await adminService.administrarPersonas();
    return res.status(200).json({
      message: 'Personas listadas correctamente',
      personas,
      success: true
    });
  } catch (error) {
    console.error('Error al obtener las personas:', error);
    return res.status(500).json({
      error: 'Error al obtener las personas',
      success: false
    });
  }
}

async function editarCuentaAhorro(req, res) {
  const { usuario, cuenta, anterior } = req.body;

  try {
    if (!cuenta || !cuenta.numCuenta || !cuenta.valorDocuIdentidad ||
        !cuenta.idTipoCuenta || !cuenta.fechaCreacion) {
      return res.status(400).json({
        message: 'Faltan datos obligatorios de la cuenta',
        success: false
      });
    }

    const numCuentaActual = anterior?.numCuenta || cuenta.anteriorNumCuenta;
    if (!numCuentaActual) {
      return res.status(400).json({
        message: 'No se pudo identificar la cuenta actual',
        success: false
      });
    }

    const saldo = Number(cuenta.saldo);
    if (!Number.isFinite(saldo)) {
      return res.status(400).json({
        message: 'El saldo debe ser un numero valido',
        success: false
      });
    }

    const result = await adminService.editarCuentaAhorro(
      usuario,
      req.ip,
      numCuentaActual,
      cuenta.numCuenta,
      cuenta.valorDocuIdentidad,
      cuenta.idTipoCuenta,
      cuenta.fechaCreacion,
      saldo
    );

    if (!result.outFlagExisteCuenta) {
      return res.status(404).json({
        message: 'La cuenta de ahorro no existe',
        success: false
      });
    }
    if (result.outFlagNumCuentaRepetido) {
      return res.status(409).json({
        message: 'El nuevo numero de cuenta ya esta registrado',
        success: false
      });
    }
    if (result.outFlagError) {
      return res.status(400).json({
        message: 'No se pudieron validar los datos de la cuenta',
        success: false
      });
    }

    bitacoraService.registrarBitacora('Actualizar cuenta de ahorro', usuario, req.ip, {
      anterior: anterior || null,
      nuevo: cuenta
    });

    return res.status(200).json({
      message: 'Cuenta de ahorro editada correctamente',
      success: true
    });
  } catch (error) {
    console.error('Error al editar la cuenta de ahorro:', error);
    return res.status(500).json({
      error: 'Error al editar la cuenta de ahorro',
      success: false
    });
  }
}

async function eliminarCuentaAhorro(req, res) {
  const { usuario, cuenta } = req.body;

  try {
    if (!cuenta?.numCuenta) {
      return res.status(400).json({
        message: 'No se pudo identificar la cuenta',
        success: false
      });
    }

    const result = await adminService.eliminarCuentaAhorro(
      usuario,
      req.ip,
      cuenta.numCuenta
    );

    if (result.outFlagError) {
      return res.status(400).json({
        message: 'La cuenta no existe o no se pudo eliminar',
        success: false
      });
    }

    bitacoraService.registrarBitacora('Eliminar cuenta de ahorro', usuario, req.ip, {
      anterior: cuenta,
      nuevo: null
    });

    return res.status(200).json({
      message: 'Cuenta de ahorro eliminada correctamente',
      success: true
    });
  } catch (error) {
    console.error('Error al eliminar la cuenta de ahorro:', error);
    return res.status(500).json({
      error: 'Error al eliminar la cuenta de ahorro',
      success: false
    });
  }
}

async function editarPersona(req, res) {
  const { usuario, personaAnterior, personaNueva } = req.body;

  try {
    if (!personaAnterior?.valorDocuIdentidad || !personaNueva) {
      return res.status(400).json({ message: 'Faltan datos de la persona', success: false });
    }

    const result = await adminService.editarPersona(usuario, req.ip, personaAnterior, personaNueva);

    if (result.outFlagExistePersona === false) {
      return res.status(404).json({ message: 'La persona no existe', success: false });
    }
    if (result.outFlagDocuIdentidadRepetido) {
      return res.status(409).json({ message: 'El documento de identidad ya esta registrado', success: false });
    }
    if (result.outFlagExisteTipoDocuIdentidad === false) {
      return res.status(400).json({ message: 'El tipo de documento no existe', success: false });
    }
    if (result.outFlagError) {
      return res.status(400).json({ message: 'No se pudo actualizar la persona', success: false });
    }

    bitacoraService.registrarBitacora('Actualizar persona', usuario, req.ip, {
      anterior: personaAnterior,
      nuevo: personaNueva
    });

    return res.status(200).json({ message: 'Persona actualizada correctamente', success: true });
  } catch (error) {
    console.error('Error al editar la persona:', error);
    return res.status(500).json({ error: 'Error al editar la persona', success: false });
  }
}

async function editarUsuario(req, res) {
  const { usuario, usuarioAnterior, usuarioNuevo } = req.body;

  try {
    if (!usuarioNuevo?.idUsuarioObjetivo) {
      return res.status(400).json({ message: 'No se pudo identificar el usuario', success: false });
    }

    const result = await adminService.editarUsuario(
      usuario,
      req.ip,
      usuarioNuevo.idUsuarioObjetivo,
      usuarioNuevo.usuario,
      usuarioNuevo.clave,
      usuarioNuevo.esAdmin
    );

    if (result.outFlagExisteUsuario === false) {
      return res.status(404).json({ message: 'El usuario no existe', success: false });
    }
    if (result.outFlagUsuarioRepetido) {
      return res.status(409).json({ message: 'El nombre de usuario ya esta registrado', success: false });
    }
    if (result.outFlagError) {
      return res.status(400).json({ message: 'No se pudo actualizar el usuario', success: false });
    }

    bitacoraService.registrarBitacora('Actualizar usuario', usuario, req.ip, {
      anterior: usuarioAnterior,
      nuevo: usuarioNuevo
    });

    return res.status(200).json({ message: 'Usuario actualizado correctamente', success: true });
  } catch (error) {
    console.error('Error al editar el usuario:', error);
    return res.status(500).json({ error: 'Error al editar el usuario', success: false });
  }
}

async function eliminarPersona(req, res) {
  const { usuario, persona } = req.body;

  try {
    if (!persona?.valorDocuIdentidad) {
      return res.status(400).json({
        message: 'No se pudo identificar la persona',
        success: false
      });
    }

    const result = await adminService.eliminarPersona(
      usuario,
      req.ip,
      persona.valorDocuIdentidad
    );

    if (result.outFlagExistePersona === false) {
      return res.status(404).json({
        message: 'La persona no existe',
        success: false
      });
    }
    if (result.outFlagError) {
      return res.status(400).json({
        message: 'No se pudo eliminar la persona',
        success: false
      });
    }

    bitacoraService.registrarBitacora('Eliminar persona', usuario, req.ip, {
      anterior: persona,
      nuevo: null
    });

    return res.status(200).json({
      message: 'Persona y sus datos asociados eliminados correctamente',
      success: true
    });
  } catch (error) {
    console.error('Error al eliminar la persona:', error);
    return res.status(500).json({
      error: 'Error al eliminar la persona',
      success: false
    });
  }
}

async function eliminarBeneficiarioReasignar(req, res) {
  const { usuario, beneficiario } = req.body;

  try {
    if (!beneficiario?.numCuenta || !beneficiario?.valorDocuIdentidad) {
      return res.status(400).json({
        message: 'No se pudo identificar el beneficiario',
        success: false
      });
    }

    const result = await adminService.eliminarBeneficiarioReasignar(
      usuario,
      req.ip,
      beneficiario.numCuenta,
      beneficiario.valorDocuIdentidad
    );

    if (result.outFlagUnicoBeneficiario) {
      return res.status(409).json({
        message: 'No se puede eliminar al unico beneficiario de la cuenta',
        success: false,
        outFlagUnicoBeneficiario: true
      });
    }

    if (result.outFlagError) {
      return res.status(400).json({
        message: 'El beneficiario no existe o no se pudo eliminar',
        success: false
      });
    }

    bitacoraService.registrarBitacora('Eliminar beneficiario y reasignar porcentajes', usuario, req.ip, {
      anterior: beneficiario,
      nuevo: null
    });

    return res.status(200).json({
      message: 'Beneficiario eliminado y porcentajes reasignados correctamente',
      success: true
    });
  } catch (error) {
    console.error('Error al eliminar el beneficiario y reasignar porcentajes:', error);
    return res.status(500).json({
      error: 'Error al eliminar el beneficiario y reasignar porcentajes',
      success: false
    });
  }
}

async function leerEventLog(req, res) {
  try {
    const inIdUsuario = req.query.idUsuario ? Number(req.query.idUsuario) : null;
    const inIdTipoOperacion = req.query.idTipoOperacion || null;
    const inFechaInicio = req.query.fechaInicio ? new Date(req.query.fechaInicio) : null;
    const inFechaFin = req.query.fechaFin ? new Date(req.query.fechaFin) : null;

    const registros = await adminService.leerEventLog(
      inIdUsuario,
      inIdTipoOperacion,
      inFechaInicio,
      inFechaFin
    );

    const datos = registros.map((registro) => {
      const fecha = new Date(registro.FechaHora);
      const fyh = Number.isNaN(fecha.getTime())
        ? ''
        : `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')} ${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}:${String(fecha.getSeconds()).padStart(2, '0')}`;

      let anterior = null;
      let nuevo = null;

      try {
        anterior = registro.JsonAntes ? JSON.parse(registro.JsonAntes) : null;
      } catch (error) {
        anterior = registro.JsonAntes;
      }

      try {
        nuevo = registro.JsonDespues ? JSON.parse(registro.JsonDespues) : null;
      } catch (error) {
        nuevo = registro.JsonDespues;
      }

      return {
        id: registro.id,
        fyh,
        ip: registro.IP,
        operacion: registro.nombreTipoOperacion,
        usuario: registro.usuario,
        detalles: {
          anterior,
          nuevo
        }
      };
    });

    return res.status(200).json(datos);
  } catch (error) {
    console.error('Error al leer el EventLog:', error);
    return res.status(500).json({ error: 'Error al leer la bitácora', success: false });
  }
}

async function procesoOperaciones(req, res) {
  try {
    const resultado = await adminService.procesoOperaciones();
    return res.status(200).json({
      message: 'Proceso batch ejecutado',
      resultado,
      success: true
    });
  } catch (error) {
    console.error('Error al ejecutar el proceso batch de operaciones:', error);
    return res.status(500).json({
      message: 'No se pudo ejecutar el proceso batch de operaciones',
      success: false
    });
  }
}


module.exports = {
  insertarTipoDocuIdentidad,
  insertarTipoMoneda,
  insertarParentesco,
  insertarTipoCuentaAhorro,
  editarTipoDocuIdentidad,
  editarTipoMoneda,
  editarParentesco,
  editarTipoCuentaAhorro,
  eliminarTipoDocuIdentidad,
  eliminarTipoMoneda,
  eliminarParentesco,
  eliminarTipoCuentaAhorro,
  tablaTipoDocuIdentidad,
  tablaTipoMoneda,
  tablaParentesco,
  tablaTipoDocuIdentidadActivo,
  tablaTipoMonedaActivo,
  tablaParentescoActivo,
  tablaTipoCuentaAhorroActivo,
  tablaCuentaAhorroActivo,
  administrarPersonas,
  editarCuentaAhorro,
  eliminarCuentaAhorro,
  editarPersona,
  editarUsuario,
  eliminarPersona,
  eliminarBeneficiarioReasignar,
  leerEventLog,
  procesoOperaciones
};