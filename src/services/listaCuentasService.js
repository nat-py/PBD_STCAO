const { sql, poolPromise } = require('../config/conexionBD');

async function innerJoin_ListarCuentas(usuario) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inUsuario', sql.VarChar(20), usuario)
    .execute('sp_innerJoin_ListarCuentas'); //llamar al SP que hace el inner join

  return result.recordset; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

async function buscarPersonaPorCedula(valorDocuIdentidad) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inValorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .execute('dbo.sp_BuscarPersonaPorCedula');

  return result.recordset[0] || null;
}

async function crearCuentaAhorro(idUsuarioOrUsuario, ip, valorDocuIdentidad, idTipoCuenta, saldoInicial) {
  const pool = await poolPromise;
  let idUsuario = Number(idUsuarioOrUsuario);
  let usuarioActual = String(idUsuarioOrUsuario ?? '').trim();

  if (!Number.isInteger(idUsuario)) {
    const usuarioResult = await pool.request()
      .input('inUser', sql.VarChar(20), idUsuarioOrUsuario)
      .query('SELECT TOP (1) id FROM dbo.Usuario WHERE usuario = @inUser');

    idUsuario = usuarioResult.recordset[0]?.id;
  } else {
    const usuarioResult = await pool.request()
      .input('inIdUsuario', sql.Int, idUsuario)
      .query('SELECT TOP (1) usuario FROM dbo.Usuario WHERE id = @inIdUsuario');
    usuarioActual = usuarioResult.recordset[0]?.usuario || usuarioActual;
  }

  if (!Number.isInteger(Number(idUsuario))) {
    throw new Error('Usuario no encontrado');
  }

  const result = await pool.request()
    .input('inIdUsuario', sql.Int, Number(idUsuario))
    .input('inIP', sql.VarChar(32), ip)
    .input('inValorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .input('inIdTipoCuenta', sql.VarChar(4), idTipoCuenta)
    .input('inSaldoInicial', sql.MONEY, saldoInicial)
    .output('outNumCuentaGenerado', sql.VarChar(10))
    .output('outFlagError', sql.BIT)
    .execute('dbo.sp_CrearCuentaAhorro');

  let numCuentaGenerado = result.output.outNumCuentaGenerado;

  if (!result.output.outFlagError && numCuentaGenerado) {
    const propietarioResult = await pool.request()
      .input('inValorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
      .query(`
        SELECT TOP (1) usuario
        FROM dbo.Usuario
        WHERE valorDocuIdentidad = @inValorDocuIdentidad
          AND estado = 1
      `);

    const usuarioPropietario =
      propietarioResult.recordset[0]?.usuario || usuarioActual;

    if (usuarioPropietario) {
      await pool.request()
        .input('inUser', sql.VarChar(20), usuarioPropietario)
        .input('inNumCuenta', sql.VarChar(10), numCuentaGenerado)
        .output('outFlagError', sql.BIT)
        .execute('dbo.sp_InsertUsuarioVer');
    }
  }

  return {
    outNumCuentaGenerado: numCuentaGenerado,
    outFlagError: result.output.outFlagError
  };
}

module.exports = {
  innerJoin_ListarCuentas,
  buscarPersonaPorCedula,
  crearCuentaAhorro
};