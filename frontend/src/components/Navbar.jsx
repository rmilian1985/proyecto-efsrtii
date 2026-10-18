import React from 'react';
import { RefreshCw, Activity, Calendar, ShieldCheck } from 'lucide-react';

export default function Navbar({ vistaActual, onRefresh, loading }) {
  const titulos = {
    dashboard: 'Panel de Control Gerencial & Metas SMART',
    procesar: 'Módulo Transaccional de Pedidos Institucionales',
    reportes: 'Reportes Gerenciales Consolidados & Exportación',
    inventario: 'Control de Inventario y Catálogo de Productos',
    clientes: 'Directorio de Clientes Institucionales y Mayoristas',
    pedidos: 'Historial de Auditoría de Pedidos Despachados'
  };

  const fechaHoy = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="app-navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">{titulos[vistaActual] || 'Panel Principal'}</h1>
        <div className="navbar-subtitle">
          <Calendar size={14} />
          <span>{fechaHoy.charAt(0).toUpperCase() + fechaHoy.slice(1)}</span>
          <span className="dot-divider">•</span>
          <ShieldCheck size={14} className="text-primary" />
          <span>Integridad Transaccional 3FN</span>
        </div>
      </div>

      <div className="navbar-right">
        <button 
          className="btn-refresh" 
          onClick={onRefresh}
          disabled={loading}
          title="Actualizar datos desde el servidor"
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          <span>{loading ? 'Sincronizando...' : 'Actualizar'}</span>
        </button>
      </div>
    </header>
  );
}
