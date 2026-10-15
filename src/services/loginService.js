const { sql, poolPromise } = require('../config/conexionBD');

async function existeUsuario(usuario, contrasena) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inUser', sql.VarChar(20), usuario)
    .input('inPassword', sql.VarChar(20), contrasena)
    .output('outFlagExiste', sql.BIT)
    .output('outFlagEsAdmin', sql.BIT)
    .execute('dbo.sp_ExisteUsuario'); //llamar al SP que verifica existencia

  const outFlagExiste = result.output.outFlagExiste
  const outFlagEsAdmin = result.output.outFlagEsAdmin
  return {outFlagExiste, outFlagEsAdmin}; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

module.exports = { existeUsuario };
