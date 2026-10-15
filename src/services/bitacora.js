const fs = require('fs');
const path = require('path');

// Ruta al archivo bitacora.json en la raíz del proyecto
const bitacoraPath = path.join(__dirname, '../../bitacora.json');

/**
 * Registra una nueva acción en la bitácora del sistema.
 * @param {string} operacion - Nombre de la acción (ej. 'login', 'insertarBeneficiario', 'modificarBeneficiario', 'consultaEstadoCuenta', 'logout')
 * @param {string} usuario - Nombre del usuario que realiza la acción
 * @param {string} ip - Dirección IP del cliente
 * @param {object|null} detalles - Objeto con los detalles de la operación (ej. { old: ..., new: ... }) o null si no aplica
 */ 
function registrarBitacora(operacion, usuario, ip, detalles = null) {
  try {
    let bitacoras = [];
    if (fs.existsSync(bitacoraPath)) {
      const fileData = fs.readFileSync(bitacoraPath, 'utf8');
      bitacoras = JSON.parse(fileData);
    }

    // Generar formato de fecha y hora: "YYYY-MM-DD HH:mm:ss"
    const fechaHora = new Date().toLocaleString('sv-SE');

    const nuevoRegistro = {
      id: bitacoras.length > 0 ? bitacoras[bitacoras.length - 1].id + 1 : 1,
      fechaHora: fechaHora,
      ip: ip || '127.0.0.1',
      operacion: operacion,
      usuario: usuario || 'sistema',
      detalles: detalles
    };

    bitacoras.push(nuevoRegistro);
    fs.writeFileSync(bitacoraPath, JSON.stringify(bitacoras, null, 2), 'utf8');
  } catch (error) {
    console.error('Error al guardar en la bitácora:', error);
  }
}

module.exports = { registrarBitacora };