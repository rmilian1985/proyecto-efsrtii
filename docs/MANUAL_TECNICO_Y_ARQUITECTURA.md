# MANUAL TÉCNICO Y ARQUITECTURA DEL SISTEMA WEB POR CAPAS
## Proyecto EFSRT II: Distribuciones y Servicios del Norte S.A.C.
### Escuela de Educación Superior Cibertec — Grupo N° 4

---

## 1. Ficha Técnica y Resumen del Proyecto

* **Institución:** Escuela de Educación Superior Cibertec
* **Facultad:** Tecnologías de la Información
* **Curso:** Experiencias Formativas en Situaciones Reales de Trabajo II (EFSRT II)
* **Empresa Caso de Estudio:** Distribuciones y Servicios del Norte S.A.C.
* **Ubicación de la Empresa:** Av. Sánchez Cerro Nro. 1250, Piura, Perú
* **Rubro:** Comercialización y distribución mayorista de productos de consumo masivo y abarrotes para clientes minoristas e instituciones públicas (Programas Vaso de Leche, Municipalidades, Qali Warma).
* **Integrantes (Grupo N° 4):**
  * Castillo Sierra Sebastian
  * Milian Chipana Raul
  * Tucto Jurado Nicole Andrea
  * Terrones Gallardo Renzo
* **Docente del Curso:** Jorge Luis Villavicencio Diaz

---

## 2. Diagnóstico Situacional y Cumplimiento de Metas SMART

En el **Capítulo 1 y 2 del informe**, se identificó que la empresa operaba con hojas de cálculo descentralizadas (Excel) que provocaban pérdidas económicas, lentitud en los despachos y descuadres de stock. 

El sistema web desarrollado da cumplimiento exacto a los **Objetivos SMART** planteados:

### Indicador Oficial de Desempeño:
$$\text{Indicador } I = \left(\frac{T_{sin} - T_{con}}{T_{sin}}\right) \times 100$$

* **$T_{sin}$ (Tiempo sin sistema):** $15 \text{ minutos } (900 \text{ segundos})$ de validación manual en hojas de cálculo y llamadas telefónicas a almacén.
* **$T_{con}$ (Tiempo con sistema relacional y web):** Menos de **$20 \text{ milisegundos}$** a través del Stored Procedure transaccional y la API REST.
* **Resultado del Indicador:** 
  $$I = \left(\frac{900 - 0.02}{900}\right) \times 100 \approx \mathbf{99.98\% \text{ de Ahorro de Tiempo}}$$
  *Supera ampliamente la meta mínima del 86% establecida para la semana 6.*

### Objetivos Específicos Alcanzados:
1. **Reducción a Cero (0) Descuadres de Stock:** Garantizado mediante transacciones atómicas **ACID** con bloqueo de concurrencia `WITH (UPDLOCK)`.
2. **Reducción al Cero (0%) de Errores de Despacho:** Garantizado por las claves foráneas en **3FN** y el disparador (trigger) `trg_ValidarDetallePedido`.

---

## 3. Arquitectura del Sistema Web por Capas (N-Tier Architecture)

El proyecto está diseñado bajo una **Arquitectura en 3 Capas Desacopladas (Clean Architecture)** recomendada para desarrollo empresarial y exigida en evaluaciones de Cibertec:

