import { useState } from 'react';
import Card from '../components/Card';
import { projects, clients } from '../data/mockData';
import { StarIcon } from '../components/KawaiiDecor';
import './Finanzas.css';

export default function Finanzas() {
  const [projectList] = useState(projects);

  const totalCobrado = projectList
    .filter(p => p.paymentStatus === 'pagado')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPendiente = projectList
    .filter(p => p.paymentStatus !== 'pagado')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalParcial = projectList
    .filter(p => p.paymentStatus === 'parcial')
    .reduce((sum, p) => sum + p.amount * 0.5, 0);

  // Datos para gráfica - últimos 6 meses
  const monthsData = [
    { month: 'Oct', cobrado: 1200, pendiente: 400 },
    { month: 'Nov', cobrado: 2100, pendiente: 600 },
    { month: 'Dic', cobrado: 1800, pendiente: 200 },
    { month: 'Ene', cobrado: 2400, pendiente: 500 },
    { month: 'Feb', cobrado: 1900, pendiente: 300 },
    { month: 'Mar', cobrado: totalCobrado, pendiente: totalPendiente },
  ];

  const maxVal = Math.max(...monthsData.flatMap(m => [m.cobrado, m.pendiente]));

  return (
    <div className="finanzas-section">
      <header className="section-header">
        <h1 className="display-font">Finanzas</h1>
      </header>

      <div className="finanzas-grid">
        <Card className="summary-card cobrado">
          <StarIcon size={12} className="card-icon" />
          <h3>Cobrado este mes</h3>
          <p className="amount accent-mint">{totalCobrado}€</p>
        </Card>
        <Card className="summary-card pendiente">
          <StarIcon size={12} className="card-icon" />
          <h3>Pendiente</h3>
          <p className="amount accent-pink">{totalPendiente}€</p>
        </Card>
      </div>

      <Card className="chart-card">
        <h3 className="card-title">Ingresos por mes</h3>
        <div className="bar-chart">
          {monthsData.map((m, i) => (
            <div key={i} className="chart-bar-group">
              <div className="bar-wrapper">
                <div
                  className="bar cobrado"
                  style={{ height: `${(m.cobrado / maxVal) * 100}%` }}
                />
                <div
                  className="bar pendiente"
                  style={{ height: `${(m.pendiente / maxVal) * 100}%` }}
                />
              </div>
              <span className="bar-label">{m.month}</span>
            </div>
          ))}
        </div>
        <div className="chart-legend">
          <span><i className="legend-dot cobrado" /> Cobrado</span>
          <span><i className="legend-dot pendiente" /> Pendiente</span>
        </div>
      </Card>

      <Card className="projects-finance-card">
        <h3 className="card-title">Proyectos y pagos</h3>
        <div className="finance-table">
          {projectList.map(project => {
            const client = clients.find(c => c.id === project.clientId);
            return (
              <div key={project.id} className="finance-row">
                <div className="row-main">
                  <span className="project-name">{project.name}</span>
                  <span className="project-client">{client?.company}</span>
                </div>
                <span className="row-amount">{project.amount}€</span>
                <span className={`row-status ${project.paymentStatus}`}>
                  {project.paymentStatus === 'pagado' ? '✓ Pagado' : 
                   project.paymentStatus === 'parcial' ? 'Parcial' : 'Pendiente'}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
