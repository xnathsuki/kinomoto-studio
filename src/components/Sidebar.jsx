import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStudio } from '../context/StudioContext';
import { useToast } from '../context/ToastContext';
import { useFinanzasAuth } from '../context/FinanzasAuthContext';
import Modal from './Modal';
import './Sidebar.css';

const PASSWORD_FINANZAS = 'kinomoto2024';

const navItems = [
  { path: '/', icon: '🌸', label: 'Dashboard' },
  { path: '/clientes', icon: '👥', label: 'Clientes' },
  { path: '/proyectos', icon: '📁', label: 'Proyectos' },
  { path: '/tareas', icon: '✅', label: 'Tareas' },
  { path: '/calendario', icon: '📅', label: 'Calendario' },
  { path: '/finanzas', icon: '💰', label: 'Finanzas', protected: true },
];

const MOODS = ['🔥', '🌸', '😴', '⚡', '🎨'];

export default function Sidebar() {
  const { mood, setMood } = useStudio();
  const { showToast } = useToast();
  const { isAuthenticated: finanzasAuth, setIsAuthenticated: setFinanzasAuth } = useFinanzasAuth();
  const navigate = useNavigate();
  const [finanzasModalOpen, setFinanzasModalOpen] = useState(false);
  const [finanzasPassword, setFinanzasPassword] = useState('');

  const handleFinanzasClick = (e) => {
    e.preventDefault();
    if (finanzasAuth) {
      navigate('/finanzas');
    } else {
      setFinanzasModalOpen(true);
      setFinanzasPassword('');
    }
  };

  const handleFinanzasSubmit = (e) => {
    e?.preventDefault?.();
    if (finanzasPassword === PASSWORD_FINANZAS) {
      setFinanzasAuth(true);
      setFinanzasModalOpen(false);
      setFinanzasPassword('');
      navigate('/finanzas');
    } else {
      showToast('Contraseña incorrecta ✦');
      setFinanzasPassword('');
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-logo">✦ Kinomoto Studio</h1>
        <p className="sidebar-subtitle">diseño con propósito ✦</p>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) =>
          item.protected ? (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              onClick={handleFinanzasClick}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              end={item.path === '/'}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          )
        )}
      </nav>

      <Modal
        isOpen={finanzasModalOpen}
        onClose={() => { setFinanzasModalOpen(false); setFinanzasPassword(''); }}
        title="✦ Acceso restringido"
      >
        <form onSubmit={handleFinanzasSubmit}>
          <p className="modal-subtitle">Ingresa tu contraseña para ver Finanzas</p>
          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={finanzasPassword}
              onChange={(e) => setFinanzasPassword(e.target.value)}
              placeholder="Contraseña"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleFinanzasSubmit()}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={() => setFinanzasModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Entrar ✦
            </button>
          </div>
        </form>
      </Modal>

      <div className="sidebar-mood">
        <label className="mood-label">✦ Tu mood hoy</label>
        <div className="mood-emojis">
          {MOODS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={`mood-btn ${mood === emoji ? 'active' : ''}`}
              onClick={() => setMood(mood === emoji ? null : emoji)}
              aria-label={`Mood ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
