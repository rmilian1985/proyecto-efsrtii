const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');

// Consolidado de inventario y ventas (sp_ReporteConsolidadoInventario)
router.get('/consolidado', (req, res) => reporteController.consolidadoInventario(req, res));

// Indicadores del Dashboard
router.get('/kpis', (req, res) => reporteController.dashboardKpis(req, res));

module.exports = router;
