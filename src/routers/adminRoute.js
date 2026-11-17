const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/insertarTipoDocuIdentidad', adminController.insertarTipoDocuIdentidad);
router.post('/insertarTipoMoneda', adminController.insertarTipoMoneda);
router.post('/insertarParentesco', adminController.insertarParentesco);

router.post('/editarTipoDocuIdentidad', adminController.editarTipoDocuIdentidad);
router.post('/editarTipoMoneda', adminController.editarTipoMoneda);
router.post('/editarParentesco', adminController.editarParentesco);

router.post('/eliminarTipoDocuIdentidad', adminController.eliminarTipoDocuIdentidad);
router.post('/eliminarTipoMoneda', adminController.eliminarTipoMoneda);
router.post('/eliminarParentesco', adminController.eliminarParentesco);

router.get('/tablaTipoDocuIdentidad', adminController.tablaTipoDocuIdentidad);
router.get('/tablaTipoMoneda', adminController.tablaTipoMoneda);
router.get('/tablaParentesco', adminController.tablaParentesco);


router.get('/tablaTipoDocuIdentidadActivo', adminController.tablaTipoDocuIdentidadActivo);
router.get('/tablaTipoMonedaActivo', adminController.tablaTipoMonedaActivo);
router.get('/tablaParentescoActivo', adminController.tablaParentescoActivo);
router.get('/tablaTipoCuentaAhorroActivo', adminController.tablaTipoCuentaAhorroActivo);

router.post('/salir', adminController.registrarSalir);

module.exports = router;