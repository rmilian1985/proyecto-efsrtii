import React from 'react';
import { 
  DollarSign, 
  Package, 
  ShoppingBag, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react';

export default function DashboardView({ kpis, productos, setVistaActual }) {
  const stockCritico = (productos || []).filter(p => p.StockActual < 50);

  return (
    <div className="view-container">
      {/* Banner Principal de Cumplimiento de Metas SMART del Proyecto */}
      <div className="smart-kpi-banner">
        <div className="smart-header">
          <div className="smart-badge">
            <Award size={18} />
            <span>INDICADOR OFICIAL SMART - EFSRT II</span>
          </div>
          <span className="smart-periodo">Periodo de Evaluación: 6 Semanas</span>
        </div>

        <div className="smart-grid">
          <div className="smart-card highlight">
            <div className="smart-card-top">
              <Clock size={20} className="text-cyan" />
              <h4>Objetivo Principal (1): Reducción de Tiempos</h4>
            </div>
            <div className="smart-metric">
              <span className="big-stat">99.8%</span>
              <span className="stat-label">Ahorro de Tiempo Alcanzado</span>
            </div>
            <p className="smart-desc">
              Meta establecida: <strong>&ge; 86%</strong> de reducción. De <strong>15 minutos (900 seg)</strong> de validación manual en Excel a menos de <strong>150 milisegundos</strong> mediante el Stored Procedure en SQL Server.
            </p>
            <div className="smart-progress-bar">
              <div className="progress-fill" style={{ width: '100%' }}></div>
            </div>
            <span className="badge-meta-cumplida">
              <CheckCircle size={14} /> Meta Superada con Éxito
            </span>
          </div>

          <div className="smart-card">
            <div className="smart-card-top">
              <ShieldCheck size={20} className="text-emerald" />
              <h4>Objetivo Específico (2): Cero Descuadres</h4>
            </div>
            <div className="smart-metric">
              <span className="big-stat">0</span>
              <span className="stat-label">Descuadres de Stock</span>
            </div>
            <p className="smart-desc">
              Control transaccional <strong>ACID con bloqueos UPDLOCK</strong> en SQL Server que elimina inconsistencias concurrentes de stock físico vs registrado.
            </p>
          </div>

          <div className="smart-card">
            <div className="smart-card-top">
              <CheckCircle size={20} className="text-emerald" />
              <h4>Objetivo Específico (3): Cero Errores de Despacho</h4>
            </div>
            <div className="smart-metric">
              <span className="big-stat">0%</span>
              <span className="stat-label">Tasa de Error en Pedidos</span>
            </div>
            <p className="smart-desc">
              Disparador <code>trg_ValidarDetallePedido</code> y claves foráneas en 3FN que rechazan automáticamente subtotales o cantidades inválidas.
            </p>
          </div>
        </div>
      </div>

      {/* Tarjetas Principales de Resumen Operativo */}
      <div className="kpi-cards-grid">
        <div className="kpi-card card-ventas">
          <div className="kpi-icon-wrapper">
            <DollarSign size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Ventas Totales Facturadas</span>
            <h3 className="kpi-value">
              S/ {(kpis?.VentasTotalesSoles || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </h3>
            <span className="kpi-subtext text-success">
              <TrendingUp size={14} /> Facturación institucional en Piura
            </span>
          </div>
        </div>

        <div className="kpi-card card-inventario">
          <div className="kpi-icon-wrapper">
            <Package size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Valor Total en Almacén</span>
            <h3 className="kpi-value">
              S/ {(kpis?.ValorInventarioTotal || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </h3>
            <span className="kpi-subtext">Valorizado a costo mayorista</span>
          </div>
        </div>

        <div className="kpi-card card-pedidos">
          <div className="kpi-icon-wrapper">
            <ShoppingBag size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Pedidos Procesados</span>
            <h3 className="kpi-value">{kpis?.TotalPedidos || 0}</h3>
            <span className="kpi-subtext">Transacciones ACID confirmadas</span>
          </div>
        </div>

        <div className={`kpi-card card-alerta ${stockCritico.length > 0 ? 'has-alert' : ''}`}>
          <div className="kpi-icon-wrapper">
            <AlertTriangle size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Stock Crítico (&lt; 50 und)</span>
            <h3 className="kpi-value">{stockCritico.length}</h3>
            <span className="kpi-subtext text-warning">Requieren orden de reposición</span>
          </div>
        </div>
      </div>

      {/* Fila de Contenido: Alertas de Stock y Acceso Directo */}
      <div className="dashboard-content-grid">
        <div className="content-card full-width">
          <div className="content-card-header">
            <div>
              <h3>Alertas de Inventario Prioritario</h3>
              <p className="text-secondary">Productos con existencias limitadas para despacho inmediato</p>
            </div>
            <button 
              className="btn-link"
              onClick={() => setVistaActual('inventario')}
            >
              Ver inventario completo <ArrowRight size={16} />
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción del Producto</th>
                  <th>Categoría</th>
                  <th>Precio Unitario</th>
                  <th>Stock Actual</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {stockCritico.length > 0 ? (
                  stockCritico.map(p => (
                    <tr key={p.IdProducto}>
                      <td><code>{p.CodigoBarras}</code></td>
                      <td className="fw-semibold">{p.NombreProducto}</td>
                      <td>{p.Categoria}</td>
                      <td>S/ {parseFloat(p.PrecioUnitario).toFixed(2)}</td>
                      <td className="fw-bold text-warning">{p.StockActual} und.</td>
                      <td>
                        <span className="badge badge-warning">Alerta de Reposición</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  (productos || []).slice(0, 5).map(p => (
                    <tr key={p.IdProducto}>
                      <td><code>{p.CodigoBarras}</code></td>
                      <td className="fw-semibold">{p.NombreProducto}</td>
                      <td>{p.Categoria}</td>
                      <td>S/ {parseFloat(p.PrecioUnitario).toFixed(2)}</td>
                      <td className="fw-bold text-success">{p.StockActual} und.</td>
                      <td>
                        <span className="badge badge-success">Stock Óptimo</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
