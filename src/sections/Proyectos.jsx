import { useState } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { projects, clients, kanbanColumns } from '../data/mockData';
import { StarIcon } from '../components/KawaiiDecor';
import './Proyectos.css';

function getUrgencyBadge(daysLeft) {
  if (daysLeft <= 2) return { label: 'Urgente', color: '#ff6eb4' };
  if (daysLeft <= 5) return { label: 'Pronto', color: '#fbbf24' };
  return { label: 'OK', color: '#67e8b1' };
}

function getDaysUntil(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  return Math.ceil((date - now) / (1000 * 60 * 60 * 24));
}

export default function Proyectos({ onToast }) {
  const [projectList, setProjectList] = useState(projects);
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewMode, setViewMode] = useState('kanban');
  const [modalOpen, setModalOpen] = useState(false);

  const moveProject = (projectId, newStatus) => {
    setProjectList(prev => prev.map(p => 
      p.id === projectId ? { ...p, status: newStatus } : p
    ));
    onToast?.('Estado actualizado ✨', 'success');
  };

  const getProjectsByColumn = (columnId) =>
    projectList.filter(p => p.status === columnId);

  return (
    <div className="proyectos-section">
      <header className="section-header">
        <h1 className="display-font">Proyectos</h1>
        <div className="view-toggle">
          <button
            className={viewMode === 'kanban' ? 'active' : ''}
            onClick={() => setViewMode('kanban')}
          >
            Kanban
          </button>
          <button
            className={viewMode === 'lista' ? 'active' : ''}
            onClick={() => setViewMode('lista')}
          >
            Lista
          </button>
        </div>
      </header>

      {selectedProject ? (
        <ProjectDetail 
          project={selectedProject} 
          client={clients.find(c => c.id === selectedProject.clientId)}
          onClose={() => setSelectedProject(null)}
        />
      ) : viewMode === 'kanban' ? (
        <div className="kanban-board">
          {kanbanColumns.map(column => (
            <div key={column.id} className="kanban-column">
              <div 
                className="column-header"
                style={{ borderTopColor: column.color }}
              >
                <h3>{column.label}</h3>
                <span className="column-count">{getProjectsByColumn(column.id).length}</span>
              </div>
              <div className="column-cards">
                {getProjectsByColumn(column.id).map(project => {
                  const client = clients.find(c => c.id === project.clientId);
                  const daysLeft = getDaysUntil(project.deadline);
                  const urgency = getUrgencyBadge(daysLeft);
                  return (
                    <Card 
                      key={project.id} 
                      className="project-card"
                      hoverable
                    >
                      <div onClick={() => setSelectedProject(project)}>
                        <div className="project-card-header">
                          <h4>{project.name}</h4>
                          <span 
                            className="urgency-badge"
                            style={{ background: urgency.color }}
                          >
                            {urgency.label}
                          </span>
                        </div>
                        <p className="project-client">{client?.company}</p>
                        <p className="project-type">{project.type}</p>
                        <div className="project-meta">
                          <span className="project-deadline">📅 {project.deadline}</span>
                          <div className="progress-mini">
                            <div 
                              className="progress-mini-fill"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="progress-text">{project.progress}%</span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="project-list-view">
          {projectList.map(project => {
            const client = clients.find(c => c.id === project.clientId);
            const daysLeft = getDaysUntil(project.deadline);
            const urgency = getUrgencyBadge(daysLeft);
            return (
              <Card 
                key={project.id}
                className="project-list-item"
                hoverable
              >
                <div onClick={() => setSelectedProject(project)} className="list-item-content">
                  <div className="list-item-main">
                    <StarIcon size={10} className="list-star" />
                    <h4>{project.name}</h4>
                    <span className="list-client">{client?.company}</span>
                    <span className="list-type">{project.type}</span>
                  </div>
                  <div className="list-item-meta">
                    <span 
                      className="status-pill"
                      style={{ background: kanbanColumns.find(c => c.id === project.status)?.color + '33' }}
                    >
                      {kanbanColumns.find(c => c.id === project.status)?.label}
                    </span>
                    <span className="list-deadline">{project.deadline}</span>
                    <span 
                      className="urgency-badge small"
                      style={{ background: urgency.color }}
                    >
                      {urgency.label}
                    </span>
                    <span className="list-progress">{project.progress}%</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProjectDetail({ project, client, onClose }) {
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Brief inicial', done: true },
    { id: 2, text: 'Moodboard', done: true },
    { id: 3, text: 'Primera propuesta', done: project.progress > 50 },
    { id: 4, text: 'Revisión cliente', done: project.progress > 80 },
    { id: 5, text: 'Entrega final', done: project.progress === 100 },
  ]);

  const toggleCheck = (id) => {
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, done: !c.done } : c));
  };

  return (
    <Card className="project-detail-card">
      <div className="detail-header">
        <button className="back-btn" onClick={onClose}>← Volver</button>
        <h2 className="display-font">{project.name}</h2>
        <p className="detail-client">{client?.company}</p>
        <div className="detail-badges">
          <span className="type-badge">{project.type}</span>
          <span className={`payment-badge ${project.paymentStatus}`}>
            {project.paymentStatus === 'pagado' ? '✓ Pagado' : 
             project.paymentStatus === 'parcial' ? 'Parcial' : 'Pendiente'}
          </span>
        </div>
      </div>
      <div className="detail-body">
        <div className="detail-section">
          <h4>Descripción</h4>
          <p>{project.notes || 'Sin descripción adicional.'}</p>
        </div>
        <div className="detail-section">
          <h4>Entregables</h4>
          <ul className="checklist">
            {checklist.map(item => (
              <li key={item.id} className={item.done ? 'done' : ''}>
                <label>
                  <input 
                    type="checkbox" 
                    checked={item.done} 
                    onChange={() => toggleCheck(item.id)}
                  />
                  <span className="checkmark">✓</span>
                  {item.text}
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div className="detail-footer">
          <div className="amount-box">
            <span className="amount-label">Monto</span>
            <span className="amount-value">{project.amount}€</span>
          </div>
          <div className="deadline-box">
            <span className="deadline-label">Deadline</span>
            <span className="deadline-value">{project.deadline}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
