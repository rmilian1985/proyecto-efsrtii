const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

router.get('/', (req, res) => clienteController.listar(req, res));
router.get('/:id', (req, res) => clienteController.obtenerPorId(req, res));
router.post('/', (req, res) => clienteController.registrar(req, res));

module.exports = router;
