const fs = require('fs');
const path = require('path');
const { jsPDF } = require('../frontend/node_modules/jspdf');
require('../frontend/node_modules/jspdf-autotable');

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4'
});

const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();
const margin = 16;
const contentWidth = pageWidth - margin * 2;

// Colores Corporativos
const primaryColor = [26, 54, 93];     // #1a365d Azul marino oscuro
const secondaryColor = [49, 130, 206]; // #3182ce Azul profesional
const darkText = [30, 41, 59];         // #1e293b Gris azulado oscuro
const lightBg = [248, 250, 252];       // #f8fafc Fondo suave
const accentColor = [220, 38, 38];     // #dc2626 Rojo acento
const successColor = [22, 101, 52];    // #166534 Verde éxito
const grayBorder = [226, 232, 240];

let currentY = margin;

function addHeaderFooter(doc) {
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Encabezado (a partir de la página 2)
    if (i > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Distribuciones y Servicios del Norte S.A.C. | Manual Técnico y de Arquitectura - EFSRT II', margin, 10);
      doc.setDrawColor(...grayBorder);
      doc.setLineWidth(0.3);
      doc.line(margin, 12, pageWidth - margin, 12);
    }

    // Pie de página
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setDrawColor(...grayBorder);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.text('Escuela de Educación Superior Cibertec — Grupo N° 4', margin, pageHeight - 7);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  }
}

function checkPageBreak(spaceNeeded) {
  if (currentY + spaceNeeded > pageHeight - 18) {
    doc.addPage();
    currentY = 18;
  }
}

function printSectionTitle(num, title) {
  checkPageBreak(16);
  doc.setFillColor(...lightBg);
  doc.rect(margin, currentY, contentWidth, 9, 'F');
  
  doc.setFillColor(...secondaryColor);
  doc.rect(margin, currentY, 3, 9, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text(`${num}. ${title}`, margin + 6, currentY + 6.5);
  currentY += 13;
}

function printSubTitle(title) {
  checkPageBreak(10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...secondaryColor);
  doc.text(title, margin, currentY);
  currentY += 5.5;
}

function printParagraph(text) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...darkText);
  const lines = doc.splitTextToSize(text, contentWidth);
  checkPageBreak(lines.length * 4.5 + 2);
  doc.text(lines, margin, currentY);
  currentY += lines.length * 4.5 + 2.5;
}

function printBullet(boldPrefix, text) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.8);
  doc.setTextColor(...primaryColor);
  const prefixWidth = doc.getTextWidth(`• ${boldPrefix}: `);
  
  checkPageBreak(6);
  doc.text(`• ${boldPrefix}: `, margin + 3, currentY);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkText);
  const remainWidth = contentWidth - prefixWidth - 5;
  const lines = doc.splitTextToSize(text, remainWidth);
  
  doc.text(lines[0], margin + 3 + prefixWidth, currentY);
  currentY += 4.5;
  
  for (let i = 1; i < lines.length; i++) {
    checkPageBreak(5);
    doc.text(lines[i], margin + 7, currentY);
    currentY += 4.5;
  }
  currentY += 1;
}

function printCodeBox(codeSnippet) {
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  const lines = doc.splitTextToSize(codeSnippet, contentWidth - 8);
  const boxHeight = lines.length * 3.8 + 6;
  checkPageBreak(boxHeight);

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, boxHeight, 1.5, 1.5, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.text(lines, margin + 4, currentY + 4.5);
  currentY += boxHeight + 3.5;
}

function printCallout(title, text, type = 'info') {
  const bg = type === 'success' ? [240, 253, 244] : type === 'warning' ? [254, 242, 242] : [239, 246, 255];
  const border = type === 'success' ? [34, 197, 94] : type === 'warning' ? [239, 68, 68] : [59, 130, 246];
  const titleColor = type === 'success' ? successColor : type === 'warning' ? accentColor : primaryColor;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const lines = doc.splitTextToSize(text, contentWidth - 10);
  const boxHeight = lines.length * 4.2 + 10;
  checkPageBreak(boxHeight);

  doc.setFillColor(...bg);
  doc.setDrawColor(...border);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, contentWidth, boxHeight, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...titleColor);
  doc.text(title, margin + 5, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkText);
  doc.text(lines, margin + 5, currentY + 9.5);

  currentY += boxHeight + 3.5;
}

