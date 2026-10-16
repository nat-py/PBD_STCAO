const { sql, poolPromise } = require('../config/conexionBD.js');
const { XMLParser } = require('fast-xml-parser');

/* este sirve para validar que se llene primero catálogo y luego no catálogo */
async function existenTablasCatalogo() 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .output('outFlagExiste', sql.INT)
    .execute('dbo.sp_ExistenciaTablasCatalogo');
  
  return result.output.outFlagExiste; 
}

/* ------------------------------------------------------ CATALOGOS ------------------------------------------------------ */
async function insertarTipoDocuIdentidad(id, nombre) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inID', sql.VarChar(4), id)
    .input('inNombre', sql.VarChar(32), nombre)
    .output('outFlagError', sql.INT)
    .execute('dbo.sp_InsertTipoDocuIdentidad');
  
  return result.output.outFlagError;
}

async function insertarTipoMoneda(id, nombre, simbolo) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inID', sql.VarChar(4), id)
    .input('inNombre', sql.VarChar(32), nombre)
    .input('inSimbolo', sql.VarChar(4), simbolo)
    .output('outFlagError', sql.INT)
    .execute('dbo.sp_InsertTipoMoneda');
  
  return result.output.outFlagError;
}

async function insertarParentesco(id, nombre) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inID', sql.VarChar(4), id)
    .input('inNombre', sql.VarChar(32), nombre)
    .output('outFlagError', sql.INT)
    .execute('dbo.sp_InsertParentesco');
  
  return result.output.outFlagError;
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
    .output('outFlagError', sql.INT)
    .execute('dbo.sp_InsertTipoCuentaAhorros');
  
  return result.output.outFlagError;
}

async function insertarTipoOperacion(id, nombre) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inID', sql.VarChar(4), id)
    .input('inNombre', sql.VarChar(50), nombre)
    .output('outFlagExiste', sql.BIT)
    .execute('dbo.sp_InsertTipoOperacion'); //llamar al SP que inserta tipo operacion

  const outFlagError = result.output.outFlagExiste
  return outFlagError;
}

/* ------------------------------------------------------ NO CATALOGOS ------------------------------------------------------ */
async function insertarPersona(tipoDocuIdentidad, nombre, valorDocuIdentidad, fechaNacimiento, email, telefono1, telefono2) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inTipoDocuIdentidad', sql.VarChar(4), tipoDocuIdentidad)
    .input('inNombre', sql.VarChar(64), nombre)
    .input('inValorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .input('inFechaNacimiento', sql.Date, new Date(fechaNacimiento))
    .input('inEmail', sql.VarChar(50), email)
    .input('inTelefono1', sql.VarChar(16), telefono1)
    .input('inTelefono2', sql.VarChar(16), telefono2)
    .output('outFlagError', sql.INT)
    .execute('dbo.sp_InsertPersona');
  
  return result.output.outFlagError;
}

async function insertarCuentaAhorro(valorDocuIdentidad, idTipoCuenta, numCuenta, fechaCreacion, saldo) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inValorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .input('inIdTipoCuenta', sql.VarChar(4), idTipoCuenta)
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .input('inFechaCreacion', sql.DATE, fechaCreacion)
    .input('inSaldo', sql.MONEY, saldo)
    .output('outFlagError', sql.BIT)
    .output('outFlagNumCuentaRepetido', sql.BIT)
    .output('outFlagEntroCatch', sql.BIT)
    .output('outFlagInserto', sql.BIT)
    .execute('dbo.sp_InsertCuentaAhorro'); //llamar al SP que insertar cuenta ahorro


  const outFlagError = result.output.outFlagError
  const cuentaRepetida = result.output.outFlagNumCuentaRepetido
  const entroCatch = result.output.outFlagEntroCatch
  const inserto = result.output.outFlagInserto
  return {outFlagError, cuentaRepetida, entroCatch, inserto};
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

