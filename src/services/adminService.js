const { sql, poolPromise } = require('../config/conexionBD.js');

async function resolverIdUsuario(pool, idUsuarioOrUsuario) {
  const idUsuario = Number(idUsuarioOrUsuario);
  if (Number.isInteger(idUsuario)) return idUsuario;

  const usuarioResult = await pool.request()
    .input('inUser', sql.VarChar(20), idUsuarioOrUsuario)
    .query('SELECT TOP (1) id FROM dbo.Usuario WHERE usuario = @inUser');

  if (!usuarioResult.recordset[0]?.id) {
    throw new Error('Usuario no encontrado');
  }

  return usuarioResult.recordset[0].id;
}

async function insertarTipoDocuIdentidad(id, nombre) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inID', sql.VarChar(4), id)
    .input('inNombre', sql.VarChar(32), nombre)
    .output('outFlagError', sql.BIT)
    .execute('dbo.sp_InsertTipoDocuIdentidad'); //llamar al SP que inserta docu
  
  const outFlagError = result.output.outFlagError
  return outFlagError;
}

async function insertarTipoMoneda(id, nombre, simbolo) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inID', sql.VarChar(4), id)
    .input('inNombre', sql.VarChar(32), nombre)
    .input('inSimbolo', sql.VarChar(4), simbolo)
    .output('outFlagError', sql.BIT)
    .execute('dbo.sp_InsertTipoMoneda'); //llamar al SP que inserta tipo moneda
  
  const outFlagError = result.output.outFlagError
  return outFlagError;
}

async function insertarParentesco(id, nombre) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inID', sql.VarChar(4), id)
    .input('inNombre', sql.VarChar(32), nombre)
    .output('outFlagError', sql.BIT)
    .execute('dbo.sp_InsertParentesco'); //llamar al SP que inserta parentesco
  
  const outFlagError = result.output.outFlagError
  return outFlagError;
}

async function insertarTipoCuentaAhorro(id, nombre, idTipoMoneda, saldoMinimo, multaSaldoMinimo, cargoAnual, numRetirosHumano,
    numRetirosAutomatico, comisionHumano, comisionAutomatico, interes) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inID', sql.VarChar(4), id)
    .input('inNombre', sql.VarChar(32), nombre)
    .input('inIDTipoMoneda', sql.VarChar(4), idTipoMoneda)
    .input('inSaldoMinimo', sql.MONEY, saldoMinimo)
    .input('inMultaSaldoMinimo', sql.MONEY, multaSaldoMinimo)
    .input('inCargoAnual', sql.VarChar(12), cargoAnual)
    .input('inNumRetirosHumano', sql.INT, numRetirosHumano)
    .input('inNumRetirosAutomatico', sql.INT, numRetirosAutomatico)
    .input('inComisionHumano', sql.VarChar(5), comisionHumano)
    .input('inComisionAutomatico', sql.VarChar(5), comisionAutomatico)
    .input('inInteres', sql.VarChar(5), interes)
    .output('outFlagError', sql.BIT)
    .execute('dbo.sp_InsertTipoCuentaAhorro'); //llamar al SP que inserta tipo cuenta
  
  const outFlagError = result.output.outFlagError
  return outFlagError;
}

async function modificarTipoCuentaAhorro(id, nombre, idTipoMoneda, saldoMinimo, multaSaldoMinimo, cargoAnual,
  numRetirosHumano, numRetirosAutomatico, comisionHumano, comisionAutomatico, interes) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inID', sql.VarChar(4), id)
    .input('inNombre', sql.VarChar(32), nombre)
    .input('inIDTipoMoneda', sql.VarChar(4), idTipoMoneda)
    .input('inSaldoMinimo', sql.MONEY, saldoMinimo)
    .input('inMultaSaldoMinimo', sql.MONEY, multaSaldoMinimo)
    .input('inCargoAnual', sql.VarChar(12), cargoAnual)
    .input('inNumRetirosHumano', sql.INT, numRetirosHumano)
    .input('inNumRetirosAutomatico', sql.INT, numRetirosAutomatico)
    .input('inComisionHumano', sql.VarChar(5), comisionHumano)
    .input('inComisionAutomatico', sql.VarChar(5), comisionAutomatico)
    .input('inInteres', sql.VarChar(5), interes)
    .output('outFlagError', sql.BIT)
    .execute('dbo.sp_UpdateTipoCuentaAhorro');

  return result.output.outFlagError;
}