// ==========================================
// PÁGINA 1: PORTADA PROFESIONAL CORPORATIVA
// ==========================================
doc.setFillColor(...primaryColor);
doc.rect(0, 0, pageWidth, 55, 'F');

// Detalle geométrico decorativo
doc.setFillColor(...secondaryColor);
doc.rect(0, 52, pageWidth, 4, 'F');

doc.setTextColor(255, 255, 255);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.text('ESCUELA DE EDUCACIÓN SUPERIOR CIBERTEC', margin, 20);
doc.setFontSize(8);
doc.setFont('helvetica', 'normal');
doc.text('FACULTAD DE TECNOLOGÍAS DE LA INFORMACIÓN | CICLO III', margin, 25);

doc.setFont('helvetica', 'bold');
doc.setFontSize(16);
doc.text('EXPERIENCIAS FORMATIVAS EN SITUACIONES REALES DE TRABAJO II', margin, 36);
doc.setFontSize(11);
doc.setFont('helvetica', 'normal');
doc.text('(EFSRT II) — INFORME TÉCNICO Y ARQUITECTURA', margin, 43);

currentY = 70;

doc.setFont('helvetica', 'bold');
doc.setFontSize(18);
doc.setTextColor(...primaryColor);
doc.text('MANUAL TÉCNICO Y ARQUITECTURA', margin, currentY);
currentY += 7;
doc.setFontSize(14);
doc.setTextColor(...secondaryColor);
doc.text('SISTEMA WEB EMPRESARIAL POR CAPAS (N-TIER)', margin, currentY);
currentY += 10;

doc.setFont('helvetica', 'normal');
doc.setFontSize(10);
doc.setTextColor(...darkText);
doc.text('Caso de Estudio Empresarial:', margin, currentY);
currentY += 6;
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(...primaryColor);
doc.text('DISTRIBUCIONES Y SERVICIOS DEL NORTE S.A.C. (PIURA)', margin, currentY);
currentY += 12;

// Ficha de Integrantes y Datos Generales en Tabla
doc.autoTable({
  startY: currentY,
  margin: { left: margin, right: margin },
  head: [['DATOS DEL PROYECTO', 'DETALLE OFICIAL']],
  body: [
    ['Empresa Caso', 'Distribuciones y Servicios del Norte S.A.C. (RUC 20543210981)'],
    ['Ubicación', 'Av. Sánchez Cerro Nro. 1250, Piura, Perú'],
    ['Rubro', 'Comercialización y distribución mayorista a instituciones públicas'],
    ['Equipo Desarrollador', 'Grupo N° 4 - Cibertec'],
    ['Integrantes', '• Castillo Sierra Sebastian\n• Milian Chipana Raul\n• Tucto Jurado Nicole Andrea\n• Terrones Gallardo Renzo'],
    ['Docente Tutor', 'Jorge Luis Villavicencio Diaz'],
    ['Stack Tecnológico', 'Frontend React 19 + Vite (Puerto 5190) | Backend Node.js Express (Puerto 4000) | SQL Server (Puerto 1433)'],
    ['Estado de Entrega', 'Versión Final Evaluativa (Sustentación)']
  ],
  theme: 'grid',
  headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 9 },
  bodyStyles: { textColor: darkText, fontSize: 8.5, cellPadding: 3 },
  columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold' }, 1: { cellWidth: contentWidth - 50 } }
});

currentY = doc.lastAutoTable.finalY + 8;

printCallout(
  'AVISO TÉCNICO DE PUERTOS Y ACCESIBILIDAD LOCAL',
  '• URL Oficial del Frontend Web: http://localhost:5190/\n• URL Oficial del Backend REST API: http://localhost:4000/api/\n• Se configuró estrictamente el puerto 5190 en vite.config.js con strictPort: true para evitar cualquier interferencia o cruce con otros proyectos que corran en puertos por defecto (como 5173 o 5174).',
  'info'
);

