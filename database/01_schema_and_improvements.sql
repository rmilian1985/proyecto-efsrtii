-- =========================================================================
-- PROYECTO EFSRT II: DISTRIBUCIONES Y SERVICIOS DEL NORTE S.A.C.
-- Script Oficial de Base de Datos, Tablas Normalizadas (3FN),
-- Índices de Rendimiento, Procedimientos Almacenados y Triggers
-- =========================================================================

-- 1. Crear Base de Datos si no existe
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'BD_DistribucionesNorte')
BEGIN
    CREATE DATABASE BD_DistribucionesNorte;
END
GO

USE BD_DistribucionesNorte;
GO

-- -------------------------------------------------------------------------
-- 2. LIMPIEZA PREVIA (Opcional, en orden inverso de dependencias)
-- -------------------------------------------------------------------------
IF OBJECT_ID('trg_ValidarDetallePedido', 'TR') IS NOT NULL DROP TRIGGER trg_ValidarDetallePedido;
IF OBJECT_ID('sp_ProcesarPedidoInstitucional', 'P') IS NOT NULL DROP PROCEDURE sp_ProcesarPedidoInstitucional;
IF OBJECT_ID('sp_ReporteConsolidadoInventario', 'P') IS NOT NULL DROP PROCEDURE sp_ReporteConsolidadoInventario;
IF OBJECT_ID('vw_ResumenDashboard', 'V') IS NOT NULL DROP VIEW vw_ResumenDashboard;
IF OBJECT_ID('DetallePedido', 'U') IS NOT NULL DROP TABLE DetallePedido;
IF OBJECT_ID('Pedido', 'U') IS NOT NULL DROP TABLE Pedido;
IF OBJECT_ID('Producto', 'U') IS NOT NULL DROP TABLE Producto;
IF OBJECT_ID('Cliente', 'U') IS NOT NULL DROP TABLE Cliente;
IF OBJECT_ID('Categoria', 'U') IS NOT NULL DROP TABLE Categoria;
GO

-- -------------------------------------------------------------------------
-- 3. CREACIÓN DE TABLAS NORMALIZADAS (Hasta Tercera Forma Normal - 3FN)
-- -------------------------------------------------------------------------

-- Tabla: Categoria
CREATE TABLE Categoria (
    IdCategoria INT IDENTITY(1,1) PRIMARY KEY,
    NombreCategoria VARCHAR(50) NOT NULL UNIQUE
);
GO

-- Tabla: Producto
CREATE TABLE Producto (
    IdProducto INT IDENTITY(1,1) PRIMARY KEY,
    CodigoBarras VARCHAR(20) UNIQUE NOT NULL,
    NombreProducto VARCHAR(100) NOT NULL,
    IdCategoria INT NOT NULL FOREIGN KEY REFERENCES Categoria(IdCategoria),
    StockActual INT NOT NULL CHECK (StockActual >= 0),
    PrecioUnitario DECIMAL(10,2) NOT NULL CHECK (PrecioUnitario > 0)
);
GO

-- Tabla: Cliente
CREATE TABLE Cliente (
    IdCliente INT IDENTITY(1,1) PRIMARY KEY,
    RUC_DNI VARCHAR(15) UNIQUE NOT NULL,
    RazonSocial VARCHAR(150) NOT NULL,
    Direccion VARCHAR(200) NOT NULL,
    Telefono VARCHAR(20) NOT NULL
);
GO

-- Tabla: Pedido
CREATE TABLE Pedido (
    IdPedido INT IDENTITY(1,1) PRIMARY KEY,
    IdCliente INT NOT NULL FOREIGN KEY REFERENCES Cliente(IdCliente),
    FechaPedido DATETIME DEFAULT GETDATE(),
    EstadoPedido VARCHAR(30) DEFAULT 'Registrado',
    TotalPedido DECIMAL(10,2) DEFAULT 0.00
);
GO

-- Tabla: DetallePedido
CREATE TABLE DetallePedido (
    IdDetalle INT IDENTITY(1,1) PRIMARY KEY,
    IdPedido INT NOT NULL FOREIGN KEY REFERENCES Pedido(IdPedido) ON DELETE CASCADE,
    IdProducto INT NOT NULL FOREIGN KEY REFERENCES Producto(IdProducto),
    Cantidad INT NOT NULL CHECK (Cantidad > 0),
    Subtotal DECIMAL(10,2) NOT NULL
);
GO

-- -------------------------------------------------------------------------
-- 4. MEJORAS DE ARQUITECTURA: ÍNDICES NON-CLUSTERED PARA ALTA VELOCIDAD
-- -------------------------------------------------------------------------
-- Justificación: Aceleran drásticamente las consultas JOIN y los cálculos de reportes
CREATE NONCLUSTERED INDEX IX_Producto_Categoria ON Producto(IdCategoria);
CREATE NONCLUSTERED INDEX IX_Pedido_Cliente ON Pedido(IdCliente);
CREATE NONCLUSTERED INDEX IX_DetallePedido_Pedido ON DetallePedido(IdPedido);
CREATE NONCLUSTERED INDEX IX_DetallePedido_Producto ON DetallePedido(IdProducto);
GO