async function eliminarTipoCuentaAhorro(id) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inIDTipoCuentaAhorro', sql.VarChar(4), id)
    .output('outFlagError', sql.BIT)
    .execute('dbo.sp_EliminarTipoCuentaAhorro');

  return {
    outFlagError: result.output.outFlagError,
    cuentas: result.recordset
  };
}


/*------------------------------- Services CRUD Tipo Documento Identidad -------------------------------*/

async function modificarTipoDocuIdentidad(id, nombre) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inID', sql.VarChar(4), id)
    .input('inNombre', sql.VarChar(32), nombre)
    .output('outFlagError', sql.BIT)
    .execute('dbo.sp_UpdateTipoDocuIdentidad'); //llamar al SP que devuelve el beneficiario
  
  const outFlagError = result.output.outFlagError
  return outFlagError; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

async function eliminarTipoDocuIdentidad(id) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inIDTipoDocuIdentidad', sql.VarChar(4), id)
    .output('outFlagError', sql.BIT)
    .execute('dbo.sp_EliminarTipoDocuIdentidad'); //llamar al SP que devuelve el beneficiario
  
  const outFlagError = result.output.outFlagError
  const personas = result.recordset;
  return { outFlagError, personas }; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

/*------------------------------- Services CRUD Tipo Moneda -------------------------------*/

async function modificarTipoMoneda(id, nombre, simbolo) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inID', sql.VarChar(4), id)
    .input('inNombre', sql.VarChar(32), nombre)
    .input('inSimbolo', sql.VarChar(4), simbolo)
    .output('outFlagError', sql.BIT)
    .execute('dbo.sp_UpdateTipoMoneda'); //llamar al SP que devuelve el beneficiario
  
  const outFlagError = result.output.outFlagError
  return outFlagError; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

async function eliminarTipoMoneda(id) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inIDTipoMoneda', sql.VarChar(4), id)
    .output('outFlagError', sql.BIT)
    .execute('dbo.sp_EliminarTipoMoneda'); //llamar al SP que devuelve el beneficiario
  
  const outFlagError = result.output.outFlagError
  const tiposCuenta = result.recordset;
  return { outFlagError, tiposCuenta }; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

/*------------------------------- Services CRUD Parentesco -------------------------------*/

async function modificarParentesco(id, nombre) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inID', sql.VarChar(4), id)
    .input('inNombre', sql.VarChar(32), nombre)
    .output('outFlagError', sql.BIT)
    .execute('dbo.sp_UpdateParentesco'); //llamar al SP que devuelve el beneficiario
  
  const outFlagError = result.output.outFlagError
  return outFlagError; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

async function eliminarParentesco(id) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inIDParentesco', sql.VarChar(4), id)
    .output('outFlagError', sql.BIT)
    .execute('dbo.sp_EliminarParentesco'); //llamar al SP que devuelve el beneficiario
  
  const outFlagError = result.output.outFlagError
  const beneficiarios = result.recordset;
  return { outFlagError, beneficiarios }; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

/*------------------------------- Services CRUD Beneficiario -------------------------------*/

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
    .output('outFlagError', sql.BIT)
    .execute('dbo.sp_EliminarBeneficiario'); //llamar al SP que elimina beneficiario
  
  const outFlagError = result.output.outFlagError
  return outFlagError; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

async function eliminarBeneficiarioReasignar(idUsuarioOrUsuario, ip, numCuenta, valorDocuIdentidad) {
  const pool = await poolPromise;
  let idUsuario = Number(idUsuarioOrUsuario);

  if (!Number.isInteger(idUsuario)) {
    const usuarioResult = await pool.request()
      .input('inUser', sql.VarChar(20), idUsuarioOrUsuario)
      .query('SELECT TOP (1) id FROM dbo.Usuario WHERE usuario = @inUser');

    idUsuario = usuarioResult.recordset[0]?.id;
  }

  if (!Number.isInteger(Number(idUsuario))) {
    throw new Error('Usuario no encontrado');
  }

  const result = await pool.request()
    .input('inIdUsuario', sql.Int, Number(idUsuario))
    .input('inIP', sql.VarChar(32), ip)
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .input('inValorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .output('outFlagUnicoBeneficiario', sql.BIT)
    .output('outFlagError', sql.BIT)
    .execute('dbo.sp_EliminarBeneficiarioReasignar');

  return {
    outFlagUnicoBeneficiario: result.output.outFlagUnicoBeneficiario,
    outFlagError: result.output.outFlagError
  };
}

/*------------------------------- Services Select Tablas (Toda) -------------------------------*/

async function tablaTipoDocuIdentidad() 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .execute('dbo.sp_TablaDocumentoIdentidad');
  
  return result.recordset;
}

