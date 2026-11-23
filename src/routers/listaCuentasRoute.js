const express = require('express');
const router = express.Router(); 
const listaCuentasController = require('../controllers/listaCuentasController');
const loginController = require('../controllers/loginController');

router.post('/lista_cuentas', listaCuentasController.listaCuentas);
router.post('/buscar_propietario', listaCuentasController.buscarPersonaPorCedula);
router.post('/crear_cuenta', listaCuentasController.crearCuentaAhorro);
router.post('/salir', loginController.registrarCierreSesion);

module.exports = router;