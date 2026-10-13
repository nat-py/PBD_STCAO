const express = require('express');
const router = express.Router(); 
const listaCuentasController = require('../controllers/cargaController');



router.post('/lista_cuentas', listaCuentasController.recibirXmlTexto);


module.exports = router;