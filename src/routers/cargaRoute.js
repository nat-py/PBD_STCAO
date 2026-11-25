const express = require('express');
const router = express.Router(); 
const cargaController = require('../controllers/cargaController');


router.post('/catalogos', cargaController.recibirXmlTexto);
router.post('/lectura', cargaController.leerDatos);


module.exports = router;