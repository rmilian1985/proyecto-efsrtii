import React, { useState } from 'react';
import { Package, Search, Filter, Tag, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export default function InventarioView({ productos, categorias }) {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('TODAS');

  const prods = productos || [];
  const cats = ['TODAS', ...(categorias || []).map(c => c.NombreCategoria)];

  const prodsFiltrados = prods.filter(p => {
    const coincideTexto = 
      p.NombreProducto.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.CodigoBarras.includes(busqueda);
    const coincideCat = 
      categoriaSeleccionada === 'TODAS' || p.Categoria === categoriaSeleccionada;
    return coincideTexto && coincideCat;
  });

  const totalValor = prodsFiltrados.reduce((sum, p) => sum + (p.StockActual * p.PrecioUnitario), 0);
  const totalStock = prodsFiltrados.reduce((sum, p) => sum + p.StockActual, 0);

  return (
    <div className="view-container">
      {/* Resumen Superior */}
      <div className="report-metrics-strip">
        <div className="report-metric-box">
          <Package size={20} className="text-cyan" />
          <div>
            <span>Catálogo Activo</span>
            <strong>{prodsFiltrados.length} Productos</strong>
          </div>
        </div>

        <div className="report-metric-box">
          <Layers size={20} className="text-emerald" />
          <div>
            <span>Unidades en Almacén</span>
            <strong>{totalStock.toLocaleString()} unidades</strong>
          </div>
        </div>

        <div className="report-metric-box">
          <Tag size={20} className="text-warning" />
          <div>
            <span>Valorización de Inventario</span>
            <strong className="text-success">
              S/ {totalValor.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </strong>
          </div>
        </div>
      </div>

      {/* Controles de Búsqueda y Filtro */}
      <div className="table-controls-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text"
            placeholder="Buscar por nombre de producto o código de barras..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="form-control-search"
          />
        </div>

        <div className="filter-category-wrapper">
          <Filter size={16} />
          <select 
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            className="form-control-select"
          >
            {cats.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="content-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Código de Barras</th>
                <th>Descripción del Producto</th>
                <th>Categoría</th>
                <th className="text-right">Stock Actual</th>
                <th className="text-right">Precio Mayorista</th>
                <th className="text-right">Subtotal Almacén</th>
                <th className="text-center">Nivel de Stock</th>
              </tr>
            </thead>
            <tbody>
              {prodsFiltrados.map(p => (
                <tr key={p.IdProducto}>
                  <td><code>#{p.IdProducto}</code></td>
                  <td><code>{p.CodigoBarras}</code></td>
                  <td className="fw-semibold">{p.NombreProducto}</td>
                  <td><span className="badge-category">{p.Categoria}</span></td>
                  <td className="text-right fw-bold">{p.StockActual}</td>
                  <td className="text-right">S/ {parseFloat(p.PrecioUnitario).toFixed(2)}</td>
                  <td className="text-right fw-bold text-success">
                    S/ {(p.StockActual * p.PrecioUnitario).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-center">
                    {p.StockActual >= 100 ? (
                      <span className="badge badge-success">Suficiente</span>
                    ) : p.StockActual >= 50 ? (
                      <span className="badge badge-normal">Moderado</span>
                    ) : (
                      <span className="badge badge-warning">Crítico (&lt;50)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
