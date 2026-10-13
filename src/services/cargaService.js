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
    .input('inInteres', sql.VarChar(2), interes)
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
    .output('outFlagError', sql.INT)
    .execute('dbo.sp_InsertTipoOperacion');
  
  return result.output.outFlagError;
}

/* ------------------------------------------------------ NO CATALOGOS ------------------------------------------------------ */
async function insertarPersona(tipoDocuIdentidad, nombre, valorDocuIdentidad, fechaNacimiento, email, telefono1, telefono2) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inTipoDocuIdentidad', sql.VarChar(4), tipoDocuIdentidad)
    .input('inNombre', sql.VarChar(64), nombre)
    .input('inValorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .input('inFechaNacimiento', sql.DATE, fechaNacimiento)
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
    .output('outFlagError', sql.INT)
    .execute('dbo.sp_InsertCuentaAhorro');
  
  return result.output.outFlagError;
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
    .input('inFechaIni', sql.DATE, fechaIni)
    .input('inFechaFin', sql.DATE, fechaFin)
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
    .input('inUser', sql.VarChar(15), usuario)
    .input('inPassword', sql.VarChar(15), contrasena)
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
    .input('inUser', sql.VarChar(15), usuario)
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .output('outFlagError', sql.INT)
    .execute('dbo.sp_InsertUsuarioVer');
  
  return result.output.outFlagError;
}

async function subirJson(jsonData) {
  try {

    // impresion de verificacion de llegada

    const hayCatalogo = await existenTablasCatalogo();

    console.log("Valor de hayCatalogo:", hayCatalogo);

    const datosBD = await procesarXmlString(jsonData);

    console.log("Datos procesados a diccionario:", datosBD);


    return { success: true, message: "No catálogo procesado y guardado con éxito" };
    
  } catch (error) {
    throw new Error(`Error al procesar el JSON: ${error.message}`);
  }
}


/* segmentacion de xml */
async function procesarXmlString(xmlData) {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: ""
    });

    const resultadoJson = parser.parse(xmlData);
    
    const raizKey = Object.keys(resultadoJson)[0];
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

module.exports = { subirJson };