import { useState } from 'react';
import Card from '../components/Card';
import { tasks, projects, clients } from '../data/mockData';
import { HeartIcon } from '../components/KawaiiDecor';
import './Tareas.css';

export default function Tareas({ onToast }) {
  const [taskList, setTaskList] = useState(tasks);
  const [filter, setFilter] = useState('hoy');
  const [completedAnim, setCompletedAnim] = useState(null);

  const today = new Date().toISOString().slice(0, 10);
  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  };
  const weekDates = getWeekDates();

  const filteredTasks = taskList.filter(t => {
    if (filter === 'hoy') return t.dueDate === today;
    if (filter === 'semana') return weekDates.includes(t.dueDate);
    return true;
  }).sort((a, b) => {
    const priorityOrder = { alta: 0, media: 1, baja: 2 };
    return (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
  });

  const handleComplete = (taskId) => {
    setTaskList(prev => prev.map(t => 
      t.id === taskId ? { ...t, completed: true } : t
    ));
    setCompletedAnim(taskId);
    setTimeout(() => setCompletedAnim(null), 800);
    onToast?.('¡Tarea completada! 💖', 'complete');
  };

  const getProjectName = (projectId) => projects.find(p => p.id === projectId)?.name || '-';
  const getClientName = (projectId) => {
    const proj = projects.find(p => p.id === projectId);
    return proj ? clients.find(c => c.id === proj.clientId)?.company : '-';
  };

  return (
    <div className="tareas-section">
      <header className="section-header">
        <h1 className="display-font">Tareas</h1>
        <div className="filter-buttons">
          {[
            { id: 'hoy', label: 'Hoy' },
            { id: 'semana', label: 'Esta semana' },
            { id: 'todas', label: 'Todas' },
          ].map(f => (
            <button
              key={f.id}
              className={`filter-btn ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <div className="tasks-list">
        {filteredTasks.map(task => (
          <Card 
            key={task.id} 
            className={`task-item ${task.completed ? 'completed' : ''} ${completedAnim === task.id ? 'celebrate' : ''}`}
            hoverable={!task.completed}
          >
            <div className="task-checkbox-wrapper">
              <input
                type="checkbox"
                id={task.id}
                checked={task.completed}
                onChange={() => !task.completed && handleComplete(task.id)}
                disabled={task.completed}
              />
              <label htmlFor={task.id} className="kawaii-checkbox">
                {task.completed ? (
                  <span className="heart-burst">💖</span>
                ) : (
                  <span className="checkbox-empty" />
                )}
              </label>
            </div>
            <div className="task-content">
              <h4 className={task.completed ? 'strikethrough' : ''}>{task.title}</h4>
              <div className="task-meta">
                <span className="task-project">{getProjectName(task.projectId)}</span>
                <span className="task-client">{getClientName(task.projectId)}</span>
                <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
                <span className="task-hours">⏱ {task.estimatedHours}h</span>
                <span className="task-date">{task.dueDate}</span>
              </div>
            </div>
            {completedAnim === task.id && (
              <div className="confetti-container">
                {[...Array(8)].map((_, i) => (
                  <span key={i} className="confetti" style={{ '--i': i }}>✨</span>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card className="empty-state">
          <p className="empty-emoji">🌸</p>
          <p>No hay tareas para mostrar</p>
        </Card>
      )}
    </div>
  );
}
