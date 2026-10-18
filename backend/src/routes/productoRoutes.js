const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

router.get('/', (req, res) => productoController.listar(req, res));
router.get('/categorias', (req, res) => productoController.listarCategorias(req, res));
router.get('/:id', (req, res) => productoController.obtenerPorId(req, res));

module.exports = router;
