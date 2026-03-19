import { useState, useRef } from 'react';
import { useStudio } from '../context/StudioContext';
import { useToast } from '../context/ToastContext';
import Topbar from '../components/Topbar';
import Modal from '../components/Modal';
import './Tareas.css';

const PRIORIDADES = ['Alta', 'Media', 'Baja'];

function getPriorityColor(prioridad) {
  if (prioridad === 'Alta') return 'red';
  if (prioridad === 'Media') return 'amber';
  return 'mint';
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const defaultForm = () => ({
  texto: '',
  prioridad: 'Media',
  tiempoEstimado: '',
  proyectoId: '',
  contexto: '',
  foto: null,
});

export default function Tareas() {
  const { tareas, proyectos, addTarea, editTarea, toggleTarea, deleteTarea } = useStudio();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm());
  const [expandedId, setExpandedId] = useState(null);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.texto.trim()) return;
    const data = {
      texto: form.texto.trim(),
      prioridad: form.prioridad || 'Media',
      tiempoEstimado: form.tiempoEstimado || null,
      proyectoId: form.proyectoId || null,
      contexto: form.contexto?.trim() || null,
      foto: form.foto || null,
    };
    if (editingId) {
      editTarea(editingId, data);
      showToast('Tarea actualizada');
    } else {
      addTarea(data);
      showToast('Tarea agregada');
    }
    setForm(defaultForm());
    setEditingId(null);
    setModalOpen(false);
  };

  const openNew = () => {
    setEditingId(null);
    setForm(defaultForm());
    setModalOpen(true);
  };

  const openEdit = (t) => {
    setEditingId(t.id);
    setForm({
      texto: t.texto || '',
      prioridad: t.prioridad || 'Media',
      tiempoEstimado: t.tiempoEstimado || '',
      proyectoId: t.proyectoId || '',
      contexto: t.contexto || '',
      foto: t.foto || null,
    });
    setModalOpen(true);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const base64 = await fileToBase64(file);
      setForm((f) => ({ ...f, foto: base64 }));
    } catch (err) {
      showToast('Error al cargar imagen');
    }
  };

  const pendientes = tareas.filter((t) => !t.completada);
  const completadas = tareas.filter((t) => t.completada);

  const TaskItem = ({ t }) => {
    const proyecto = proyectos.find((p) => p.id === t.proyectoId);
    const color = getPriorityColor(t.prioridad);
    const isExpanded = expandedId === t.id;
    const hasContext = t.contexto || t.foto;

    return (
      <li className={`tarea-item ${t.completada ? 'completada' : ''}`}>
        <button
          type="button"
          className={`tarea-checkbox ${t.completada ? 'checked' : ''}`}
          onClick={() => toggleTarea(t.id)}
          aria-label={t.completada ? 'Marcar pendiente' : 'Marcar completada'}
        >
          {t.completada && <span className="tarea-check">✓</span>}
        </button>
        <div className="tarea-content">
          <div
            className="tarea-main"
            onClick={() => setExpandedId(isExpanded ? null : t.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setExpandedId(isExpanded ? null : t.id)}
          >
            <span className="tarea-texto">{t.texto}</span>
            {proyecto && (
              <span className="tarea-proyecto">{proyecto.nombre}</span>
            )}
            {t.tiempoEstimado && (
              <span className="tarea-tiempo font-mono">{t.tiempoEstimado}</span>
            )}
          </div>
          <div className={`tarea-contexto-panel ${isExpanded ? 'expanded' : ''}`}>
            {hasContext ? (
              <>
                {t.contexto && (
                  <p className="tarea-contexto-texto">{t.contexto}</p>
                )}
                {t.foto && (
                  <img src={t.foto} alt="" className="tarea-contexto-foto" />
                )}
              </>
            ) : (
              <p className="tarea-contexto-empty">Sin contexto agregado ✦</p>
            )}
          </div>
        </div>
        <button
          type="button"
          className="tarea-edit-btn"
          onClick={(e) => { e.stopPropagation(); openEdit(t); }}
          aria-label="Editar tarea"
          title="Editar"
        >
          ✏
        </button>
        <span className={`priority-dot priority-${color}`} />
      </li>
    );
  };

  return (
    <div className="tareas-page">
      <Topbar
        title="Tareas"
        action={
          <button className="btn-primary" onClick={openNew}>
            + Nueva tarea
          </button>
        }
      />

      <div className="tareas-content">
        <div className="tareas-blocks">
          <section className="tareas-block">
            <h3 className="block-title">Pendientes</h3>
            {pendientes.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">✅</span>
                <p>No hay tareas pendientes</p>
                <p className="empty-hint">¡Todo al día! O agrega una nueva</p>
                <button className="btn-primary btn-sm" onClick={openNew}>
                  + Agregar tarea
                </button>
              </div>
            ) : (
              <ul className="tarea-list">
                {pendientes.map((t) => (
                  <TaskItem key={t.id} t={t} />
                ))}
              </ul>
            )}
          </section>

          <section className="tareas-block">
            <h3 className="block-title">Completadas</h3>
            {completadas.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">✓</span>
                <p>No hay tareas completadas</p>
                <p className="empty-hint">Marca tareas como hechas para verlas aquí</p>
              </div>
            ) : (
              <ul className="tarea-list">
                {completadas.map((t) => (
                  <TaskItem key={t.id} t={t} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingId(null); setForm(defaultForm()); }}
        title={editingId ? 'Editar tarea' : 'Nueva tarea'}
      >
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Texto *</label>
            <input
              value={form.texto}
              onChange={(e) => setForm({ ...form, texto: e.target.value })}
              placeholder="¿Qué tienes que hacer?"
              required
            />
          </div>
          <div className="input-group">
            <label>Prioridad</label>
            <select
              value={form.prioridad}
              onChange={(e) => setForm({ ...form, prioridad: e.target.value })}
            >
              {PRIORIDADES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Tiempo estimado</label>
            <input
              value={form.tiempoEstimado}
              onChange={(e) => setForm({ ...form, tiempoEstimado: e.target.value })}
              placeholder="ej: 2h"
            />
          </div>
          <div className="input-group">
            <label>Proyecto vinculado</label>
            <select
              value={form.proyectoId}
              onChange={(e) => setForm({ ...form, proyectoId: e.target.value })}
            >
              <option value="">Sin proyecto</option>
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Contexto</label>
            <textarea
              value={form.contexto}
              onChange={(e) => setForm({ ...form, contexto: e.target.value })}
              placeholder="Agrega detalles, referencias o instrucciones para esta tarea..."
            />
          </div>
          <div className="input-group">
            <label>Foto</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {form.foto ? (
              <div className="tarea-foto-preview">
                <img src={form.foto} alt="Preview" className="tarea-foto-thumb" />
                <button
                  type="button"
                  className="btn-quitar-foto"
                  onClick={() => setForm((f) => ({ ...f, foto: null }))}
                >
                  ✕ Quitar foto
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn-ghost btn-select-file"
                onClick={() => fileInputRef.current?.click()}
              >
                Seleccionar imagen
              </button>
            )}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={() => { setModalOpen(false); setEditingId(null); setForm(defaultForm()); }}>
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