-- -------------------------------------------------------------------------
-- 5. PROCEDIMIENTOS ALMACENADOS (LÓGICA TRANSACCIONAL ACID)
-- -------------------------------------------------------------------------

-- ALGORITMO 1: Transacción atómica para registrar pedidos y descontar stock automáticamente
-- Cumple con el requerimiento de evaluación de la página 16 del informe
CREATE PROCEDURE sp_ProcesarPedidoInstitucional
    @IdCliente INT,
    @IdProducto INT,
    @CantidadSolicitada INT,
    @Resultado INT OUTPUT,       -- 1: Éxito, 0: Stock Insuficiente, -1: Error
    @Mensaje VARCHAR(200) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @StockActual INT;
    DECLARE @PrecioU DECIMAL(10,2);
    
    -- Iniciar transacción ACID
    BEGIN TRANSACTION;
    BEGIN TRY
        -- Bloqueo de lectura (UPDLOCK) para evitar condiciones de carrera (Race Condition)
        SELECT @StockActual = StockActual, @PrecioU = PrecioUnitario 
        FROM Producto WITH (UPDLOCK) 
        WHERE IdProducto = @IdProducto;
        
        IF @StockActual IS NULL
        BEGIN
            SET @Resultado = -1;
            SET @Mensaje = 'Error: El producto especificado no existe.';
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Algoritmo de validación de negocio (Control de Stock)
        IF @StockActual >= @CantidadSolicitada
        BEGIN
            -- 1. Insertar la cabecera del pedido
            INSERT INTO Pedido (IdCliente, FechaPedido, EstadoPedido, TotalPedido)
            VALUES (@IdCliente, GETDATE(), 'Procesado', (@CantidadSolicitada * @PrecioU));
            
            DECLARE @IdPedidoGenerado INT = SCOPE_IDENTITY();
            
            -- 2. Insertar el detalle del pedido
            INSERT INTO DetallePedido (IdPedido, IdProducto, Cantidad, Subtotal)
            VALUES (@IdPedidoGenerado, @IdProducto, @CantidadSolicitada, (@CantidadSolicitada * @PrecioU));
            
            -- 3. Actualizar (procesar) el stock relacional
            UPDATE Producto 
            SET StockActual = StockActual - @CantidadSolicitada 
            WHERE IdProducto = @IdProducto;
            
            COMMIT TRANSACTION;
            SET @Resultado = 1;
            SET @Mensaje = 'Pedido procesado y stock actualizado correctamente.';
        END
        ELSE
        BEGIN
            ROLLBACK TRANSACTION;
            SET @Resultado = 0;
            SET @Mensaje = 'Stock insuficiente para procesar la cantidad solicitada.';
        END
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @Resultado = -1;
        SET @Mensaje = 'Error interno en la BD: ' + ERROR_MESSAGE();
    END CATCH
END;
GO

-- ALGORITMO 2: Consulta de Agregación Relacional para Reportes de Inventario y Ventas
CREATE PROCEDURE sp_ReporteConsolidadoInventario
AS
BEGIN
    SET NOCOUNT ON;
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
    ORDER BY ValorTotalInventario DESC;
END;
GO

-- -------------------------------------------------------------------------
-- 6. DISPARADORES (TRIGGERS) PARA INTEGRIDAD REFERENCIAL Y VALIDACIÓN
-- -------------------------------------------------------------------------
CREATE TRIGGER trg_ValidarDetallePedido
ON DetallePedido
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    -- Previene inserciones de subtotales negativos o erróneos
    IF EXISTS (SELECT 1 FROM inserted WHERE Subtotal < 0)
    BEGIN
        RAISERROR('Error de Integridad: El subtotal no puede ser menor a cero.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

-- -------------------------------------------------------------------------
-- 7. VISTA MEJORADA: RESUMEN DE INDICADORES (KPIs DASHBOARD)
-- -------------------------------------------------------------------------
CREATE VIEW vw_ResumenDashboard AS
SELECT 
    (SELECT COUNT(*) FROM Producto) AS TotalProductos,
    (SELECT COUNT(*) FROM Cliente) AS TotalClientes,
    (SELECT COUNT(*) FROM Pedido) AS TotalPedidos,
    (SELECT ISNULL(SUM(TotalPedido), 0) FROM Pedido WHERE EstadoPedido = 'Procesado') AS VentasTotalesSoles,
    (SELECT ISNULL(SUM(StockActual * PrecioUnitario), 0) FROM Producto) AS ValorInventarioTotal,
    (SELECT COUNT(*) FROM Producto WHERE StockActual < 50) AS ProductosStockCritico;
GO
