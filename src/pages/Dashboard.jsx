import { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { useToast } from '../context/ToastContext';
import Topbar from '../components/Topbar';
import Modal from '../components/Modal';
import './Dashboard.css';

const PASSWORD_COBRADO = 'kinomoto2024';

const MOOD_MESSAGES = {
  '🔥': '¡En llamas! Día de máxima productividad.',
  '🌸': 'Flujo tranquilo, creatividad bloom.',
  '😴': 'Modo café x3. Igual lo logramos.',
  '⚡': 'Energía total. ¡A conquistar deadlines!',
  '🎨': 'En modo artístico puro. Magia incoming.',
};

function getUrgencyColor(deadline) {
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

function getPriorityColor(prioridad) {
  if (prioridad === 'Alta') return 'red';
  if (prioridad === 'Media') return 'amber';
  return 'mint';
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function Dashboard({ onMenuClick }) {
  const { clientes, proyectos, tareas, mood } = useStudio();
  const { showToast } = useToast();
  const [cobradoRevealed, setCobradoRevealed] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const proyectosActivos = proyectos.filter((p) => p.status !== 'Pagado');
  const tareasPendientes = tareas.filter((t) => !t.completada);
  const totalCobrado = proyectos
    .filter((p) => p.status === 'Pagado' && p.monto)
    .reduce((sum, p) => sum + Number(p.monto), 0);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const en7Dias = new Date(hoy);
  en7Dias.setDate(en7Dias.getDate() + 7);

  const proximosDeadlines = proyectos
    .filter((p) => {
      if (!p.deadline) return false;
      const d = new Date(p.deadline);
      return d >= hoy && d <= en7Dias;
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  const tareasDeHoy = tareasPendientes.slice(0, 4);

  const mensajeMotivacional = mood ? MOOD_MESSAGES[mood] : 'Bienvenida a tu estudio ✦';

  const handlePasswordSubmit = (e) => {
    e?.preventDefault?.();
    if (passwordInput === PASSWORD_COBRADO) {
      setCobradoRevealed(true);
      setPasswordModalOpen(false);
      setPasswordInput('');
    } else {
      showToast('Contraseña incorrecta ✦');
      setPasswordInput('');
    }
  };

  return (
    <div className="dashboard-page">
      <Topbar title="Dashboard" onMenuClick={onMenuClick} />

      <div className="dashboard-content">
        <p className="dashboard-mood">{mensajeMotivacional}</p>

        <div className="stats-grid">
          <div className="stat-card stat-pink">
            <span className="stat-value">{proyectosActivos.length}</span>
            <span className="stat-label">Proyectos activos</span>
          </div>
          <div className="stat-card stat-lila">
            <span className="stat-value">{clientes.length}</span>
            <span className="stat-label">Total clientes</span>
          </div>
          <div className="stat-card stat-mint">
            <span className="stat-value">{tareasPendientes.length}</span>
            <span className="stat-label">Tareas pendientes</span>
          </div>
          <div className="stat-card stat-amber">
            <div className="stat-cobrado-row">
              <span
                className={`stat-value font-mono ${!cobradoRevealed ? 'stat-hidden' : ''}`}
                style={!cobradoRevealed ? { color: 'var(--amber)' } : {}}
              >
                {cobradoRevealed ? `$${totalCobrado.toLocaleString()}` : '••••••'}
              </span>
              <button
                type="button"
                className="stat-eye-btn"
                onClick={() => {
                  if (cobradoRevealed) return;
                  setPasswordModalOpen(true);
                }}
                aria-label="Revelar monto"
              >
                <EyeIcon />
              </button>
            </div>
            <span className="stat-label">Total cobrado</span>
          </div>
        </div>

        <div className="dashboard-widgets">
          <div className="widget">
            <h3 className="widget-title">Próximos deadlines</h3>
            {proximosDeadlines.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📅</span>
                <p>No hay deadlines en los próximos 7 días</p>
                <p className="empty-hint">Agrega proyectos con fechas para verlos aquí</p>
              </div>
            ) : (
              <ul className="deadline-list">
                {proximosDeadlines.map((p) => {
                  const cliente = clientes.find((c) => c.id === p.clienteId);
                  const urgency = getUrgencyColor(p.deadline);
                  return (
                    <li key={p.id} className="deadline-item">
                      <div>
                        <strong>{p.nombre}</strong>
                        <span className="deadline-cliente">
                          {cliente?.nombre || 'Sin cliente'}
                        </span>
                      </div>
                      <span className={`chip chip-${urgency}`}>
                        {p.deadline
                          ? new Date(p.deadline).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                            })
                          : '—'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="widget">
            <h3 className="widget-title">Tareas de hoy</h3>
            {tareasDeHoy.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">✅</span>
                <p>No hay tareas pendientes</p>
                <p className="empty-hint">¡Genial! O agrega nuevas tareas</p>
              </div>
            ) : (
              <ul className="task-list">
                {tareasDeHoy.map((t) => (
                  <li key={t.id} className="task-item">
                    <span
                      className={`priority-dot priority-${getPriorityColor(t.prioridad)}`}
                    />
                    <span className="task-text">{t.texto}</span>
                    {t.tiempoEstimado && (
                      <span className="task-time font-mono">{t.tiempoEstimado}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="widget widget-full">
          <h3 className="widget-title">Progreso de proyectos</h3>
          {proyectosActivos.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📁</span>
              <p>No hay proyectos activos</p>
              <p className="empty-hint">Crea tu primer proyecto para ver el progreso</p>
            </div>
          ) : (
            <div className="progress-list">
              {proyectosActivos.slice(0, 3).map((p) => (
                <div key={p.id} className="progress-item">
                  <div className="progress-header">
                    <span className="progress-name">{p.nombre}</span>
                    <span className="progress-pct font-mono" style={{ color: 'var(--lila)' }}>
                      {p.avance ?? 0}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${p.avance ?? 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={passwordModalOpen}
        onClose={() => {
          setPasswordModalOpen(false);
          setPasswordInput('');
        }}
        title="Ver total cobrado"
      >
        <form onSubmit={handlePasswordSubmit}>
          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Contraseña"
              autoFocus
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={() => setPasswordModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Ver monto ✦
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
