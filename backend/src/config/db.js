/**
 * ==============================================================================
 * CAPA DE INFRAESTRUCTURA Y CONFIGURACIÓN: db.js
 * Módulo de Conexión a Microsoft SQL Server mediante Pool de Conexiones
 * Proyecto EFSRT II - Cibertec
 * ==============================================================================
 * 
 * Explicación Técnica:
 * 1. Utiliza la librería oficial 'mssql' (driver Tedious nativo de Node.js).
 * 2. Implementa el patrón 'Connection Pool' (Grupo de Conexiones):
 *    - En lugar de abrir y cerrar una conexión TCP en cada petición HTTP (lo cual
 *      generaría latencia alta e ineficiencia), se mantiene un conjunto de
 *      conexiones abiertas listas para ser reutilizadas.
 * 3. Admite conexiones locales (SQL Server Express / Developer) y remotas (Azure SQL / Nube).
 */

const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'sqlserver',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'BD_DistribucionesNorte',
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true', // true para Azure SQL
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true', // true para local/autofirmado
    enableArithAbort: true,
    connectTimeout: 8000,
    requestTimeout: 15000
  },
  pool: {
    max: 15,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool = null;
let isConnected = false;

/**
 * Retorna la instancia activa del pool de conexiones a SQL Server
 */
async function getPool() {
  if (pool && isConnected) {
    return pool;
  }

  try {
    console.log(`[DB INFO] Intentando conectar a SQL Server en ${config.server}:${config.port}/${config.database}...`);
    pool = await new sql.ConnectionPool(config).connect();
    isConnected = true;
    console.log('[DB SUCCESS] Conexión establecida exitosamente con Microsoft SQL Server.');

    pool.on('error', (err) => {
      console.error('[DB ERROR] Error imprevisto en el Connection Pool de SQL Server:', err.message);
      isConnected = false;
      pool = null;
    });

    return pool;
  } catch (error) {
    console.warn(`[DB WARNING] No se pudo conectar a SQL Server (${error.message}).`);
    console.warn('[DB WARNING] Modo Resiliencia Activo: Se usarán datos de respaldo en memoria si SQL Server no responde.');
    isConnected = false;
    pool = null;
    return null;
  }
}

/**
 * Función de verificación de estado de la Base de Datos (Healthcheck)
 */
async function checkDbConnection() {
  try {
    const activePool = await getPool();
    if (!activePool) return { connected: false, message: 'No se pudo conectar a la instancia SQL Server' };
    const result = await activePool.request().query('SELECT @@VERSION as version, DB_NAME() as currentDb;');
    return {
      connected: true,
      currentDb: result.recordset[0].currentDb,
      version: result.recordset[0].version
    };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

module.exports = {
  sql,
  getPool,
  checkDbConnection,
  isDbConnected: () => isConnected
};
