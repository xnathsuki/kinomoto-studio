import { useState } from 'react';
import Card from '../components/Card';
import { projects, clients } from '../data/mockData';
import { StarIcon } from '../components/KawaiiDecor';
import './Calendario.css';

function getUrgencyColor(daysLeft) {
  if (daysLeft <= 2) return '#ff6eb4';
  if (daysLeft <= 5) return '#fbbf24';
  return '#67e8b1';
}

function getDaysUntil(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  return Math.ceil((date - now) / (1000 * 60 * 60 * 24));
}

export default function Calendario() {
  const [viewMode, setViewMode] = useState('mensual');
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const calendarDays = [];
  const startOffset = (firstDay === 0 ? 6 : firstDay - 1);
  for (let i = 0; i < startOffset; i++) {
    calendarDays.push({ day: prevMonthDays - startOffset + i + 1, currentMonth: false, dateStr: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const project = projects.find(p => p.deadline === dateStr);
    calendarDays.push({ 
      day: d, 
      currentMonth: true, 
      dateStr,
      project,
      urgency: project ? getDaysUntil(dateStr) : null,
    });
  }

  const today = new Date().toISOString().slice(0, 10);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
  };

  const [selectedDay, setSelectedDay] = useState(null);
  const selectedDayProjects = selectedDay 
    ? projects.filter(p => p.deadline === selectedDay)
    : [];

  return (
    <div className="calendario-section">
      <header className="section-header">
        <h1 className="display-font">Calendario</h1>
        <div className="view-toggle">
          <button
            className={viewMode === 'mensual' ? 'active' : ''}
            onClick={() => setViewMode('mensual')}
          >
            Mensual
          </button>
          <button
            className={viewMode === 'semanal' ? 'active' : ''}
            onClick={() => setViewMode('semanal')}
          >
            Semanal
          </button>
        </div>
      </header>

      <Card className="calendar-card">
        <div className="calendar-nav">
          <button onClick={prevMonth}>←</button>
          <h2 className="display-font">{monthNames[month]} {year}</h2>
          <button onClick={nextMonth}>→</button>
        </div>

        <div className="calendar-grid">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
            <div key={d} className="cal-header-cell">{d}</div>
          ))}
          {calendarDays.map((item, i) => (
            <div
              key={i}
              className={`cal-day-cell ${!item.currentMonth ? 'other-month' : ''} ${item.dateStr === today ? 'today' : ''} ${selectedDay === item.dateStr ? 'selected' : ''}`}
              onClick={() => item.dateStr && setSelectedDay(item.dateStr)}
            >
              <span className="cal-num">{item.day}</span>
              {item.project && (
                <span
                  className="cal-dot"
                  style={{ background: getUrgencyColor(item.urgency) }}
                  title={item.project.name}
                />
              )}
            </div>
          ))}
        </div>

        {selectedDay && (
          <div className="day-detail">
            <h4>📅 {selectedDay}</h4>
            {selectedDayProjects.length === 0 ? (
              <p className="muted">Sin deadlines este día</p>
            ) : (
              <ul>
                {selectedDayProjects.map(p => {
                  const client = clients.find(c => c.id === p.clientId);
                  return (
                    <li key={p.id}>
                      <StarIcon size={8} />
                      <span>{p.name}</span>
                      <span className="client-name">— {client?.company}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
