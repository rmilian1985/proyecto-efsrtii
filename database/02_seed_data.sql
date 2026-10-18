-- =========================================================================
-- PROYECTO EFSRT II: DISTRIBUCIONES Y SERVICIOS DEL NORTE S.A.C.
-- Script de Inserción de Datos Realistas (Seed Data Ampliado)
-- Ubicación: Piura, Perú
-- =========================================================================

USE BD_DistribucionesNorte;
GO

-- 1. Categorías del rubro de consumo masivo y abarrotes
INSERT INTO Categoria (NombreCategoria) VALUES 
('Lácteos y Derivados'),
('Abarrotes y Conservas'),
('Granos, Harinas y Cereales'),
('Aceites, Grasas y Condimentos'),
('Bebidas y Jugos Institucionales');
GO

-- 2. Productos realistas con marcas de alta rotación en programas sociales y mayoristas
INSERT INTO Producto (CodigoBarras, NombreProducto, IdCategoria, StockActual, PrecioUnitario) VALUES 
-- Categoría 1: Lácteos y Derivados
('77501230001', 'Leche Evaporada Gloria Azul 400g', 1, 1500, 4.50),
('77501230002', 'Leche Condensada Gloria 397g', 1, 800, 5.20),
('77501230004', 'Leche Evaporada Bonlé 400g', 1, 950, 3.80),
('77501230005', 'Queso Edam Laive Trozo 500g', 1, 320, 18.50),
('77501230006', 'Mantequilla Gloria con Sal 200g', 1, 400, 7.20),

-- Categoría 2: Abarrotes y Conservas
('77501230003', 'Atún en Aceite Primor 160g', 2, 1200, 6.80),
('77501230007', 'Gratado de Pescado Real 170g', 2, 2100, 3.90),
('77501230008', 'Filete de Caballa Campomar 170g', 2, 850, 5.90),
('77501230009', 'Duraznos al Jugo A1 Lata 820g', 2, 450, 9.80),
('77501230010', 'Pasta de Tomate Pomarola 150g', 2, 1100, 2.70),

-- Categoría 3: Granos, Harinas y Cereales
('77501230011', 'Arroz Superior Costeño Saco 50kg', 3, 300, 165.00),
('77501230012', 'Arroz Extra Paisana Bolsa 5kg', 3, 620, 21.50),
('77501230013', 'Avena Precortada 3 Ositos 500g', 3, 1400, 3.60),
('77501230014', 'Fideos Spaghetti Don Vittorio 500g', 3, 2400, 3.10),
('77501230015', 'Lenteja Criolla Costeño Bolsa 1kg', 3, 750, 7.80),
('77501230016', 'Harina Preparada Blanca Nieve 1kg', 3, 580, 5.50),

-- Categoría 4: Aceites, Grasas y Condimentos
('77501230017', 'Aceite Vegetal Primor Premium 900ml', 4, 1350, 8.90),
('77501230018', 'Aceite Vegetal Cil 900ml', 4, 1600, 7.20),
('77501230019', 'Sal Yodada Marina Emsal 1kg', 4, 3000, 1.40),
('77501230020', 'Vinagre Blanco Menoyo 500ml', 4, 700, 2.50),

-- Categoría 5: Bebidas y Jugos
('77501230021', 'Agua Mineral San Luis Bidón 20L', 5, 250, 18.00),
('77501230022', 'Jugo Pulp Néctar Durazno 1L', 5, 820, 4.30);
GO

-- 3. Clientes Institucionales y Mayoristas de la Región Piura
INSERT INTO Cliente (RUC_DNI, RazonSocial, Direccion, Telefono) VALUES 
('20543210981', 'Municipalidad Provincial de Piura', 'Av. Loreto 150, Piura', '073324455'),
('20612345678', 'Comité Vaso de Leche - Castilla', 'Calle Grau 420, Piura', '073345566'),
('20145678912', 'Municipalidad Distrital de Catacaos', 'Jr. Comercio 540, Catacaos', '073370120'),
('20489561234', 'Programa Nacional Qali Warma - Sede Piura', 'Urb. Los Cocos Mz. C Lote 12, Piura', '073318920'),
('20311223344', 'Beneficencia Pública de Piura', 'Calle Huánuco 112, Piura', '073305540'),
('10458923412', 'Comercial El Chira E.I.R.L. - Sullana', 'Mercado Modelo Puesto 45, Sullana', '073502211');
GO

-- 4. Pedidos Históricos para poblar reportes y dashboard
-- Pedido 1: Municipalidad de Piura (Lácteos y Atún)
INSERT INTO Pedido (IdCliente, FechaPedido, EstadoPedido, TotalPedido) 
VALUES (1, DATEADD(DAY, -5, GETDATE()), 'Procesado', 2250.00);

DECLARE @P1 INT = SCOPE_IDENTITY();
INSERT INTO DetallePedido (IdPedido, IdProducto, Cantidad, Subtotal) VALUES
(@P1, 1, 500, 2250.00); -- 500 Leches Gloria Azul a 4.50
UPDATE Producto SET StockActual = StockActual - 500 WHERE IdProducto = 1;

-- Pedido 2: Comité Vaso de Leche Castilla (Avena y Leche)
INSERT INTO Pedido (IdCliente, FechaPedido, EstadoPedido, TotalPedido) 
VALUES (2, DATEADD(DAY, -3, GETDATE()), 'Procesado', 2900.00);

DECLARE @P2 INT = SCOPE_IDENTITY();
INSERT INTO DetallePedido (IdPedido, IdProducto, Cantidad, Subtotal) VALUES
(@P2, 1, 200, 900.00),   -- 200 Leches Gloria Azul
(@P2, 13, 500, 1800.00), -- 500 Avenas 3 Ositos
(@P2, 19, 140, 200.00);  -- Sal
UPDATE Producto SET StockActual = StockActual - 200 WHERE IdProducto = 1;
UPDATE Producto SET StockActual = StockActual - 500 WHERE IdProducto = 13;

-- Pedido 3: Municipalidad de Catacaos (Arroz y Aceite)
INSERT INTO Pedido (IdCliente, FechaPedido, EstadoPedido, TotalPedido) 
VALUES (3, DATEADD(DAY, -1, GETDATE()), 'Procesado', 8250.00);

DECLARE @P3 INT = SCOPE_IDENTITY();
INSERT INTO DetallePedido (IdPedido, IdProducto, Cantidad, Subtotal) VALUES
(@P3, 11, 50, 8250.00); -- 50 sacos de arroz costeño a 165
UPDATE Producto SET StockActual = StockActual - 50 WHERE IdProducto = 11;

-- Pedido 4: Beneficencia de Piura
INSERT INTO Pedido (IdCliente, FechaPedido, EstadoPedido, TotalPedido) 
VALUES (5, GETDATE(), 'Procesado', 1600.00);

DECLARE @P4 INT = SCOPE_IDENTITY();
INSERT INTO DetallePedido (IdPedido, IdProducto, Cantidad, Subtotal) VALUES
(@P4, 3, 200, 1360.00), -- 200 Atunes Primor a 6.80
(@P4, 14, 80, 248.00);  -- Fideos
UPDATE Producto SET StockActual = StockActual - 200 WHERE IdProducto = 3;
GO

PRINT 'Datos semilla insertados correctamente para Distribuciones y Servicios del Norte S.A.C.';
GO
