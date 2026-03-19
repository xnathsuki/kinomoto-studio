import { useState, useRef } from 'react';
import { useStudio } from '../context/StudioContext';
import { useToast } from '../context/ToastContext';
import Topbar from '../components/Topbar';
import Modal from '../components/Modal';
import './Tareas.css';

const PRIORIDADES = ['Alta', 'Media', 'Baja'];

const ETIQUETAS_DISPONIBLES = [
  { nombre: 'Urgente', color: '--red', bg: '--red-dim' },
  { nombre: 'Cliente', color: '--pink', bg: '--pink-dim' },
  { nombre: 'Revisión', color: '--amber', bg: '--amber-dim' },
  { nombre: 'Entrega', color: '--mint', bg: '--mint-dim' },
  { nombre: 'Admin', color: '--lila', bg: '--lila-dim' },
  { nombre: 'Personal', color: '--text2', bg: '--surface3' },
];

const TIEMPO_OPCIONES = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '1h', value: 60 },
  { label: '1.5h', value: 90 },
  { label: '2h', value: 120 },
  { label: '3h', value: 180 },
  { label: '4h', value: 240 },
  { label: '6h', value: 360 },
  { label: '8h', value: 480 },
  { label: 'Personalizado', value: 'custom' },
];

const TIPOS_CAMPO = [
  { value: 'texto', label: 'Texto' },
  { value: 'numero', label: 'Número' },
  { value: 'fecha', label: 'Fecha' },
  { value: 'lista', label: 'Lista' },
  { value: 'checkbox', label: 'Checkbox' },
];

const MAX_ADJUNTOS = 5;

function getPriorityColor(prioridad) {
  if (prioridad === 'Alta') return 'red';
  if (prioridad === 'Media') return 'amber';
  return 'mint';
}

function formatTiempo(minutos) {
  if (minutos == null) return '';
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function getDeadlineInfo(deadline) {
  if (!deadline) return null;
  const d = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { type: 'vencida', label: 'Vencida', class: 'deadline-vencida' };
  if (diff === 0) return { type: 'hoy', label: 'Hoy', class: 'deadline-hoy' };
  if (diff === 1) return { type: 'manana', label: 'Mañana', class: 'deadline-manana' };
  if (diff <= 3) return { type: 'proximo', label: `${diff} días`, class: 'deadline-proximo' };
  return { type: 'normal', label: d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }), class: 'deadline-normal' };
}

function formatFechaRelativa(ts) {
  const now = Date.now();
  const diff = now - ts;
  const min = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (min < 1) return 'hace un momento';
  if (min < 60) return `hace ${min} min`;
  if (h < 24) return `hace ${h}h`;
  if (d === 1) return 'ayer';
  if (d < 7) return `hace ${d} días`;
  return new Date(ts).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
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
  tiempoEstimado: null,
  tiempoEstimadoCustom: '',
  proyectoId: '',
  contexto: '',
  deadline: '',
  adjuntos: [],
  camposPersonalizados: [],
  etiquetas: [],
});

