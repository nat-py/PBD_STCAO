const listaService = require('../services/listaCuentasService');

async function listaCuentas(req, res) {
  try {
    const { usuario } = req.body;

    const cuentas = await listaService.innerJoin_ListarCuentas(usuario);
    res.status(200).json({ message: 'Cuentas listadas correctamente', cuentas, success: true });

  } catch (error) {
    console.error('Error al validar usuario:', error);
    res.status(500).json({ message: 'Error al validar usuario'});
  }
}

module.exports = {
  listaCuentas
};