async function insertarEstadoCuenta(numCuenta, fechaIni, fechaFin, saldoIni, saldoMini, saldoFin,
interesesAcumulados, cantidadRetiros, cantidadDepositos, cantidadSinpeEntrantes, 
cantidadSinpeSalientes) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .input('inFechaIni', sql.Date, new Date(fechaIni))
    .input('inFechaFin', sql.Date, new Date(fechaFin))
    .input('inSaldoIni', sql.MONEY, saldoIni)
    .input('inSaldoMini', sql.MONEY, saldoMini)
    .input('inSaldoFin', sql.MONEY, saldoFin)
    .input('inInteresesAcumulados', sql.MONEY, interesesAcumulados)
    .input('inCantidadRetiros', sql.MONEY, cantidadRetiros)
    .input('inCantidadDepositos', sql.MONEY, cantidadDepositos)
    .input('inCantidadSinpeEntrantes', sql.MONEY, cantidadSinpeEntrantes)
    .input('inCantidadSinpeSalientes', sql.MONEY, cantidadSinpeSalientes)
    .output('outFlagError', sql.INT)
    .execute('dbo.sp_InsertEstadoCuenta');
  
  return result.output.outFlagError;
}

async function insertarUsuario(usuario, contrasena, esAdmin, valorDocuIdentidad) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inUser', sql.VarChar(20), usuario)
    .input('inPassword', sql.VarChar(20), contrasena)
    .input('esAdmin', sql.BIT, esAdmin)
    .input('valorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .output('outFlagError', sql.INT)
    .execute('dbo.sp_InsertUsuario');
  
  return result.output.outFlagError;
}

async function insertarUsuarioVer(usuario, numCuenta) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inUser', sql.VarChar(20), usuario)
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .output('outFlagError', sql.INT)
    .execute('dbo.sp_InsertUsuarioVer');
  
  return result.output.outFlagError;
}

/* segmentacion de xml */
async function procesarXmlString(xmlData) {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: ""
    });

    const resultadoJson = parser.parse(xmlData);
    
    const raizKey = Object.keys(resultadoJson)[1];
    const contenidoRaiz = resultadoJson[raizKey];

    const diccionarioEstructurado = {};

    for (const [nombrePadre, hijos] of Object.entries(contenidoRaiz)) {
      if (hijos && typeof hijos === 'object') {
        const claveHijoReal = Object.keys(hijos)[0];
        let listaHijos = hijos[claveHijoReal];

        // Asegura que siempre sea una lista (array)
        if (!Array.isArray(listaHijos)) {
          listaHijos = [listaHijos];
        }

        diccionarioEstructurado[nombrePadre] = listaHijos;
      }
    }

    return diccionarioEstructurado;

  } catch (error) {
    throw new Error(`Error al procesar el XML: ${error.message}`);
  }
}