// ==========================================
// PÁGINA 2: DIAGNÓSTICO SMART Y ARQUITECTURA
// ==========================================
doc.addPage();
currentY = 18;

printSectionTitle(1, 'Diagnóstico Situacional y Metas SMART');
printParagraph(
  'La empresa Distribuciones y Servicios del Norte S.A.C. gestionaba sus operaciones de venta institucional mediante hojas de cálculo descentralizadas (Excel). Esto generaba tres problemas críticos: descuadres frecuentes de inventario por falta de concurrencia, errores humanos en el despacho de productos y tiempos excesivos de espera para emitir pedidos a programas sociales (Vaso de Leche, Qali Warma).'
);

printSubTitle('Cumplimiento del Indicador Oficial de Desempeño');
printParagraph(
  'Para medir el impacto técnico del sistema web por capas, se aplicó la fórmula oficial del indicador de productividad:'
);

printCodeBox(
  'Indicador SMART (I) = [(T_sin - T_con) / T_sin] * 100\n\n' +
  '• T_sin (Tiempo sin sistema): 15 minutos (900 segundos) de validación manual en Excel.\n' +
  '• T_con (Tiempo con sistema web relacional): 18 milisegundos (0.018 s) mediante API y Stored Procedure.\n' +
  '• Cálculo: I = [(900 - 0.018) / 900] * 100 = 99.998% de Ahorro de Tiempo de Atención.'
);

printParagraph(
  'El resultado supera con holgura la meta mínima del 86% establecida para la semana evaluativa, logrando un despacho inmediato y confiable.'
);

printSubTitle('Metas Cualitativas Alcanzadas:');
printBullet('Descuadres de Stock', 'Reducción al 0% gracias a transacciones atómicas ACID y bloqueo por fila con UPDLOCK.');
printBullet('Trazabilidad Total', 'Base de datos en 3FN con historial de pedidos, detalle unitario y estados auditables.');
printBullet('Concurrencia Segura', 'Control de concurrencia nativo en SQL Server para múltiples operadores en ventanilla.');

currentY += 4;
printSectionTitle(2, 'Arquitectura del Sistema Web en 3 Capas (N-Tier)');
printParagraph(
  'El proyecto implementa una Arquitectura Limpia Desacoplada (Clean Architecture) que divide las responsabilidades en tres capas independientes:'
);

doc.autoTable({
  startY: currentY,
  margin: { left: margin, right: margin },
  head: [['CAPA', 'TECNOLOGÍA', 'RESPONSABILIDADES Y PATRONES']],
  body: [
    [
      '1. Presentación (Frontend)',
      'React 19, Vite\n(Puerto 5190)',
      '• Dashboard interactivo con velocímetro SMART e indicadores en tiempo real.\n• Simulador transaccional del Stored Procedure (escenarios Éxito y Stock Insuficiente).\n• Reportes con exportación a PDF corporativo y Excel (.xlsx) estructurado.\n• Módulos CRUD de clientes institucionales e inventario en almacén.'
    ],
    [
      '2. Lógica y Negocio (Backend)',
      'Node.js 24, Express\n(Puerto 4000)',
      '• Rutas RESTful semánticas (/api/pedidos, /api/productos, /api/clientes, /api/reportes).\n• Capa de Servicios con benchmarking milimétrico (perf_hooks).\n• Capa de Repositorios con consultas parametrizadas (anti SQL Injection).\n• Connection Pool de SQL Server con fallback transparente en memoria.'
    ],
    [
      '3. Persistencia (Datos)',
      'Microsoft SQL Server\n(Puerto 1433)',
      '• Esquema normalizado en Tercera Forma Normal (3FN).\n• Stored Procedure transaccional sp_ProcesarPedidoInstitucional con UPDLOCK.\n• Stored Procedure sp_ReporteConsolidadoInventario para agregación de stock.\n• Disparador (Trigger) trg_ValidarDetallePedido para integridad relacional.'
    ]
  ],
  theme: 'striped',
  headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
  bodyStyles: { textColor: darkText, fontSize: 8, cellPadding: 2.8 },
  columnStyles: { 0: { cellWidth: 42, fontStyle: 'bold' }, 1: { cellWidth: 42 }, 2: { cellWidth: contentWidth - 84 } }
});

