const express = require('express');
const router = express.Router(); 
const loginController = require('../controllers/loginController');


router.post('/login', loginController.validarUsuario);
router.post('/validar_cuenta_beneficiario', loginController.validarCuentaBeneficiario);
router.post('/registrar_usuario', loginController.registrarUsuarioCompleto);
  
module.exports = router;