async function xmlBD(jsonData) {
  try {

    // impresion de verificacion de llegada

    const datosBD = await procesarXmlString(jsonData);


     if (datosBD?.Tipo_Doc) {
      for (const item of datosBD.Tipo_Doc) {
        if (await insertarTipoDocuIdentidad(item.Id, item.Nombre) !== 0) {
          console.error(`Error al insertar TipoDocuIdentidad con ID: ${item.Id}`);
        }
      }
    }

    if (datosBD?.Tipo_Moneda) {
      for (const item of datosBD.Tipo_Moneda) {
        if (await insertarTipoMoneda(item.Id, item.Nombre, item.Simbolo) !== 0) {
          console.error(`Error al insertar TipoDocuIdentidad con ID: ${item.Id}`);
        }
      }
    }

    if (datosBD?.Parentezcos) {
      for (const item of datosBD.Parentezcos) {
        if (await insertarParentesco(item.Id, item.Nombre) !== 0) {
          console.error(`Error al insertar Parentesco con ID: ${item.Id}`);
        }
      }
    }

    if (datosBD?.Tipo_Cuenta_Ahorros) {
      for (const item of datosBD.Tipo_Cuenta_Ahorros) {
        if (await insertarTipoCuentaAhorro(item.Id, item.Nombre, item.IdTipoMoneda, item.SaldoMinimo, item.MultaSaldoMin,
          item.CargoAnual, item.NumRetirosHumano, item.NumRetirosAutomatico, item.comisionHumano,
          item.comisionAutomatico, item.interes) !== 0) {
            console.error(`Error al insertar TipoCuentaAhorros con ID: ${item.Id}`);
        }
      }
    }

    if (datosBD?.TipoOperacionesBitacora) {
      for (const item of datosBD.TipoOperacionesBitacora) {
        if (await insertarTipoOperacion(item.id, item.nombre) === 0) {
          console.error(`Error al insertar TipoOperacion con ID: ${item.id}`);
        }
      }
    }
    
    const hayCatalogo = await existenTablasCatalogo();
    
    if (hayCatalogo) {
      if (datosBD?.Personas) {
        for (const item of datosBD.Personas) {
          if (await insertarPersona(item.TipoDocuIdentidad, item.Nombre, item.ValorDocumentoIdentidad, item.FechaNacimiento, item.Email,
            item.telefono1, item.telefono1) !== 0) {
            console.error(`Error al insertar Persona con ValorDocumentoIdentidad: ${item.ValorDocumentoIdentidad}`);
          }
        }
      }

      if (datosBD?.Cuentas) {
        for (const item of datosBD.Cuentas) {
          const resultado = await insertarCuentaAhorro(item.ValorDocumentoIdentidadDelCliente, item.TipoCuentaId, item.NumeroCuenta, item.FechaCreacion,
            item.Saldo);
            console.log(`bandera de insercion de cuenta: ${resultado.cuentaRepetida}, ${resultado.entroCatch}, ${resultado.inserto}, ${resultado.outFlagError}`);
          if (resultado === 0) {
            console.error(`Error al insertar CuentaAhorro con Num_Cuenta: ${item.NumeroCuenta}, Error: ${resultado.message}`);
          }
        }
      }

      if (datosBD?.Beneficiarios) {
        for (const item of datosBD.Beneficiarios) {
          if (await insertarBeneficiario(item.NumeroCuenta, item.ValorDocumentoIdentidadBeneficiario, item.IdParentezco, item.Porcentaje) !== 0) {
            console.error(`Error al insertar Beneficiario con Num_Cuenta: ${item.NumeroCuenta}`);
          }
        }
      }

      if (datosBD?.Estados_de_Cuenta ) {
        for (const item of datosBD.Estados_de_Cuenta ) {
          if (await insertarEstadoCuenta(item.NumeroCuenta, item.fechaInicio, item.fechafin, item.saldoinicial,
            item.saldoMinimo, item.saldo_final, item.interesesAcumulados, item.cantRetiros,
            item.cantDepositos, item.cantSinpeEntrantes, item.cantSinpeSalientes) === 0) {
            console.error(`Error al insertar EstadoCuenta con Num_Cuenta: ${item.NumeroCuenta}`);
          }
        }
      }
      
      if (datosBD?.Usuarios) {
        for (const item of datosBD.Usuarios) {
          if (await insertarUsuario(item.User, item.Pass, item.EsAdministrador, item.ValorDocId) !== 0) {
            console.error(`Error al insertar Usuario con Usuario: ${item.User}`);
          }
        }
      }
      
      if (datosBD?.Usuarios_Ver) {
        for (const item of datosBD.Usuarios_Ver) {
          if (await insertarUsuarioVer(item.User, item.NumeroCuenta) !== 0) {
            console.error(`Error al insertar UsuarioVer con Usuario: ${item.User}`);
          }
        }
      }
    }


  } catch (error) {
    throw new Error(`Error al procesar el JSON: ${error.message}`);
  }
}



module.exports = { xmlBD };