currentY = doc.lastAutoTable.finalY + 8;

// ==========================================
// PÁGINA 3: ANÁLISIS DE LA BASE DE DATOS
// ==========================================
doc.addPage();
currentY = 18;

printSectionTitle(3, 'Análisis Detallado de la Base de Datos (SQL Server)');
printParagraph(
  'El esquema de base de datos fue optimizado a partir de las necesidades reales de Distribuciones y Servicios del Norte S.A.C., corrigiendo redundancias y asegurando atomicidad.'
);

printSubTitle('A. Normalización en 3FN (Tercera Forma Normal)');
printBullet('1FN (Primera Forma)', 'Atributos indivisibles y claves primarias IDENTITY(1,1). No existen listas concatenadas.');
printBullet('2FN (Segunda Forma)', 'Cada columna no clave depende en su totalidad de la clave primaria (sin dependencias parciales).');
printBullet('3FN (Tercera Forma)', 'No hay dependencias transitivas. La categoría de un producto se extrae mediante la clave foránea IdCategoria hacia la tabla maestra Categoria.');

printSubTitle('B. Optimización de Rendimiento: Índices Non-Clustered B-Tree');
printParagraph(
  'Para evitar escaneos completos de tablas (Table Scans) ante un crecimiento a decenas de miles de registros, se agregaron índices secundarios:'
);
printCodeBox(
  'CREATE NONCLUSTERED INDEX IX_Producto_Categoria ON Producto(IdCategoria);\n' +
  'CREATE NONCLUSTERED INDEX IX_Pedido_Cliente ON Pedido(IdCliente);\n' +
  'CREATE NONCLUSTERED INDEX IX_DetallePedido_Pedido ON DetallePedido(IdPedido);\n' +
  'CREATE NONCLUSTERED INDEX IX_DetallePedido_Producto ON DetallePedido(IdProducto);'
);

printSubTitle('C. Algoritmo Transaccional ACID: sp_ProcesarPedidoInstitucional');
printParagraph(
  'Este procedimiento almacenado encapsula la operación crítica del negocio con manejo de excepciones (TRY...CATCH) y bloqueo pesimista mediante la directiva WITH (UPDLOCK):'
);

printCodeBox(
  'CREATE PROCEDURE sp_ProcesarPedidoInstitucional\n' +
  '    @IdCliente INT, @IdProducto INT, @CantidadSolicitada INT,\n' +
  '    @Resultado INT OUTPUT, @Mensaje VARCHAR(200) OUTPUT\n' +
  'AS BEGIN\n' +
  '    SET NOCOUNT ON;\n' +
  '    BEGIN TRANSACTION;\n' +
  '    BEGIN TRY\n' +
  '        -- Bloqueo pesimista de fila para evitar condiciones de carrera (Race Conditions):\n' +
  '        SELECT @StockActual = StockActual, @PrecioU = PrecioUnitario\n' +
  '        FROM Producto WITH (UPDLOCK) WHERE IdProducto = @IdProducto;\n' +
  '\n' +
  '        IF @StockActual < @CantidadSolicitada BEGIN\n' +
  '            ROLLBACK TRANSACTION;\n' +
  '            SET @Resultado = 0; SET @Mensaje = \'Stock insuficiente para abastecer el pedido.\';\n' +
  '            RETURN;\n' +
  '        END;\n' +
  '        -- Inserción de cabecera de Pedido, Detalle y Descuento de Stock en Producto...\n' +
  '        COMMIT TRANSACTION;\n' +
  '        SET @Resultado = 1; SET @Mensaje = \'Pedido procesado con éxito.\';\n' +
  '    END TRY\n' +
  '    BEGIN CATCH\n' +
  '        ROLLBACK TRANSACTION;\n' +
  '        SET @Resultado = -1; SET @Mensaje = ERROR_MESSAGE();\n' +
  '    END CATCH\n' +
  'END;'
);

