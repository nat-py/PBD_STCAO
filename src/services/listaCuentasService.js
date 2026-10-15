const { sql, poolPromise } = require('../config/conexionBD');

async function innerJoin_ListarCuentas(usuario) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inUsuario', sql.VarChar(20), usuario)
    .execute('sp_innerJoin_ListarCuentas'); //llamar al SP que hace el inner join

  return result.recordset; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

module.exports = { innerJoin_ListarCuentas };