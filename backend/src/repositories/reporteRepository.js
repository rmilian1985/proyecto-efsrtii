/**
 * ==============================================================================
 * CAPA DE ACCESO A DATOS (DAL): reporteRepository.js
 * Responsabilidad: Ejecutar sp_ReporteConsolidadoInventario y consultas agregadas
 * para reportes gerenciales exportables a Excel/PDF y Dashboard KPIs.
 * Proyecto EFSRT II - Cibertec
 * ==============================================================================
 */

const { getPool, sql, sqlcmdBridge } = require('../config/db');
const memoryStore = require('../config/seedMemory');

class ReporteRepository {
  /**
   * Ejecuta el Stored Procedure sp_ReporteConsolidadoInventario
   */
  async getReporteConsolidado() {
    const pool = await getPool();

    if (pool) {
      const result = await pool.request().execute('sp_ReporteConsolidadoInventario');
      return result.recordset;
    }

    if (sqlcmdBridge.isAvailable()) {
      return await sqlcmdBridge.getReporteConsolidado();
    }

    // Fallback en memoria agregando ventas sobre productos
    return memoryStore.productos.map(p => {
      let unidadesVendidas = 0;
      memoryStore.pedidos.forEach(ped => {
        if (ped.detalles) {
          ped.detalles.forEach(d => {
            if (d.IdProducto === p.IdProducto) {
              unidadesVendidas += d.Cantidad;
            }
          });
        }
      });

      return {
        Categoria: p.Categoria,
        CodigoBarras: p.CodigoBarras,
        NombreProducto: p.NombreProducto,
        StockActual: p.StockActual,
        PrecioUnitario: p.PrecioUnitario,
        ValorTotalInventario: parseFloat((p.StockActual * p.PrecioUnitario).toFixed(2)),
        TotalUnidadesVendidas: unidadesVendidas
      };
    }).sort((a, b) => b.ValorTotalInventario - a.ValorTotalInventario);
  }

  /**
   * Métricas consolidadas para el Dashboard
   */
  async getKpis() {
    const pool = await getPool();

    if (pool) {
      const result = await pool.request().query(`
        SELECT 
          (SELECT COUNT(*) FROM Producto) AS TotalProductos,
          (SELECT COUNT(*) FROM Cliente) AS TotalClientes,
          (SELECT COUNT(*) FROM Pedido) AS TotalPedidos,
          (SELECT ISNULL(SUM(TotalPedido), 0) FROM Pedido WHERE EstadoPedido = 'Procesado') AS VentasTotalesSoles,
          (SELECT ISNULL(SUM(StockActual * PrecioUnitario), 0) FROM Producto) AS ValorInventarioTotal,
          (SELECT COUNT(*) FROM Producto WHERE StockActual < 50) AS ProductosStockCritico;
      `);
      return result.recordset[0];
    }

    if (sqlcmdBridge.isAvailable()) {
      return await sqlcmdBridge.getKpis();
    }

    const ventasTotales = memoryStore.pedidos
      .filter(p => p.EstadoPedido === 'Procesado')
      .reduce((sum, p) => sum + p.TotalPedido, 0);

    const valorInventario = memoryStore.productos
      .reduce((sum, p) => sum + (p.StockActual * p.PrecioUnitario), 0);

    const productosBajoStock = memoryStore.productos
      .filter(p => p.StockActual < 50).length;

    return {
      TotalProductos: memoryStore.productos.length,
      TotalClientes: memoryStore.clientes.length,
      TotalPedidos: memoryStore.pedidos.length,
      VentasTotalesSoles: parseFloat(ventasTotales.toFixed(2)),
      ValorInventarioTotal: parseFloat(valorInventario.toFixed(2)),
      ProductosStockCritico: productosBajoStock
    };
  }
}

module.exports = new ReporteRepository();