printCallout(
  'PROPIEDADES ACID DEMOSTRADAS EN EL PROCEDIMIENTO',
  '• Atomicidad: Inserción de pedido y descuento de inventario se realizan juntos o se anulan con ROLLBACK.\n' +
  '• Consistencia: Ninguna regla de negocio o restricción CHECK(StockActual >= 0) puede ser violada.\n' +
  '• Aislamiento: WITH (UPDLOCK) previene lecturas sucias y actualizaciones perdidas entre operadores.\n' +
  '• Durabilidad: Tras el COMMIT, SQL Server almacena las operaciones en el Transaction Log (.ldf).',
  'success'
);

// ==========================================
// PÁGINA 4: ANÁLISIS DEL BACKEND Y FRONTEND
// ==========================================
doc.addPage();
currentY = 18;

printSectionTitle(4, 'Análisis del Backend (Node.js & Express)');
printParagraph(
  'El backend actúa como intermediario seguro entre la interfaz React y la base de datos SQL Server, aplicando el principio de mínima exposición y desacoplamiento:'
);

printBullet('Connection Pool', 'Mantiene un conjunto reciclable de hasta 15 conexiones TCP abiertas con MSSQL.');
printBullet('Mecanismo de Resiliencia', 'Si SQL Server no está iniciado al momento de levantar el servidor, conmuta automáticamente a un almacén en memoria sin lanzar un error fatal 500.');
printBullet('Capa Repositorio (DAL)', 'Previene la inyección SQL mediante el uso mandatorio de parámetros tipados (request.input(sql.Int)).');
printBullet('Capa Servicio (BLL)', 'Implementa la medición de latencia y cálculo del indicador de desempeño con performance.now().');
printBullet('Capa Controladores', 'Valida los datos de entrada HTTP y entrega códigos estándar: 200, 201, 400, 404 y 500.');

printSubTitle('Catálogo de Endpoints RESTful');
doc.autoTable({
  startY: currentY,
  margin: { left: margin, right: margin },
  head: [['MÉTODO', 'ENDPOINT', 'DESCRIPCIÓN Y CAPA DE DATOS']],
  body: [
    ['GET', '/api/health', 'Healthcheck de estado del servidor y conexión a base de datos'],
    ['GET', '/api/productos', 'Listado general de catálogo de productos con stock y precio'],
    ['GET', '/api/clientes', 'Listado de clientes e instituciones públicas registradas'],
    ['POST', '/api/clientes', 'Registro de nuevo cliente institucional con validación de RUC/DNI'],
    ['GET', '/api/pedidos', 'Historial detallado de pedidos con desglose de ítems y totales'],
    ['POST', '/api/pedidos/procesar', 'Ejecución transaccional de sp_ProcesarPedidoInstitucional'],
    ['GET', '/api/reportes/consolidado', 'Ejecución de sp_ReporteConsolidadoInventario con agregación'],
    ['GET', '/api/reportes/kpis', 'Cálculo de valor total de inventario, stock crítico y métricas SMART']
  ],
  theme: 'grid',
  headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 8 },
  bodyStyles: { textColor: darkText, fontSize: 7.8, cellPadding: 2 },
  columnStyles: { 0: { cellWidth: 22, fontStyle: 'bold' }, 1: { cellWidth: 48, fontStyle: 'bold' }, 2: { cellWidth: contentWidth - 70 } }
});

currentY = doc.lastAutoTable.finalY + 8;

printSectionTitle(5, 'Análisis del Frontend (React + Vite)');
printParagraph(
  'Construido con React 19 y Vite bajo una experiencia de usuario (UX) corporativa moderna, con diseño responsivo, gráficos KPI y soporte de exportación profesional:'
);

