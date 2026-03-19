import './Topbar.css';

export default function Topbar({ title, action, onMenuClick }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="hamburger-btn"
          onClick={onMenuClick}
          aria-label="Abrir menú"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
        <h1 className="topbar-title">{title}</h1>
      </div>
      {action && <div className="topbar-action">{action}</div>}
    </header>
  );
}
