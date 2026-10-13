const { sql, poolPromise } = require('../config/conexionBD');

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

  console.log('Resultado del procedimiento almacenado:', outFlagError, outFlagEsdmin);

  return {outFlagError, outFlagEsdmin}; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}
module.exports = { existeUsuario };