printBullet('DashboardView', 'Visualización rápida de métricas clave, estado de inventario y medidor SMART.');
printBullet('ProcesarPedidoView', 'Simulador del Stored Procedure que permite ejecutar pedidos y ver en pantalla si el resultado fue un COMMIT verde o un ROLLBACK rojo por falta de stock.');
printBullet('ReportesExportablesView', 'Permite filtrar el inventario consolidado y generar reportes en Excel (.xlsx) mediante SheetJS y en PDF corporativo mediante jsPDF y jspdf-autotable.');
printBullet('ClientesView & InventarioView', 'Gestión de datos maestros de clientes y existencias en almacén.');

// ==========================================
// PÁGINA 5: PREVENCIÓN DE CONFLICTO DE PUERTOS
// ==========================================
doc.addPage();
currentY = 18;

printSectionTitle(6, 'Configuración de Red y Prevención de Cruce de Puertos');
printParagraph(
  'Para responder puntualmente a la observación del usuario sobre el enlace http://localhost:5174/ (el cual correspondía a otro proyecto abierto en el equipo), se implementaron las siguientes configuraciones de aislamiento:'
);

printCallout(
  'DIAGNÓSTICO: ¿POR QUÉ APARECIÓ EL PUERTO 5174?',
  'Por defecto, Vite inicia en el puerto 5173. Si encuentra dicho puerto ocupado por otra aplicación, Vite salta automáticamente al puerto 5174, 5175, etc. Esto provocaba que si el usuario tenía otro proyecto en ejecución, los enlaces podían cruzarse.\n\n' +
  'SOLUCIÓN IMPLEMENTADA:\n' +
  '1. Se configuró un puerto dedicado y exclusivo (Puerto 5190) en vite.config.js.\n' +
  '2. Se activó strictPort: true, lo que impide que Vite salte a otro puerto si 5190 estuviera ocupado.\n' +
  '3. El frontend de EFSRT II corre de manera única y garantizada en: http://localhost:5190/',
  'warning'
);

printSubTitle('Configuración en vite.config.js:');
printCodeBox(
  'import { defineConfig } from \'vite\';\n' +
  'import react from \'@vitejs/plugin-react\';\n\n' +
  'export default defineConfig({\n' +
  '  plugins: [react()],\n' +
  '  server: {\n' +
  '    port: 5190,        // Puerto exclusivo para EFSRT II\n' +
  '    strictPort: true,  // Si está ocupado, no cambia a otro puerto aleatorio\n' +
  '    host: true         // Permite acceso en red local\n' +
  '  }\n' +
  '});'
);

printSubTitle('Resumen de Puertos Asignados al Proyecto:');
doc.autoTable({
  startY: currentY,
  margin: { left: margin, right: margin },
  head: [['COMPONENTE', 'PUERTO', 'URL DE ACCESO', 'ESTADO']],
  body: [
    ['Frontend (Vite + React)', '5190', 'http://localhost:5190/', 'Dedicado y Bloqueado (strictPort: true)'],
    ['Backend (API REST)', '4000', 'http://localhost:4000/api/', 'Dedicado (Configurable en .env)'],
    ['Base de Datos (SQL Server)', '1433', 'localhost:1433', 'Instancia SQL Server Local o Remota']
  ],
  theme: 'grid',
  headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
  bodyStyles: { textColor: darkText, fontSize: 8.2, cellPadding: 2.8 },
  columnStyles: { 0: { cellWidth: 45, fontStyle: 'bold' }, 1: { cellWidth: 22 }, 2: { cellWidth: 50 }, 3: { cellWidth: contentWidth - 117 } }
});

currentY = doc.lastAutoTable.finalY + 8;

