const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const loginController = require('../controllers/loginController');

router.post('/insertarTipoDocuIdentidad', adminController.insertarTipoDocuIdentidad);
router.post('/insertarTipoMoneda', adminController.insertarTipoMoneda);
router.post('/insertarParentesco', adminController.insertarParentesco);
router.post('/insertarTipoCuentaAhorro', adminController.insertarTipoCuentaAhorro);

router.post('/editarTipoDocuIdentidad', adminController.editarTipoDocuIdentidad);
router.post('/editarTipoMoneda', adminController.editarTipoMoneda);
router.post('/editarParentesco', adminController.editarParentesco);
router.post('/editarTipoCuentaAhorro', adminController.editarTipoCuentaAhorro);
router.post('/editarCuentaAhorro', adminController.editarCuentaAhorro);
router.post('/eliminarCuentaAhorro', adminController.eliminarCuentaAhorro);
router.post('/editarPersona', adminController.editarPersona);
router.post('/editarUsuario', adminController.editarUsuario);
router.post('/eliminarPersona', adminController.eliminarPersona);
router.post('/eliminarBeneficiarioReasignar', adminController.eliminarBeneficiarioReasignar);

router.post('/eliminarTipoDocuIdentidad', adminController.eliminarTipoDocuIdentidad);
router.post('/eliminarTipoMoneda', adminController.eliminarTipoMoneda);
router.post('/eliminarParentesco', adminController.eliminarParentesco);
router.post('/eliminarTipoCuentaAhorro', adminController.eliminarTipoCuentaAhorro);

router.get('/tablaTipoDocuIdentidad', adminController.tablaTipoDocuIdentidad);
router.get('/tablaTipoMoneda', adminController.tablaTipoMoneda);
router.get('/tablaParentesco', adminController.tablaParentesco);


router.get('/tablaTipoDocuIdentidadActivo', adminController.tablaTipoDocuIdentidadActivo);
router.get('/tablaTipoMonedaActivo', adminController.tablaTipoMonedaActivo);
router.get('/tablaParentescoActivo', adminController.tablaParentescoActivo);
router.get('/tablaTipoCuentaAhorroActivo', adminController.tablaTipoCuentaAhorroActivo);
router.get('/tablaCuentaAhorroActivo', adminController.tablaCuentaAhorroActivo);
router.get('/personas', adminController.administrarPersonas);
router.get('/bitacora', adminController.leerEventLog);

router.post('/procesoOperaciones', adminController.procesoOperaciones);
router.post('/salir', loginController.registrarCierreSesion);

module.exports = router;