const { sql, poolPromise } = require('../config/conexionBD.js');

async function top8_EstadoCuenta_AsociadoCuenta(numCuenta) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .execute('dbo.sp_Top8_EstadoCuenta_AsociadoCuenta'); //llamar al SP

  return result.recordset; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

async function registrarEventoEstadoCuenta(usuario, tipoOperacion, ip)
{
  const pool = await poolPromise;
  const usuarioResult = await pool.request()
    .input('inUser', sql.VarChar(20), usuario)
    .query('SELECT TOP (1) id FROM dbo.Usuario WHERE usuario = @inUser');

  const idUsuario = usuarioResult.recordset[0]?.id;
  if (idUsuario == null || !Number.isInteger(Number(idUsuario))) {
    return { usuarioNoExiste: true };
  }

  const result = await pool.request()
    .input('inIdUsuario', sql.Int, Number(idUsuario))
    .input('inIdTipoOperacion', sql.VarChar(4), tipoOperacion)
    .input('inIP', sql.VarChar(32), ip)
    .input('inJsonAntes', sql.NVarChar(sql.MAX), null)
    .input('inJsonDespues', sql.NVarChar(sql.MAX), null)
    .output('outIdEventLog', sql.Int)
    .output('outFlagError', sql.BIT)
    .execute('dbo.sp_GuardarEventLog');

  if (result.output.outFlagError) {
    throw new Error('El procedimiento sp_GuardarEventLog no pudo guardar el evento');
  }

  if (result.output.outIdEventLog == null || !Number.isInteger(Number(result.output.outIdEventLog))) {
    throw new Error('sp_GuardarEventLog no devolvió el identificador del evento');
  }

  return {
    usuarioNoExiste: false,
    idEventLog: result.output.outIdEventLog
  };
}

async function beneficiariosAsociadosCuenta(numCuenta) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .execute('dbo.sp_beneficiarioAsociadoCuenta'); //llamar al SP que inserta usuario

  return result.recordset; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

async function personaAsociadaUsuario(usuario) {

  
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inUser', sql.VarChar(20), usuario)
    .output('outFlagExisteUsuario', sql.BIT)
    .output('outFlagDatosInaccesibles', sql.BIT)
    .execute('dbo.sp_PersonaAsociadaUsuario');

  return {
    persona: result.recordset[0] || null,
    outFlagExisteUsuario: result.output.outFlagExisteUsuario,
    outFlagDatosInaccesibles: result.output.outFlagDatosInaccesibles
  };
}

async function eliminarBeneficiario(idUsuarioOrUsuario, ip, numCuenta, valorDocuIdentidad)
{
  const pool = await poolPromise;
  const idUsuario = await resolverIdUsuario(pool, idUsuarioOrUsuario);
  const result = await pool.request()
    .input('inIdUsuario', sql.Int, idUsuario)
    .input('inIP', sql.VarChar(45), ip)
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .input('inValorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .output('outFlagError', sql.BIT)
    .execute('dbo.sp_EliminarBeneficiario');

  return result.output.outFlagError;
}

async function tablaParentescoActivo() 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .execute('dbo.sp_TablaParentescoActivo');

  return result.recordset;
}

async function tablaTipoDocuIdentidadActivo() 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .execute('dbo.sp_TablaDocumentoIdentidadActivo');

  return result.recordset;
}

async function obtenerTiposMovimientoActivos()
{
  const pool = await poolPromise;
  const result = await pool.request()
    .execute('dbo.sp_ObtenerTiposMovimientoComprobante');

  return result.recordset;
}

async function movimientosCuentaUltimos4Meses(numCuenta)
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inCodigoCuenta', sql.VarChar(10), numCuenta)
    .execute('dbo.sp_MovimientosCuentaUltimos4Meses');

  return result.recordset;
}