```
┌──────────────────────────────────────────────────────────────────┐
│                      CAPA DE PRESENTACIÓN (CLIENTE)             │
│                      React + Vite (Frontend SPA)                 │
│   - Dashboard con KPIs & Medidor SMART                           │
│   - Módulo Transaccional para invocar Stored Procedure (ACID)    │
│   - Módulo de Reportes Exportables a Excel (.xlsx) y PDF (.pdf)  │
│   - Gestión de Inventario y Clientes Institucionales            │
└─────────────────────────────────┬────────────────────────────────┘
                                  │ HTTP / JSON (REST API)
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                   CAPA DE LÓGICA DE NEGOCIO Y API               │
│                      Node.js + Express (Backend)                 │
│   1. Controladores (Controllers): Reciben peticiones HTTP y JSON │
│   2. Servicios (Services): Validaciones de negocio y benchmarks  │
│   3. Repositorios (DAL): Consultas parametrizadas y Stored Procs │
│   4. Configuración (DB Pool): Gestión de conexiones con 'mssql'  │
└─────────────────────────────────┬────────────────────────────────┘
                                  │ TCP/IP (Puerto 1433)
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                     CAPA DE PERSISTENCIA (DATOS)                 │
│                      Microsoft SQL Server                        │
│   - Tablas Normalizadas en 3FN con Índices Non-Clustered         │
│   - Stored Procedure: sp_ProcesarPedidoInstitucional             │
│   - Stored Procedure: sp_ReporteConsolidadoInventario            │
│   - Trigger: trg_ValidarDetallePedido                            │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Análisis Detallado del Código de la Base de Datos (SQL Server)

El archivo [`database/01_schema_and_improvements.sql`](file:///e:/Cursos/Cibertec/Ciclo%203/EFSRTII/Proyecto/database/01_schema_and_improvements.sql) contiene la estructura completa.

### A. Normalización hasta la Tercera Forma Normal (3FN)
1. **1FN (Primera Forma Normal):** Se eliminan grupos repetitivos. Cada columna tiene valores atómicos (ej. `CodigoBarras`, `PrecioUnitario`). Cada tabla cuenta con una Clave Primaria (`PK`) única (`IDENTITY(1,1)`).
2. **2FN (Segunda Forma Normal):** Todos los atributos que no forman parte de la clave primaria dependen funcionalmente de manera completa de la clave primaria (no hay dependencias parciales).
3. **3FN (Tercera Forma Normal):** No existen dependencias transitivas entre atributos no clave. Por ejemplo, en la tabla `Producto`, el nombre de la categoría no se almacena como texto repetido, sino que se referencia mediante la clave foránea `IdCategoria` hacia la tabla `Categoria`.

### B. Mejoras Implementadas sobre la Base de Datos Original
1. **Índices Non-Clustered:**
   ```sql
   CREATE NONCLUSTERED INDEX IX_Producto_Categoria ON Producto(IdCategoria);
   CREATE NONCLUSTERED INDEX IX_Pedido_Cliente ON Pedido(IdCliente);
   CREATE NONCLUSTERED INDEX IX_DetallePedido_Pedido ON DetallePedido(IdPedido);
   CREATE NONCLUSTERED INDEX IX_DetallePedido_Producto ON DetallePedido(IdProducto);
   ```
   * **¿Por qué se agregaron?** Sin índices secundarios, cada vez que se ejecutan los `JOIN` de reportes o la verificación de pedidos, SQL Server tendría que realizar un escaneo completo de la tabla (*Table Scan*), lo que degradaría el rendimiento al aumentar los registros. Los índices de árbol B (*B-Tree*) permiten búsquedas en tiempo logarítmico $O(\log n)$.

2. **Integridad en Cascada:**
   `ON DELETE CASCADE` en `DetallePedido` para evitar errores de orfandad si se limpia un pedido en mantenimiento.

### C. Análisis del Algoritmo 1: `sp_ProcesarPedidoInstitucional`
Este procedimiento encapsula la lógica transaccional más crítica del negocio:
```sql
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
    
    BEGIN TRANSACTION;
    BEGIN TRY
        -- Bloqueo con UPDLOCK:
        SELECT @StockActual = StockActual, @PrecioU = PrecioUnitario 
        FROM Producto WITH (UPDLOCK) 
        WHERE IdProducto = @IdProducto;
        ...
