const { sql, poolPromise } = require('../config/conexionBD');
const fs = require('fs');

/* este sirve para validar que se llene primero catálogo y luego no catálogo */
async function existenTablasCatalogo() 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .execute('dbo.sp_ExistenciaTablasCatalogo');
  
  const outFlagError = result.output.outFlagError
  return outFlagError; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

/* ------------------------------------------------------ CATALOGOS ------------------------------------------------------ */
async function insertarTipoDocuIdentidad(id, nombre) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inID', sql.VarChar(4), id)
    .input('inNombre', sql.VarChar(32), nombre)
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
    .input('inInteres', sql.VarChar(2), interes)
    .execute('dbo.sp_InsertTipoCuentaAhorros'); //llamar al SP que inserta tipo cuenta
  
  const outFlagError = result.output.outFlagError
  return outFlagError;
}

async function insertarTipoOperacion(id, nombre) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inID', sql.VarChar(4), id) /*ARREGLAR SP EN BASE PORQUE TIENE MAL LA EXTENSION DEL VARCHAR*/
    .input('inNombre', sql.VarChar(50), nombre)
    .execute('dbo.sp_InsertTipoOperacion'); //llamar al SP que inserta tipo operacion
  
  const outFlagError = result.output.outFlagError
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
    .input('inFechaNacimiento', sql.DATE, fechaNacimiento)
    .input('inEmail', sql.VarChar(50), email)
    .input('inTelefono1', sql.VarChar(16), telefono1)
    .input('inTelefono2', sql.VarChar(16), telefono2)
    .execute('dbo.sp_InsertPersona'); //llamar al SP que inserta persona
  
  const outFlagError = result.output.outFlagError
  return outFlagError;
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
    .execute('dbo.sp_InsertCuentaAhorro'); //llamar al SP que insertar cuenta ahorro
  
  const outFlagError = result.output.outFlagError
  return outFlagError;
}

async function insertarBeneficiario(numCuenta, valorDocuIdentidad, idParentesco, porcentaje) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .input('inValorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .input('inIDParentesco', sql.VarChar(4), idParentesco)
    .input('inPorcentaje', sql.INT, porcentaje)
    .execute('dbo.sp_InsertBeneficiario'); //llamar al SP que inserta beneficiario
  
  const outFlagError = result.output.outFlagError
  return outFlagError;
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
    .execute('dbo.sp_InsertEstadoCuenta'); //llamar al SP que inserta estado cuenta
  
  const outFlagError = result.output.outFlagError
  return outFlagError;
}

async function insertarUsuario(usuario, contrasena, esAdmin, valorDocuIdentidad) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inUser', sql.VarChar(15), usuario)
    .input('inPassword', sql.VarChar(15), contrasena)
    .input('esAdmin', sql.BIT, esAdmin)
    .input('valorDocuIdentidad', sql.VarChar(32), valorDocuIdentidad)
    .execute('dbo.sp_InsertUsuario'); //llamar al SP que inserta usuario
  
  const outFlagError = result.output.outFlagError
  return outFlagError; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

async function insertarUsuarioVer(usuario, numCuenta) 
{
  const pool = await poolPromise;
  const result = await pool.request()
    .input('inUser', sql.VarChar(15), usuario)
    .input('inNumCuenta', sql.VarChar(10), numCuenta)
    .execute('dbo.sp_InsertUsuarioVer'); //llamar al SP que inserta usuarios ver
  
  const outFlagError = result.output.outFlagError
  return outFlagError; //record es toda la respuesta dada por la BD, recordset es el conjunto de registros que devuelve el SP
}

