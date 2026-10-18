import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Search, 
  Filter, 
  TrendingUp, 
  Package, 
  Layers, 
  Database,
  CheckCircle2,
  Printer
} from 'lucide-react';
import { exportarReporteExcel, exportarReportePDF } from '../utils/exportUtils';

export default function ReportesExportablesView({ reporte, loading }) {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODAS');

  const filas = reporte?.filas || [];
  const resumen = reporte?.resumen || {
    totalItems: 0,
    totalValorInventario: 0,
    totalUnidadesVendidas: 0
  };

  // Obtener categorías únicas para el filtro
  const categorias = ['TODAS', ...new Set(filas.map(f => f.Categoria))];

  // Filtrado de filas
  const filasFiltradas = filas.filter(f => {
    const coincideTexto = 
      f.NombreProducto.toLowerCase().includes(busqueda.toLowerCase()) ||
      f.CodigoBarras.includes(busqueda);
    const coincideCategoria = 
      categoriaFiltro === 'TODAS' || f.Categoria === categoriaFiltro;
    return coincideTexto && coincideCategoria;
  });

  const handleExportarExcel = () => {
    exportarReporteExcel(filasFiltradas, resumen);
  };

  const handleExportarPDF = () => {
    exportarReportePDF(filasFiltradas, resumen);
  };

  return (
    <div className="view-container">
      {/* Encabezado del Módulo de Reportes */}
      <div className="reportes-header-card">
        <div className="reportes-title-block">
          <div className="badge-sp">
            <Database size={15} />
            <span>ALGORITMO 2: sp_ReporteConsolidadoInventario</span>
          </div>
          <h2>Reporte Oficial Consolidado de Inventario y Ventas</h2>
          <p className="text-secondary">
            Consulta de agregación relacional que calcula en tiempo real existencias físicas, valorización total de almacén y rotación de consumo masivo para auditorías de licitaciones públicas.
          </p>
        </div>

        {/* Botones de Exportación Destacados */}
        <div className="export-actions-group">
          <button 
            className="btn-export btn-excel"
            onClick={handleExportarExcel}
            disabled={filasFiltradas.length === 0}
            title="Descargar archivo en formato Microsoft Excel"
          >
            <FileSpreadsheet size={18} />
            <span>Exportar a Excel (.xlsx)</span>
          </button>

          <button 
            className="btn-export btn-pdf"
            onClick={handleExportarPDF}
            disabled={filasFiltradas.length === 0}
            title="Generar e imprimir documento PDF institucional con membrete y firmas"
          >
            <FileText size={18} />
            <span>Exportar a PDF (.pdf)</span>
          </button>
        </div>
      </div>

      {/* Resumen de Métricas del Reporte */}
      <div className="report-metrics-strip">
        <div className="report-metric-box">
          <Package size={20} className="text-cyan" />
          <div>
            <span>Total de Productos en Reporte</span>
            <strong>{filasFiltradas.length} ítems</strong>
          </div>
        </div>

        <div className="report-metric-box">
          <TrendingUp size={20} className="text-emerald" />
          <div>
            <span>Valor Total de Inventario</span>
            <strong className="text-success">
              S/ {(resumen.totalValorInventario || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </strong>
          </div>
        </div>

        <div className="report-metric-box">
          <Layers size={20} className="text-warning" />
          <div>
            <span>Total Unidades Despachadas</span>
            <strong>{(resumen.totalUnidadesVendidas || 0).toLocaleString()} unidades</strong>
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="table-controls-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text"
            placeholder="Buscar por descripción o código de barras..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="form-control-search"
          />
        </div>

        <div className="filter-category-wrapper">
          <Filter size={16} />
          <select 
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="form-control-select"
          >
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla del Reporte Consolidado */}
      <div className="content-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Código de Barras</th>
                <th>Descripción del Producto</th>
                <th className="text-right">Stock Actual</th>
                <th className="text-right">Precio Unitario</th>
                <th className="text-right">Valor Total Inventario</th>
                <th className="text-center">Total Vendidas</th>
                <th className="text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filasFiltradas.length > 0 ? (
                filasFiltradas.map((fila, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className="badge-category">{fila.Categoria}</span>
                    </td>
                    <td>
                      <code>{fila.CodigoBarras}</code>
                    </td>
                    <td className="fw-semibold">{fila.NombreProducto}</td>
                    <td className="text-right fw-bold">
                      <span className={fila.StockActual < 50 ? 'text-warning' : 'text-success'}>
                        {fila.StockActual}
                      </span>
                    </td>
                    <td className="text-right">S/ {parseFloat(fila.PrecioUnitario).toFixed(2)}</td>
                    <td className="text-right fw-bold text-success">
                      S/ {parseFloat(fila.ValorTotalInventario).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-center">
                      <span className="badge-vendidos">
                        {fila.TotalUnidadesVendidas} und.
                      </span>
                    </td>
                    <td className="text-center">
                      {fila.StockActual >= 100 ? (
                        <span className="badge badge-success">Abundante</span>
                      ) : fila.StockActual >= 50 ? (
                        <span className="badge badge-normal">Normal</span>
                      ) : (
                        <span className="badge badge-warning">Crítico</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center p-4 text-muted">
                    No se encontraron productos que coincidan con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
            {filasFiltradas.length > 0 && (
              <tfoot>
                <tr className="tfoot-totals">
                  <td colSpan="3" className="fw-bold">TOTALES CONSOLIDADOS:</td>
                  <td className="text-right fw-bold">
                    {filasFiltradas.reduce((sum, f) => sum + (parseInt(f.StockActual, 10) || 0), 0)} und.
                  </td>
                  <td></td>
                  <td className="text-right fw-bold text-success">
                    S/ {filasFiltradas.reduce((sum, f) => sum + (parseFloat(f.ValorTotalInventario) || 0), 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-center fw-bold">
                    {filasFiltradas.reduce((sum, f) => sum + (parseInt(f.TotalUnidadesVendidas, 10) || 0), 0)} und.
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Explicación Técnica de la Query para la Sustentación */}
      <div className="content-card technical-doc-box">
        <div className="doc-header">
          <Database size={18} className="text-cyan" />
          <h4>Explicación del Algoritmo Relacional de Reportes (Sustentación Cibertec)</h4>
        </div>
        <div className="doc-content">
          <p>
            El procedimiento <code>sp_ReporteConsolidadoInventario</code> ejecuta un <strong>INNER JOIN</strong> entre <code>Producto</code> y <code>Categoria</code> para obtener la clasificación comercial, y un <strong>LEFT JOIN</strong> con <code>DetallePedido</code> para computar el histórico de salidas sin excluir aquellos productos que aún no registran ventas.
          </p>
          <div className="code-snippet">
            <code>
              SELECT c.NombreCategoria, p.CodigoBarras, p.NombreProducto, p.StockActual, p.PrecioUnitario,<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(p.StockActual * p.PrecioUnitario) AS ValorTotalInventario,<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ISNULL(SUM(dp.Cantidad), 0) AS TotalUnidadesVendidas<br/>
              FROM Producto p<br/>
              INNER JOIN Categoria c ON p.IdCategoria = c.IdCategoria<br/>
              LEFT JOIN DetallePedido dp ON p.IdProducto = dp.IdProducto<br/>
              GROUP BY c.NombreCategoria, p.CodigoBarras, p.NombreProducto, p.StockActual, p.PrecioUnitario<br/>
              ORDER BY ValorTotalInventario DESC;
            </code>
          </div>
          <p className="doc-footer-note">
            <CheckCircle2 size={14} className="text-success" /> La cláusula <code>ISNULL(SUM(dp.Cantidad), 0)</code> garantiza que productos sin despachos devuelvan 0 en lugar de NULL, asegurando la consistencia aritmética de la aplicación.
          </p>
        </div>
      </div>
    </div>
  );
}