async function tablaTipoMoneda() 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .execute('dbo.sp_TablaTipoMoneda');
  
  return result.recordset;
}

async function tablaParentesco() 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .execute('dbo.sp_TablaParentesco');
  
  return result.recordset;
}

/*------------------------------- Services Select Tablas (Activas) -------------------------------*/

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

  const tiposCuentas = result.recordset;
  const tieneComisionAutomatica = tiposCuentas.some(
    cuenta => cuenta.comisionAutomatico !== undefined
  );

  if (tieneComisionAutomatica) {
    return tiposCuentas;
  }

  const comisiones = await pool.request().query(`
    SELECT id, comisionAutomatico
    FROM dbo.TipoCuentaAhorro
    WHERE estado = 1
  `);

  const comisionesPorId = new Map(
    comisiones.recordset.map(cuenta => [String(cuenta.id), cuenta.comisionAutomatico])
  );

  return tiposCuentas.map(cuenta => ({
    ...cuenta,
    comisionAutomatico: comisionesPorId.get(String(cuenta.id)) ?? null
  }));
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

async function administrarPersonas() {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT
      p.id,
      p.tipoDocuIdentidad,
      td.nombre AS tipoDocuNombre,
      p.nombre,
      p.valorDocuIdentidad,
      p.fechaNacimiento,
      p.email,
      p.telefono1,
      p.telefono2,
      p.estado
    FROM dbo.Persona p
    LEFT JOIN dbo.TipoDocumentoIdentidad td
      ON td.id = p.tipoDocuIdentidad
    WHERE p.estado = 1
    ORDER BY p.id;

    SELECT
      u.id AS idUsuario,
      u.usuario,
      u.contrasena,
      u.esAdmin,
      u.valorDocuIdentidad
    FROM dbo.Usuario u
    WHERE u.estado = 1;

    SELECT
      uv.usuario,
      uv.numCuenta,
      c.valorDocuIdentidad,
      c.idTipoCuenta,
      tc.nombre AS tipoCuentaNombre,
      c.fechaCreacion,
      c.saldo,
      p.nombre AS nombrePropietario
    FROM dbo.UsuariosVer uv
    INNER JOIN dbo.CuentaAhorro c
      ON c.numCuenta = uv.numCuenta
     AND c.estado = 1
    INNER JOIN dbo.TipoCuentaAhorro tc
      ON tc.id = c.idTipoCuenta
    INNER JOIN dbo.Persona p
      ON p.valorDocuIdentidad = c.valorDocuIdentidad
    WHERE uv.estado = 1;

    SELECT
      b.valorDocuIdentidad,
      b.numCuenta,
      b.porcentaje,
      par.nombre AS parentesco
    FROM dbo.Beneficiario b
    LEFT JOIN dbo.Parentesco par
      ON par.id = b.idParentesco
    WHERE b.estado = 1;
  `);

  const personas = result.recordsets[0] || [];
  const usuarios = result.recordsets[1] || [];
  const cuentasAccesibles = result.recordsets[2] || [];
  const beneficiarios = result.recordsets[3] || [];

  return personas.map(persona => {
    const documento = String(persona.valorDocuIdentidad || '').trim();
    const usuario = usuarios.find(
      item => String(item.valorDocuIdentidad || '').trim() === documento
    );
    const nombresUsuario = usuario ? [usuario] : [];

    const cuentasAhorro = cuentasAccesibles
      .filter(cuenta => nombresUsuario.some(item => item.usuario === cuenta.usuario))
      .map(cuenta => ({
        numCuenta: cuenta.numCuenta,
        idTipoCuenta: cuenta.idTipoCuenta,
        tipoCuentaNombre: cuenta.tipoCuentaNombre,
        fechaCreacion: cuenta.fechaCreacion,
        saldo: cuenta.saldo,
        valorDocuIdentidad: cuenta.valorDocuIdentidad,
        nombrePropietario: cuenta.nombrePropietario
      }));

    const cuentasBeneficiario = beneficiarios
      .filter(beneficiario =>
        String(beneficiario.valorDocuIdentidad || '').trim() === documento
      )
      .map(beneficiario => ({
        numCuenta: beneficiario.numCuenta,
        valorDocuIdentidad: beneficiario.valorDocuIdentidad,
        parentesco: beneficiario.parentesco,
        porcentaje: beneficiario.porcentaje
      }));

    const fecha = persona.fechaNacimiento
      ? new Date(persona.fechaNacimiento)
      : null;

    return {
      id: persona.id,
      nombre: persona.nombre,
      idTipoDocuIdentidad: persona.tipoDocuIdentidad,
      tipoDocuNombre: persona.tipoDocuNombre,
      valorDocuIdentidad: persona.valorDocuIdentidad,
      fechaNacimiento: fecha && !Number.isNaN(fecha.getTime())
        ? `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
        : '',
      email: persona.email,
      telefono1: persona.telefono1,
      telefono2: persona.telefono2,
      usuario: usuario?.usuario || '',
      idUsuarioObjetivo: usuario?.idUsuario || null,
      contrasena: usuario?.contrasena || '',
      esAdmin: usuario?.esAdmin || false,
      cuentasAhorro,
      cuentasBeneficiario
    };
  });
}

