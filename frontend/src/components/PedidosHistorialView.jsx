import React, { useState } from 'react';
import { History, Eye, X, Calendar, DollarSign, Package, CheckCircle2, Building2 } from 'lucide-react';
import { api } from '../services/api';

export default function PedidosHistorialView({ pedidos }) {
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [cargandoDetalles, setCargandoDetalles] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);

  const verDetalle = async (pedido) => {
    setPedidoSeleccionado(pedido);
    setModalAbierto(true);
    setCargandoDetalles(true);

    const res = await api.getPedidoDetalle(pedido.IdPedido);
    setCargandoDetalles(false);

    if (res.success) {
      setDetalles(res.data);
    } else {
      setDetalles([]);
    }
  };

  const lista = pedidos || [];

  return (
    <div className="view-container">
      {/* Resumen Superior */}
      <div className="report-metrics-strip">
        <div className="report-metric-box">
          <History size={20} className="text-cyan" />
          <div>
            <span>Total de Pedidos Registrados</span>
            <strong>{lista.length} Pedidos</strong>
          </div>
        </div>

        <div className="report-metric-box">
          <DollarSign size={20} className="text-emerald" />
          <div>
            <span>Monto Acumulado Facturado</span>
            <strong className="text-success">
              S/ {lista.reduce((sum, p) => sum + (parseFloat(p.TotalPedido) || 0), 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </strong>
          </div>
        </div>

        <div className="report-metric-box">
          <CheckCircle2 size={20} className="text-warning" />
          <div>
            <span>Estado Transaccional</span>
            <strong>100% Auditados en 3FN</strong>
          </div>
        </div>
      </div>

      {/* Tabla del Historial */}
      <div className="content-card">
        <div className="content-card-header">
          <div>
            <h3>Auditoría de Pedidos Despachados</h3>
            <p className="text-secondary">Registro histórico de transacciones procesadas por la cabecera <code>Pedido</code></p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>N° Pedido</th>
                <th>Cliente Institucional</th>
                <th>RUC / DNI</th>
                <th>Fecha de Registro</th>
                <th className="text-right">Total Facturado</th>
                <th className="text-center">Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista.length > 0 ? (
                lista.map(p => (
                  <tr key={p.IdPedido}>
                    <td><code>PED-{String(p.IdPedido).padStart(5, '0')}</code></td>
                    <td className="fw-semibold">{p.Cliente}</td>
                    <td><code>{p.RUC_DNI || '-'}</code></td>
                    <td>
                      <div className="date-cell">
                        <Calendar size={14} className="text-muted" />
                        <span>{new Date(p.FechaPedido).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="text-right fw-bold text-success">
                      S/ {parseFloat(p.TotalPedido).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-center">
                      <span className="badge badge-success">
                        <CheckCircle2 size={12} /> {p.EstadoPedido}
                      </span>
                    </td>
                    <td className="text-center">
                      <button 
                        className="btn-icon primary"
                        onClick={() => verDetalle(p)}
                        title="Ver detalle del pedido (DetallePedido)"
                      >
                        <Eye size={16} /> Ver Ítems
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-4 text-muted">
                    No se registran pedidos aún. Utilice el módulo "Procesar Pedido" para emitir uno.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de DetallePedido */}
      {modalAbierto && pedidoSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <div>
                <h3>Detalle del Pedido PED-{String(pedidoSeleccionado.IdPedido).padStart(5, '0')}</h3>
                <span className="text-secondary">Tabla relacional vinculada: <code>DetallePedido</code></span>
              </div>
              <button className="btn-close" onClick={() => setModalAbierto(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="order-meta-grid">
                <div>
                  <span className="meta-label">Cliente Institucional:</span>
                  <strong className="meta-value">{pedidoSeleccionado.Cliente}</strong>
                </div>
                <div>
                  <span className="meta-label">Fecha y Hora:</span>
                  <span className="meta-value">
                    {new Date(pedidoSeleccionado.FechaPedido).toLocaleString('es-PE')}
                  </span>
                </div>
                <div>
                  <span className="meta-label">Total del Pedido:</span>
                  <strong className="meta-value text-success">
                    S/ {parseFloat(pedidoSeleccionado.TotalPedido).toFixed(2)}
                  </strong>
                </div>
              </div>

              {cargandoDetalles ? (
                <p className="text-center p-4">Consultando DetallePedido en SQL Server...</p>
              ) : (
                <div className="table-responsive mt-3">
                  <table className="data-table small">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Producto</th>
                        <th className="text-right">Cantidad</th>
                        <th className="text-right">Precio Unit.</th>
                        <th className="text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalles.map((d, index) => (
                        <tr key={index}>
                          <td><code>{d.CodigoBarras || '-'}</code></td>
                          <td className="fw-semibold">{d.NombreProducto}</td>
                          <td className="text-right fw-bold">{d.Cantidad} und.</td>
                          <td className="text-right">S/ {parseFloat(d.PrecioUnitario).toFixed(2)}</td>
                          <td className="text-right fw-bold text-success">
                            S/ {parseFloat(d.Subtotal).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setModalAbierto(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
