import { useMemo } from 'react';
import { useStudio } from '../context/StudioContext';
import Topbar from '../components/Topbar';
import './Calendario.css';

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function getDeadlineDotClass(deadline, today) {
  if (!deadline) return null;
  const d = new Date(deadline);
  d.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
  if (diff <= 1) return 'dot-red';
  if (diff <= 3) return 'dot-amber';
  return 'dot-pink';
}

export default function Calendario({ onMenuClick }) {
  const { proyectos } = useStudio();

  const { year, month, days, firstDay } = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const firstDay = first.getDay();
    const totalDays = last.getDate();

    const days = [];
    const prevMonth = new Date(y, m, 0).getDate();
    for (let i = 0; i < firstDay; i++) {
      days.push({
        day: prevMonth - firstDay + i + 1,
        isCurrentMonth: false,
      });
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }

    return {
      year: y,
      month: m,
      days,
      firstDay,
    };
  }, []);

  const today = new Date();
  const todayDate = today.getDate();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  const deadlinesByDay = useMemo(() => {
    const map = {};
    proyectos.forEach((p) => {
      if (!p.deadline) return;
      const d = new Date(p.deadline);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (d.getMonth() === month && d.getFullYear() === year) {
        if (!map[key]) map[key] = [];
        map[key].push(p);
      }
    });
    return map;
  }, [proyectos, month, year]);

  return (
    <div className="calendario-page">
      <Topbar title="Calendario" onMenuClick={onMenuClick} />

      <div className="calendario-content">
        <h2 className="calendario-mes" style={{ color: 'var(--pink)' }}>
          {MESES[month]} {year}
        </h2>

        <div className="calendario-grid">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="calendario-header">
              {d}
            </div>
          ))}
          {days.map((cell, i) => {
            const key = cell.isCurrentMonth ? `${year}-${month}-${cell.day}` : null;
            const deadlines = key ? (deadlinesByDay[key] || []) : [];
            const hasDeadline = deadlines.length > 0;
            const dotClass = hasDeadline
              ? getDeadlineDotClass(deadlines[0].deadline, new Date())
              : null;
            const isToday =
              cell.isCurrentMonth &&
              isCurrentMonth &&
              cell.day === todayDate;

            return (
              <div
                key={i}
                className={`calendario-cell ${!cell.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
              >
                <span className="cell-day">{cell.day}</span>
                {hasDeadline && (
                  <span className={`cell-dot ${dotClass}`} title={deadlines.map((p) => p.nombre).join(', ')} />
                )}
              </div>
            );
          })}
        </div>

        <div className="calendario-leyenda">
          <span className="leyenda-item">
            <span className="leyenda-dot dot-red" /> ≤1 día
          </span>
          <span className="leyenda-item">
            <span className="leyenda-dot dot-amber" /> ≤3 días
          </span>
          <span className="leyenda-item">
            <span className="leyenda-dot dot-pink" /> resto
          </span>
        </div>
      </div>
    </div>
  );
}
