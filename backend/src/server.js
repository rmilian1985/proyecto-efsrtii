/**
 * ==============================================================================
 * SERVIDOR PRINCIPAL: server.js
 * API REST N-Capas para Distribuciones y Servicios del Norte S.A.C.
 * Proyecto EFSRT II - Cibertec
 * ==============================================================================
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const routes = require('./routes');
const { getPool } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares Globales
app.use(cors({
  origin: '*', // Permite conexiones desde el frontend en desarrollo y producción
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Ruta Raíz Informativa
app.get('/', (req, res) => {
  res.json({
    sistema: 'API Backend N-Capas - Distribuciones y Servicios del Norte S.A.C.',
    curso: 'Experiencias Formativas en Situaciones Reales de Trabajo II (EFSRT II)',
    institucion: 'Cibertec',
    version: '1.0.0',
    estado: 'Servidor Operativo',
    documentacion_endpoints: {
      healthcheck: '/api/health',
      clientes: '/api/clientes',
      productos: '/api/productos',
      pedidos: '/api/pedidos',
      procesar_pedido_sp: 'POST /api/pedidos/procesar',
      reporte_consolidado_sp: 'GET /api/reportes/consolidado',
      dashboard_kpis: 'GET /api/reportes/kpis'
    }
  });
});

// Montar Rutas de la API REST
app.use('/api', routes);

// Manejo de Rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Middleware Global de Manejo de Errores (500)
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR CRÍTICO]:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Ocurrió un error interno en el servidor.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar Servidor e Inicializar Pool de Base de Datos
app.listen(PORT, async () => {
  console.log('======================================================================');
  console.log(`[API REST] Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`[INFO] Empresa: Distribuciones y Servicios del Norte S.A.C. (Piura)`);
  console.log(`[INFO] Proyecto: EFSRT II - Cibertec`);
  console.log('======================================================================');
  
  // Conectar con el pool de SQL Server de forma asíncrona
  await getPool();
});

module.exports = app;
