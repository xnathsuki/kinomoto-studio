import { useState } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { clients, projects } from '../data/mockData';
import { FlowerIcon } from '../components/KawaiiDecor';
import './Clientes.css';

export default function Clientes({ onToast }) {
  const [clientList, setClientList] = useState(clients);
  const [selectedClient, setSelectedClient] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [formData, setFormData] = useState({ name: '', company: '', email: '', phone: '', status: 'activo', label: '' });

  const filteredClients = clientList.filter(c => {
    const matchSearch = !search || 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'todos' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleAddClient = () => {
    setFormData({ name: '', company: '', email: '', phone: '', status: 'activo', label: '' });
    setModalOpen(true);
  };

  const handleSaveClient = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    const newClient = {
      id: 'c' + (clientList.length + 1),
      ...formData,
      avatar: null,
    };
    setClientList([...clientList, newClient]);
    setModalOpen(false);
    onToast?.('Cliente guardado ✨', 'success');
  };

  const getClientProjects = (clientId) => 
    projects.filter(p => p.clientId === clientId);

  return (
    <div className="clientes-section">
      <header className="section-header">
        <h1 className="display-font">Clientes</h1>
        <button className="btn-primary" onClick={handleAddClient}>
          <span>+</span> Nuevo cliente
        </button>
      </header>

      <div className="clientes-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre o empresa..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          {['todos', 'activo', 'pausado', 'archivado'].map(status => (
            <button
              key={status}
              className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {selectedClient ? (
        <Card className="client-detail-card">
          <div className="client-detail-header">
            <button className="back-btn" onClick={() => setSelectedClient(null)}>← Volver</button>
            <div className="client-avatar large">
              {selectedClient.name.charAt(0)}
            </div>
            <div>
              <h2 className="display-font">{selectedClient.name}</h2>
              <p className="client-company">{selectedClient.company}</p>
              {selectedClient.label && (
                <span className={`label-badge ${selectedClient.label}`}>{selectedClient.label}</span>
              )}
            </div>
          </div>
          <div className="client-detail-body">
            <div className="detail-section">
              <h4>Contacto</h4>
              <p>📧 {selectedClient.email}</p>
              {selectedClient.phone && <p>📞 {selectedClient.phone}</p>}
            </div>
            <div className="detail-section">
              <h4>Proyectos</h4>
              {getClientProjects(selectedClient.id).length === 0 ? (
                <p className="muted">Sin proyectos aún</p>
              ) : (
                <ul>
                  {getClientProjects(selectedClient.id).map(p => (
                    <li key={p.id}>{p.name} — {p.status}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <div className="clientes-grid">
          {filteredClients.map(client => (
            <Card 
              key={client.id} 
              className="client-card"
              hoverable
            >
              <div 
                className="client-card-inner"
                onClick={() => setSelectedClient(client)}
              >
                <FlowerIcon size={6} className="client-decor" />
                <div className="client-avatar">
                  {client.name.charAt(0)}
                </div>
                <h3 className="client-name">{client.name}</h3>
                <p className="client-company">{client.company}</p>
                <div className="client-meta">
                  <span className={`status-badge ${client.status}`}>{client.status}</span>
                  {client.label && (
                    <span className={`label-badge small ${client.label}`}>{client.label}</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo cliente">
        <form onSubmit={handleSaveClient} className="client-form">
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="María García"
              required
            />
          </div>
          <div className="form-group">
            <label>Empresa</label>
            <input
              type="text"
              value={formData.company}
              onChange={e => setFormData({ ...formData, company: e.target.value })}
              placeholder="Mi Empresa S.L."
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@empresa.com"
            />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+34 612 345 678"
            />
          </div>
          <div className="form-group">
            <label>Estado</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="activo">Activo</option>
              <option value="pausado">Pausado</option>
              <option value="archivado">Archivado</option>
            </select>
          </div>
          <div className="form-group">
            <label>Etiqueta</label>
            <select
              value={formData.label}
              onChange={e => setFormData({ ...formData, label: e.target.value })}
            >
              <option value="">Ninguna</option>
              <option value="VIP">VIP</option>
              <option value="frecuente">Frecuente</option>
              <option value="nuevo">Nuevo</option>
            </select>
          </div>
          <button type="submit" className="btn-primary full-width">Guardar cliente ✨</button>
        </form>
      </Modal>
    </div>
  );
}
