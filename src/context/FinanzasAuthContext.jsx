import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const FinanzasAuthContext = createContext(null);

export function FinanzasAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/finanzas') {
      setIsAuthenticated(false);
    }
  }, [location.pathname]);

  return (
    <FinanzasAuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </FinanzasAuthContext.Provider>
  );
}

export function useFinanzasAuth() {
  const ctx = useContext(FinanzasAuthContext);
  if (!ctx) throw new Error('useFinanzasAuth must be used within FinanzasAuthProvider');
  return ctx;
}
