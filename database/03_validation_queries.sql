-- =========================================================================
-- PROYECTO EFSRT II: DISTRIBUCIONES Y SERVICIOS DEL NORTE S.A.C.
-- SCRIPT DE VALIDACIÓN Y CAPTURA DE PANTALLAS PARA EL INFORME ACADÉMICO
-- Compatible con SQL Server Management Studio (SSMS)
-- =========================================================================

USE BD_DistribucionesNorte;
GO

PRINT '=========================================================================';
PRINT 'CASO DE VALIDACIÓN 1: COMPARACIÓN DE KPIS DEL DASHBOARD';
PRINT 'Web: Tarjetas de Resumen | SSMS: Vista vw_ResumenDashboard';
PRINT '=========================================================================';

-- 1.1 Ejecutar la vista de KPIs para contrastar con las tarjetas superiores del Dashboard
SELECT 
    TotalProductos,
    TotalClientes,
    TotalPedidos,
    FORMAT(VentasTotalesSoles, 'C', 'es-PE') AS VentasTotales_PEN,
    FORMAT(ValorInventarioTotal, 'C', 'es-PE') AS ValorInventario_PEN,
    ProductosStockCritico
FROM vw_ResumenDashboard;
GO

PRINT '=========================================================================';
PRINT 'CASO DE VALIDACIÓN 2: SIMULADOR DE PEDIDO EXITOSO (COMMIT TRANSACCIONAL)';
PRINT 'Web: Tarjeta Verde [TRANSACCIÓN EXITOSA] | SSMS: sp_ProcesarPedidoInstitucional';
PRINT '=========================================================================';

-- 2.1 Consultar el Stock del Producto 1 (Leche Gloria Azul) ANTES del pedido
SELECT 
    IdProducto,
    CodigoBarras,
    NombreProducto,
    StockActual AS [Stock_ANTES_del_Pedido],
    PrecioUnitario
FROM Producto
WHERE IdProducto = 1;
GO

-- 2.2 Ejecutar el Stored Procedure solicitando 10 unidades para el Cliente 1 (Municipalidad de Piura)
DECLARE @ResultadoExito INT;
DECLARE @MensajeExito VARCHAR(200);

EXEC sp_ProcesarPedidoInstitucional 
    @IdCliente = 1,
    @IdProducto = 1,
    @CantidadSolicitada = 10,
    @Resultado = @ResultadoExito OUTPUT,
    @Mensaje = @MensajeExito OUTPUT;

-- Mostrar el retorno de los parámetros OUTPUT del Stored Procedure
SELECT 
    @ResultadoExito AS [Codigo_Resultado (1=Exito)], 
    @MensajeExito AS [Mensaje_del_Motor_SQL];
GO

-- 2.3 Verificar que el Stock disminuyó exactamente en 10 unidades (Atomicidad ACID)
SELECT 
    IdProducto,
    CodigoBarras,
    NombreProducto,
    StockActual AS [Stock_DESPUES_del_Pedido]
FROM Producto
WHERE IdProducto = 1;
GO

-- 2.4 Consultar la cabecera y el detalle recién generados en las tablas relacionales
SELECT TOP 1 
    p.IdPedido,
    c.RazonSocial AS Cliente,
    p.FechaPedido,
    p.EstadoPedido,
    p.TotalPedido
FROM Pedido p
INNER JOIN Cliente c ON p.IdCliente = c.IdCliente
ORDER BY p.IdPedido DESC;

SELECT TOP 1 
    dp.IdDetalle,
    dp.IdPedido,
    pr.NombreProducto,
    dp.Cantidad,
    dp.Subtotal
FROM DetallePedido dp
INNER JOIN Producto pr ON dp.IdProducto = pr.IdProducto
ORDER BY dp.IdDetalle DESC;
GO

PRINT '=========================================================================';
PRINT 'CASO DE VALIDACIÓN 3: SIMULADOR DE PEDIDO CON FALLA / STOCK INSUFICIENTE';
PRINT 'Web: Tarjeta Roja [TRANSACCIÓN REVERTIDA] | SSMS: ROLLBACK Automático';
PRINT '=========================================================================';

-- 3.1 Consultar el stock actual
SELECT 
    IdProducto,
    NombreProducto,
    StockActual AS [Stock_Disponible]
FROM Producto
WHERE IdProducto = 1;
GO

-- 3.2 Intentar procesar un pedido de 50,000 unidades (Excede ampliamente el stock)
DECLARE @ResultadoFalla INT;
DECLARE @MensajeFalla VARCHAR(200);

EXEC sp_ProcesarPedidoInstitucional 
    @IdCliente = 1,
    @IdProducto = 1,
    @CantidadSolicitada = 50000,
    @Resultado = @ResultadoFalla OUTPUT,
    @Mensaje = @MensajeFalla OUTPUT;

SELECT 
    @ResultadoFalla AS [Codigo_Resultado (0=Stock Insuficiente)], 
    @MensajeFalla AS [Mensaje_del_Motor_SQL];
GO

-- 3.3 Demostrar que gracias al ROLLBACK TRANSACTION el stock no sufrió alteración ni descuadre
SELECT 
    IdProducto,
    NombreProducto,
    StockActual AS [Stock_Intacto_Post_Rollback]
FROM Producto
WHERE IdProducto = 1;
GO

PRINT '=========================================================================';
PRINT 'CASO DE VALIDACIÓN 4: REPORTE CONSOLIDADO DE INVENTARIO';
PRINT 'Web: Módulo Reportes Exportables | SSMS: sp_ReporteConsolidadoInventario';
PRINT '=========================================================================';

-- 4.1 Ejecutar el procedimiento de agregación que alimenta la tabla web y el Excel/PDF
EXEC sp_ReporteConsolidadoInventario;
GO

PRINT '=========================================================================';
PRINT 'CASO DE VALIDACIÓN 5: INTEGRIDAD REFERENCIAL MEDIANTE TRIGGER';
PRINT 'Validación de la regla de negocio: trg_ValidarDetallePedido';
PRINT '=========================================================================';

-- 5.1 Intentar insertar un detalle con Subtotal negativo (-50.00).
-- El trigger trg_ValidarDetallePedido interceptará la anomalía y abortará con RAISERROR.
BEGIN TRY
    INSERT INTO DetallePedido (IdPedido, IdProducto, Cantidad, Subtotal)
    VALUES (1, 1, 5, -50.00);
END TRY
BEGIN CATCH
    SELECT 
        ERROR_NUMBER() AS [Numero_Error],
        ERROR_MESSAGE() AS [Mensaje_Disparado_Por_Trigger],
        'La transacción fue abortada correctamente por el trigger.' AS Estado_Auditoria;
END CATCH;
GO

PRINT '=========================================================================';
PRINT 'CASO DE VALIDACIÓN 6: AUDITORÍA DE ÍNDICES NON-CLUSTERED (B-TREE)';
PRINT 'Demostración de mejoras arquitectónicas para consultas de alto rendimiento';
PRINT '=========================================================================';

-- 6.1 Listar los índices secundarios creados en las tablas principales
SELECT 
    t.name AS [Tabla],
    i.name AS [Nombre_Indice],
    i.type_desc AS [Tipo_Estructura]
FROM sys.indexes i
INNER JOIN sys.tables t ON i.object_id = t.object_id
WHERE i.name LIKE 'IX_%'
ORDER BY t.name;
GO
