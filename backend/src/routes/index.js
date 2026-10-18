const express = require('express');
const router = express.Router();

const clienteRoutes = require('./clienteRoutes');
const productoRoutes = require('./productoRoutes');
const pedidoRoutes = require('./pedidoRoutes');
const reporteRoutes = require('./reporteRoutes');
const { checkDbConnection } = require('../config/db');

// Healthcheck de la API y de SQL Server
router.get('/health', async (req, res) => {
  const dbStatus = await checkDbConnection();
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    empresa: 'Distribuciones y Servicios del Norte S.A.C.',
    proyecto: 'EFSRT II - Cibertec',
    database: dbStatus
  });
});

// Enrutamiento modular por entidad
router.use('/clientes', clienteRoutes);
router.use('/productos', productoRoutes);
router.use('/pedidos', pedidoRoutes);
router.use('/reportes', reporteRoutes);

module.exports = router;
