import { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { useToast } from '../context/ToastContext';
import Topbar from '../components/Topbar';
import Modal from '../components/Modal';
import './Clientes.css';

const ESTADOS = [
  { value: 'activo', label: 'Activo' },
  { value: 'pausado', label: 'Pausado' },
  { value: 'archivado', label: 'Archivado' },
];

const ETIQUETAS = [
  { value: '', label: 'Ninguna' },
  { value: 'Nuevo', label: 'Nuevo' },
  { value: 'Frecuente', label: 'Frecuente' },
  { value: 'VIP', label: 'VIP' },
];

const AVATAR_COLORS = ['avatar-pink', 'avatar-lila', 'avatar-mint'];

function getAvatarColor(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export default function Clientes() {
  const { clientes, proyectos, addCliente, editCliente, deleteCliente } = useStudio();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    empresa: '',
    email: '',
    tel: '',
    estado: 'activo',
    etiqueta: '',
    notas: '',
  });

  const openNew = () => {
    setEditingId(null);
    setForm({
      nombre: '',
      empresa: '',
      email: '',
      tel: '',
      estado: 'activo',
      etiqueta: '',
      notas: '',
    });
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditingId(c.id);
    setForm({
      nombre: c.nombre || '',
      empresa: c.empresa || '',
      email: c.email || '',
      tel: c.tel || c.telefono || '',
      estado: c.estado || 'activo',
      etiqueta: c.etiqueta || '',
      notas: c.notas || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    if (editingId) {
      editCliente(editingId, form);
      showToast('Cliente actualizado');
    } else {
      addCliente(form);
      showToast('Cliente agregado');
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (!editingId) return;
    if (window.confirm('¿Eliminar este cliente?')) {
      deleteCliente(editingId);
      showToast('Cliente eliminado');
      setModalOpen(false);
    }
  };

  const countProyectos = (clienteId) =>
    proyectos.filter((p) => p.clienteId === clienteId).length;

  return (
    <div className="clientes-page">
      <Topbar
        title="Clientes"
        action={
          <button className="btn-primary" onClick={openNew}>
            + Nuevo cliente
          </button>
        }
      />

      <div className="clientes-content">
        {clientes.length === 0 ? (
          <div className="empty-state-large">
            <span className="empty-icon">👥</span>
            <h3>No hay clientes aún</h3>
            <p>Agrega tu primer cliente para empezar a organizar tus proyectos</p>
            <button className="btn-primary" onClick={openNew}>
              + Agregar cliente
            </button>
          </div>
        ) : (
          <div className="clientes-grid">
            {clientes.map((c, i) => {
              const tel = c.tel || c.telefono;
              return (
                <article
                  key={c.id}
                  className="cliente-card"
                  onClick={() => openEdit(c)}
                >
                  <div className={`cliente-avatar ${getAvatarColor(i)}`}>
                    {(c.nombre || '?')[0].toUpperCase()}
                  </div>
                  <div className="cliente-info">
                    <h3 className="cliente-nombre">{c.nombre}</h3>
                    {c.empresa && (
                      <p className="cliente-empresa">{c.empresa}</p>
                    )}
                    {c.email && (
                      <p className="cliente-email">{c.email}</p>
                    )}
                    <div className="cliente-badges">
                      <span className={`badge badge-${c.estado || 'activo'}`}>
                        {ESTADOS.find((e) => e.value === (c.estado || 'activo'))?.label}
                      </span>
                      {c.etiqueta && (
                        <span className={`badge badge-etq-${c.etiqueta.toLowerCase()}`}>
                          {c.etiqueta}
                        </span>
                      )}
                    </div>
                    <p className="cliente-proyectos">
                      {countProyectos(c.id)} proyecto{countProyectos(c.id) !== 1 ? 's' : ''}
                    </p>
                    {tel && (
                      <a
                        href={`https://wa.me/${tel.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-whatsapp"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="wa-icon">💬</span>
                        WhatsApp
                      </a>
                    )}
                    {c.notas && (
                      <p className="cliente-notas">{c.notas}</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar cliente' : 'Nuevo cliente'}
      >
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nombre *</label>
            <input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre del cliente"
              required
            />
          </div>
          <div className="input-group">
            <label>Empresa</label>
            <input
              value={form.empresa}
              onChange={(e) => setForm({ ...form, empresa: e.target.value })}
              placeholder="Nombre de la empresa"
            />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@ejemplo.com"
            />
          </div>
          <div className="input-group">
            <label>Teléfono (WhatsApp)</label>
            <input
              value={form.tel}
              onChange={(e) => setForm({ ...form, tel: e.target.value })}
              placeholder="Ej: 573001234567"
            />
            <p className="input-hint">Ingresa el número sin + ni espacios. Ej: 573001234567</p>
          </div>
          <div className="input-group">
            <label>Estado</label>
            <select
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
            >
              {ESTADOS.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Etiqueta</label>
            <select
              value={form.etiqueta}
              onChange={(e) => setForm({ ...form, etiqueta: e.target.value })}
            >
              {ETIQUETAS.map((e) => (
                <option key={e.value || 'none'} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Notas internas</label>
            <textarea
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
              placeholder="Notas sobre el cliente..."
            />
          </div>
          <div className="modal-actions">
            {editingId && (
              <button type="button" className="btn-delete" onClick={handleDelete}>
                Eliminar
              </button>
            )}
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Guardar ✦
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
