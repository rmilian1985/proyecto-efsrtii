-- =========================================================================
-- PROYECTO EFSRT II: DISTRIBUCIONES Y SERVICIOS DEL NORTE S.A.C.
-- Script de Inserción de Datos Realistas (Seed Data Oficial 100% Sincronizado)
-- Ubicación: Piura, Perú
-- =========================================================================

USE BD_DistribucionesNorte;
GO

-- 1. Limpiar datos existentes respetando integridad referencial
DELETE FROM DetallePedido;
DELETE FROM Pedido;
DELETE FROM Producto;
DELETE FROM Cliente;
DELETE FROM Categoria;
GO

-- 2. Categorías del rubro de consumo masivo y abarrotes (con IDs explícitos)
SET IDENTITY_INSERT Categoria ON;
INSERT INTO Categoria (IdCategoria, NombreCategoria) VALUES 
(1, 'Lácteos y Derivados'),
(2, 'Abarrotes y Conservas'),
(3, 'Granos, Harinas y Cereales'),
(4, 'Aceites, Grasas y Condimentos'),
(5, 'Bebidas y Jugos Institucionales');
SET IDENTITY_INSERT Categoria OFF;
GO

-- 3. Productos realistas con marcas de alta rotación en programas sociales y mayoristas
SET IDENTITY_INSERT Producto ON;
INSERT INTO Producto (IdProducto, CodigoBarras, NombreProducto, IdCategoria, StockActual, PrecioUnitario) VALUES 
(1, '77501230001', 'Leche Evaporada Gloria Azul 400g', 1, 1500, 4.50),
(2, '77501230002', 'Leche Condensada Gloria 397g', 1, 800, 5.20),
(3, '77501230003', 'Atún en Aceite Primor 160g', 2, 1200, 6.80),
(4, '77501230004', 'Leche Evaporada Bonlé 400g', 1, 950, 3.80),
(5, '77501230005', 'Queso Edam Laive Trozo 500g', 1, 320, 18.50),
(6, '77501230007', 'Gratado de Pescado Real 170g', 2, 2100, 3.90),
(7, '77501230011', 'Arroz Superior Costeño Saco 50kg', 3, 300, 165.00),
(8, '77501230013', 'Avena Precortada 3 Ositos 500g', 3, 1400, 3.60),
(9, '77501230014', 'Fideos Spaghetti Don Vittorio 500g', 3, 2400, 3.10),
(10, '77501230017', 'Aceite Vegetal Primor Premium 900ml', 4, 1350, 8.90),
(11, '77501230019', 'Sal Yodada Marina Emsal 1kg', 4, 3000, 1.40),
(12, '77501230021', 'Agua Mineral San Luis Bidón 20L', 5, 250, 18.00);
SET IDENTITY_INSERT Producto OFF;
GO

-- 4. Clientes Institucionales y Mayoristas de la Región Piura
SET IDENTITY_INSERT Cliente ON;
INSERT INTO Cliente (IdCliente, RUC_DNI, RazonSocial, Direccion, Telefono) VALUES 
(1, '20543210981', 'Municipalidad Provincial de Piura', 'Av. Loreto 150, Piura', '073324455'),
(2, '20612345678', 'Comité Vaso de Leche - Castilla', 'Calle Grau 420, Piura', '073345566'),
(3, '20145678912', 'Municipalidad Distrital de Catacaos', 'Jr. Comercio 540, Catacaos', '073370120'),
(4, '20489561234', 'Programa Nacional Qali Warma - Sede Piura', 'Urb. Los Cocos Mz. C Lote 12, Piura', '073318920'),
(5, '20311223344', 'Beneficencia Pública de Piura', 'Calle Huánuco 112, Piura', '073305540'),
(6, '10458923412', 'Comercial El Chira E.I.R.L. - Sullana', 'Mercado Modelo Puesto 45, Sullana', '073502211');
SET IDENTITY_INSERT Cliente OFF;
GO

-- 5. Pedidos Históricos para poblar reportes y dashboard
-- Pedido 1: Municipalidad de Piura = S/ 2,250.00
SET IDENTITY_INSERT Pedido ON;
INSERT INTO Pedido (IdPedido, IdCliente, FechaPedido, EstadoPedido, TotalPedido) 
VALUES (1, 1, DATEADD(DAY, -5, GETDATE()), 'Procesado', 2250.00);

-- Pedido 2: Comité Vaso de Leche Castilla = S/ 2,700.00
INSERT INTO Pedido (IdPedido, IdCliente, FechaPedido, EstadoPedido, TotalPedido) 
VALUES (2, 2, DATEADD(DAY, -3, GETDATE()), 'Procesado', 2700.00);

-- Pedido 3: Municipalidad de Catacaos = S/ 8,250.00
INSERT INTO Pedido (IdPedido, IdCliente, FechaPedido, EstadoPedido, TotalPedido) 
VALUES (3, 3, DATEADD(DAY, -1, GETDATE()), 'Procesado', 8250.00);
SET IDENTITY_INSERT Pedido OFF;

-- Detalles de Pedidos
SET IDENTITY_INSERT DetallePedido ON;
INSERT INTO DetallePedido (IdDetalle, IdPedido, IdProducto, Cantidad, Subtotal) VALUES
(1, 1, 1, 500, 2250.00),
(2, 2, 1, 200, 900.00),
(3, 2, 8, 500, 1800.00),
(4, 3, 7, 50, 8250.00);
SET IDENTITY_INSERT DetallePedido OFF;
GO

PRINT 'Datos semilla insertados y sincronizados correctamente para Distribuciones y Servicios del Norte S.A.C.';
GO
