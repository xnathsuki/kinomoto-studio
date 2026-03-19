import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudio } from '../context/StudioContext';
import { useToast } from '../context/ToastContext';
import { useFinanzasAuth } from '../context/FinanzasAuthContext';
import Topbar from '../components/Topbar';
import Modal from '../components/Modal';
import './Finanzas.css';

const PASSWORD_FINANZAS = 'kinomoto2024';

export default function Finanzas({ onMenuClick }) {
  const { clientes, proyectos } = useStudio();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated } = useFinanzasAuth();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setPasswordModalOpen(true);
    }
  }, [isAuthenticated]);

  const handlePasswordSubmit = (e) => {
    e?.preventDefault?.();
    if (passwordInput === PASSWORD_FINANZAS) {
      setIsAuthenticated(true);
      setPasswordModalOpen(false);
      setPasswordInput('');
    } else {
      showToast('Contraseña incorrecta ✦');
      setPasswordInput('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="finanzas-page">
        <Topbar title="Finanzas" onMenuClick={onMenuClick} />
        <Modal
          isOpen={passwordModalOpen}
          onClose={() => navigate('/')}
          title="✦ Acceso restringido"
        >
          <form onSubmit={handlePasswordSubmit}>
            <p className="modal-subtitle">Ingresa tu contraseña para ver Finanzas</p>
            <div className="input-group">
              <label>Contraseña</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Contraseña"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={() => navigate('/')}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                Entrar ✦
              </button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  const totalCobrado = proyectos
    .filter((p) => p.status === 'Pagado' && p.monto)
    .reduce((sum, p) => sum + Number(p.monto), 0);

  const totalProyectado = proyectos
    .filter((p) => p.monto)
    .reduce((sum, p) => sum + Number(p.monto), 0);

  const pendiente = totalProyectado - totalCobrado;

  const proyectosConMonto = proyectos.filter((p) => p.monto != null && p.monto > 0);

  function getMontoColor(status) {
    if (status === 'Pagado') return 'var(--mint)';
    if (status === 'Entregado') return 'var(--amber)';
    return 'var(--lila)';
  }

  return (
    <div className="finanzas-page">
      <Topbar title="Finanzas" onMenuClick={onMenuClick} />

      <div className="finanzas-content">
        <div className="finanzas-stats">
          <div className="fin-stat stat-mint">
            <span className="fin-value font-mono">${totalCobrado.toLocaleString()}</span>
            <span className="fin-label">Total cobrado</span>
          </div>
          <div className="fin-stat stat-amber">
            <span className="fin-value font-mono">${pendiente.toLocaleString()}</span>
            <span className="fin-label">Pendiente</span>
          </div>
          <div className="fin-stat stat-lila">
            <span className="fin-value font-mono">${totalProyectado.toLocaleString()}</span>
            <span className="fin-label">Total proyectado</span>
          </div>
        </div>

        <div className="finanzas-list">
          <h3 className="list-title">Proyectos con monto</h3>
          {proyectosConMonto.length === 0 ? (
            <div className="empty-state-large">
              <span className="empty-icon">💰</span>
              <h3>No hay proyectos con monto</h3>
              <p>Agrega montos a tus proyectos para ver el resumen financiero</p>
            </div>
          ) : (
            <ul className="proyecto-fin-list">
              {proyectosConMonto.map((p) => {
                const cliente = clientes.find((c) => c.id === p.clienteId);
                return (
                  <li key={p.id} className="proyecto-fin-item">
                    <div className="proyecto-fin-info">
                      <strong>{p.nombre}</strong>
                      <span className="proyecto-fin-meta">
                        {cliente?.nombre || 'Sin cliente'}
                        {p.tipo && ` · ${p.tipo}`}
                      </span>
                    </div>
                    <div className="proyecto-fin-right">
                      <span
                        className="badge badge-status"
                        style={{
                          background:
                            p.status === 'Pagado'
                              ? 'var(--mint-dim)'
                              : p.status === 'Entregado'
                              ? 'var(--amber-dim)'
                              : 'var(--lila-dim)',
                          color: getMontoColor(p.status),
                        }}
                      >
                        {p.status || '—'}
                      </span>
                      <span
                        className="proyecto-fin-monto font-mono"
                        style={{ color: getMontoColor(p.status) }}
                      >
                        ${Number(p.monto).toLocaleString()}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
