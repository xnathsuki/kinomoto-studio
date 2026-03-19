import { useState } from 'react';
import Card from '../components/Card';
import { clients, projects, tasks, moods } from '../data/mockData';
import { StarIcon } from '../components/KawaiiDecor';
import './Dashboard.css';

function getUrgencyColor(daysLeft) {
  if (daysLeft <= 2) return '#ff6eb4';
  if (daysLeft <= 5) return '#fbbf24';
  return '#67e8b1';
}

function getDaysUntil(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function Dashboard() {
  const [selectedMood, setSelectedMood] = useState('energica');
  const today = new Date().toISOString().slice(0, 10);
  
  const activeProjects = projects.filter(p => !['entregado', 'pagado'].includes(p.status));
  const weekDeadlines = projects.filter(p => {
    const days = getDaysUntil(p.deadline);
    return days >= 0 && days <= 7;
  }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  const todayTasks = tasks.filter(t => t.dueDate === today && !t.completed);
  const completedThisMonth = projects.filter(p => p.status === 'pagado' || p.status === 'entregado').length;
  const totalThisMonth = projects.length;
  const progressPercent = Math.round((completedThisMonth / totalThisMonth) * 100);
  
  const currentMood = moods.find(m => m.id === selectedMood);

  // Mini calendar - current month
  const year = new Date().getFullYear();
  const month = new Date().getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const project = projects.find(p => p.deadline === dateStr);
    calendarDays.push({ day: d, dateStr, hasDeadline: !!project, urgency: project ? getDaysUntil(dateStr) : null });
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="display-font">¡Hola! 👋</h1>
        <p className="dashboard-subtitle">Resumen de tu día creativo</p>
      </header>

      <div className="dashboard-grid">
        <Card className="dashboard-card mood-card">
          <h3 className="card-title">Estado de ánimo</h3>
          <div className="mood-options">
            {moods.map(m => (
              <button
                key={m.id}
                className={`mood-btn ${selectedMood === m.id ? 'active' : ''}`}
                onClick={() => setSelectedMood(m.id)}
                title={m.label}
              >
                <span className="mood-emoji">{m.emoji}</span>
              </button>
            ))}
          </div>
          <p className="mood-message">{currentMood?.message}</p>
        </Card>

        <Card className="dashboard-card stats-card">
          <h3 className="card-title">Progreso del mes</h3>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="progress-text">
            <span className="accent-pink">{completedThisMonth}</span> de {totalThisMonth} proyectos completados
          </p>
        </Card>

        <Card className="dashboard-card summary-card">
          <h3 className="card-title">Resumen rápido</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-value accent-lilac">{activeProjects.length}</span>
              <span className="stat-label">Proyectos activos</span>
            </div>
            <div className="stat-item">
              <span className="stat-value accent-mint">{todayTasks.length}</span>
              <span className="stat-label">Tareas hoy</span>
            </div>
            <div className="stat-item">
              <span className="stat-value accent-pink">{weekDeadlines.length}</span>
              <span className="stat-label">Deadlines esta semana</span>
            </div>
          </div>
        </Card>

        <Card className="dashboard-card calendar-card">
          <h3 className="card-title">Calendario</h3>
          <div className="mini-calendar">
            <div className="calendar-header">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                <span key={d} className="cal-day-name">{d}</span>
              ))}
            </div>
            <div className="calendar-grid">
              {calendarDays.map((item, i) => (
                <div key={i} className={`cal-cell ${item?.dateStr === today ? 'today' : ''}`}>
                  {item ? (
                    <>
                      <span className="cal-day">{item.day}</span>
                      {item.hasDeadline && (
                        <span 
                          className="cal-dot" 
                          style={{ background: getUrgencyColor(item.urgency) }}
                        />
                      )}
                    </>
                  ) : ''}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="dashboard-card deliveries-card full-width">
          <h3 className="card-title">Próximas 3 entregas</h3>
          <div className="deliveries-list">
            {weekDeadlines.slice(0, 3).map(project => {
              const client = clients.find(c => c.id === project.clientId);
              const daysLeft = getDaysUntil(project.deadline);
              const hoursLeft = daysLeft * 24;
              return (
                <div key={project.id} className="delivery-item">
                  <StarIcon size={8} className="delivery-star" />
                  <div className="delivery-info">
                    <span className="delivery-name">{project.name}</span>
                    <span className="delivery-client">{client?.company}</span>
                  </div>
                  <div 
                    className="delivery-countdown"
                    style={{ color: getUrgencyColor(daysLeft) }}
                  >
                    {daysLeft > 0 ? (
                      <>{daysLeft}d {hoursLeft % 24}h</>
                    ) : (
                      <span className="overdue">¡Hoy!</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
