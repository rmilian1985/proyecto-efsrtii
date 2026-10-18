import React, { useState } from 'react';
import { Users, Search, UserPlus, Phone, MapPin, Building2, CheckCircle2, X } from 'lucide-react';
import { api } from '../services/api';

export default function ClientesView({ clientes, onClienteCreado }) {
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    rucDni: '',
    razonSocial: '',
    direccion: '',
    telefono: ''
  });
  const [mensajeExito, setMensajeExito] = useState('');

  const clientesFiltrados = (clientes || []).filter(c => 
    c.RazonSocial.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.RUC_DNI.includes(busqueda)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensajeExito('');

    const res = await api.crearCliente(nuevoCliente);
    setGuardando(false);

    if (res.success) {
      setMensajeExito('Cliente registrado correctamente en la base de datos.');
      setNuevoCliente({ rucDni: '', razonSocial: '', direccion: '', telefono: '' });
      setTimeout(() => {
        setModalAbierto(false);
        setMensajeExito('');
        if (onClienteCreado) onClienteCreado();
      }, 1200);
    } else {
      alert(res.message || 'Error al registrar cliente');
    }
  };

  return (
    <div className="view-container">
      {/* Barra de Acciones */}
      <div className="table-controls-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text"
            placeholder="Buscar por Razón Social o RUC/DNI..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="form-control-search"
          />
        </div>

        <button 
          className="btn-primary-action"
          onClick={() => setModalAbierto(true)}
        >
          <UserPlus size={18} />
          <span>Registrar Cliente Institucional</span>
        </button>
      </div>

      {/* Grid de Clientes */}
      <div className="clients-grid">
        {clientesFiltrados.map(c => (
          <div key={c.IdCliente} className="client-card">
            <div className="client-card-header">
              <div className="client-avatar">
                <Building2 size={24} />
              </div>
              <div>
                <h4>{c.RazonSocial}</h4>
                <span className="badge-ruc">RUC/DNI: {c.RUC_DNI}</span>
              </div>
            </div>

            <div className="client-card-body">
              <div className="client-info-row">
                <MapPin size={16} className="text-secondary" />
                <span>{c.Direccion}</span>
              </div>
              <div className="client-info-row">
                <Phone size={16} className="text-secondary" />
                <span>{c.Telefono}</span>
              </div>
            </div>

            <div className="client-card-footer">
              <span className="badge badge-normal">Cliente Verificado Piura</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para Crear Cliente */}
      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Nuevo Cliente Institucional</h3>
              <button className="btn-close" onClick={() => setModalAbierto(false)}>
                <X size={20} />
              </button>
            </div>

            {mensajeExito ? (
              <div className="modal-success-state">
                <CheckCircle2 size={48} className="text-success" />
                <h4>¡Registro Exitoso!</h4>
                <p>{mensajeExito}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label>RUC o DNI (8 u 11 dígitos)</label>
                  <input 
                    type="text"
                    required
                    maxLength={15}
                    value={nuevoCliente.rucDni}
                    onChange={(e) => setNuevoCliente({ ...nuevoCliente, rucDni: e.target.value })}
                    className="form-control"
                    placeholder="Ej. 20543210981"
                  />
                </div>

                <div className="form-group">
                  <label>Razón Social o Nombre Institucional</label>
                  <input 
                    type="text"
                    required
                    value={nuevoCliente.razonSocial}
                    onChange={(e) => setNuevoCliente({ ...nuevoCliente, razonSocial: e.target.value })}
                    className="form-control"
                    placeholder="Ej. Comité Vaso de Leche Piura Centro"
                  />
                </div>

                <div className="form-group">
                  <label>Dirección Fiscal / Sede de Entrega</label>
                  <input 
                    type="text"
                    required
                    value={nuevoCliente.direccion}
                    onChange={(e) => setNuevoCliente({ ...nuevoCliente, direccion: e.target.value })}
                    className="form-control"
                    placeholder="Ej. Av. Grau N° 850, Piura"
                  />
                </div>

                <div className="form-group">
                  <label>Teléfono de Contacto</label>
                  <input 
                    type="text"
                    required
                    value={nuevoCliente.telefono}
                    onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
                    className="form-control"
                    placeholder="Ej. 073324455"
                  />
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setModalAbierto(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary-action"
                    disabled={guardando}
                  >
                    {guardando ? 'Guardando...' : 'Guardar Cliente'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
