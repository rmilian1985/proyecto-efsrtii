/**
 * ==============================================================================
 * PUENTE DE CONEXIÓN DIRECTA A MICROSOFT SQL SERVER: sqlcmdBridge.js
 * Proyecto EFSRT II - Cibertec
 * Empresa: Distribuciones y Servicios del Norte S.A.C.
 * ==============================================================================
 * 
 * Propósito:
 * Permite ejecutar consultas y Stored Procedures transaccionales directamente
 * contra la instancia local de Microsoft SQL Server (BD_DistribucionesNorte)
 * mediante Shared Memory / Named Pipes usando la utilidad nativa 'sqlcmd'.
 * 
 * Esto garantiza que las operaciones realizadas desde el aplicativo web en
 * localhost (como sp_ProcesarPedidoInstitucional) impacten inmediatamente
 * las tablas físicas (Pedido, DetallePedido, Producto) en SQL Server Management Studio.
 */

const cp = require('child_process');

class SqlcmdBridge {
  constructor() {
    this._available = null;
  }

  /**
   * Verifica si sqlcmd está disponible en el sistema y puede conectarse a SQL Server
   */
  isAvailable() {
    if (this._available !== null) return this._available;

    if (process.platform !== 'win32') {
      this._available = false;
      return false;
    }

    try {
      const out = cp.execFileSync('sqlcmd', [
        '-S', '.',
        '-E',
        '-C',
        '-d', 'BD_DistribucionesNorte',
        '-Q', 'SET NOCOUNT ON; SELECT DB_NAME() AS db;'
      ], { encoding: 'utf8', timeout: 3000 });

      this._available = out.includes('BD_DistribucionesNorte');
      if (this._available) {
        console.log('[SQL SERVER BRIDGE] Conexión nativa a Microsoft SQL Server (BD_DistribucionesNorte) activa vía Shared Memory.');
      }
      return this._available;
    } catch (e) {
      this._available = false;
      return false;
    }
  }

  /**
   * Ejecuta una consulta SQL en sqlcmd y retorna el resultado parseado como JSON
   */
  queryJson(tsql, isSingleObject = false) {
    try {
      const jsonClause = isSingleObject ? 'FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;' : 'FOR JSON PATH;';
      const fullQuery = `SET NOCOUNT ON;\n${tsql}\n${jsonClause}`;

      const out = cp.execFileSync('sqlcmd', [
        '-S', '.',
        '-E',
        '-C',
        '-d', 'BD_DistribucionesNorte',
        '-w', '65535',
        '-y', '0',
        '-Q', fullQuery
      ], { encoding: 'utf8', timeout: 10000 });

      const cleaned = out.split(/\r?\n/).map(l => l.trim()).join('');
      if (!cleaned) return isSingleObject ? null : [];
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('[SQL SERVER BRIDGE ERROR]:', error.message);
      throw error;
    }
  }

  /**
   * Ejecuta el Stored Procedure transaccional sp_ProcesarPedidoInstitucional
   */
  async procesarPedidoInstitucional(idCliente, idProducto, cantidadSolicitada) {
    const cId = parseInt(idCliente, 10);
    const pId = parseInt(idProducto, 10);
    const cant = parseInt(cantidadSolicitada, 10);

    const tsql = `
      SET NOCOUNT ON;
      DECLARE @res INT;
      DECLARE @msj VARCHAR(200);

      EXEC sp_ProcesarPedidoInstitucional 
        @IdCliente = ${cId}, 
        @IdProducto = ${pId}, 
        @CantidadSolicitada = ${cant}, 
        @Resultado = @res OUTPUT, 
        @Mensaje = @msj OUTPUT;

      SELECT @res AS Resultado, @msj AS Mensaje 
      FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
    `;

    try {
      const out = cp.execFileSync('sqlcmd', [
        '-S', '.',
        '-E',
        '-C',
        '-d', 'BD_DistribucionesNorte',
        '-w', '65535',
        '-y', '0',
        '-Q', tsql
      ], { encoding: 'utf8', timeout: 10000 });

      const cleaned = out.split(/\r?\n/).map(l => l.trim()).join('');
      const spOutput = JSON.parse(cleaned);

      return {
        resultado: spOutput.Resultado,
        mensaje: spOutput.Mensaje,
        ejecutadoEn: 'Microsoft SQL Server (sp_ProcesarPedidoInstitucional)'
      };
    } catch (error) {
      console.error('[SQL SERVER BRIDGE ERROR en sp_ProcesarPedidoInstitucional]:', error.message);
      return {
        resultado: -1,
        mensaje: `Error al ejecutar Stored Procedure en SQL Server: ${error.message}`,
        ejecutadoEn: 'Microsoft SQL Server Error'
      };
    }
  }