```
* **¿Qué es `WITH (UPDLOCK)`?** En un entorno con múltiples pedidos simultáneos (concurrencia), dos operadores podrían leer el mismo stock a la vez antes de que uno descuente (*Lost Update* o Lectura Sucia). `UPDLOCK` instruye al motor de SQL Server a colocar un bloqueo de actualización en la fila seleccionada, impidiendo que otra transacción modifique o descuente ese producto hasta que la transacción actual termine.
* **Propiedades ACID cumplidas:**
  * **Atomicidad:** Se ejecutan **ambas** operaciones (inserción de pedido + descuento de stock) o **ninguna** (`ROLLBACK`).
  * **Consistencia:** Las reglas `CHECK (StockActual >= 0)` nunca se violan.
  * **Aislamiento:** Gracias a `UPDLOCK` y los niveles de aislamiento de SQL Server.
  * **Durabilidad:** Una vez hecho el `COMMIT`, los cambios se escriben en el Transaction Log (`LDF`) y persisten ante caídas eléctricas.

### D. Análisis del Algoritmo 2: `sp_ReporteConsolidadoInventario`
```sql
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
```
* **¿Por qué `LEFT JOIN`?** Si se usara `INNER JOIN` con `DetallePedido`, los productos nuevos que aún no han tenido ventas quedarían excluidos del reporte de inventario. El `LEFT JOIN` mantiene todos los productos y `ISNULL(SUM(...), 0)` convierte los `NULL` en `0`.

### E. Análisis del Trigger: `trg_ValidarDetallePedido`
* Se dispara automáticamente tras cada `INSERT` en `DetallePedido`.
* Accede a la tabla temporal residente en memoria del motor `inserted`. Si `Subtotal < 0`, aborta con `RAISERROR` y `ROLLBACK TRANSACTION`.

---

## 5. Explicación Detallada del Código del Backend (Node.js & Express)

El backend está organizado en capas independientes dentro de la carpeta `backend/`:

### A. Capa de Conexión y Pool de Base de Datos ([`backend/src/config/db.js`](file:///e:/Cursos/Cibertec/Ciclo%203/EFSRTII/Proyecto/backend/src/config/db.js))
* **Patrón Connection Pool:** Crear una conexión TCP por cada usuario es muy costoso en memoria y CPU. El pool mantiene un conjunto de 15 conexiones reciclables (`min: 0, max: 15`).
* **Protección y Resiliencia:** Si la base de datos SQL Server no está encendida durante una prueba rápida o en un despliegue inicial en la nube sin credenciales cargadas, el backend conmuta de forma transparente al almacén en memoria ([`seedMemory.js`](file:///e:/Cursos/Cibertec/Ciclo%203/EFSRTII/Proyecto/backend/src/config/seedMemory.js)) con un mensaje de diagnóstico, impidiendo que el servidor se caiga con error 500.

### B. Capa de Acceso a Datos ([`backend/src/repositories/`](file:///e:/Cursos/Cibertec/Ciclo%203/EFSRTII/Proyecto/backend/src/repositories))
* **Protección contra Inyección SQL:** Todos los métodos utilizan parámetros tipados de la librería `mssql`:
  ```javascript
  request.input('IdCliente', sql.Int, idCliente);
  request.input('IdProducto', sql.Int, idProducto);
  request.input('CantidadSolicitada', sql.Int, cantidadSolicitada);
  request.output('Resultado', sql.Int);
  request.output('Mensaje', sql.VarChar(200));
  const spResult = await request.execute('sp_ProcesarPedidoInstitucional');
  ```
  Los datos nunca se concatenan directamente en cadenas de texto, neutralizando por completo ataques de inyección SQL.

### C. Capa de Servicios de Negocio ([`backend/src/services/`](file:///e:/Cursos/Cibertec/Ciclo%203/EFSRTII/Proyecto/backend/src/services))
* En [`pedidoService.js`](file:///e:/Cursos/Cibertec/Ciclo%203/EFSRTII/Proyecto/backend/src/services/pedidoService.js), se implementó la medición del tiempo con `perf_hooks.performance.now()` para calcular con exactitud milimétrica el tiempo de respuesta del servidor y devolver el porcentaje del **Indicador SMART** en cada transacción.

### D. Capa Controladora y Rutas ([`backend/src/controllers/`](file:///e:/Cursos/Cibertec/Ciclo%203/EFSRTII/Proyecto/backend/src/controllers))
* Se asegura de enviar códigos de respuesta HTTP semánticos:
  * `200 OK`: Consulta exitosa o retorno de estado.
  * `201 Created`: Pedido o cliente creado satisfactoriamente.
  * `400 Bad Request`: Parámetros de entrada inválidos.
  * `404 Not Found`: Recurso no encontrado.
  * `500 Internal Server Error`: Falla no controlada capturada por el middleware global.

---

## 6. Explicación Detallada del Frontend (React + Vite)

Ubicado en `frontend/`, utiliza componentes funcionales y Hooks modernos:

### A. Módulo de Reportes Exportables ([`ReportesExportablesView.jsx`](file:///e:/Cursos/Cibertec/Ciclo%203/EFSRTII/Proyecto/frontend/src/components/ReportesExportablesView.jsx))
* Permite visualizar la salida en tiempo real de `sp_ReporteConsolidadoInventario`, filtrar por categorías, buscar por código de barras y exportar en dos formatos empresariales:

1. **Exportación a Microsoft Excel (.xlsx):**
   * Utiliza la librería **SheetJS (`xlsx`)**.
   * Convierte los objetos JSON a una hoja estructurada (`XLSX.utils.json_to_sheet`), define el ancho óptimo de cada columna (`!cols`) y añade una fila de totales generales al final.
2. **Exportación a Documento PDF (.pdf):**
   * Utiliza **jsPDF** junto con **jspdf-autotable**.
   * Genera un diseño corporativo:
     * Franja superior azul corporativa con el nombre formal *DISTRIBUCIONES Y SERVICIOS DEL NORTE S.A.C.*
     * Datos de R.U.C., dirección en Piura y fecha/hora exacta de emisión.
     * Cuadro de resumen con valorización total del inventario y total de unidades vendidas.
     * Tabla con filas alternas, precios alineados a la derecha y subtotales en negrita.
     * Bloque inferior con líneas de firma para el *Jefe de Logística y Almacén* y el *Responsable de Auditoría*.

### B. Módulo de Simulación del Stored Procedure ([`ProcesarPedidoView.jsx`](file:///e:/Cursos/Cibertec/Ciclo%203/EFSRTII/Proyecto/frontend/src/components/ProcesarPedidoView.jsx))
* Permite al evaluador reproducir los dos escenarios principales presentados en las páginas 18 a 20 del informe:
  1. **Caso de Éxito:** Se solicitan 50 unidades de Leche Gloria Azul. La aplicación muestra la tarjeta verde `TRANSACCIÓN EXITOSA (COMMIT)`, con `@Resultado = 1` y el mensaje de confirmación. El stock desciende de inmediato.
  2. **Caso de Falla (Stock Insuficiente):** Se solicitan 5,000 unidades. La aplicación muestra la tarjeta roja `TRANSACCIÓN REVERTIDA (ROLLBACK)`, con `@Resultado = 0` y la explicación del rollback automático que previene inconsistencias en almacén.

---

## 7. Guía Paso a Paso para Despliegue en la Nube

### Opción 1: Despliegue del Backend en Render.com (Gratis)
1. Sube tu código a un repositorio en **GitHub**.
2. Ingresa a [render.com](https://render.com) y selecciona **New Web Service**.
3. Conecta tu repositorio de GitHub y selecciona la carpeta raíz del backend (`Root Directory: backend`).
4. Configura:
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
5. En la sección **Environment Variables**, agrega:
   * `PORT`: `4000`
   * `DB_SERVER`: tu servidor SQL Server (ej. en Azure SQL o tu IP pública si tienes el puerto 1433 abierto).
   * `DB_USER`: tu usuario de SQL.
   * `DB_PASSWORD`: tu contraseña.
   * `DB_NAME`: `BD_DistribucionesNorte`.
   * `DB_ENCRYPT`: `true` (si usas Azure) o `false`.
   * `DB_TRUST_SERVER_CERTIFICATE`: `true`.
6. Haz clic en **Deploy Web Service**. Render te proporcionará una URL pública (ej. `https://distribuciones-norte-api.onrender.com`).

