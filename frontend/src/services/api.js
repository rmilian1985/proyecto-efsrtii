/**
 * ==============================================================================
 * CLIENTE API: api.js
 * Capa de Comunicación HTTP con el Backend REST Node.js / SQL Server
 * Proyecto EFSRT II - Cibertec
 * ==============================================================================
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`[API FETCH ERROR] en ${endpoint}:`, error);
    return {
      success: false,
      message: 'No se pudo conectar con el servidor backend. Verifique que la API esté en ejecución.'
    };
  }
}

export const api = {
  // Verificación de estado
  getHealth: () => request('/health'),

  // Dashboard KPIs
  getDashboardKpis: () => request('/reportes/kpis'),

  // Clientes
  getClientes: () => request('/clientes'),
  getClienteById: (id) => request(`/clientes/${id}`),
  crearCliente: (cliente) => request('/clientes', {
    method: 'POST',
    body: JSON.stringify(cliente)
  }),

  // Productos y Categorías
  getProductos: () => request('/productos'),
  getCategorias: () => request('/productos/categorias'),

  // Pedidos Institucionales (sp_ProcesarPedidoInstitucional)
  getPedidos: () => request('/pedidos'),
  getPedidoDetalle: (id) => request(`/pedidos/${id}/detalle`),
  procesarPedidoIndividual: (datos) => request('/pedidos/procesar', {
    method: 'POST',
    body: JSON.stringify(datos)
  }),
  procesarPedidoMultiple: (datos) => request('/pedidos/procesar-multiple', {
    method: 'POST',
    body: JSON.stringify(datos)
  }),

  // Reportes Consolidados (sp_ReporteConsolidadoInventario)
  getReporteConsolidado: () => request('/reportes/consolidado')
};