async function editarPersona(idUsuarioOrUsuario, ip, personaAnterior, personaNueva) {
  const pool = await poolPromise;
  const idUsuario = await resolverIdUsuario(pool, idUsuarioOrUsuario);

  const result = await pool.request()
    .input('inIdUsuario', sql.Int, idUsuario)
    .input('inIP', sql.VarChar(32), ip)
    .input('inValorDocuIdentidadActual', sql.VarChar(32), personaAnterior.valorDocuIdentidad)
    .input('inValorDocuIdentidadNuevo', sql.VarChar(32), personaNueva.valorDocuIdentidad)
    .input('inTipoDocuIdentidad', sql.VarChar(4), personaNueva.idTipoDocuIdentidad)
    .input('inNombre', sql.VarChar(64), personaNueva.nombre)
    .input('inFechaNacimiento', sql.Date, personaNueva.fechaNacimiento || null)
    .input('inEmail', sql.VarChar(50), personaNueva.email || '')
    .input('inTelefono1', sql.VarChar(16), personaNueva.telefono1 || '')
    .input('inTelefono2', sql.VarChar(16), personaNueva.telefono2 || '')
    .output('outFlagExistePersona', sql.BIT)
    .output('outFlagDocuIdentidadRepetido', sql.BIT)
    .output('outFlagExisteTipoDocuIdentidad', sql.BIT)
    .output('outFlagError', sql.BIT)
    .execute('dbo.sp_EditarPersona');

  return {
    outFlagExistePersona: result.output.outFlagExistePersona,
    outFlagDocuIdentidadRepetido: result.output.outFlagDocuIdentidadRepetido,
    outFlagExisteTipoDocuIdentidad: result.output.outFlagExisteTipoDocuIdentidad,
    outFlagError: result.output.outFlagError
  };
}

async function editarUsuario(idUsuarioEjecutor, ip, idUsuarioObjetivo, usuarioNuevo, claveNueva, esAdmin) {
  const pool = await poolPromise;
  const idEjecutor = await resolverIdUsuario(pool, idUsuarioEjecutor);

  const result = await pool.request()
    .input('inIdUsuarioEjecutor', sql.Int, idEjecutor)
    .input('inIP', sql.VarChar(32), ip)
    .input('inIdUsuarioObjetivo', sql.Int, Number(idUsuarioObjetivo))
    .input('inUsuarioNuevo', sql.VarChar(32), usuarioNuevo)
    .input('inClaveNueva', sql.VarChar(32), claveNueva || null)
    .input('inEsAdmin', sql.BIT, Boolean(esAdmin))
    .output('outFlagExisteUsuario', sql.BIT)
    .output('outFlagUsuarioRepetido', sql.BIT)
    .output('outFlagError', sql.BIT)
    .execute('dbo.sp_EditarUsuario');

  return {
    outFlagExisteUsuario: result.output.outFlagExisteUsuario,
    outFlagUsuarioRepetido: result.output.outFlagUsuarioRepetido,
    outFlagError: result.output.outFlagError
  };
}

