/**
 * ==============================================================================
 * CAPA DE ACCESO A DATOS (DAL): productoRepository.js
 * Responsabilidad: Interactuar con 'Producto' y 'Categoria' en SQL Server.
 * Proyecto EFSRT II - Cibertec
 * ==============================================================================
 */

const { getPool, sql } = require('../config/db');
const memoryStore = require('../config/seedMemory');

class ProductoRepository {
  async getAll() {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request().query(`
        SELECT 
          p.IdProducto,
          p.CodigoBarras,
          p.NombreProducto,
          p.IdCategoria,
          c.NombreCategoria AS Categoria,
          p.StockActual,
          p.PrecioUnitario,
          (p.StockActual * p.PrecioUnitario) AS ValorTotal
        FROM Producto p
        INNER JOIN Categoria c ON p.IdCategoria = c.IdCategoria
        ORDER BY p.NombreProducto ASC;
      `);
      return result.recordset;
    }
    return memoryStore.productos;
  }

  async getById(id) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('IdProducto', sql.Int, id)
        .query(`
          SELECT 
            p.IdProducto,
            p.CodigoBarras,
            p.NombreProducto,
            p.IdCategoria,
            c.NombreCategoria AS Categoria,
            p.StockActual,
            p.PrecioUnitario
          FROM Producto p
          INNER JOIN Categoria c ON p.IdCategoria = c.IdCategoria
          WHERE p.IdProducto = @IdProducto;
        `);
      return result.recordset[0] || null;
    }
    return memoryStore.productos.find(p => p.IdProducto === parseInt(id, 10)) || null;
  }

  async getCategorias() {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request().query(`
        SELECT IdCategoria, NombreCategoria
        FROM Categoria
        ORDER BY NombreCategoria ASC;
      `);
      return result.recordset;
    }
    return memoryStore.categorias;
  }
}

module.exports = new ProductoRepository();