  /**
   * Obtiene todos los pedidos con información del cliente
   */
  async getPedidos() {
    const tsql = `
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
      ORDER BY p.IdPedido DESC
    `;
    return this.queryJson(tsql, false) || [];
  }

  /**
   * Obtiene el detalle de un pedido
   */
  async getDetallePedido(idPedido) {
    const pId = parseInt(idPedido, 10);
    const tsql = `
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
      WHERE dp.IdPedido = ${pId}
    `;
    return this.queryJson(tsql, false) || [];
  }

  /**
   * Obtiene todos los productos con su categoría
   */
  async getProductos() {
    const tsql = `
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
      ORDER BY p.NombreProducto ASC
    `;
    return this.queryJson(tsql, false) || [];
  }

  /**
   * Obtiene un producto por ID
   */
  async getProductoById(id) {
    const pId = parseInt(id, 10);
    const tsql = `
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
      WHERE p.IdProducto = ${pId}
    `;
    return this.queryJson(tsql, true);
  }

  /**
   * Obtiene las categorías
   */
  async getCategorias() {
    const tsql = `
      SELECT IdCategoria, NombreCategoria
      FROM Categoria
      ORDER BY NombreCategoria ASC
    `;
    return this.queryJson(tsql, false) || [];
  }

  /**
   * Obtiene los clientes
   */
  async getClientes() {
    const tsql = `
      SELECT IdCliente, RUC_DNI, RazonSocial, Direccion, Telefono
      FROM Cliente
      ORDER BY RazonSocial ASC
    `;
    return this.queryJson(tsql, false) || [];
  }

  /**
   * Obtiene un cliente por ID
   */
  async getClienteById(id) {
    const cId = parseInt(id, 10);
    const tsql = `
      SELECT IdCliente, RUC_DNI, RazonSocial, Direccion, Telefono
      FROM Cliente
      WHERE IdCliente = ${cId}
    `;
    return this.queryJson(tsql, true);
  }

  /**
   * Inserta un cliente
   */
  async createCliente({ rucDni, razonSocial, direccion, telefono }) {
    const safeRuc = (rucDni || '').replace(/'/g, "''");
    const safeRazon = (razonSocial || '').replace(/'/g, "''");
    const safeDir = (direccion || '').replace(/'/g, "''");
    const safeTel = (telefono || '').replace(/'/g, "''");

    const tsql = `
      INSERT INTO Cliente (RUC_DNI, RazonSocial, Direccion, Telefono)
      VALUES ('${safeRuc}', '${safeRazon}', '${safeDir}', '${safeTel}');
      SELECT SCOPE_IDENTITY() AS IdCliente
    `;
    const res = this.queryJson(tsql, true);
    return { id: res?.IdCliente, rucDni, razonSocial, direccion, telefono };
  }

  /**
   * Obtiene los KPIs calculados en vivo desde SQL Server
   */
  async getKpis() {
    const tsql = `
      SELECT 
        (SELECT COUNT(*) FROM Producto) AS TotalProductos,
        (SELECT COUNT(*) FROM Cliente) AS TotalClientes,
        (SELECT COUNT(*) FROM Pedido) AS TotalPedidos,
        (SELECT ISNULL(SUM(TotalPedido), 0) FROM Pedido WHERE EstadoPedido = 'Procesado') AS VentasTotalesSoles,
        (SELECT ISNULL(SUM(StockActual * PrecioUnitario), 0) FROM Producto) AS ValorInventarioTotal,
        (SELECT COUNT(*) FROM Producto WHERE StockActual < 50) AS ProductosStockCritico
    `;
    return this.queryJson(tsql, true);
  }

  /**
   * Obtiene el reporte consolidado de inventario desde SQL Server
   */
  async getReporteConsolidado() {
    const tsql = `
      SELECT 
          c.NombreCategoria AS Categoria,
          p.CodigoBarras,
          p.NombreProducto,
          p.StockActual,
          p.PrecioUnitario,
          (p.StockActual * p.PrecioUnitario) AS ValorTotalInventario,
          ISNULL(SUM(dp.Cantidad), 0) AS TotalUnidadesVendidas
      FROM Producto p
      INNER JOIN Categoria c ON p.IdCategoria = c.IdCategoria
      LEFT JOIN DetallePedido dp ON p.IdProducto = dp.IdProducto
      GROUP BY c.NombreCategoria, p.CodigoBarras, p.NombreProducto, p.StockActual, p.PrecioUnitario
      ORDER BY ValorTotalInventario DESC
    `;
    return this.queryJson(tsql, false) || [];
  }
}

module.exports = new SqlcmdBridge();