function TaskItem({
  t,
  isCompletada,
  columnaKey,
  proyecto,
  expandedId,
  dragId,
  dragOverId,
  dragEnabledId,
  editingChecklistTitulo,
  newChecklistTitulo,
  editingChecklistItem,
  editingChecklistItemTexto,
  showAddChecklist,
  actividadExpandida,
  onToggle,
  onEdit,
  onMainClick,
  onLightbox,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  onDragHandleMouseDown,
  onDragHandleMouseUp,
  onEditChecklistTitulo,
  onDeleteChecklist,
  onToggleChecklistItem,
  onEditChecklistItem,
  onDeleteChecklistItem,
  onConvertirEnTarea,
  onAddChecklistItem,
  onAddChecklist,
  setEditingChecklistTitulo,
  setNewChecklistTitulo,
  setEditingChecklistItem,
  setEditingChecklistItemTexto,
  setShowAddChecklist,
  setActividadExpandida,
  setExpandedId,
}) {
  const color = getPriorityColor(t.prioridad);
  const isExpanded = expandedId === t.id;
  const hasContext = t.contexto || (t.adjuntos?.length > 0);
  const adjuntos = t.adjuntos ?? [];
  const camposConValor = (t.camposPersonalizados ?? []).filter((c) => c.valor !== '' && c.valor !== false && c.valor != null);

  return (
    <li
      className={`tarea-item ${t.completada ? 'completada' : ''} ${dragId === t.id ? 'dragging' : ''} ${dragOverId === t.id ? 'drag-over' : ''}`}
      draggable={dragEnabledId === t.id}
      onDragStart={(e) => onDragStart(e, t.id, columnaKey)}
      onDragOver={(e) => onDragOver(e, t.id)}
      onDragEnd={() => { onDragEnd(); onDragHandleMouseUp(); }}
      onDrop={(e) => onDrop(e, t.id, columnaKey)}
    >
      <span
        className="tarea-drag-handle"
        title="Arrastrar para reordenar (mantén 150ms)"
        onMouseDown={() => onDragHandleMouseDown(t.id)}
        onMouseUp={onDragHandleMouseUp}
        onMouseLeave={onDragHandleMouseUp}
      >
        ⠿
      </span>
      <button
        type="button"
        className={`tarea-checkbox ${t.completada ? 'checked' : ''}`}
        onClick={() => onToggle(t)}
        aria-label={t.completada ? 'Marcar pendiente' : 'Marcar completada'}
      >
        {t.completada && <span className="tarea-check">✓</span>}
      </button>
      <div className="tarea-content">
        <div
          className={`tarea-main ${isExpanded ? 'expanded' : ''}`}
          onClick={(e) => onMainClick(e, t, isExpanded)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setExpandedId(isExpanded ? null : t.id)}
        >
          <span className={`tarea-expand-icon ${isExpanded ? 'rotated' : ''}`} aria-hidden>▸</span>
          <div className="tarea-main-inner">
            <div className="tarea-main-row">
            {(t.etiquetas ?? []).slice(0, 3).map((etq) => {
              const def = ETIQUETAS_DISPONIBLES.find((e) => e.nombre === etq);
              return (
                <span
                  key={etq}
                  className="tarea-etiqueta-pill"
                  style={def ? { background: `var(${def.bg})`, color: `var(${def.color})` } : {}}
                >
                  {etq}
                </span>
              );
            })}
            {(t.etiquetas ?? []).length > 3 && (
              <span className="tarea-etiqueta-more">+{(t.etiquetas ?? []).length - 3}</span>
            )}
            <span className="tarea-texto">{t.texto}</span>
          </div>
          <div className="tarea-meta-row">
            {proyecto && <span className="tarea-proyecto">{proyecto.nombre}</span>}
            {(t.tiempoEstimado != null || t.tiempoReal != null) && (
              <span className="tarea-tiempo font-mono">
                {t.completada && t.tiempoEstimado != null && t.tiempoReal != null
                  ? `Estimado: ${formatTiempo(t.tiempoEstimado)} · Real: ${formatTiempo(t.tiempoReal)}`
                  : formatTiempo(t.tiempoEstimado)}
              </span>
            )}
            {getDeadlineInfo(t.deadline) && (
              <span className={`deadline-chip ${getDeadlineInfo(t.deadline).class}`}>
                {getDeadlineInfo(t.deadline).type === 'hoy' && '🔔 '}
                {getDeadlineInfo(t.deadline).label}
              </span>
            )}
          </div>
          </div>
        </div>
        <div className={`tarea-contexto-panel ${isExpanded ? 'expanded' : ''}`}>
          {hasContext || (t.checklists ?? []).length > 0 || camposConValor.length > 0 || (t.actividad ?? []).length > 0 ? (
            <>
              {t.contexto && <p className="tarea-contexto-texto">{t.contexto}</p>}
              {adjuntos.length > 0 && (
                <div className="tarea-adjuntos-grid">
                  {adjuntos.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      className="tarea-adjunto-thumb"
                      onClick={() => onLightbox(a.data)}
                    >
                      <img src={a.data} alt="" />
                    </button>
                  ))}
                </div>
              )}
              {(t.checklists ?? []).map((cl) => {
                const items = cl.items ?? [];
                const done = items.filter((i) => i.done).length;
                const pct = items.length ? Math.round((done / items.length) * 100) : 0;
                return (
                  <div key={cl.id} className="tarea-checklist">
                    <div className="checklist-header">
                      {editingChecklistTitulo === cl.id ? (
                        <input
                          value={newChecklistTitulo}
                          onChange={(e) => setNewChecklistTitulo(e.target.value)}
                          onBlur={() => { onEditChecklistTitulo(t.id, cl.id, newChecklistTitulo || cl.titulo); setEditingChecklistTitulo(null); setNewChecklistTitulo(''); }}
                          onKeyDown={(e) => e.key === 'Enter' && (onEditChecklistTitulo(t.id, cl.id, newChecklistTitulo || cl.titulo), setEditingChecklistTitulo(null), setNewChecklistTitulo(''))}
                          autoFocus
                        />
                      ) : (
                        <span onClick={() => { setEditingChecklistTitulo(cl.id); setNewChecklistTitulo(cl.titulo); }}>{cl.titulo}</span>
                      )}
                      <span className="checklist-pct font-mono">{pct}%</span>
                      <button type="button" className="checklist-delete" onClick={() => window.confirm('¿Eliminar checklist?') && onDeleteChecklist(t.id, cl.id)}>✕</button>
                    </div>
                    <div className="checklist-progress" style={{ background: 'var(--surface2)' }}>
                      <div className="checklist-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <ul className="checklist-items">
                      {items.map((item) => (
                        <li key={item.id} className={`checklist-item ${item.done ? 'done' : ''}`}>
                          <button type="button" className="checklist-item-cb" onClick={() => onToggleChecklistItem(t.id, cl.id, item.id, item, cl)}>
                            {item.done && '✓'}
                          </button>
                          {editingChecklistItem === item.id ? (
                            <input
                              value={editingChecklistItemTexto}
                              onBlur={() => { onEditChecklistItem(t.id, cl.id, item.id, editingChecklistItemTexto || item.texto); setEditingChecklistItem(null); setEditingChecklistItemTexto(''); }}
                              onKeyDown={(e) => e.key === 'Enter' && (onEditChecklistItem(t.id, cl.id, item.id, editingChecklistItemTexto || item.texto), setEditingChecklistItem(null), setEditingChecklistItemTexto(''))}
                              onChange={(e) => setEditingChecklistItemTexto(e.target.value)}
                              autoFocus
                            />
                          ) : (
                            <span onDoubleClick={() => { setEditingChecklistItem(item.id); setEditingChecklistItemTexto(item.texto); }}>{item.texto}</span>
                          )}
                          <span className="checklist-item-actions">
                            <button type="button" onClick={() => onConvertirEnTarea(t.id, cl.id, item.id)} title="Convertir en tarea">→ tarea</button>
                            <button type="button" onClick={() => onDeleteChecklistItem(t.id, cl.id, item.id)}>✕</button>
                          </span>
                        </li>
                      ))}
                    </ul>
                    <input
                      type="text"
                      placeholder="Agregar ítem..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { onAddChecklistItem(t.id, cl.id, e.target.value); e.target.value = ''; }
                      }}
                      className="checklist-add-input"
                    />
                  </div>
                );
              })}
              {showAddChecklist && isExpanded && expandedId === t.id && (
                <div className="checklist-add-inline">
                  <input
                    value={newChecklistTitulo}
                    onChange={(e) => setNewChecklistTitulo(e.target.value)}
                    placeholder="Título del checklist"
                    onKeyDown={(e) => e.key === 'Enter' && onAddChecklist()}
                    autoFocus
                  />
                  <button type="button" onClick={onAddChecklist}>Agregar ✦</button>
                  <button type="button" onClick={() => { setShowAddChecklist(false); setNewChecklistTitulo(''); }}>Cancelar</button>
                </div>
              )}
              <button type="button" className="btn-add-checklist" onClick={() => { setShowAddChecklist(true); setExpandedId(t.id); }}>
                + Agregar checklist
              </button>
              {camposConValor.length > 0 && (
                <div className="tarea-campos-panel">
                  {camposConValor.map((c) => (
                    <div key={c.id} className="tarea-campo-line">
                      {c.nombre} · {c.tipo === 'checkbox' ? (c.valor ? '✓' : '✗') : String(c.valor)}
                    </div>
                  ))}
                </div>
              )}
              {(t.actividad ?? []).length > 0 && (
                <div className="tarea-actividad">
                  <h4 className="actividad-title">✦ Historial</h4>
                  <ul className="actividad-list">
                    {(actividadExpandida === t.id ? t.actividad : t.actividad.slice(0, 10)).map((a) => (
                      <li key={a.id}>
                        <span className="actividad-dot" />
                        <span className="actividad-desc">{a.descripcion}</span>
                        <span className="actividad-fecha">{formatFechaRelativa(a.fecha)}</span>
                      </li>
                    ))}
                  </ul>
                  {t.actividad.length > 10 && actividadExpandida !== t.id && (
                    <button type="button" className="btn-ver-todo" onClick={() => setActividadExpandida(t.id)}>Ver todo</button>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="tarea-contexto-empty">Sin contexto agregado ✦</p>
          )}
        </div>
      </div>
      <button type="button" className="tarea-edit-btn" onClick={(e) => { e.stopPropagation(); onEdit(t); }} aria-label="Editar">✏</button>
      <span className={`priority-dot priority-${color}`} />
    </li>
  );
}

