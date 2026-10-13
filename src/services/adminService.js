const { sql, poolPromise } = require('../config/conexionBD.js');

async function insertarTipoDocuIdentidad(id, nombre) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inID', sql.VarChar(4), id)
    .input('inNombre', sql.VarChar(32), nombre)
    .execute('dbo.sp_InsertTipoDocuIdentidad'); //llamar al SP que inserta docu
  
  const outFlagError = result.output.outFlagError
  return outFlagError;
}

async function insertarTipoMoneda(id, nombre, simbolo) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inID', sql.VarChar(4), id)
    .input('inNombre', sql.VarChar(32), nombre)
    .input('inSimbolo', sql.VarChar(4), simbolo)
    .execute('dbo.sp_InsertTipoMoneda'); //llamar al SP que inserta tipo moneda
  
  const outFlagError = result.output.outFlagError
  return outFlagError;
}

async function insertarParentesco(id, nombre) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inID', sql.VarChar(4), id)
    .input('inNombre', sql.VarChar(32), nombre)
    .execute('dbo.sp_InsertParentesco'); //llamar al SP que inserta parentesco
  
  const outFlagError = result.output.outFlagError
  return outFlagError;
}

async function insertarTipoCuentaAhorro(id, nombre, idTipoMoneda, saldoMinimo, multaSaldoMinimo, cargoAnual, numRetirosHumano,
    numRetirosAutomatico, comisionHumano, comisionAutomatico, interes) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inID', sql.VarChar(4), id)
    .input('inNombre', sql.VarChar(32), nombre)
    .input('inIDTipoMoneda', sql.VarChar(4), idTipoMoneda)
    .input('inSaldoMinimo', sql.MONEY, saldoMinimo)
    .input('inMultaSaldoMinimo', sql.MONEY, multaSaldoMinimo)
    .input('inCargoAnual', sql.VarChar(12), cargoAnual)
    .input('inNumRetirosHumano', sql.INT, numRetirosHumano)
    .input('inNumRetirosAutomatico', sql.INT, numRetirosAutomatico)
    .input('inComisionHumano', sql.VarChar(5), comisionHumano)
    .input('inComisionAutomatico', sql.VarChar(5), comisionAutomatico)
    .input('inInteres', sql.VarChar(2), interes)
    .execute('dbo.sp_InsertTipoCuentaAhorros'); //llamar al SP que inserta tipo cuenta
  
  const outFlagError = result.output.outFlagError
  return outFlagError;
}

async function insertarTipoOperacion(id, nombre) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inID', sql.VarChar(4), id)
    .input('inNombre', sql.VarChar(50), nombre)
    .execute('dbo.sp_InsertTipoOperacion'); //llamar al SP que inserta tipo operacion
  
  const outFlagError = result.output.outFlagError
  return outFlagError;
}

async function insertarPersona(tipoDocuIdentidad, nombre, valorDocuIdentidad, fechaNacimiento, email, telefono1, telefono2) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inTipoDocuIdentidad', sql.VarChar(4), tipoDocuIdentidad)
    .input('inNombre', sql.VarChar(64), nombre)
    .input('inValorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .input('inFechaNacimiento', sql.DATE, fechaNacimiento)
    .input('inEmail', sql.VarChar(50), email)
    .input('inTelefono1', sql.VarChar(16), telefono1)
    .input('inTelefono2', sql.VarChar(16), telefono2)
    .execute('dbo.sp_InsertPersona'); //llamar al SP que inserta persona
  
  const outFlagError = result.output.outFlagError
  return outFlagError;
}

async function insertarCuentaAhorro(valorDocuIdentidad, idTipoCuenta, numCuenta, fechaCreacion, saldo) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inValorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .input('inIdTipoCuenta', sql.VarChar(4), idTipoCuenta)
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .input('inFechaCreacion', sql.DATE, fechaCreacion)
    .input('inSaldo', sql.MONEY, saldo)
    .execute('dbo.sp_InsertCuentaAhorro'); //llamar al SP que insertar cuenta ahorro
  
  const outFlagError = result.output.outFlagError
  return outFlagError;
}

async function insertarBeneficiario(numCuenta, valorDocuIdentidad, idParentesco, porcentaje) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .input('inValorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .input('inIDParentesco', sql.VarChar(4), idParentesco)
    .input('inPorcentaje', sql.INT, porcentaje)
    .execute('dbo.sp_InsertBeneficiario'); //llamar al SP que inserta beneficiario
  
  const outFlagError = result.output.outFlagError
  return outFlagError;
}

