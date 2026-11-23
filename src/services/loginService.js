const { sql, poolPromise } = require('../config/conexionBD');

async function existeUsuario(usuario, contrasena, ip)
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inUser', sql.VarChar(20), usuario)
    .input('inPassword', sql.VarChar(20), contrasena)
    .input('inIP', sql.VarChar(45), ip)
    .output('outFlagExiste', sql.BIT)
    .output('outFlagEsAdmin', sql.BIT)
    .execute('dbo.sp_ExisteUsuario'); //llamar al SP que verifica existencia

  const outFlagExiste = result.output.outFlagExiste;
  const outFlagEsAdmin = result.output.outFlagEsAdmin;
  return {outFlagExiste, outFlagEsAdmin}; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

async function registrarCierreSesion(idUsuarioOrUsuario, ip) {
  const pool = await poolPromise;
  let idUsuario = Number(idUsuarioOrUsuario);

  if (!Number.isInteger(idUsuario)) {
    const result = await pool.request()
      .input('inUser', sql.VarChar(20), idUsuarioOrUsuario)
      .query('SELECT TOP (1) id FROM dbo.Usuario WHERE usuario = @inUser');

    idUsuario = result.recordset[0]?.id;
  }

  if (!Number.isInteger(Number(idUsuario))) {
    throw new Error('Usuario no encontrado');
  }

  await pool.request()
    .input('inIdUsuario', sql.Int, Number(idUsuario))
    .input('inIP', sql.VarChar(45), ip)
    .execute('dbo.sp_RegistrarCierreSesion');

  return { success: true };
}

async function registrarPersonaUsuario(ip, persona, usuario) {
  const pool = await poolPromise;
  const request = pool.request()
    .input('inIP', sql.VarChar(32), ip)
    .input('inTipoDocuIdentidad', sql.VarChar(4), persona.TipoDocuIdentidad)
    .input('inNombre', sql.VarChar(64), persona.Nombre)
    .input('inValorDocuIdentidad', sql.VarChar(32), persona.ValorDocumentoIdentidad)
    .input('inFechaNacimiento', sql.Date, persona.FechaNacimiento)
    .input('inEmail', sql.VarChar(50), persona.Email)
    .input('inTelefono1', sql.VarChar(16), persona.telefono1)
    .input('inTelefono2', sql.VarChar(16), persona.telefono2 || null)
    .input('inUsuario', sql.VarChar(32), usuario.usuario)
    .input('inClave', sql.VarChar(32), usuario.contrasena)
    .output('outIdUsuarioCreado', sql.Int)
    .output('outFlagDocuIdentidadExiste', sql.BIT)
    .output('outFlagTipoDocuExiste', sql.BIT)
    .output('outFlagUsuarioExiste', sql.BIT)
    .output('outFlagError', sql.BIT);

  const result = await request.execute('dbo.sp_RegistrarPersonaUsuario');
  return {
    idUsuarioCreado: result.output.outIdUsuarioCreado,
    flagDocuIdentidadExiste: result.output.outFlagDocuIdentidadExiste,
    flagTipoDocuExiste: result.output.outFlagTipoDocuExiste,
    flagUsuarioExiste: result.output.outFlagUsuarioExiste,
    flagError: result.output.outFlagError
  };
}

async function crearCuentaDeRegistro(idUsuario, ip, valorDocuIdentidad, idTipoCuenta, saldoInicial) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inIdUsuario', sql.Int, idUsuario)
    .input('inIP', sql.VarChar(32), ip)
    .input('inValorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .input('inIdTipoCuenta', sql.VarChar(4), idTipoCuenta)
    .input('inSaldoInicial', sql.MONEY, saldoInicial)
    .output('outNumCuentaGenerado', sql.VarChar(10))
    .output('outFlagError', sql.BIT)
    .execute('dbo.sp_CrearCuentaAhorro');

  return {
    numCuenta: result.output.outNumCuentaGenerado,
    flagError: result.output.outFlagError
  };
}

async function validarCuentaBeneficiario(numCuenta, usuario, contrasena) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .input('inUsuario', sql.VarChar(32), usuario)
    .input('inClave', sql.VarChar(32), contrasena)
    .output('outEsValido', sql.BIT)
    .output('outCantidadBeneficiariosActivos', sql.Int)
    .output('outPorcentajeDisponible', sql.Int)
    .execute('dbo.sp_ValidarCuentaCredenciales');

  return {
    esValido: result.output.outEsValido,
    cantidadBeneficiariosActivos: result.output.outCantidadBeneficiariosActivos,
    porcentajeDisponible: result.output.outPorcentajeDisponible,
    beneficiarios: result.recordset || []
  };
}

async function insertarBeneficiarioRegistro(idUsuario, ip, numCuenta, valorDocuIdentidad, idParentesco, porcentaje) {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const existentesResult = await transaction.request()
      .input('inNumCuenta', sql.VarChar(10), numCuenta)
      .query(`
        SELECT id, porcentaje
        FROM dbo.Beneficiario
        WHERE numCuenta = @inNumCuenta
          AND estado = 1
        ORDER BY id ASC
      `);

    const existentes = existentesResult.recordset || [];
    if (existentes.length >= 3) {
      await transaction.rollback();
      return {
        flagError: true,
        message: 'La cuenta ya tiene los 3 beneficiarios permitidos.'
      };
    }

    if (existentes.length === 0 && porcentaje !== 100) {
      await transaction.rollback();
      return {
        flagError: true,
        message: 'Cuando no hay beneficiarios, el nuevo beneficiario debe tener el 100%.'
      };
    }

    const porcentajeExistentes = 100 - porcentaje;
    if (porcentajeExistentes < existentes.length && existentes.length > 0) {
      await transaction.rollback();
      return {
        flagError: true,
        message: 'El porcentaje solicitado deja menos de 1% disponible para un beneficiario existente.'
      };
    }

    if (existentes.length > 0) {
      const base = Math.floor(porcentajeExistentes / existentes.length);
      const resto = porcentajeExistentes % existentes.length;

      for (let index = 0; index < existentes.length; index++) {
        const nuevoPorcentaje = base + (index < resto ? 1 : 0);
        await transaction.request()
          .input('inId', sql.Int, existentes[index].id)
          .input('inPorcentaje', sql.Int, nuevoPorcentaje)
          .query(`
            UPDATE dbo.Beneficiario
            SET porcentaje = @inPorcentaje
            WHERE id = @inId
              AND estado = 1
          `);
      }
    }

    const result = await transaction.request()
      .input('inIdUsuario', sql.Int, idUsuario)
      .input('inIP', sql.VarChar(45), ip)
      .input('inNumCuenta', sql.VarChar(10), numCuenta)
      .input('inValorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
      .input('inIDParentesco', sql.VarChar(4), idParentesco)
      .input('inPorcentaje', sql.INT, porcentaje)
      .output('outFlagError', sql.BIT)
      .execute('dbo.sp_InsertBeneficiarioBitacora');

    if (result.output.outFlagError) {
      await transaction.rollback();
      return {
        flagError: true,
        message: 'No se pudo insertar el nuevo beneficiario.'
      };
    }

    await transaction.commit();
    return { flagError: false, mensaje: 'Beneficiario agregado y porcentajes recalculados.' };
  } catch (error) {
    try {
      await transaction.rollback();
    } catch (_) {
      // La transaccion ya pudo haber finalizado.
    }
    throw error;
  }
}

module.exports = {
  existeUsuario,
  registrarCierreSesion,
  registrarPersonaUsuario,
  crearCuentaDeRegistro,
  validarCuentaBeneficiario,
  insertarBeneficiarioRegistro
};