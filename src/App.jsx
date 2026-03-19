import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StudioProvider } from './context/StudioContext';
import { ToastProvider } from './context/ToastContext';
import { FinanzasAuthProvider } from './context/FinanzasAuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Proyectos from './pages/Proyectos';
import Tareas from './pages/Tareas';
import Calendario from './pages/Calendario';
import Finanzas from './pages/Finanzas';
import './App.css';

function AppInner() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleMenu = useCallback(() => setMobileMenuOpen((v) => !v), []);
  const closeMenu = useCallback(() => setMobileMenuOpen(false), []);

  return (
    <div className="app">
      <Sidebar mobileOpen={mobileMenuOpen} onClose={closeMenu} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard onMenuClick={toggleMenu} />} />
          <Route path="/clientes" element={<Clientes onMenuClick={toggleMenu} />} />
          <Route path="/proyectos" element={<Proyectos onMenuClick={toggleMenu} />} />
          <Route path="/tareas" element={<Tareas onMenuClick={toggleMenu} />} />
          <Route path="/calendario" element={<Calendario onMenuClick={toggleMenu} />} />
          <Route path="/finanzas" element={<Finanzas onMenuClick={toggleMenu} />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <StudioProvider>
      <ToastProvider>
        <BrowserRouter>
          <FinanzasAuthProvider>
            <AppInner />
          </FinanzasAuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </StudioProvider>
  );
}

export default App;
