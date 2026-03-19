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

function App() {
  return (
    <StudioProvider>
      <ToastProvider>
        <BrowserRouter>
          <FinanzasAuthProvider>
            <div className="app">
              <Sidebar />
              <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/proyectos" element={<Proyectos />} />
                <Route path="/tareas" element={<Tareas />} />
                <Route path="/calendario" element={<Calendario />} />
                <Route path="/finanzas" element={<Finanzas />} />
              </Routes>
              </main>
            </div>
          </FinanzasAuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </StudioProvider>
  );
}

export default App;