async function subirXml(fileTempPath) {
  let contenidoXML = fs.readFileSync(fileTempPath, 'utf-8');

  const existenTablas = await existenTablasCatalogo();

  if (contenidoXML.includes("<Catalogos>")) {
    const catalogos = procesarCatalogosXML(contenidoXML);

    for (let tipoDocuIdentidad of catalogos.TipoDocuIdentidad) {
      if (await insertarTipoDocuIdentidad(tipoDocuIdentidad[0], tipoDocuIdentidad[1]) !== 0) {
        throw new Error(`Error al insertar TipoDocuIdentidad con ID: ${tipoDocuIdentidad[0]}`);
      }
    }
    for (let tipoMoneda of catalogos.TipoMoneda) {
      if (await insertarTipoMoneda(tipoMoneda[0], tipoMoneda[1], tipoMoneda[2]) !== 0) {
        throw new Error(`Error al insertar TipoMoneda con ID: ${tipoMoneda[0]}`);
      }
    }
    for (let parentesco of catalogos.Parentesco) {
      if (await insertarParentesco(parentesco[0], parentesco[1]) !== 0) {
        throw new Error(`Error al insertar Parentesco con ID: ${parentesco[0]}`);
      }
    }
    for (let tipoCuentaAhorro of catalogos.TipoCuentaAhorro) {
      if (await insertarTipoCuentaAhorro(tipoCuentaAhorro[0], tipoCuentaAhorro[1], tipoCuentaAhorro[2], parseFloat(tipoCuentaAhorro[3]), parseFloat(tipoCuentaAhorro[4]), tipoCuentaAhorro[5], parseInt(tipoCuentaAhorro[6]), parseInt(tipoCuentaAhorro[7]), tipoCuentaAhorro[8], tipoCuentaAhorro[9], tipoCuentaAhorro[10]) !== 0) {
        throw new Error(`Error al insertar TipoCuentaAhorro con ID: ${tipoCuentaAhorro[0]}`);
      }
    }
    for (let tipoOperacion of catalogos.TipoOperacion) {
      if (await insertarTipoOperacion(tipoOperacion[0], tipoOperacion[1]) !== 0) {
        throw new Error(`Error al insertar TipoOperacion con ID: ${tipoOperacion[0]}`);
      }
    }

    return { success: true, message: "Catálogo procesado y guardado con éxito" };
  } 
  if (contenidoXML.includes("<NoCatalogos>")) {
    if (!existenTablas) {
      // Al lanzar este error, el controlador lo atrapa arriba
      throw new Error("Primero debe cargar un archivo de catálogo antes de cargar un no catálogo.");
    }

    const noCatalogos = procesarNoCatalogosXML(contenidoXML);

    for (let persona of noCatalogos.Persona) {
      if (await insertarPersona(persona.Id, persona.Nombre, persona.Apellido, persona.Correo, persona.Telefono) !== 0) {
        throw new Error(`Error al insertar Persona con ID: ${persona.Id}`);
      }
    }
    for (let cuentaAhorro of noCatalogos.CuentaAhorro) {
      if (await insertarCuentaAhorro(cuentaAhorro.Id, cuentaAhorro.TipoCuenta, cuentaAhorro.NumeroCuenta, cuentaAhorro.FechaCreacion, parseFloat(cuentaAhorro.Saldo)) !== 0) {
        throw new Error(`Error al insertar CuentaAhorro con ID: ${cuentaAhorro.Id}`);
      }
    }
    for (let beneficiario of noCatalogos.Beneficiario) {
      if (await insertarBeneficiario(beneficiario.NumeroCuenta, beneficiario.IdPersona, beneficiario.Parentesco, parseInt(beneficiario.Porcentaje)) !== 0) {
        throw new Error(`Error al insertar Beneficiario con NumeroCuenta: ${beneficiario.NumeroCuenta} y IdPersona: ${beneficiario.IdPersona}`);
      }
    }
    for (let estadoCuenta of noCatalogos.EstadoCuenta) {
      if (await insertarEstadoCuenta(estadoCuenta.NumeroCuenta, estadoCuenta.FechaInicio, estadoCuenta.FechaFin, parseFloat(estadoCuenta.SaldoInicio), parseFloat(estadoCuenta.SaldoMinimo), parseFloat(estadoCuenta.SaldoFin), parseFloat(estadoCuenta.InteresesAcumulados), parseInt(estadoCuenta.CantidadRetiros), parseInt(estadoCuenta.CantidadDepositos), parseInt(estadoCuenta.CantidadSinpeEntrantes), parseInt(estadoCuenta.CantidadSinpeSalientes)) !== 0) {
        throw new Error(`Error al insertar EstadoCuenta con NumeroCuenta: ${estadoCuenta.NumeroCuenta}`);
      }
    }
    for (let usuario of noCatalogos.Usuario) {
      if (await insertarUsuario(usuario.NombreUsuario, usuario.Contrasena, usuario.EsAdmin === "true", usuario.IdPersona) !== 0) {
        throw new Error(`Error al insertar Usuario con NombreUsuario: ${usuario.NombreUsuario}`);
      }
    }
    for (let usuarioVer of noCatalogos.UsuarioVer) {
      if (await insertarUsuarioVer(usuarioVer.NombreUsuario, usuarioVer.NumeroCuenta) !== 0) {
        throw new Error(`Error al insertar UsuarioVer con NombreUsuario: ${usuarioVer.NombreUsuario} y NumeroCuenta: ${usuarioVer.NumeroCuenta}`);
      }
    }

    return { success: true, message: "No catálogo procesado y guardado con éxito" };
  }

  throw new Error("El archivo cargado no tiene la estructura esperada.");
}


function procesarCatalogosXML(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  const resultado = {};

  const categorias = xmlDoc.documentElement.children;

  for (let categoria of categorias) {
    const nombreCategoria = categoria.nodeName;
    const elementos = categoria.children;
    const listaElementos = [];

    for (let el of elementos) {
        const id = el.getAttribute("Id") || el.getAttribute("id");
        const nombre = el.getAttribute("Nombre") || el.getAttribute("nombre");
        listaElementos.push([id, nombre]);
    }

    resultado[nombreCategoria] = listaElementos;
  }
  return resultado;
}

function procesarNoCatalogosXML(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const resultado = {};

    const secciones = xmlDoc.documentElement.children;
    for (let seccion of secciones) {
        const nombreSeccion = seccion.nodeName;
        const elementos = seccion.children;
        const listaElementos = [];

        for (let el of elementos) {
            const atributos = {};
            for (let attr of el.attributes) {
                atributos[attr.name] = attr.value;
            }
            listaElementos.push(atributos);
        }

        resultado[nombreSeccion] = listaElementos;
    }

    return resultado;
}






module.exports = { subirXml };