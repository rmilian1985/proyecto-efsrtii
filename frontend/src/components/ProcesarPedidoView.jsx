import React, { useState } from 'react';
import { 
  Send, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Zap, 
  Database, 
  Info, 
  ShoppingCart,
  Trash2,
  Plus
} from 'lucide-react';
import { api } from '../services/api';

export default function ProcesarPedidoView({ clientes, productos, onPedidoCompletado }) {
  const [modo, setModo] = useState('unitario'); // 'unitario' | 'carrito'

  // Estados para Modo Unitario (Evaluación Oficial del Stored Procedure)
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidadSolicitada, setCantidadSolicitada] = useState(50);
  const [procesando, setProcesando] = useState(false);
  const [resultadoSP, setResultadoSP] = useState(null);

  // Estados para Modo Carrito
  const [carrito, setCarrito] = useState([]);
  const [clienteCarrito, setClienteCarrito] = useState('');
  const [prodCarrito, setProdCarrito] = useState('');
  const [cantCarrito, setCantCarrito] = useState(10);
  const [resultadoCarrito, setResultadoCarrito] = useState(null);

  // Producto activo en modo unitario
  const productoActivo = (productos || []).find(p => p.IdProducto === parseInt(productoSeleccionado, 10));
  const subtotalCalculado = productoActivo ? (productoActivo.PrecioUnitario * (parseInt(cantidadSolicitada, 10) || 0)) : 0;

  // Botones de carga rápida para casos del informe Cibertec
  const cargarCasoExito = () => {
    if (clientes.length > 0 && productos.length > 0) {
      setClienteSeleccionado(clientes[0].IdCliente);
      setProductoSeleccionado(productos[0].IdProducto);
      setCantidadSolicitada(50);
      setResultadoSP(null);
    }
  };

  const cargarCasoFalla = () => {
    if (clientes.length > 0 && productos.length > 0) {
      setClienteSeleccionado(clientes[0].IdCliente);
      setProductoSeleccionado(productos[0].IdProducto);
      setCantidadSolicitada(5000); // Excede stock
      setResultadoSP(null);
    }
  };

  // Ejecución del Stored Procedure
  const handleEjecutarSP = async (e) => {
    e.preventDefault();
    if (!clienteSeleccionado || !productoSeleccionado || !cantidadSolicitada) {
      alert('Por favor complete todos los campos.');
      return;
    }

    setProcesando(true);
    setResultadoSP(null);

    const res = await api.procesarPedidoIndividual({
      idCliente: clienteSeleccionado,
      idProducto: productoSeleccionado,
      cantidadSolicitada: parseInt(cantidadSolicitada, 10)
    });

    setProcesando(false);
    setResultadoSP(res);

    if (res.resultado === 1) {
      if (onPedidoCompletado) onPedidoCompletado();
    }
  };

  // Manejo de Carrito
  const agregarAlCarrito = () => {
    if (!prodCarrito || !cantCarrito || cantCarrito <= 0) return;
    const prod = productos.find(p => p.IdProducto === parseInt(prodCarrito, 10));
    if (!prod) return;

    const existe = carrito.find(item => item.idProducto === prod.IdProducto);
    if (existe) {
      setCarrito(carrito.map(item => 
        item.idProducto === prod.IdProducto 
          ? { ...item, cantidad: item.cantidad + parseInt(cantCarrito, 10), subtotal: (item.cantidad + parseInt(cantCarrito, 10)) * prod.PrecioUnitario }
          : item
      ));
    } else {
      setCarrito([
        ...carrito,
        {
          idProducto: prod.IdProducto,
          nombreProducto: prod.NombreProducto,
          codigoBarras: prod.CodigoBarras,
          precioUnitario: prod.PrecioUnitario,
          cantidad: parseInt(cantCarrito, 10),
          subtotal: parseInt(cantCarrito, 10) * prod.PrecioUnitario
        }
      ]);
    }
    setCantCarrito(10);
  };

  const quitarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.idProducto !== id));
  };

  const procesarCarritoCompleto = async () => {
    if (!clienteCarrito) {
      alert('Seleccione un cliente institucional.');
      return;
    }
    if (carrito.length === 0) {
      alert('El carrito está vacío.');
      return;
    }

    setProcesando(true);
    setResultadoCarrito(null);

    const res = await api.procesarPedidoMultiple({
      idCliente: clienteCarrito,
      items: carrito
    });

    setProcesando(false);
    setResultadoCarrito(res);

    if (res.exitoGlobal) {
      setCarrito([]);
      if (onPedidoCompletado) onPedidoCompletado();
    }
  };

  return (
    <div className="view-container">
      {/* Selector de Modos */}
      <div className="tab-nav">
        <button 
          className={`tab-btn ${modo === 'unitario' ? 'active' : ''}`}
          onClick={() => setModo('unitario')}
        >
          <Zap size={18} />
          <span>Prueba Oficial del Stored Procedure (Pág. 18-20 Informe)</span>
        </button>
        <button 
          className={`tab-btn ${modo === 'carrito' ? 'active' : ''}`}
          onClick={() => setModo('carrito')}
        >
          <ShoppingCart size={18} />
          <span>Carrito de Pedido Multiproducto</span>
        </button>
      </div>

      {modo === 'unitario' ? (
        <div className="sp-demo-layout">
          {/* Formulario de Invocación del SP */}
          <div className="content-card">
            <div className="content-card-header">
              <div>
                <h3>Ejecución de Transacción ACID</h3>
                <p className="text-secondary">
                  Invoca directamente el procedimiento <code>sp_ProcesarPedidoInstitucional</code>
                </p>
              </div>
            </div>

            {/* Botones de Casos de Prueba Rápidos del Informe */}
            <div className="test-cases-toolbar">
              <span className="toolbar-label">Escenarios del Informe Cibertec:</span>
              <button 
                type="button" 
                className="btn-pill-test success"
                onClick={cargarCasoExito}
              >
                <CheckCircle2 size={14} /> Cargar Caso ÉXITO (50 und Gloria)
              </button>
              <button 
                type="button" 
                className="btn-pill-test danger"
                onClick={cargarCasoFalla}
              >
                <XCircle size={14} /> Cargar Caso FALLA (5,000 und &gt; Stock)
              </button>
            </div>

            <form onSubmit={handleEjecutarSP} className="sp-form">
              <div className="form-group">
                <label>1. Cliente Institucional (@IdCliente)</label>
                <select 
                  value={clienteSeleccionado} 
                  onChange={(e) => setClienteSeleccionado(e.target.value)}
                  className="form-control"
                  required
                >
                  <option value="">-- Seleccione Cliente --</option>
                  {(clientes || []).map(c => (
                    <option key={c.IdCliente} value={c.IdCliente}>
                      {c.RazonSocial} (RUC/DNI: {c.RUC_DNI})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>2. Producto a Solicitar (@IdProducto)</label>
                <select 
                  value={productoSeleccionado} 
                  onChange={(e) => setProductoSeleccionado(e.target.value)}
                  className="form-control"
                  required
                >
                  <option value="">-- Seleccione Producto --</option>
                  {(productos || []).map(p => (
                    <option key={p.IdProducto} value={p.IdProducto}>
                      {p.NombreProducto} — Stock: {p.StockActual} und. (S/ {parseFloat(p.PrecioUnitario).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {productoActivo && (
                <div className="product-spec-box">
                  <div className="spec-item">
                    <span>Stock Disponible en Almacén:</span>
                    <strong className={productoActivo.StockActual < 50 ? 'text-warning' : 'text-success'}>
                      {productoActivo.StockActual} unidades
                    </strong>
                  </div>
                  <div className="spec-item">
                    <span>Precio Unitario Mayorista:</span>
                    <strong>S/ {parseFloat(productoActivo.PrecioUnitario).toFixed(2)}</strong>
                  </div>
                  <div className="spec-item">
                    <span>Código de Barras:</span>
                    <code>{productoActivo.CodigoBarras}</code>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>3. Cantidad Solicitada (@CantidadSolicitada)</label>
                <input 
                  type="number" 
                  min="1"
                  value={cantidadSolicitada}
                  onChange={(e) => setCantidadSolicitada(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="order-summary-box">
                <span>Total Estimado del Pedido:</span>
                <h3>S/ {subtotalCalculado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</h3>
              </div>

              <button 
                type="submit" 
                className="btn-primary-action"
                disabled={procesando}
              >
                <Send size={18} />
                <span>{procesando ? 'Ejecutando Transacción...' : 'Ejecutar Transacción en SQL Server'}</span>
              </button>
            </form>
          </div>

          {/* Panel de Resultado de la Transacción */}
          <div className="content-card result-panel">
            <div className="content-card-header">
              <h3>Consola de Retorno del Stored Procedure</h3>
              <Database size={18} className="text-cyan" />
            </div>

            {resultadoSP ? (
              <div className={`sp-result-card ${resultadoSP.resultado === 1 ? 'is-success' : 'is-failure'}`}>
                <div className="result-header">
                  {resultadoSP.resultado === 1 ? (
                    <>
                      <CheckCircle2 size={32} className="text-success" />
                      <div>
                        <h4>TRANSACCIÓN EXITOSA (COMMIT)</h4>
                        <span className="badge badge-success">@Resultado = 1</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle size={32} className="text-danger" />
                      <div>
                        <h4>TRANSACCIÓN REVERTIDA (ROLLBACK)</h4>
                        <span className="badge badge-danger">@Resultado = {resultadoSP.resultado}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="result-body">
                  <div className="message-box">
                    <span className="label">Parámetro de Salida @Mensaje:</span>
                    <p className="message-text">"{resultadoSP.mensaje}"</p>
                  </div>

                  <div className="tech-details-grid">
                    <div className="tech-item">
                      <Clock size={16} />
                      <div>
                        <span>Tiempo de Ejecución:</span>
                        <strong>{resultadoSP.indicadorSmart?.tiempoEjecucionMs || 0} ms</strong>
                      </div>
                    </div>

                    <div className="tech-item">
                      <Zap size={16} className="text-cyan" />
                      <div>
                        <span>Eficiencia SMART vs Excel:</span>
                        <strong className="text-success">
                          {resultadoSP.indicadorSmart?.porcentajeEficiencia || 99.8}% más rápido
                        </strong>
                      </div>
                    </div>

                    <div className="tech-item">
                      <Database size={16} />
                      <div>
                        <span>Motor de Ejecución:</span>
                        <small>{resultadoSP.ejecutadoEn}</small>
                      </div>
                    </div>
                  </div>

                  <div className="acid-explanation">
                    <Info size={16} />
                    <p>
                      {resultadoSP.resultado === 1 
                        ? 'Se aplicó UPDLOCK en tabla Producto, se insertó la cabecera en Pedido, el detalle en DetallePedido y se descontó el stock relacional de forma atómica.'
                        : 'El algoritmo relacional validó (StockActual >= Cantidad). Al ser falsa la condición, ejecutó ROLLBACK TRANSACTION protegiendo la base de datos de números negativos o inconsistencias.'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-result-placeholder">
                <Info size={40} className="text-muted" />
                <h4>A la espera de ejecución</h4>
                <p>
                  Haga clic en <strong>"Ejecutar Transacción en SQL Server"</strong> o seleccione uno de los casos del informe en la barra superior para visualizar el retorno del Stored Procedure.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Modo Carrito Multiproducto */
        <div className="content-card">
          <div className="content-card-header">
            <div>
              <h3>Pedido Mayorista con Múltiples Ítems</h3>
              <p className="text-secondary">Permite armar una orden completa para abastecimiento institucional</p>
            </div>
          </div>

          <div className="carrito-builder-grid">
            <div className="carrito-left">
              <div className="form-group">
                <label>Cliente Institucional Destino</label>
                <select 
                  value={clienteCarrito} 
                  onChange={(e) => setClienteCarrito(e.target.value)}
                  className="form-control"
                >
                  <option value="">-- Seleccione Cliente --</option>
                  {(clientes || []).map(c => (
                    <option key={c.IdCliente} value={c.IdCliente}>
                      {c.RazonSocial}
                    </option>
                  ))}
                </select>
              </div>

              <div className="add-item-row">
                <div className="form-group flex-2">
                  <label>Agregar Producto</label>
                  <select 
                    value={prodCarrito} 
                    onChange={(e) => setProdCarrito(e.target.value)}
                    className="form-control"
                  >
                    <option value="">-- Seleccionar --</option>
                    {(productos || []).map(p => (
                      <option key={p.IdProducto} value={p.IdProducto}>
                        {p.NombreProducto} (Stock: {p.StockActual})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group flex-1">
                  <label>Cantidad</label>
                  <input 
                    type="number" 
                    min="1"
                    value={cantCarrito}
                    onChange={(e) => setCantCarrito(e.target.value)}
                    className="form-control"
                  />
                </div>

                <button 
                  type="button" 
                  className="btn-add-item"
                  onClick={agregarAlCarrito}
                >
                  <Plus size={18} /> Agregar
                </button>
              </div>
            </div>

            <div className="carrito-right">
              <h4>Ítems del Pedido ({carrito.length})</h4>
              {carrito.length === 0 ? (
                <p className="text-muted">No ha agregado productos a la orden aún.</p>
              ) : (
                <div className="carrito-table-wrapper">
                  <table className="data-table small">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cant.</th>
                        <th>P. Unit.</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {carrito.map(item => (
                        <tr key={item.idProducto}>
                          <td>{item.nombreProducto}</td>
                          <td>{item.cantidad}</td>
                          <td>S/ {item.precioUnitario.toFixed(2)}</td>
                          <td className="fw-bold">S/ {item.subtotal.toFixed(2)}</td>
                          <td>
                            <button 
                              className="btn-icon danger" 
                              onClick={() => quitarDelCarrito(item.idProducto)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="carrito-total-footer">
                    <span>Total a Facturar:</span>
                    <h3>S/ {carrito.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2)}</h3>
                  </div>

                  <button 
                    className="btn-primary-action full-width"
                    onClick={procesarCarritoCompleto}
                    disabled={procesando}
                  >
                    <Send size={18} />
                    <span>{procesando ? 'Procesando ítems...' : 'Confirmar y Despachar Pedido'}</span>
                  </button>
                </div>
              )}

              {resultadoCarrito && (
                <div className={`mt-3 p-3 rounded ${resultadoCarrito.exitoGlobal ? 'bg-success-subtle' : 'bg-danger-subtle'}`}>
                  <strong>{resultadoCarrito.mensaje}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