async function guardarMovimiento(idTipoMovimiento, numCuenta, monto, descripcion, idComprobante)
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inIdTipoMovimiento', sql.VarChar(4), String(idTipoMovimiento))
    .input('inCodigoCuenta', sql.VarChar(10), numCuenta)
    .input('inMonto', sql.Money, monto)
    .input('inDescripcion', sql.VarChar(50), descripcion)
    .input('inIdComprobante', sql.Int, idComprobante || null)
    .output('outNuevoSaldo', sql.Money)
    .output('outFlagTipoMovimientoNoExiste', sql.BIT)
    .output('outFlagAccionInvalida', sql.BIT)
    .output('outFlagMontoInvalido', sql.BIT)
    .output('outFlagCuentaNoExiste', sql.BIT)
    .output('outFlagSaldoInsuficiente', sql.BIT)
    .output('outFlagError', sql.BIT)
    .execute('dbo.sp_GuardarMovimiento');

  return {
    nuevoSaldo: result.output.outNuevoSaldo,
    flagTipoMovimientoNoExiste: result.output.outFlagTipoMovimientoNoExiste === true || result.output.outFlagTipoMovimientoNoExiste === 1,
    flagAccionInvalida: result.output.outFlagAccionInvalida === true || result.output.outFlagAccionInvalida === 1,
    flagMontoInvalido: result.output.outFlagMontoInvalido === true || result.output.outFlagMontoInvalido === 1,
    flagCuentaNoExiste: result.output.outFlagCuentaNoExiste === true || result.output.outFlagCuentaNoExiste === 1,
    flagSaldoInsuficiente: result.output.outFlagSaldoInsuficiente === true || result.output.outFlagSaldoInsuficiente === 1,
    flagError: result.output.outFlagError === true || result.output.outFlagError === 1
  };
}