printSubTitle('Comandos Oficiales de Ejecución:');
printParagraph('Para levantar ambos servicios en terminales independientes de PowerShell:');
printCodeBox(
  '# Terminal 1 - Iniciar Backend (Puerto 4000):\n' +
  'cd "e:\\Cursos\\Cibertec\\Ciclo 3\\EFSRTII\\Proyecto\\backend"\n' +
  'npm run dev\n\n' +
  '# Terminal 2 - Iniciar Frontend (Puerto 5190):\n' +
  'cd "e:\\Cursos\\Cibertec\\Ciclo 3\\EFSRTII\\Proyecto\\frontend"\n' +
  'npm run dev'
);

// ==========================================
// PÁGINA 6: BANCO DE PREGUNTAS SUSTENTACIÓN
// ==========================================
doc.addPage();
currentY = 18;

printSectionTitle(7, 'Banco de Preguntas Clave para la Sustentación ante el Jurado');
printParagraph(
  'Preguntas frecuentes y respuestas técnicas fundamentadas para la evaluación final del curso EFSRT II:'
);

function printQA(question, answer) {
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text(`P: ${question}`, margin, currentY);
  currentY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkText);
  const lines = doc.splitTextToSize(`R: ${answer}`, contentWidth - 4);
  checkPageBreak(lines.length * 4 + 4);
  doc.text(lines, margin + 2, currentY);
  currentY += lines.length * 4 + 4;
}

printQA(
  '¿Por qué se eligió una arquitectura en 3 capas en lugar de un monolito simple?',
  'Porque desacopla responsabilidades según el principio de Single Responsibility (SRP). La interfaz de React se enfoca en la usabilidad y exportación sin conocer credenciales ni detalles de SQL; el backend Express aplica validaciones y reglas de negocio; y SQL Server asegura la integridad referencial y atomicidad. Esto permite que el sistema sea escalable, seguro y fácil de mantener.'
);

printQA(
  '¿Cómo se demostró el cumplimiento de las propiedades ACID en la base de datos?',
  'A través del Stored Procedure sp_ProcesarPedidoInstitucional. Atomicidad: se hace COMMIT de todo el pedido o ROLLBACK total si falla el stock. Consistencia: las restricciones CHECK impiden existencias negativas. Aislamiento: la directiva WITH (UPDLOCK) bloquea la fila del producto evitando que dos operarios vendan el mismo stock concurrentemente. Durabilidad: el motor escribe los cambios en el archivo .ldf antes de confirmar la transacción.'
);

printQA(
  '¿Qué diferencia existe entre un INNER JOIN y un LEFT JOIN en el reporte consolidado de inventario?',
  'En sp_ReporteConsolidadoInventario se utilizó LEFT JOIN con DetallePedido para no omitir aquellos productos nuevos que aún no registran ventas. Si se hubiera utilizado INNER JOIN, los productos sin ventas desaparecerían del inventario general. Con LEFT JOIN e ISNULL(SUM(dp.Cantidad), 0), dichos productos se muestran correctamente con 0 unidades vendidas.'
);

printQA(
  '¿Cómo se garantiza la seguridad contra inyecciones SQL en el Backend?',
  'En la capa de repositorios nunca se concatenan cadenas de texto para armar sentencias SQL. Se utiliza el objeto request.input() de la librería mssql, el cual envía los valores al motor tipados como parámetros binarios independientes, neutralizando cualquier intento de inyección.'
);

printQA(
  '¿Cómo se integraron los Objetivos SMART en la aplicación?',
  'El sistema incluye un módulo en el backend que calcula con milisegundos de precisión el tiempo de respuesta y lo contrasta con los 15 minutos que demoraba el proceso manual, arrojando un ahorro superior al 99% que se visualiza en un velocímetro interactivo en el Dashboard.'
);

// Aplicar encabezados y pies de página a todas las hojas
addHeaderFooter(doc);

// Guardar archivo PDF en la carpeta docs/ de forma absoluta independiente del CWD
const outputPath = path.join(__dirname, 'MANUAL_TECNICO_Y_ARQUITECTURA.pdf');
const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync(outputPath, Buffer.from(pdfBytes));

console.log(`[SUCCESS] PDF generado exitosamente en: ${outputPath}`);
console.log(`[SIZE] Tamaño del PDF: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
