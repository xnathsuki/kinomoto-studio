import { createContext, useContext, useState, useCallback } from 'react';
import '../components/Toast.css';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [queue, setQueue] = useState([]);

  const showToast = useCallback((message) => {
    const id = Date.now() + Math.random();
    setQueue((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setQueue((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  const dismiss = useCallback((id) => {
    setQueue((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {queue.map((t) => (
          <div
            key={t.id}
            className="toast"
            role="alert"
            onClick={() => dismiss(t.id)}
          >
            <span className="toast-icon">✦</span>
            <span className="toast-message">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
