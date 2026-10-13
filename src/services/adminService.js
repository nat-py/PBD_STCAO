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