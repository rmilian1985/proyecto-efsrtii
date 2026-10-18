/**
 * ==============================================================================
 * UTILIDADES DE EXPORTACIÓN: exportUtils.js
 * Generación de Reportes Oficiales en Formatos Excel (.xlsx) y PDF (.pdf)
 * Proyecto EFSRT II - Cibertec
 * ==============================================================================
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Exporta el reporte consolidado de inventario a formato Microsoft Excel (.xlsx)
 */
export function exportarReporteExcel(filas, resumen) {
  // 1. Preparar datos formateados para la hoja de cálculo
  const dataParaExcel = filas.map((item, index) => ({
    'N°': index + 1,
    'Categoría': item.Categoria,
    'Código de Barras': item.CodigoBarras,
    'Descripción del Producto': item.NombreProducto,
    'Stock Actual (Und)': item.StockActual,
    'Precio Unitario (S/)': parseFloat(item.PrecioUnitario).toFixed(2),
    'Valor Total Inventario (S/)': parseFloat(item.ValorTotalInventario).toFixed(2),
    'Unidades Vendidas': item.TotalUnidadesVendidas
  }));

  // Fila de resumen total
  dataParaExcel.push({
    'N°': '',
    'Categoría': 'TOTALES GENERALES',
    'Código de Barras': '',
    'Descripción del Producto': `Total Productos: ${resumen.totalItems || filas.length}`,
    'Stock Actual (Und)': '',
    'Precio Unitario (S/)': '',
    'Valor Total Inventario (S/)': parseFloat(resumen.totalValorInventario || 0).toFixed(2),
    'Unidades Vendidas': resumen.totalUnidadesVendidas || 0
  });

  // 2. Crear Workbook y Worksheet
  const worksheet = XLSX.utils.json_to_sheet(dataParaExcel);

  // Ajustar ancho de columnas para lectura óptima
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 25 },
    { wch: 18 },
    { wch: 40 },
    { wch: 18 },
    { wch: 20 },
    { wch: 24 },
    { wch: 18 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Consolidado Inventario');

  // 3. Descargar archivo
  const fechaStr = new Date().toISOString().slice(0, 10);
  const nombreArchivo = `Reporte_Inventario_DistribucionesNorte_${fechaStr}.xlsx`;
  XLSX.writeFile(workbook, nombreArchivo);
}

/**
 * Exporta el reporte consolidado a formato PDF con membrete institucional y firma
 */
export function exportarReportePDF(filas, resumen) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const fechaActual = new Date();
  const fechaFormateada = fechaActual.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Encabezado Corporativo
  doc.setFillColor(15, 23, 42); // Navy Blue 900
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('DISTRIBUCIONES Y SERVICIOS DEL NORTE S.A.C.', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('R.U.C. 20608945123 | Av. Sánchez Cerro Nro. 1250 - Piura | EFSRT II - Cibertec', 14, 18);
  doc.text(`Fecha y Hora de Emisión: ${fechaFormateada}`, 14, 23);

  // Título del Reporte
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('REPORTE CONSOLIDADO DE INVENTARIO Y VENTAS', 14, 38);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Fuente: Procedimiento Almacenado [sp_ReporteConsolidadoInventario] - SQL Server', 14, 43);

  // Tarjetas Resumen de KPIs
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 47, 182, 16, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Total Productos Registrados:', 18, 54);
  doc.setFont('helvetica', 'normal');
  doc.text(`${resumen.totalItems || filas.length} ítems`, 68, 54);

  doc.setFont('helvetica', 'bold');
  doc.text('Valor Total de Almacén:', 105, 54);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // Verde esmeralda
  doc.text(`S/ ${(resumen.totalValorInventario || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`, 150, 54);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Unidades Totales Vendidas:', 18, 59);
  doc.setFont('helvetica', 'normal');
  doc.text(`${(resumen.totalUnidadesVendidas || 0).toLocaleString()} und.`, 68, 59);

  // Columnas para autoTable
  const headers = [
    ['N°', 'Categoría', 'Código', 'Producto', 'Stock', 'P. Unit.', 'Valor Total', 'Vendidos']
  ];

  const bodyData = filas.map((item, index) => [
    index + 1,
    item.Categoria,
    item.CodigoBarras,
    item.NombreProducto,
    item.StockActual,
    `S/ ${parseFloat(item.PrecioUnitario).toFixed(2)}`,
    `S/ ${parseFloat(item.ValorTotalInventario).toFixed(2)}`,
    item.TotalUnidadesVendidas
  ]);

  autoTable(doc, {
    head: headers,
    body: bodyData,
    startY: 68,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 32 },
      2: { cellWidth: 26 },
      3: { cellWidth: 46 },
      4: { halign: 'right', cellWidth: 16 },
      5: { halign: 'right', cellWidth: 20 },
      6: { halign: 'right', cellWidth: 22, fontStyle: 'bold' },
      7: { halign: 'center', cellWidth: 16 }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14, bottom: 25 },
    didDrawPage: (data) => {
      // Pie de página en cada hoja
      const str = `Página ${doc.internal.getNumberOfPages()}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(str, 185, 290);
      doc.text('Distribuciones y Servicios del Norte S.A.C. - Sistema de Auditoría y Control de Inventarios', 14, 290);
    }
  });

  // Bloque de Firmas al final del documento
  const posY = doc.lastAutoTable.finalY + 20;
  if (posY < 260) {
    doc.setDrawColor(148, 163, 184);
    doc.line(25, posY, 85, posY);
    doc.line(125, posY, 185, posY);

    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Jefe de Logística y Almacén', 34, posY + 5);
    doc.text('Distribuciones del Norte S.A.C.', 33, posY + 9);

    doc.text('Responsable de Auditoría / Cibertec', 130, posY + 5);
    doc.text('Validación Transaccional ACID', 136, posY + 9);
  }

  // Descargar PDF
  const fechaStr = fechaActual.toISOString().slice(0, 10);
  doc.save(`Reporte_Consolidado_DistribucionesNorte_${fechaStr}.pdf`);
}