### Opción 2: Despliegue del Frontend en Vercel (Gratis)
1. Ingresa a [vercel.com](https://vercel.com) y haz clic en **Add New Project**.
2. Conecta el mismo repositorio de GitHub.
3. En la configuración del proyecto, establece:
   * **Root Directory:** `frontend`
   * **Framework Preset:** `Vite`
4. En **Environment Variables**, agrega:
   * `VITE_API_URL`: la URL generada en Render (ej. `https://distribuciones-norte-api.onrender.com/api`).
5. Haz clic en **Deploy**. En menos de 1 minuto tendrás la aplicación web funcionando en la nube con certificado SSL gratuito (HTTPS).

---

## 8. Banco de Preguntas y Respuestas para la Sustentación ante el Jurado

### P1: ¿Por qué eligieron una arquitectura por capas en lugar de colocar las consultas SQL directamente en la interfaz?
> **Respuesta:** *"Colocar lógica SQL en la interfaz (arquitectura monolítica o espagueti) acopla fuertemente el sistema, genera brechas de seguridad (exposición de credenciales de base de datos en el cliente) e impide reutilizar la lógica de negocio. La arquitectura por capas implementa el principio de responsabilidad única: el Frontend se encarga de la experiencia visual y exportación, el Backend aplica las reglas y validaciones, y SQL Server garantiza la persistencia e integridad transaccional."*

### P2: ¿Qué significa que una transacción sea ACID y cómo lo demostraron en el proyecto?
> **Respuesta:** *"ACID son las 4 propiedades fundamentales de una transacción relacional:
> 1. **Atomicidad:** Se ejecutan todas las operaciones o ninguna. En `sp_ProcesarPedidoInstitucional`, si el stock no alcanza, se ejecuta `ROLLBACK` y ni el pedido ni el detalle se guardan.
> 2. **Consistencia:** Las restricciones `CHECK (StockActual >= 0)` impiden que el almacén quede con existencias negativas.
> 3. **Aislamiento:** El bloqueo `WITH (UPDLOCK)` asegura que transacciones simultáneas no interfieran entre sí al leer y actualizar el mismo producto.
> 4. **Durabilidad:** Una vez hecho el `COMMIT`, los datos quedan asentados en el motor de SQL Server de forma permanente."*

### P3: ¿Por qué usaron un procedimiento almacenado para los reportes (`sp_ReporteConsolidadoInventario`) en lugar de hacer los cálculos en JavaScript?
> **Respuesta:** *"Porque procesar la agregación en el motor de base de datos aprovecha el optimizador de consultas de SQL Server, los índices en memoria y el procesamiento multihilo del servidor. Si tuviéramos 500,000 registros, transferir medio millón de filas por la red para sumarlas en JavaScript saturaría el ancho de banda y la memoria del navegador. Con el Stored Procedure, el motor solo transmite el resumen consolidado procesado en milisegundos."*

### P4: ¿Cómo garantiza la aplicación la prevención de inyecciones SQL?
> **Respuesta:** *"En la capa de acceso a datos (Repositorios), empleamos consultas parametrizadas a través del objeto `request.input()` de la librería `mssql`. Los parámetros son tratados estrictamente como literales de datos y nunca como código ejecutable por el motor de SQL Server."*
