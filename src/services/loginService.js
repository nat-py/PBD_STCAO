const { sql, poolPromise } = require('../config/conexionBD');

async function existeUsuario(usuario, contrasena) 
{

  console.log('Verificando existencia del usuario:', usuario, 'con la contraseña:', contrasena);

  const pool = await poolPromise;
  const result = await pool.request()
    .input('inUser', sql.VarChar(15), usuario)
    .input('inPassword', sql.VarChar(15), contrasena)
    .execute('dbo.sp_ExisteUsuario'); //llamar al SP que verifica existencia
  
  const outFlagError = result.output.outFlagError
  const outFlagEsdmin = result.output.outFlagEsAdmin
  return {outFlagError, outFlagEsdmin}; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

module.exports = { existeUsuario };