async function eliminarPersona(idUsuarioOrUsuario, ip, valorDocuIdentidad) {
  const pool = await poolPromise;
  const idUsuario = await resolverIdUsuario(pool, idUsuarioOrUsuario);

  const result = await pool.request()
    .input('inIdUsuario', sql.Int, idUsuario)
    .input('inIP', sql.VarChar(32), ip)
    .input('inValorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .output('outFlagExistePersona', sql.BIT)
    .output('outFlagError', sql.BIT)
    .execute('dbo.sp_EliminarPersona');

  return {
    outFlagExistePersona: result.output.outFlagExistePersona,
    outFlagError: result.output.outFlagError
  };
}

async function editarCuentaAhorro(idUsuarioOrUsuario, ip, numCuentaActual, numCuentaNuevo,
  valorDocuIdentidad, idTipoCuenta, fechaCreacion, saldo) {
  const pool = await poolPromise;
  let idUsuario = Number(idUsuarioOrUsuario);


  if (!Number.isInteger(idUsuario)) {
    const usuarioResult = await pool.request()
      .input('inUser', sql.VarChar(20), idUsuarioOrUsuario)
      .query('SELECT TOP (1) id FROM dbo.Usuario WHERE usuario = @inUser');

    idUsuario = usuarioResult.recordset[0]?.id;
  }

  if (!Number.isInteger(Number(idUsuario))) {
    throw new Error('Usuario no encontrado');
  }

  const result = await pool.request()
    .input('inIdUsuario', sql.Int, Number(idUsuario))
    .input('inIP', sql.VarChar(32), ip)
    .input('inNumCuentaActual', sql.VarChar(10), numCuentaActual)
    .input('inNumCuentaNuevo', sql.VarChar(10), numCuentaNuevo)
    .input('inValorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .input('inIdTipoCuenta', sql.VarChar(4), idTipoCuenta)
    .input('inFechaCreacion', sql.DATE, fechaCreacion)
    .input('inSaldo', sql.MONEY, saldo)
    .output('outFlagExisteCuenta', sql.BIT)
    .output('outFlagNumCuentaRepetido', sql.BIT)
    .output('outFlagError', sql.BIT)
    .execute('dbo.sp_EditarCuentaAhorro');

  return {
    outFlagExisteCuenta: result.output.outFlagExisteCuenta,
    outFlagNumCuentaRepetido: result.output.outFlagNumCuentaRepetido,
    outFlagError: result.output.outFlagError
  };
}

async function eliminarCuentaAhorro(idUsuarioOrUsuario, ip, numCuenta) {
  const pool = await poolPromise;
  let idUsuario = Number(idUsuarioOrUsuario);

  if (!Number.isInteger(idUsuario)) {
    const usuarioResult = await pool.request()
      .input('inUser', sql.VarChar(20), idUsuarioOrUsuario)
      .query('SELECT TOP (1) id FROM dbo.Usuario WHERE usuario = @inUser');

    idUsuario = usuarioResult.recordset[0]?.id;
  }

  if (!Number.isInteger(Number(idUsuario))) {
    throw new Error('Usuario no encontrado');
  }

  const result = await pool.request()
    .input('inIdUsuario', sql.Int, Number(idUsuario))
    .input('inIP', sql.VarChar(32), ip)
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .output('outFlagError', sql.BIT)
    .execute('dbo.sp_EliminarCuentaAhorro');

  return {
    outFlagError: result.output.outFlagError
  };
}

async function tablaBeneficiarioActivo() 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .execute('dbo.sp_TablaBeneficiarioActivo');
  
  return result.recordset;
}



async function leerEventLog(inIdUsuario = null, inIdTipoOperacion = null, inFechaInicio = null, inFechaFin = null) {
  const pool = await poolPromise;
  const request = pool.request()
    .input('inIdUsuario', sql.Int, inIdUsuario)
    .input('inIdTipoOperacion', sql.VarChar(4), inIdTipoOperacion)
    .input('inFechaInicio', sql.DateTime, inFechaInicio)
    .input('inFechaFin', sql.DateTime, inFechaFin);

  const result = await request.execute('dbo.sp_LeerEventLog');
  return result.recordset;
}

module.exports = { 
  insertarTipoDocuIdentidad,
  insertarTipoMoneda,
  insertarParentesco,
  insertarTipoCuentaAhorro,
  modificarTipoCuentaAhorro,
  eliminarTipoCuentaAhorro,
  modificarTipoDocuIdentidad,
  eliminarTipoDocuIdentidad,
  modificarTipoMoneda,
  eliminarTipoMoneda,
  modificarParentesco,
  eliminarParentesco,
  eliminarBeneficiario,
  eliminarBeneficiarioReasignar,
  editarPersona,
  editarUsuario,
  eliminarPersona,
  tablaTipoDocuIdentidad,
  tablaTipoMoneda,
  tablaParentesco,
  tablaTipoDocuIdentidadActivo,
  tablaTipoMonedaActivo,
  tablaParentescoActivo,
  tablaTipoCuentaAhorroActivo,
  tablaPersonaActiva,
  tablaCuentaAhorroActivo,
  administrarPersonas,
  editarCuentaAhorro,
  eliminarCuentaAhorro,
  tablaBeneficiarioActivo,
  leerEventLog
};