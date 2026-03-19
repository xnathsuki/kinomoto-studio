import './Topbar.css';

export default function Topbar({ title, action }) {
  return (
    <header className="topbar">
      <h1 className="topbar-title">{title}</h1>
      {action && <div className="topbar-action">{action}</div>}
    </header>
  );
}