async function insertarBeneficiario(idUsuarioOrUsuario, ip, numCuenta, valorDocuIdentidad, idParentesco, porcentaje)
{
  const pool = await poolPromise;
  let idUsuario = Number(idUsuarioOrUsuario);

  if (!Number.isInteger(idUsuario)) {
    const usuarioResult = await pool.request()
      .input('inUser', sql.VarChar(20), idUsuarioOrUsuario)
      .query('SELECT TOP (1) id FROM dbo.Usuario WHERE usuario = @inUser');

    idUsuario = usuarioResult.recordset[0]?.id;
  }

  if (!Number.isInteger(Number(idUsuario))) {
    throw new Error('Usuario no encontrado');
  }

  const result = await pool.request()
    .input('inIdUsuario', sql.Int, Number(idUsuario))
    .input('inIP', sql.VarChar(45), ip)
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .input('inValorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .input('inIDParentesco', sql.VarChar(4), idParentesco)
    .input('inPorcentaje', sql.INT, porcentaje)
    .output('outFlagError', sql.BIT)
    .execute('dbo.sp_InsertBeneficiarioBitacora');

  return result.output.outFlagError;
}

async function resolverIdUsuario(pool, idUsuarioOrUsuario) {
  let idUsuario = Number(idUsuarioOrUsuario);

  if (!Number.isInteger(idUsuario)) {
    const usuarioResult = await pool.request()
      .input('inUser', sql.VarChar(20), idUsuarioOrUsuario)
      .query('SELECT TOP (1) id FROM dbo.Usuario WHERE usuario = @inUser');

    idUsuario = usuarioResult.recordset[0]?.id;
  }

  if (!Number.isInteger(Number(idUsuario))) {
    throw new Error('Usuario no encontrado');
  }

  return Number(idUsuario);
}

async function editarBeneficiarioDocuDiferente(idUsuarioOrUsuario, ip, valorDocuIdentidadPasado, valorDocuIdentidadNuevo, nombreBeneficiario, nombreParentesco,
  porcentaje, fechaNacimiento, nombreTipoDocuIdentidad, email, telefono1, telefono2, numCuenta)
{
  const pool = await poolPromise;
  const idUsuario = await resolverIdUsuario(pool, idUsuarioOrUsuario);
  const result = await pool.request()
    .input('inIdUsuario', sql.Int, idUsuario)
    .input('inIP', sql.VarChar(45), ip)
    .input('inValorDocuIdentidadPasado', sql.VarChar(32), valorDocuIdentidadPasado)
    .input('inValorDocuIdentidadNuevo', sql.VarChar(32), valorDocuIdentidadNuevo)
    .input('inNombreBeneficiario', sql.VarChar(64), nombreBeneficiario)
    .input('inIDParentesco', sql.VarChar(4), nombreParentesco)
    .input('inPorcentajeBeneficio', sql.INT, porcentaje)
    .input('inFechaNacimiento', sql.DATE, fechaNacimiento)
    .input('inIDTipoDocuIdentidad', sql.VarChar(4), nombreTipoDocuIdentidad)
    .input('inEmail', sql.VarChar(50), email)
    .input('inTelefono1', sql.VarChar(16), telefono1)
    .input('inTelefono2', sql.VarChar(16), telefono2)
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .output('outFlagExistePersona', sql.BIT)
    .output('outFlagDocuIdentidadRepetido', sql.BIT)
    .output('outFlagExisteBeneficiario', sql.BIT)
    .output('outFlagExisteParentesco', sql.BIT)
    .output('outFlagExisteTipoDocuIdentidad', sql.BIT)
    .output('outFlagError', sql.BIT)
    
    .execute('dbo.sp_EditarBeneficiarioDocuDiferente'); //llamar al SP que edita beneficiario

  return {
    outFlagExistePersona: result.output.outFlagExistePersona,
    outFlagDocuIdentidadRepetido: result.output.outFlagDocuIdentidadRepetido,
    outFlagExisteBeneficiario: result.output.outFlagExisteBeneficiario,
    outFlagExisteParentesco: result.output.outFlagExisteParentesco,
    outFlagExisteTipoDocuIdentidad: result.output.outFlagExisteTipoDocuIdentidad,
    outFlagError: result.output.outFlagError
  };
}

async function editarBeneficiarioDocuIgual(idUsuarioOrUsuario, ip, valorDocuIdentidad, nombreBeneficiario, nombreParentesco,
  porcentaje, fechaNacimiento, nombreTipoDocuIdentidad, email, telefono1, telefono2, numCuenta)
{
  const pool = await poolPromise;
  const idUsuario = await resolverIdUsuario(pool, idUsuarioOrUsuario);
  const result = await pool.request()
    .input('inIdUsuario', sql.Int, idUsuario)
    .input('inIP', sql.VarChar(45), ip)
    .input('inValorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .input('inNombreBeneficiario', sql.VarChar(64), nombreBeneficiario)
    .input('inIDParentesco', sql.VarChar(4), nombreParentesco)
    .input('inPorcentajeBeneficio', sql.INT, porcentaje)
    .input('inFechaNacimiento', sql.DATE, fechaNacimiento)
    .input('inIDTipoDocuIdentidad', sql.VarChar(4), nombreTipoDocuIdentidad)
    .input('inEmail', sql.VarChar(50), email)
    .input('inTelefono1', sql.VarChar(16), telefono1)
    .input('inTelefono2', sql.VarChar(16), telefono2)
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .output('outFlagExistePersona', sql.BIT)
    .output('outFlagDocuIdentidadRepetido', sql.BIT)
    .output('outFlagExisteBeneficiario', sql.BIT)
    .output('outFlagExisteParentesco', sql.BIT)
    .output('outFlagExisteTipoDocuIdentidad', sql.BIT)
    .output('outFlagError', sql.BIT)
    .output('outFlagEncontroParentesco', sql.BIT)
    .execute('dbo.sp_EditarBeneficiarioDocuIgual'); //llamar al SP que edita beneficiario

  const outFlagError = result.output.outFlagError
  const outFlagExistePersona = result.output.outFlagExistePersona
  const outFlagDocuIdentidadRepetido = result.output.outFlagDocuIdentidadRepetido
  const outFlagExisteBeneficiario = result.output.outFlagExisteBeneficiario
  const outFlagExisteParentesco = result.output.outFlagExisteParentesco
  const outFlagExisteTipoDocuIdentidad = result.output.outFlagExisteTipoDocuIdentidad
  const outFlagEncontroParentesco = result.output.outFlagEncontroParentesco
  return {
    outFlagError,
    outFlagExistePersona,
    outFlagDocuIdentidadRepetido,
    outFlagExisteBeneficiario,
    outFlagExisteParentesco,
    outFlagExisteTipoDocuIdentidad,
    outFlagEncontroParentesco
  }; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

async function buscarPersonaPorCedula(valorDocuIdentidad) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inValorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .execute('dbo.sp_BuscarPersonaPorCedula');

  return result.recordset[0] || null;
}

module.exports = { 
  top8_EstadoCuenta_AsociadoCuenta, 
  registrarEventoEstadoCuenta,
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
  buscarPersonaPorCedula
};