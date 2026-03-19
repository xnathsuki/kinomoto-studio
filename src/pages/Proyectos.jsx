import { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { useToast } from '../context/ToastContext';
import Topbar from '../components/Topbar';
import Modal from '../components/Modal';
import './Proyectos.css';

const COLUMNAS = [
  { id: 'Por iniciar', color: 'lila' },
  { id: 'En proceso', color: 'pink' },
  { id: 'En revisión', color: 'amber' },
  { id: 'Entregado', color: 'mint' },
  { id: 'Pagado', color: 'text3' },
];

const TIPOS = [
  'Branding', 'Logo', 'Social Media', 'Web', 'Ilustración',
  'Packaging', 'Editorial', 'Otro',
];

function getUrgencyClass(deadline) {
  if (!deadline) return 'mint';
  const d = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
  if (diff <= 1) return 'red';
  if (diff <= 3) return 'amber';
  return 'mint';
}

export default function Proyectos({ onMenuClick }) {
  const { clientes, proyectos, addProyecto, editProyecto, deleteProyecto } = useStudio();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [preselectedStatus, setPreselectedStatus] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    clienteId: '',
    tipo: '',
    deadline: '',
    monto: '',
    status: 'Por iniciar',
    avance: 0,
    descripcion: '',
  });

  const resetForm = () => ({
    nombre: '',
    clienteId: '',
    tipo: '',
    deadline: '',
    monto: '',
    status: 'Por iniciar',
    avance: 0,
    descripcion: '',
  });

  const openNew = (status) => {
    setEditingId(null);
    setForm({
      ...resetForm(),
      status: status || 'Por iniciar',
    });
    setPreselectedStatus(status);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      nombre: p.nombre || '',
      clienteId: p.clienteId || '',
      tipo: p.tipo || '',
      deadline: p.deadline ? p.deadline.slice(0, 10) : '',
      monto: p.monto ?? '',
      status: p.status || 'Por iniciar',
      avance: p.avance ?? 0,
      descripcion: p.descripcion || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    const data = {
      ...form,
      clienteId: form.clienteId || null,
      monto: form.monto ? Number(form.monto) : null,
      avance: Number(form.avance) || 0,
    };
    if (editingId) {
      editProyecto(editingId, data);
      showToast('Proyecto actualizado');
    } else {
      addProyecto(data);
      showToast('Proyecto agregado');
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (!editingId) return;
    if (window.confirm('¿Eliminar este proyecto?')) {
      deleteProyecto(editingId);
      showToast('Proyecto eliminado');
      setModalOpen(false);
    }
  };

  const getProyectosByStatus = (status) =>
    proyectos.filter((p) => (p.status || 'Por iniciar') === status);

  return (
    <div className="proyectos-page">
      <Topbar
        title="Proyectos"
        onMenuClick={onMenuClick}
        action={
          <button className="btn-primary" onClick={() => openNew()}>
            + Nuevo proyecto
          </button>
        }
      />

      <div className="proyectos-content">
        {proyectos.length === 0 ? (
          <div className="empty-state-large">
            <span className="empty-icon">📁</span>
            <h3>No hay proyectos aún</h3>
            <p>Crea tu primer proyecto para organizar tu trabajo</p>
            <button className="btn-primary" onClick={() => openNew()}>
              + Agregar proyecto
            </button>
          </div>
        ) : (
          <div className="kanban">
            {COLUMNAS.map((col) => {
              const items = getProyectosByStatus(col.id);
              return (
                <div key={col.id} className="kanban-col">
                  <h3 className={`kanban-col-title col-${col.color}`}>{col.id}</h3>
                  <div className="kanban-cards">
                    {items.map((p) => {
                      const cliente = clientes.find((c) => c.id === p.clienteId);
                      const urgency = getUrgencyClass(p.deadline);
                      return (
                        <div
                          key={p.id}
                          className="proyecto-card"
                          onClick={() => openEdit(p)}
                        >
                          <h4 className="proyecto-nombre">{p.nombre}</h4>
                          <p className="proyecto-meta">
                            {cliente?.nombre || 'Sin cliente'}
                            {p.tipo && ` · ${p.tipo}`}
                          </p>
                          {p.deadline && (
                            <span className={`chip chip-${urgency}`}>
                              {new Date(p.deadline).toLocaleDateString('es-ES')}
                            </span>
                          )}
                          <div className="proyecto-progress">
                            <div
                              className="proyecto-progress-fill"
                              style={{ width: `${p.avance ?? 0}%` }}
                            />
                          </div>
                          <span className="proyecto-pct font-mono" style={{ color: 'var(--lila)' }}>
                            {p.avance ?? 0}%
                          </span>
                          {p.monto != null && p.monto > 0 && (
                            <span className="proyecto-monto font-mono">
                              ${Number(p.monto).toLocaleString()}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <button
                    className="kanban-add"
                    onClick={() => openNew(col.id)}
                  >
                    + agregar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar proyecto' : 'Nuevo proyecto'}
      >
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nombre *</label>
            <input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre del proyecto"
              required
            />
          </div>
          <div className="input-group">
            <label>Cliente</label>
            <select
              value={form.clienteId}
              onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
            >
              <option value="">Sin cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Tipo</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            >
              <option value="">Seleccionar</option>
              {TIPOS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Deadline</label>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label>Monto</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.monto}
              onChange={(e) => setForm({ ...form, monto: e.target.value })}
              placeholder="0"
            />
          </div>
          <div className="input-group">
            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {COLUMNAS.map((c) => (
                <option key={c.id} value={c.id}>{c.id}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Avance (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.avance}
              onChange={(e) => setForm({ ...form, avance: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label>Descripción / Entregables</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Descripción del proyecto..."
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