export default function Tareas({ onMenuClick }) {
  const {
    tareas,
    proyectos,
    columnasExtra,
    addTarea,
    editTarea,
    toggleTarea,
    deleteTarea,
    logActividad,
    reordenarTareas,
    addColumna,
    deleteColumna,
    moverTareaAColumna,
    addChecklist,
    editChecklistTitulo,
    deleteChecklist,
    addChecklistItem,
    toggleChecklistItem,
    editChecklistItem,
    deleteChecklistItem,
    convertirItemEnTarea,
    addCampoPersonalizado,
    editCampoPersonalizado,
    deleteCampoPersonalizado,
  } = useStudio();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm());
  const [expandedId, setExpandedId] = useState(null);
  const [filtroEtiqueta, setFiltroEtiqueta] = useState(null);
  const [editingChecklistTitulo, setEditingChecklistTitulo] = useState(null);
  const [editingChecklistItem, setEditingChecklistItem] = useState(null);
  const [newChecklistTitulo, setNewChecklistTitulo] = useState('');
  const [editingChecklistItemTexto, setEditingChecklistItemTexto] = useState('');
  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [newCampoForm, setNewCampoForm] = useState(null);
  const [tiempoRealTaskId, setTiempoRealTaskId] = useState(null);
  const [tiempoRealInput, setTiempoRealInput] = useState('');
  const [lightboxAdjunto, setLightboxAdjunto] = useState(null);
  const [actividadExpandida, setActividadExpandida] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [dragEnabledId, setDragEnabledId] = useState(null);
  const dragHoldTimer = useRef(null);
  const fileInputRef = useRef(null);

  const handleDragHandleMouseDown = (taskId) => {
    dragHoldTimer.current = setTimeout(() => setDragEnabledId(taskId), 150);
  };

  const handleDragHandleMouseUp = () => {
    if (dragHoldTimer.current) clearTimeout(dragHoldTimer.current);
    setDragEnabledId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.texto.trim()) return;
    const tiempoEst = form.tiempoEstimado === 'custom'
      ? (parseInt(form.tiempoEstimadoCustom, 10) || null)
      : (form.tiempoEstimado || null);
    const adjuntosFinal = editingId ? (tareas.find((x) => x.id === editingId)?.adjuntos ?? form.adjuntos) : form.adjuntos;
    const data = {
      texto: form.texto.trim(),
      prioridad: form.prioridad || 'Media',
      tiempoEstimado: tiempoEst,
      proyectoId: form.proyectoId || null,
      contexto: form.contexto?.trim() || null,
      adjuntos: adjuntosFinal,
      camposPersonalizados: form.camposPersonalizados,
      etiquetas: form.etiquetas,
      deadline: form.deadline || null,
    };
    if (editingId) {
      const prev = tareas.find((x) => x.id === editingId);
      editTarea(editingId, data);
      logActividad(editingId, 'editada', 'Tarea editada');
      const etiqChanged = JSON.stringify(prev?.etiquetas ?? []) !== JSON.stringify(data.etiquetas ?? []);
      if (etiqChanged) logActividad(editingId, 'etiqueta_cambiada', 'Etiquetas actualizadas');
      if ((data.adjuntos?.length ?? 0) > (prev?.adjuntos?.length ?? 0)) logActividad(editingId, 'foto_agregada', 'Foto adjuntada');
      showToast('Tarea actualizada');
    } else {
      addTarea(data);
      showToast('Tarea agregada');
    }
    setForm(defaultForm());
    setEditingId(null);
    setNewCampoForm(null);
    setModalOpen(false);
  };

  const openNew = () => {
    setEditingId(null);
    setForm(defaultForm());
    setNewCampoForm(null);
    setModalOpen(true);
  };

  const openEdit = (t) => {
    setEditingId(t.id);
    const te = typeof t.tiempoEstimado === 'number' ? t.tiempoEstimado : null;
    const inOpciones = TIEMPO_OPCIONES.some((o) => o.value !== 'custom' && o.value === te);
    setForm({
      texto: t.texto || '',
      prioridad: t.prioridad || 'Media',
      tiempoEstimado: te != null && !inOpciones ? 'custom' : te,
      tiempoEstimadoCustom: te != null && !inOpciones ? String(te) : '',
      proyectoId: t.proyectoId || '',
      contexto: t.contexto || '',
      deadline: t.deadline ? t.deadline.slice(0, 10) : '',
      adjuntos: t.adjuntos ?? [],
      camposPersonalizados: t.camposPersonalizados ?? [],
      etiquetas: t.etiquetas ?? [],
    });
    setNewCampoForm(null);
    setModalOpen(true);
  };

  const handleToggleTarea = (t) => {
    const wasCompleted = t.completada;
    toggleTarea(t.id);
    if (!wasCompleted) {
      logActividad(t.id, 'completada', 'Tarea marcada como completada');
      if (t.tiempoEstimado != null) {
        setTiempoRealTaskId(t.id);
        setTiempoRealInput('');
      }
    }
  };

  const handleTiempoRealSave = () => {
    if (!tiempoRealTaskId) return;
    const mins = parseInt(tiempoRealInput, 10);
    if (!isNaN(mins) && mins >= 0) {
      editTarea(tiempoRealTaskId, { tiempoReal: mins });
    }
    setTiempoRealTaskId(null);
    setTiempoRealInput('');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const current = editingId ? tareas.find((x) => x.id === editingId)?.adjuntos?.length ?? form.adjuntos.length : form.adjuntos.length;
    if (current >= MAX_ADJUNTOS) {
      showToast(`Máximo ${MAX_ADJUNTOS} imágenes`);
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      const adj = { id: crypto.randomUUID(), nombre: file.name, tipo: 'imagen', data: base64, fecha: Date.now() };
      if (editingId) {
        const t = tareas.find((x) => x.id === editingId);
        const updated = [...(t?.adjuntos ?? []), adj];
        editTarea(editingId, { adjuntos: updated });
        logActividad(editingId, 'foto_agregada', 'Foto adjuntada');
      } else {
        setForm((f) => ({ ...f, adjuntos: [...f.adjuntos, adj] }));
      }
    } catch (err) {
      showToast('Imagen demasiado grande para guardar ✦');
    }
    e.target.value = '';
  };

  const removeAdjunto = (adjuntoId) => {
    if (editingId) {
      const t = tareas.find((x) => x.id === editingId);
      editTarea(editingId, { adjuntos: (t?.adjuntos ?? []).filter((a) => a.id !== adjuntoId) });
    } else {
      setForm((f) => ({ ...f, adjuntos: f.adjuntos.filter((a) => a.id !== adjuntoId) }));
    }
  };

  const handleAddChecklist = () => {
    if (!newChecklistTitulo.trim()) return;
    addChecklist(expandedId, newChecklistTitulo.trim());
    logActividad(expandedId, 'checklist_agregado', `Checklist '${newChecklistTitulo.trim()}' agregado`);
    setNewChecklistTitulo('');
    setShowAddChecklist(false);
  };

  const handleAddChecklistItem = (tareaId, checklistId, texto) => {
    if (!texto?.trim()) return;
    addChecklistItem(tareaId, checklistId, texto.trim());
  };

  const handleToggleChecklistItem = (tareaId, checklistId, itemId, item, checklist) => {
    toggleChecklistItem(tareaId, checklistId, itemId);
    if (!item.done) {
      logActividad(tareaId, 'item_completado', `Ítem '${item.texto}' completado en '${checklist.titulo}'`);
    }
  };

  const handleConvertirEnTarea = (tareaId, checklistId, itemId) => {
    convertirItemEnTarea(tareaId, checklistId, itemId);
    showToast('Ítem convertido en tarea ✦');
  };

  const handleAddCampo = () => {
    if (!newCampoForm?.nombre?.trim()) return;
    const campo = {
      tipo: newCampoForm.tipo,
      nombre: newCampoForm.nombre.trim(),
      valor: newCampoForm.tipo === 'checkbox' ? false : '',
      opciones: newCampoForm.tipo === 'lista' ? (newCampoForm.opciones || '').split(',').map((o) => o.trim()).filter(Boolean) : undefined,
    };
    if (editingId) {
      addCampoPersonalizado(editingId, campo);
      logActividad(editingId, 'campo_agregado', `Campo '${campo.nombre}' agregado`);
    } else {
      setForm((f) => ({ ...f, camposPersonalizados: [...f.camposPersonalizados, { ...campo, id: crypto.randomUUID() }] }));
    }
    setNewCampoForm(null);
  };

  const getColumnaKey = (t) => (t.completada ? 'completada' : (t.columnaId ?? 'pendientes'));

  const handleDragStart = (e, id, columnaKey) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.setData('columnaKey', columnaKey);
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(id);
  };

  const handleDragEnd = () => {
    setDragId(null);
    setDragOverId(null);
  };

  const handleDrop = (e, targetId, targetColumnaKey) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    const sourceColumnaKey = e.dataTransfer.getData('columnaKey');
    if (!sourceId) {
      setDragId(null);
      setDragOverId(null);
      return;
    }
    const sourceTarea = tareas.find((t) => t.id === sourceId);
    if (!sourceTarea) return;

    const targetColumnaId = targetColumnaKey === 'completada' ? 'completada' : targetColumnaKey === 'pendientes' ? null : targetColumnaKey;

    if (sourceColumnaKey !== targetColumnaKey) {
      moverTareaAColumna(sourceId, targetColumnaId);
      if (sourceTarea.completada && targetColumnaKey !== 'completada') logActividad(sourceId, 'reactivada', 'Tarea reactivada');
      else if (!sourceTarea.completada && targetColumnaKey === 'completada') logActividad(sourceId, 'completada', 'Tarea marcada como completada');
      setDragId(null);
      setDragOverId(null);
      return;
    }

    const list = tareas
      .filter((t) => getColumnaKey(t) === targetColumnaKey)
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
    const sourceIdx = list.findIndex((t) => t.id === sourceId);
    const targetIdx = list.findIndex((t) => t.id === targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;
    const reordered = [...list];
    const [removed] = reordered.splice(sourceIdx, 1);
    reordered.splice(targetIdx, 0, removed);
    const otherTasks = tareas.filter((t) => getColumnaKey(t) !== targetColumnaKey);
    const fullReordered = [...otherTasks, ...reordered].sort((a, b) => {
      const aKey = getColumnaKey(a);
      const bKey = getColumnaKey(b);
      if (aKey !== bKey) return (aKey === 'completada' ? 1 : 0) - (bKey === 'completada' ? 1 : 0);
      const aIdx = reordered.findIndex((x) => x.id === a.id);
      const bIdx = reordered.findIndex((x) => x.id === b.id);
      if (aIdx >= 0 && bIdx >= 0) return aIdx - bIdx;
      return (a.orden ?? 0) - (b.orden ?? 0);
    });
    reordenarTareas(fullReordered);
    setDragId(null);
    setDragOverId(null);
  };

  const handleDropOnColumn = (e, columnaKey) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    const sourceColumnaKey = e.dataTransfer.getData('columnaKey');
    if (!sourceId || sourceColumnaKey === columnaKey) return;
    const targetColumnaId = columnaKey === 'completada' ? 'completada' : columnaKey === 'pendientes' ? null : columnaKey;
    moverTareaAColumna(sourceId, targetColumnaId);
    const sourceTarea = tareas.find((t) => t.id === sourceId);
    if (sourceTarea?.completada && columnaKey !== 'completada') logActividad(sourceId, 'reactivada', 'Tarea reactivada');
    else if (!sourceTarea?.completada && columnaKey === 'completada') logActividad(sourceId, 'completada', 'Tarea marcada como completada');
    setDragId(null);
    setDragOverId(null);
  };

  const handleMainClick = (e, t, isExpanded) => {
    const isHandle = e.target.closest('.tarea-drag-handle');
    if (isHandle) return;
    setExpandedId(isExpanded ? null : t.id);
    setShowAddChecklist(false);
  };

  const filterByEtiqueta = (list) =>
    filtroEtiqueta ? list.filter((t) => (t.etiquetas ?? []).includes(filtroEtiqueta)) : list;

  const columnas = [
    { id: 'pendientes', key: 'pendientes', nombre: 'Pendientes', color: '--mint', tasks: filterByEtiqueta(tareas.filter((t) => !t.completada && (t.columnaId ?? null) === null).sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))) },
    ...(columnasExtra ?? []).sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)).map((col) => ({
      id: col.id,
      key: col.id,
      nombre: col.nombre,
      color: col.color ?? '--lila',
      tasks: filterByEtiqueta(tareas.filter((t) => !t.completada && t.columnaId === col.id).sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))),
    })),
    { id: 'completadas', key: 'completada', nombre: 'Completadas', color: '--text2', tasks: filterByEtiqueta(tareas.filter((t) => t.completada).sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))) },
  ];

  const taskItemProps = (t) => ({
    t,
    isCompletada: t.completada,
    columnaKey: getColumnaKey(t),
    proyecto: proyectos.find((p) => p.id === t.proyectoId),
    expandedId,
    dragId,
    dragOverId,
    dragEnabledId,
    editingChecklistTitulo,
    newChecklistTitulo,
    editingChecklistItem,
    editingChecklistItemTexto,
    showAddChecklist,
    actividadExpandida,
    onToggle: handleToggleTarea,
    onEdit: openEdit,
    onMainClick: handleMainClick,
    onLightbox: setLightboxAdjunto,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragEnd: handleDragEnd,
    onDrop: handleDrop,
    onDragHandleMouseDown: handleDragHandleMouseDown,
    onDragHandleMouseUp: handleDragHandleMouseUp,
    onEditChecklistTitulo: editChecklistTitulo,
    onDeleteChecklist: deleteChecklist,
    onToggleChecklistItem: handleToggleChecklistItem,
    onEditChecklistItem: editChecklistItem,
    onDeleteChecklistItem: deleteChecklistItem,
    onConvertirEnTarea: handleConvertirEnTarea,
    onAddChecklistItem: handleAddChecklistItem,
    onAddChecklist: handleAddChecklist,
    setEditingChecklistTitulo,
    setNewChecklistTitulo,
    setEditingChecklistItem,
    setEditingChecklistItemTexto,
    setShowAddChecklist,
    setActividadExpandida,
    setExpandedId,
  });

  return (
    <div className="tareas-page">
      <Topbar title="Tareas" onMenuClick={onMenuClick} action={<button className="btn-primary" onClick={openNew}>+ Nueva tarea</button>} />
      <div className="tareas-filtro">
        <button className={`filtro-pill ${!filtroEtiqueta ? 'active' : ''}`} onClick={() => setFiltroEtiqueta(null)}>Todas</button>
        {ETIQUETAS_DISPONIBLES.map((e) => (
          <button key={e.nombre} className={`filtro-pill ${filtroEtiqueta === e.nombre ? 'active' : ''}`} onClick={() => setFiltroEtiqueta(filtroEtiqueta === e.nombre ? null : e.nombre)} style={filtroEtiqueta === e.nombre ? { background: `var(${e.bg})`, color: `var(${e.color})` } : {}}>
            {e.nombre}
          </button>
        ))}
      </div>
      <div className="tareas-content">
        <div className="tareas-kanban">
          {columnas.map((col) => (
            <section
              key={col.id}
              className={`tareas-block tareas-columna ${dragOverId ? 'drop-active' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => col.tasks.length === 0 && handleDropOnColumn(e, col.key)}
            >
              <h3 className="block-title" style={{ borderTopColor: col.key !== 'completada' ? `var(${col.color})` : undefined }}>
                {col.nombre} ({col.tasks.length})
              </h3>
              {col.tasks.length === 0 ? (
                <div
                  className="empty-state columna-drop-zone"
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                  onDrop={(e) => handleDropOnColumn(e, col.key)}
                >
                  <span className="empty-icon">{col.key === 'completada' ? '✓' : '📋'}</span>
                  <p>{col.key === 'pendientes' ? 'No hay tareas pendientes' : col.key === 'completada' ? 'No hay tareas completadas' : 'Arrastra tareas aquí'}</p>
                  {col.key === 'pendientes' && <button className="btn-primary btn-sm" onClick={openNew}>+ Agregar tarea</button>}
                </div>
              ) : (
                <ul className="tarea-list">
                  {col.tasks.map((t) => (
                    <TaskItem key={t.id} {...taskItemProps(t)} />
                  ))}
                </ul>
              )}
            </section>
          ))}
          <section className="tareas-block tareas-columna-add">
            <button type="button" className="btn-add-columna" onClick={() => { const n = window.prompt('Nombre de la columna', 'En progreso'); if (n?.trim()) addColumna(n.trim()); }}>
              + Columna
            </button>
          </section>
        </div>
      </div>

      {tiempoRealTaskId && (
        <div className="tiempo-real-prompt">
          <p>¿Cuánto tiempo tomó realmente?</p>
          <input type="number" min="0" value={tiempoRealInput} onChange={(e) => setTiempoRealInput(e.target.value)} placeholder="minutos" />
          <button type="button" onClick={handleTiempoRealSave}>Guardar</button>
          <button type="button" onClick={() => { setTiempoRealTaskId(null); setTiempoRealInput(''); }}>Omitir</button>
        </div>
      )}

      {lightboxAdjunto && (
        <div className="lightbox-overlay" onClick={() => setLightboxAdjunto(null)}>
          <img src={lightboxAdjunto} alt="" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingId(null); setForm(defaultForm()); setNewCampoForm(null); }} title={editingId ? 'Editar tarea' : 'Nueva tarea'}>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Texto *</label>
            <input value={form.texto} onChange={(e) => setForm({ ...form, texto: e.target.value })} placeholder="¿Qué tienes que hacer?" required />
          </div>
          <div className="input-group">
            <label>Prioridad</label>
            <select value={form.prioridad} onChange={(e) => setForm({ ...form, prioridad: e.target.value })}>
              {PRIORIDADES.map((p) => (<option key={p} value={p}>{p}</option>))}
            </select>
          </div>
          <div className="input-group">
            <label>Tiempo estimado</label>
            <select value={form.tiempoEstimado ?? ''} onChange={(e) => setForm({ ...form, tiempoEstimado: e.target.value === 'custom' ? 'custom' : (e.target.value ? parseInt(e.target.value, 10) : null), tiempoEstimadoCustom: '' })}>
              <option value="">Sin estimar</option>
              {TIEMPO_OPCIONES.filter((o) => o.value !== 'custom').map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
              <option value="custom">Personalizado</option>
            </select>
            {form.tiempoEstimado === 'custom' && (
              <input type="number" min="0" value={form.tiempoEstimadoCustom} onChange={(e) => setForm({ ...form, tiempoEstimadoCustom: e.target.value })} placeholder="minutos" />
            )}
          </div>
          <div className="input-group">
            <label>Fecha límite</label>
            <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            {form.deadline && (
              <p className="deadline-ayuda" style={{ color: getDeadlineInfo(form.deadline)?.class?.includes('vencida') ? 'var(--red)' : 'var(--mint)' }}>
                {(() => {
                  const info = getDeadlineInfo(form.deadline);
                  if (!info) return null;
                  if (info.type === 'vencida') return 'Venció hace días';
                  if (info.type === 'hoy') return 'Vence hoy';
                  if (info.type === 'manana') return 'Falta 1 día';
                  if (info.type === 'proximo') return `Faltan ${info.label}`;
                  const d = new Date(form.deadline);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  d.setHours(0, 0, 0, 0);
                  const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
                  return `Faltan ${diff} días`;
                })()}
              </p>
            )}
          </div>
          <div className="input-group">
            <label>Proyecto vinculado</label>
            <select value={form.proyectoId} onChange={(e) => setForm({ ...form, proyectoId: e.target.value })}>
              <option value="">Sin proyecto</option>
              {proyectos.map((p) => (<option key={p.id} value={p.id}>{p.nombre}</option>))}
            </select>
          </div>
          <div className="input-group">
            <label>Contexto</label>
            <textarea value={form.contexto} onChange={(e) => setForm({ ...form, contexto: e.target.value })} placeholder="Agrega detalles, referencias o instrucciones..." />
          </div>
          <div className="input-group">
            <label>Etiquetas</label>
            <div className="etiquetas-pills">
              {ETIQUETAS_DISPONIBLES.map((e) => (
                <button
                  key={e.nombre}
                  type="button"
                  className={`etiqueta-pill ${form.etiquetas.includes(e.nombre) ? 'active' : ''}`}
                  style={form.etiquetas.includes(e.nombre) ? { background: `var(${e.bg})`, color: `var(${e.color})`, borderColor: `var(${e.color})` } : {}}
                  onClick={() => setForm((f) => ({ ...f, etiquetas: f.etiquetas.includes(e.nombre) ? f.etiquetas.filter((x) => x !== e.nombre) : [...f.etiquetas, e.nombre] }))}
                >
                  {e.nombre}
                </button>
              ))}
            </div>
          </div>
          <div className="input-group">
            <label>Campos personalizados</label>
            {(editingId ? (tareas.find((x) => x.id === editingId)?.camposPersonalizados ?? []) : form.camposPersonalizados).map((c) => (
              <div key={c.id} className="campo-row">
                <span className="campo-nombre">{c.nombre}</span>
                <span className="campo-tipo-badge">{c.tipo}</span>
                {c.tipo === 'texto' && (
                  <input type="text" value={c.valor} onChange={(e) => editingId ? editCampoPersonalizado(editingId, c.id, e.target.value) : setForm((f) => ({ ...f, camposPersonalizados: f.camposPersonalizados.map((x) => x.id === c.id ? { ...x, valor: e.target.value } : x) }))} />
                )}
                {c.tipo === 'numero' && (
                  <input type="number" value={c.valor} onChange={(e) => editingId ? editCampoPersonalizado(editingId, c.id, parseFloat(e.target.value) || 0) : setForm((f) => ({ ...f, camposPersonalizados: f.camposPersonalizados.map((x) => x.id === c.id ? { ...x, valor: parseFloat(e.target.value) || 0 } : x) }))} />
                )}
                {c.tipo === 'fecha' && (
                  <input type="date" value={c.valor} onChange={(e) => editingId ? editCampoPersonalizado(editingId, c.id, e.target.value) : setForm((f) => ({ ...f, camposPersonalizados: f.camposPersonalizados.map((x) => x.id === c.id ? { ...x, valor: e.target.value } : x) }))} />
                )}
                {c.tipo === 'lista' && (
                  <select value={c.valor} onChange={(e) => editingId ? editCampoPersonalizado(editingId, c.id, e.target.value) : setForm((f) => ({ ...f, camposPersonalizados: f.camposPersonalizados.map((x) => x.id === c.id ? { ...x, valor: e.target.value } : x) }))}>
                    <option value="">Seleccionar</option>
                    {(c.opciones ?? []).map((o) => (<option key={o} value={o}>{o}</option>))}
                  </select>
                )}
                {c.tipo === 'checkbox' && (
                  <label className="campo-checkbox-switch">
                    <input type="checkbox" checked={!!c.valor} onChange={(e) => editingId ? editCampoPersonalizado(editingId, c.id, e.target.checked) : setForm((f) => ({ ...f, camposPersonalizados: f.camposPersonalizados.map((x) => x.id === c.id ? { ...x, valor: e.target.checked } : x) }))} />
                    <span />
                  </label>
                )}
                <button type="button" className="campo-delete" onClick={() => editingId ? deleteCampoPersonalizado(editingId, c.id) : setForm((f) => ({ ...f, camposPersonalizados: f.camposPersonalizados.filter((x) => x.id !== c.id) }))}>✕</button>
              </div>
            ))}
            {!newCampoForm ? (
              <button type="button" className="btn-ghost" onClick={() => setNewCampoForm({ nombre: '', tipo: 'texto', opciones: '' })}>+ Agregar campo</button>
            ) : (
              <div className="new-campo-form">
                <input value={newCampoForm.nombre} onChange={(e) => setNewCampoForm({ ...newCampoForm, nombre: e.target.value })} placeholder="Nombre (ej: Ronda de revisión)" />
                <select value={newCampoForm.tipo} onChange={(e) => setNewCampoForm({ ...newCampoForm, tipo: e.target.value })}>
                  {TIPOS_CAMPO.map((tc) => (<option key={tc.value} value={tc.value}>{tc.label}</option>))}
                </select>
                {newCampoForm.tipo === 'lista' && (
                  <input value={newCampoForm.opciones} onChange={(e) => setNewCampoForm({ ...newCampoForm, opciones: e.target.value })} placeholder="Opciones separadas por coma" />
                )}
                <button type="button" onClick={handleAddCampo}>Agregar ✦</button>
                <button type="button" onClick={() => setNewCampoForm(null)}>Cancelar</button>
              </div>
            )}
          </div>
          <div className="input-group">
            <label>Archivos adjuntos</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            {(editingId ? tareas.find((x) => x.id === editingId)?.adjuntos ?? [] : form.adjuntos).length >= MAX_ADJUNTOS ? (
              <p className="adjuntos-limit">Máximo {MAX_ADJUNTOS} imágenes</p>
            ) : (
              <button type="button" className="btn-ghost btn-select-file" onClick={() => fileInputRef.current?.click()}>+ Adjuntar imagen</button>
            )}
            <div className="adjuntos-grid">
              {(editingId ? tareas.find((x) => x.id === editingId)?.adjuntos ?? [] : form.adjuntos).map((a) => (
                <div key={a.id} className="adjunto-thumb-wrap">
                  <img src={a.data} alt="" className="adjunto-thumb" />
                  <button type="button" className="adjunto-remove" onClick={() => removeAdjunto(a.id)}>✕</button>
                </div>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            {editingId && (
              <button type="button" className="btn-delete" onClick={() => window.confirm('¿Eliminar esta tarea?') && (deleteTarea(editingId), setModalOpen(false), setEditingId(null), setForm(defaultForm()), setNewCampoForm(null), showToast('Tarea eliminada'))}>
                Eliminar tarea
              </button>
            )}
            <button type="button" className="btn-ghost" onClick={() => { setModalOpen(false); setEditingId(null); setForm(defaultForm()); setNewCampoForm(null); }}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar ✦</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
