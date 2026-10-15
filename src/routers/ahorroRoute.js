const express = require('express');
const router = express.Router();
const ahorroController = require('../controllers/ahorroController');

router.post('/top8_estado_cuenta', ahorroController.top8_EstadoCuenta_AsociadoCuenta);
router.post('/beneficiarios_asociados', ahorroController.beneficiariosAsociadosCuenta);
router.post('/eliminar_beneficiario', ahorroController.eliminarBeneficiario);
router.post('/parentescos', ahorroController.tablaParentescoActivo);
router.post('/tipos_documento', ahorroController.tablaTipoDocuIdentidadActivo);
router.post('/salir', ahorroController.registrarSalir);
router.post('/registrar_estado', ahorroController.registrarEstado);
router.post('/insertar_beneficiario', ahorroController.insertarBeneficiario);
router.put('/editar_beneficiario_DocuDiferente', ahorroController.editarBeneficiarioDocuDiferente);
router.put('/editar_beneficiario_DocuIgual', ahorroController.editarBeneficiarioDocuIgual);

module.exports = router;