const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

// Procesamiento individual evaluado en informe (sp_ProcesarPedidoInstitucional)
router.post('/procesar', (req, res) => pedidoController.procesar(req, res));

// Procesamiento múltiple (carrito de compras institucional)
router.post('/procesar-multiple', (req, res) => pedidoController.procesarMultiple(req, res));

// Historial y detalles
router.get('/', (req, res) => pedidoController.listar(req, res));
router.get('/:id/detalle', (req, res) => pedidoController.obtenerDetalle(req, res));

module.exports = router;
