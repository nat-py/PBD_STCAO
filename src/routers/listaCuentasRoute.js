const express = require('express');
const router = express.Router(); 
const listaCuentasController = require('../controllers/listaCuentasController');

router.post('/lista_cuentas', listaCuentasController.listaCuentas);

module.exports = router;