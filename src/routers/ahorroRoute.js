const express = require('express');
const router = express.Router();
const ahorroController = require('../controllers/ahorroController');
const loginController = require('../controllers/loginController');

router.post('/top8_estado_cuenta', ahorroController.top8_EstadoCuenta_AsociadoCuenta);
router.post('/beneficiarios_asociados', ahorroController.beneficiariosAsociadosCuenta);
router.post('/perfil_usuario', ahorroController.personaAsociadaUsuario);
router.post('/eliminar_beneficiario', ahorroController.eliminarBeneficiario);
router.post('/parentescos', ahorroController.tablaParentescoActivo);
router.post('/tipos_documento', ahorroController.tablaTipoDocuIdentidadActivo);
router.post('/tipos_movimiento', ahorroController.obtenerTiposMovimientoActivos);
router.post('/movimientos', ahorroController.movimientosCuentaUltimos4Meses);
router.post('/guardar_movimiento', ahorroController.guardarMovimiento);
router.post('/salir', loginController.registrarCierreSesion);
router.post('/registrar_evento_estado', ahorroController.registrarEventoEstadoCuenta);
router.post('/insertar_beneficiario', ahorroController.insertarBeneficiario);
router.post('/buscar_persona', ahorroController.buscarPersonaPorCedula);
router.put('/editar_beneficiario_DocuDiferente', ahorroController.editarBeneficiarioDocuDiferente);
router.put('/editar_beneficiario_DocuIgual', ahorroController.editarBeneficiarioDocuIgual);

module.exports = router;