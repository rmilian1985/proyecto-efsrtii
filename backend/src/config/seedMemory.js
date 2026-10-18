/**
 * ==============================================================================
 * DATOS SEMILLA EN MEMORIA (FALLBACK / CACHE)
 * Utilizados como respaldo resiliente para pruebas si el motor SQL Server
 * no estuviera disponible en el entorno de despliegue inicial.
 * ==============================================================================
 */

const memoryStore = {
  categorias: [
    { IdCategoria: 1, NombreCategoria: 'Lácteos y Derivados' },
    { IdCategoria: 2, NombreCategoria: 'Abarrotes y Conservas' },
    { IdCategoria: 3, NombreCategoria: 'Granos, Harinas y Cereales' },
    { IdCategoria: 4, NombreCategoria: 'Aceites, Grasas y Condimentos' },
    { IdCategoria: 5, NombreCategoria: 'Bebidas y Jugos Institucionales' }
  ],
  productos: [
    { IdProducto: 1, CodigoBarras: '77501230001', NombreProducto: 'Leche Evaporada Gloria Azul 400g', IdCategoria: 1, Categoria: 'Lácteos y Derivados', StockActual: 1500, PrecioUnitario: 4.50 },
    { IdProducto: 2, CodigoBarras: '77501230002', NombreProducto: 'Leche Condensada Gloria 397g', IdCategoria: 1, Categoria: 'Lácteos y Derivados', StockActual: 800, PrecioUnitario: 5.20 },
    { IdProducto: 3, CodigoBarras: '77501230003', NombreProducto: 'Atún en Aceite Primor 160g', IdCategoria: 2, Categoria: 'Abarrotes y Conservas', StockActual: 1200, PrecioUnitario: 6.80 },
    { IdProducto: 4, CodigoBarras: '77501230004', NombreProducto: 'Leche Evaporada Bonlé 400g', IdCategoria: 1, Categoria: 'Lácteos y Derivados', StockActual: 950, PrecioUnitario: 3.80 },
    { IdProducto: 5, CodigoBarras: '77501230005', NombreProducto: 'Queso Edam Laive Trozo 500g', IdCategoria: 1, Categoria: 'Lácteos y Derivados', StockActual: 320, PrecioUnitario: 18.50 },
    { IdProducto: 6, CodigoBarras: '77501230007', NombreProducto: 'Gratado de Pescado Real 170g', IdCategoria: 2, Categoria: 'Abarrotes y Conservas', StockActual: 2100, PrecioUnitario: 3.90 },
    { IdProducto: 7, CodigoBarras: '77501230011', NombreProducto: 'Arroz Superior Costeño Saco 50kg', IdCategoria: 3, Categoria: 'Granos, Harinas y Cereales', StockActual: 300, PrecioUnitario: 165.00 },
    { IdProducto: 8, CodigoBarras: '77501230013', NombreProducto: 'Avena Precortada 3 Ositos 500g', IdCategoria: 3, Categoria: 'Granos, Harinas y Cereales', StockActual: 1400, PrecioUnitario: 3.60 },
    { IdProducto: 9, CodigoBarras: '77501230014', NombreProducto: 'Fideos Spaghetti Don Vittorio 500g', IdCategoria: 3, Categoria: 'Granos, Harinas y Cereales', StockActual: 2400, PrecioUnitario: 3.10 },
    { IdProducto: 10, CodigoBarras: '77501230017', NombreProducto: 'Aceite Vegetal Primor Premium 900ml', IdCategoria: 4, Categoria: 'Aceites, Grasas y Condimentos', StockActual: 1350, PrecioUnitario: 8.90 },
    { IdProducto: 11, CodigoBarras: '77501230019', NombreProducto: 'Sal Yodada Marina Emsal 1kg', IdCategoria: 4, Categoria: 'Aceites, Grasas y Condimentos', StockActual: 3000, PrecioUnitario: 1.40 },
    { IdProducto: 12, CodigoBarras: '77501230021', NombreProducto: 'Agua Mineral San Luis Bidón 20L', IdCategoria: 5, Categoria: 'Bebidas y Jugos Institucionales', StockActual: 250, PrecioUnitario: 18.00 }
  ],
  clientes: [
    { IdCliente: 1, RUC_DNI: '20543210981', RazonSocial: 'Municipalidad Provincial de Piura', Direccion: 'Av. Loreto 150, Piura', Telefono: '073324455' },
    { IdCliente: 2, RUC_DNI: '20612345678', RazonSocial: 'Comité Vaso de Leche - Castilla', Direccion: 'Calle Grau 420, Piura', Telefono: '073345566' },
    { IdCliente: 3, RUC_DNI: '20145678912', RazonSocial: 'Municipalidad Distrital de Catacaos', Direccion: 'Jr. Comercio 540, Catacaos', Telefono: '073370120' },
    { IdCliente: 4, RUC_DNI: '20489561234', RazonSocial: 'Programa Nacional Qali Warma - Sede Piura', Direccion: 'Urb. Los Cocos Mz. C Lote 12, Piura', Telefono: '073318920' },
    { IdCliente: 5, RUC_DNI: '20311223344', RazonSocial: 'Beneficencia Pública de Piura', Direccion: 'Calle Huánuco 112, Piura', Telefono: '073305540' },
    { IdCliente: 6, RUC_DNI: '10458923412', RazonSocial: 'Comercial El Chira E.I.R.L. - Sullana', Direccion: 'Mercado Modelo Puesto 45, Sullana', Telefono: '073502211' }
  ],
  pedidos: [
    {
      IdPedido: 1,
      IdCliente: 1,
      Cliente: 'Municipalidad Provincial de Piura',
      FechaPedido: new Date(Date.now() - 5 * 86400000).toISOString(),
      EstadoPedido: 'Procesado',
      TotalPedido: 2250.00,
      detalles: [
        { IdDetalle: 1, IdProducto: 1, NombreProducto: 'Leche Evaporada Gloria Azul 400g', Cantidad: 500, PrecioUnitario: 4.50, Subtotal: 2250.00 }
      ]
    },
    {
      IdPedido: 2,
      IdCliente: 2,
      Cliente: 'Comité Vaso de Leche - Castilla',
      FechaPedido: new Date(Date.now() - 3 * 86400000).toISOString(),
      EstadoPedido: 'Procesado',
      TotalPedido: 2700.00,
      detalles: [
        { IdDetalle: 2, IdProducto: 1, NombreProducto: 'Leche Evaporada Gloria Azul 400g', Cantidad: 200, PrecioUnitario: 4.50, Subtotal: 900.00 },
        { IdDetalle: 3, IdProducto: 8, NombreProducto: 'Avena Precortada 3 Ositos 500g', Cantidad: 500, PrecioUnitario: 3.60, Subtotal: 1800.00 }
      ]
    },
    {
      IdPedido: 3,
      IdCliente: 3,
      Cliente: 'Municipalidad Distrital de Catacaos',
      FechaPedido: new Date(Date.now() - 1 * 86400000).toISOString(),
      EstadoPedido: 'Procesado',
      TotalPedido: 8250.00,
      detalles: [
        { IdDetalle: 4, IdProducto: 7, NombreProducto: 'Arroz Superior Costeño Saco 50kg', Cantidad: 50, PrecioUnitario: 165.00, Subtotal: 8250.00 }
      ]
    }
  ]
};

module.exports = memoryStore;
