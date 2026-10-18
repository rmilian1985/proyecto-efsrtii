import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { api } from './services/api';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import ProcesarPedidoView from './components/ProcesarPedidoView';
import ReportesExportablesView from './components/ReportesExportablesView';
import InventarioView from './components/InventarioView';
import ClientesView from './components/ClientesView';
import PedidosHistorialView from './components/PedidosHistorialView';

export default function App() {
  const [vistaActual, setVistaActual] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [dbHealth, setDbHealth] = useState(null);

  // Estados de datos maestros
  const [kpis, setKpis] = useState(null);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [reporteConsolidado, setReporteConsolidado] = useState(null);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      // Peticiones paralelas para máxima velocidad de renderizado
      const [
        healthRes,
        kpiRes,
        prodRes,
        catRes,
        cliRes,
        pedRes,
        repRes
      ] = await Promise.all([
        api.getHealth(),
        api.getDashboardKpis(),
        api.getProductos(),
        api.getCategorias(),
        api.getClientes(),
        api.getPedidos(),
        api.getReporteConsolidado()
      ]);

      if (healthRes?.database) setDbHealth(healthRes.database);
      if (kpiRes?.success) setKpis(kpiRes.data);
      if (prodRes?.success) setProductos(prodRes.data);
      if (catRes?.success) setCategorias(catRes.data);
      if (cliRes?.success) setClientes(cliRes.data);
      if (pedRes?.success) setPedidos(pedRes.data);
      if (repRes?.success) setReporteConsolidado(repRes.data);
    } catch (err) {
      console.error('[CARGA ERROR] Fallo al cargar datos iniciales:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  return (
    <div className="app-layout">
      {/* Barra Lateral de Navegación */}
      <Sidebar 
        vistaActual={vistaActual} 
        setVistaActual={setVistaActual}
        dbHealth={dbHealth}
      />

      {/* Contenido Principal */}
      <main className="app-main">
        <Navbar 
          vistaActual={vistaActual} 
          onRefresh={cargarDatos}
          loading={loading}
        />

        {vistaActual === 'dashboard' && (
          <DashboardView 
            kpis={kpis}
            productos={productos}
            setVistaActual={setVistaActual}
          />
        )}

        {vistaActual === 'procesar' && (
          <ProcesarPedidoView 
            clientes={clientes}
            productos={productos}
            onPedidoCompletado={cargarDatos}
          />
        )}

        {vistaActual === 'reportes' && (
          <ReportesExportablesView 
            reporte={reporteConsolidado}
            loading={loading}
          />
        )}

        {vistaActual === 'inventario' && (
          <InventarioView 
            productos={productos}
            categorias={categorias}
          />
        )}

        {vistaActual === 'clientes' && (
          <ClientesView 
            clientes={clientes}
            onClienteCreado={cargarDatos}
          />
        )}

        {vistaActual === 'pedidos' && (
          <PedidosHistorialView 
            pedidos={pedidos}
          />
        )}
      </main>
    </div>
  );
}
