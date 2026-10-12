const { sql, poolPromise } = require('../config/conexionBD');



async function existeUsuario(usuario, contrasena) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inUser', sql.VarChar(15), usuario)
    .input('inPassword', sql.VarChar(15), contrasena)
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

