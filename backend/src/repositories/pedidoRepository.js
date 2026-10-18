/**
 * ==============================================================================
 * CAPA DE ACCESO A DATOS (DAL): pedidoRepository.js
 * Responsabilidad: Ejecutar la lógica transaccional de Pedidos mediante
 * el Stored Procedure 'sp_ProcesarPedidoInstitucional' en Microsoft SQL Server.
 * Proyecto EFSRT II - Cibertec
 * ==============================================================================
 */

const { getPool, sql } = require('../config/db');
const memoryStore = require('../config/seedMemory');

class PedidoRepository {
  /**
   * Ejecuta el Stored Procedure transaccional sp_ProcesarPedidoInstitucional
   */
  async procesarPedidoInstitucional(idCliente, idProducto, cantidadSolicitada) {
    const pool = await getPool();

    if (pool) {
      const request = pool.request();
      
      // Parámetros de Entrada (INPUT)
      request.input('IdCliente', sql.Int, idCliente);
      request.input('IdProducto', sql.Int, idProducto);
      request.input('CantidadSolicitada', sql.Int, cantidadSolicitada);

      // Parámetros de Salida (OUTPUT) según la especificación del informe
      request.output('Resultado', sql.Int);
      request.output('Mensaje', sql.VarChar(200));

      const spResult = await request.execute('sp_ProcesarPedidoInstitucional');

      const resultado = spResult.output.Resultado;
      const mensaje = spResult.output.Mensaje;

      return {
        resultado, // 1: Éxito, 0: Stock Insuficiente, -1: Error
        mensaje,
        ejecutadoEn: 'Microsoft SQL Server (Stored Procedure Transaccional)'
      };
    }

    // Fallback de resiliencia en memoria
    const producto = memoryStore.productos.find(p => p.IdProducto === parseInt(idProducto, 10));
    const cliente = memoryStore.clientes.find(c => c.IdCliente === parseInt(idCliente, 10));

    if (!cliente) {
      return { resultado: -1, mensaje: 'Error: El cliente especificado no existe.', ejecutadoEn: 'Memoria Resiliente' };
    }

    if (!producto) {
      return { resultado: -1, mensaje: 'Error: El producto especificado no existe.', ejecutadoEn: 'Memoria Resiliente' };
    }

    if (producto.StockActual >= cantidadSolicitada) {
      // Descontar stock
      producto.StockActual -= cantidadSolicitada;
      
      const nuevoIdPedido = memoryStore.pedidos.length + 1;
      const subtotal = cantidadSolicitada * producto.PrecioUnitario;

      const nuevoPedido = {
        IdPedido: nuevoIdPedido,
        IdCliente: cliente.IdCliente,
        Cliente: cliente.RazonSocial,
        FechaPedido: new Date().toISOString(),
        EstadoPedido: 'Procesado',
        TotalPedido: subtotal,
        detalles: [
          {
            IdDetalle: memoryStore.pedidos.length * 2 + 1,
            IdProducto: producto.IdProducto,
            NombreProducto: producto.NombreProducto,
            Cantidad: cantidadSolicitada,
            PrecioUnitario: producto.PrecioUnitario,
            Subtotal: subtotal
          }
        ]
      };

      memoryStore.pedidos.unshift(nuevoPedido);

      return {
        resultado: 1,
        mensaje: 'Pedido procesado y stock actualizado correctamente.',
        pedido: nuevoPedido,
        ejecutadoEn: 'Memoria Resiliente (Simulación ACID)'
      };
    } else {
      return {
        resultado: 0,
        mensaje: `Stock insuficiente para procesar la cantidad solicitada. (Stock actual: ${producto.StockActual})`,
        ejecutadoEn: 'Memoria Resiliente (Simulación ACID)'
      };
    }
  }

  /**
   * Obtiene la lista completa de pedidos con información del cliente
   */
  async getAll() {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request().query(`
        SELECT 
          p.IdPedido,
          p.IdCliente,
          c.RazonSocial AS Cliente,
          c.RUC_DNI,
          p.FechaPedido,
          p.EstadoPedido,
          p.TotalPedido,
          (
            SELECT COUNT(*) 
            FROM DetallePedido dp 
            WHERE dp.IdPedido = p.IdPedido
          ) AS TotalItems
        FROM Pedido p
        INNER JOIN Cliente c ON p.IdCliente = c.IdCliente
        ORDER BY p.FechaPedido DESC;
      `);
      return result.recordset;
    }
    return memoryStore.pedidos;
  }

  /**
   * Obtiene el detalle completo de un pedido específico
   */
  async getDetalle(idPedido) {
    const pool = await getPool();
    if (pool) {
      const result = await pool.request()
        .input('IdPedido', sql.Int, idPedido)
        .query(`
          SELECT 
            dp.IdDetalle,
            dp.IdPedido,
            dp.IdProducto,
            pr.NombreProducto,
            pr.CodigoBarras,
            dp.Cantidad,
            pr.PrecioUnitario,
            dp.Subtotal
          FROM DetallePedido dp
          INNER JOIN Producto pr ON dp.IdProducto = pr.IdProducto
          WHERE dp.IdPedido = @IdPedido;
        `);
      return result.recordset;
    }
    const pedido = memoryStore.pedidos.find(p => p.IdPedido === parseInt(idPedido, 10));
    return pedido ? pedido.detalles : [];
  }
}

module.exports = new PedidoRepository();
