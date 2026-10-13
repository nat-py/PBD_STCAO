const loginService = require('../services/loginService');

async function validarUsuario(req, res) {
  try {
    const { usuario, contrasena } = req.body;

    const estados = await loginService.existeUsuario(usuario, contrasena);

    console.log('Estados devueltos por el servicio:', estados);

    if (estados.outFlagExiste == false) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos', success: false });
    }
    return res.status(200).json({ message: 'Usuario validado correctamente', isAdmin: estados.outFlagEsAdmin === 1, success: true });
    
  } catch (error) {
    console.error('Error al validar usuario:', error);
    res.status(500).json({ message: 'Error al validar usuario'});
  }
}

module.exports = {
  validarUsuario
};