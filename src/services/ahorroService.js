const { sql, poolPromise } = require('../config/conexionBD.js');

async function top8_EstadoCuenta_AsociadoCuenta(numCuenta) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .execute('dbo.sp_Top8_EstadoCuenta_AsociadoCuenta'); //llamar al SP

  return result.recordset; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

async function beneficiariosAsociadosCuenta(numCuenta) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .execute('dbo.sp_beneficiarioAsociadoCuenta'); //llamar al SP que inserta usuario

  return result.recordset; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

async function eliminarBeneficiario(valorDocuIdentidad) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inValorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .output('outFlagError', sql.BIT)
    .execute('dbo.sp_EliminarBeneficiario'); //llamar al SP que elimina beneficiario

  const outFlagError = result.output.outFlagError
  return outFlagError; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
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

async function insertarBeneficiario(numCuenta, valorDocuIdentidad, idParentesco, porcentaje) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .input('inValorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .input('inIDParentesco', sql.VarChar(4), idParentesco)
    .input('inPorcentaje', sql.INT, porcentaje)
    .output('outFlagError', sql.INT)
    .execute('dbo.sp_InsertBeneficiario');
  
  return result.output.outFlagError;
}

async function editarBeneficiarioDocuDiferente(valorDocuIdentidadPasado, valorDocuIdentidadNuevo, nombreBeneficiario, nombreParentesco,
  porcentaje, fechaNacimiento, nombreTipoDocuIdentidad, email, telefono1, telefono2, numCuenta) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inValorDocuIdentidadPasado', sql.VarChar(32), valorDocuIdentidadPasado)
    .input('inValorDocuIdentidadNuevo', sql.VarChar(32), valorDocuIdentidadNuevo)
    .input('inNombreBeneficiario', sql.VarChar(64), nombreBeneficiario)
    .input('inNombreParentesco', sql.VarChar(32), nombreParentesco)
    .input('inPorcentajeBeneficio', sql.INT, porcentaje)
    .input('inFechaNacimiento', sql.DATE, fechaNacimiento)
    .input('inNombreTipoDocuIdentidad', sql.VarChar(32), nombreTipoDocuIdentidad)
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
    .execute('dbo.sp_EditarBeneficiario'); //llamar al SP que edita beneficiario
  
  const outFlagError = result.output.outFlagError
  return outFlagError; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

async function editarBeneficiarioDocuIgual(valorDocuIdentidad, nombreBeneficiario, nombreParentesco,
  porcentaje, fechaNacimiento, nombreTipoDocuIdentidad, email, telefono1, telefono2, numCuenta) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inValorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .input('inNombreBeneficiario', sql.VarChar(64), nombreBeneficiario)
    .input('inNombreParentesco', sql.VarChar(32), nombreParentesco)
    .input('inPorcentajeBeneficio', sql.INT, porcentaje)
    .input('inFechaNacimiento', sql.DATE, fechaNacimiento)
    .input('inNombreTipoDocuIdentidad', sql.VarChar(32), nombreTipoDocuIdentidad)
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
    .execute('dbo.sp_EditarBeneficiario'); //llamar al SP que edita beneficiario
  
  const outFlagError = result.output.outFlagError
  return outFlagError; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}


module.exports = { 
  top8_EstadoCuenta_AsociadoCuenta, 
  beneficiariosAsociadosCuenta, 
  eliminarBeneficiario, 
  tablaParentescoActivo, 
  tablaTipoDocuIdentidadActivo,
  insertarBeneficiario,
  editarBeneficiarioDocuDiferente,
  editarBeneficiarioDocuIgual
};