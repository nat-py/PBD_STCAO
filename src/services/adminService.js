const { sql, poolPromise } = require('../config/conexionBD');

async function insertarTipoDocuIdentidad(id, nombre) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inID', sql.VarChar(4), id)
    .input('inNombre', sql.VarChar(32), nombre)
    .execute('dbo.sp_InsertTipoDocuIdentidad'); //llamar al SP que inserta docu
  
  return result.returnValue;
}

async function insertarTipoMoneda(id, nombre, simbolo) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inID', sql.VarChar(4), id)
    .input('inNombre', sql.VarChar(32), nombre)
    .input('inSimbolo', sql.VarChar(4), simbolo)
    .execute('dbo.sp_InsertTipoMoneda'); //llamar al SP que inserta docu
  
  return result.returnValue;
}

async function insertarParentesco(id, nombre) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inID', sql.VarChar(4), id)
    .input('inNombre', sql.VarChar(32), nombre)
    .execute('dbo.sp_InsertParentesco'); //llamar al SP que inserta tipo cuenta
  
  return result.returnValue;
}

async function insertarTipoCuentaAhorro(id, nombre, idTipoMoneda, saldoMinimo, multaSaldoMinimo, cargoAnual, numRetirosHumano,
    numRetirosAutomatico, comisionHumano) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inID', sql.VarChar(4), id)
    .input('inNombre', sql.VarChar(32), nombre)
    .input('inIDTipoMoneda', sql.VarChar(4), idTipoMoneda)
    .input('inSaldoMinimo', sql.VarChar(12), saldoMinimo)
    .input('inMultaSaldoMinimo', sql.VarChar(12), multaSaldoMinimo)
    .input('inCargoAnual', sql.VarChar(12), cargoAnual)
    .input('inNumRetirosHumano', sql.VarChar(2), numRetirosHumano)
    .input('inNumRetirosAutomatico', sql.VarChar(2), numRetirosAutomatico)
    .input('inComisionHumano', sql.VarChar(5), comisionHumano)
    .input('inInteres', sql.VarChar(2), interes)
    .execute('dbo.sp_InsertTipoCuentaAhorros'); //llamar al SP que inserta tipo cuenta
  
  return result.returnValue;
}

async function insertarTipoOperacion(id, nombre) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inID', sql.VarChar(4), id) /*ARREGLAR SP EN BASE PORQUE TIENE MAL LA EXTENSION DEL VARCHAR*/
    .input('inNombre', sql.VarChar(50), nombre)
    .execute('dbo.sp_InsertTipoOperacion'); //llamar al SP que inserta tipo cuenta
  
  return result.returnValue;
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
    .execute('dbo.sp_InsertPersona'); //llamar al SP que inserta tipo cuenta
  
  return result.returnValue;
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
    .execute('dbo.sp_InsertCuentaAhorro'); //llamar al SP que inserta tipo cuenta
  
  return result.returnValue;
}

async function insertarBeneficiario(numCuenta, valorDocuIdentidad, idParentesco, porcentaje) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .input('inValorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .input('inIDParentesco', sql.VarChar(4), idParentesco)
    .input('inPorcentaje', sql.INT, porcentaje)
    .execute('dbo.sp_InsertBeneficiario'); //llamar al SP que inserta tipo cuenta
  
  return result.returnValue;
}

async function insertarEstadoCuenta(numCuenta, fechaIni, fechaFin, saldoIni, saldoFin) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .input('inFechaIni', sql.DATE, fechaIni)
    .input('inFechaFin', sql.DATE, fechaFin)
    .input('inSaldoIni', sql.MONEY, saldoIni)
    .input('inSaldoFin', sql.MONEY, saldoFin)
    .execute('dbo.sp_InsertEstadoCuenta'); //llamar al SP que inserta tipo cuenta
  
  return result.returnValue;
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
  
  return result.returnValue; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

async function insertarUsuarioVer(usuario, numCuenta) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inUser', sql.VarChar(15), usuario)
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .execute('dbo.sp_InsertUsuarioVer'); //llamar al SP que inserta usuario
  
  return result.returnValue; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

async function existeUsuario(usuario, contrasena) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inUser', sql.VarChar(15), usuario)
    .input('inPassword', sql.VarChar(15), contrasena)
    .execute('dbo.sp_ExisteUsuario'); //llamar al SP que inserta usuario
  
  return result.returnValue; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

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

async function retornarBeneficiario(numCuenta, valorDocuIdentidad) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .input('inValorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .execute('dbo.sp_RetornarBeneficiario'); //llamar al SP que inserta usuario
  
  return result.recordset; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

async function eliminarBeneficiario(valorDocuIdentidad) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inValorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .execute('dbo.sp_EliminarBeneficiario'); //llamar al SP que inserta usuario
  
  return result.returnValue; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}