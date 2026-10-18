import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  FileSpreadsheet, 
  History, 
  Database, 
  CheckCircle2, 
  AlertCircle,
  Truck
} from 'lucide-react';

export default function Sidebar({ vistaActual, setVistaActual, dbHealth }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard & KPIs', icon: LayoutDashboard },
    { id: 'procesar', label: 'Procesar Pedido (SP)', icon: ShoppingCart, badge: 'ACID' },
    { id: 'reportes', label: 'Reportes Exportables', icon: FileSpreadsheet, badge: 'Excel / PDF' },
    { id: 'inventario', label: 'Inventario de Almacén', icon: Package },
    { id: 'clientes', label: 'Clientes Institucionales', icon: Users },
    { id: 'pedidos', label: 'Historial de Pedidos', icon: History }
  ];

  return (
    <aside className="app-sidebar">
      {/* Encabezado con Logo Corporativo */}
      <div className="sidebar-brand">
        <div className="brand-icon-wrapper">
          <Truck className="brand-icon" size={26} />
        </div>
        <div className="brand-text">
          <h2>DISTRIBUCIONES</h2>
          <span>DEL NORTE S.A.C.</span>
        </div>
      </div>

      <div className="sidebar-badge-piura">
        <span>Sede Piura • Consumo Masivo</span>
      </div>

      {/* Menú de Navegación */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = vistaActual === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setVistaActual(item.id)}
            >
              <Icon size={20} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          );
        })}
      </nav>

      {/* Estado del Motor de Base de Datos */}
      <div className="sidebar-db-status">
        <div className="status-header">
          <Database size={15} />
          <span>Motor SQL Server</span>
        </div>
        <div className="status-indicator">
          {dbHealth?.connected ? (
            <>
              <CheckCircle2 size={16} className="text-success" />
              <div className="status-details">
                <strong>Conectado a BD</strong>
                <small>{dbHealth.currentDb || 'BD_DistribucionesNorte'}</small>
              </div>
            </>
          ) : (
            <>
              <AlertCircle size={16} className="text-warning" />
              <div className="status-details">
                <strong>Modo Resiliente</strong>
                <small>Memoria Transaccional</small>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Pie con Créditos Académicos */}
      <div className="sidebar-footer">
        <p className="footer-title">EFSRT II - CIBERTEC</p>
        <p className="footer-sub">Grupo N° 4 • Ciclo III</p>
      </div>
    </aside>
  );
}