async function insertarEstadoCuenta(numCuenta, fechaIni, fechaFin, saldoIni, saldoMini, saldoFin,
interesesAcumulados, cantidadRetiros, cantidadDepositos, cantidadSinpeEntrantes, 
cantidadSinpeSalientes) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .input('inFechaIni', sql.DATE, fechaIni)
    .input('inFechaFin', sql.DATE, fechaFin)
    .input('inSaldoIni', sql.MONEY, saldoIni)
    .input('inSaldoMini', sql.MONEY, saldoMini)
    .input('inSaldoFin', sql.MONEY, saldoFin)
    .input('inInteresesAcumulados', sql.MONEY, interesesAcumulados)
    .input('inCantidadRetiros', sql.MONEY, cantidadRetiros)
    .input('inCantidadDepositos', sql.MONEY, cantidadDepositos)
    .input('inCantidadSinpeEntrantes', sql.MONEY, cantidadSinpeEntrantes)
    .input('inCantidadSinpeSalientes', sql.MONEY, cantidadSinpeSalientes)
    .execute('dbo.sp_InsertEstadoCuenta'); //llamar al SP que inserta estado cuenta
  
  const outFlagError = result.output.outFlagError
  return outFlagError;
}

async function insertarUsuario(usuario, contrasena, esAdmin, valorDocuIdentidad) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inUser', sql.VarChar(15), usuario)
    .input('inPassword', sql.VarChar(15), contrasena)
    .input('esAdmin', sql.BIT, esAdmin)
    .input('valorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .execute('dbo.sp_InsertUsuario'); //llamar al SP que inserta usuario
  
  const outFlagError = result.output.outFlagError
  return outFlagError; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

async function insertarUsuarioVer(usuario, numCuenta) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inUser', sql.VarChar(15), usuario)
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .execute('dbo.sp_InsertUsuarioVer'); //llamar al SP que inserta usuarios ver
  
  const outFlagError = result.output.outFlagError
  return outFlagError; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

async function existeUsuario(usuario, contrasena) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inUser', sql.VarChar(15), usuario)
    .input('inPassword', sql.VarChar(15), contrasena)
    .input('outFlagExiste', sql.BIT, 0)
    .input('outFlagEsAdmin', sql.BIT, 0)
    .execute('dbo.sp_ExisteUsuario'); //llamar al SP que verifica existencia
  
  const outFlagError = result.output.outFlagError
  const outFlagEsdmin = result.output.outFlagEsAdmin
  return {outFlagError, outFlagEsdmin}; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

async function innerJoin_Beneficiario_EstadoCuenta_AsociadoCuenta(numCuenta) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .execute('dbo.sp_innerJoin_Beneficiario_EstadoCuenta_AsociadoCuenta'); //llamar al SP que hace el inner join
  
  return result.recordset; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

/*
async function beneficiariosAsociadosCuentaAhorro(numCuenta) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .execute('dbo.sp_beneficiarioAsociadoCuenta'); //llamar al SP que inserta usuario
  
  return result.recordset; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

async function estadoCuentaAsociadosCuentaAhorro(numCuenta) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .execute('dbo.sp_EstadoCuentaAsociadoCuenta'); //llamar al SP que inserta usuario
  
  return result.recordset; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}
*/

async function retornarBeneficiario(numCuenta, valorDocuIdentidad) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .input('inValorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .execute('dbo.sp_RetornarBeneficiario'); //llamar al SP que devuelve el beneficiario
  
  return result.recordset; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

async function eliminarBeneficiario(valorDocuIdentidad) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inValorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .execute('dbo.sp_EliminarBeneficiario'); //llamar al SP que elimina beneficiario
  
  const outFlagError = result.output.outFlagError
  return outFlagError; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

async function existenTablasCatalogo() 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .execute('dbo.sp_ExistenciaTablasCatalogo'); //llamar al SP que verifica existencia
  
  const outFlagError = result.output.outFlagError
  return outFlagError; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

/*------------------------------- Services Select Tablas Activas -------------------------------*/

async function tablaTipoDocuIdentidadActivo() 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .execute('dbo.sp_TablaDocumentoIdentidadActivo');
  
  return result.recordset;
}

async function tablaTipoMonedaActivo() 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .execute('dbo.sp_TablaTipoMonedaActivo');
  
  return result.recordset;
}

async function tablaParentescoActivo() 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .execute('dbo.sp_TablaParentescoActivo');
  
  return result.recordset;
}

async function tablaTipoCuentaAhorroActivo() 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .execute('dbo.sp_TablaTipoCuentaAhorroActivo');
  
  return result.recordset;
}

async function tablaTipoOperacionActivo() 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .execute('dbo.sp_TablaTipoOperacionActivo');
  
  return result.recordset;
}

async function tablaPersonaActiva() 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .execute('dbo.sp_TablaPersonaActivo');
  
  return result.recordset;
}

async function tablaCuentaAhorroActivo() 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .execute('dbo.sp_TablaCuentaAhorroActivo');
  
  return result.recordset;
}

async function tablaBeneficiarioActivo() 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .execute('dbo.sp_TablaBeneficiarioActivo');
  
  return result.recordset;
}

async function tablaEstadoCuentaActivo() 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .execute('dbo.sp_TablaEstadoCuentaActivo');
  
  return result.recordset;
}

async function tablaUsuarioActivo() 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .execute('dbo.sp_TablaUsuarioActivo');
  
  return result.recordset;
}

async function tablaUsuariosVerActivo() 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .execute('dbo.sp_TablaUsuariosVerActivo');
  
  return result.recordset;
}