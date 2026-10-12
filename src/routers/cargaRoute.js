const express = require('express');
const router = express.Router(); 

const cargaController = require('../controllers/cargaController'); // Importa las funciones del controlador de empleados

// Define las rutas relativas al módulo de empleados

// rutas get obtiene de bd
router.post('/catalogos', cargaController.subirXml);


module.exports = router;