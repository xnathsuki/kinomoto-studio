import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEYS = {
  clientes: 'studio-yume-clientes',
  proyectos: 'studio-yume-proyectos',
  tareas: 'studio-yume-tareas',
  mood: 'studio-yume-mood',
  seeded: 'studio_seeded',
};

const loadFromStorage = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.warn('Error loading from localStorage:', e);
  }
  return defaultValue;
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Error saving to localStorage:', e);
  }
};

function getSeedData() {
  const clientesSeed = [
    { nombre: 'Valentina Ríos', empresa: 'Bloom Agency', email: 'vale@bloomagency.co', tel: '573001112233', estado: 'activo', etiqueta: 'VIP', notas: 'Prefiere comunicación por WhatsApp. Muy puntual con los pagos.' },
    { nombre: 'Sebastián Mora', empresa: 'Mora Café', email: 'sebas@moracafe.com', tel: '573109988776', estado: 'activo', etiqueta: 'Frecuente', notas: 'Le gusta el estilo minimalista y colores tierra.' },
    { nombre: 'Lucía Fernández', empresa: 'LF Estudio', email: 'lucia@lfestudio.com', tel: '573207654321', estado: 'pausado', etiqueta: 'Nuevo', notas: 'Proyecto pausado hasta marzo. Retomar con propuesta actualizada.' },
  ];
  const clientesWithIds = clientesSeed.map((c) => ({ ...c, id: crypto.randomUUID() }));
  const byNombre = Object.fromEntries(clientesWithIds.map((c) => [c.nombre, c.id]));

  const proyectosSeed = [
    { nombre: 'Branding Bloom Agency', cliente: 'Valentina Ríos', tipo: 'Branding', deadline: '2025-04-10', monto: 3500000, status: 'En proceso', avance: 60, descripcion: 'Identidad visual completa: logo, paleta, tipografía y manual de marca.' },
    { nombre: 'Menú Digital Mora Café', cliente: 'Sebastián Mora', tipo: 'Ilustración', deadline: '2025-03-28', monto: 850000, status: 'En revisión', avance: 90, descripcion: 'Diseño de menú ilustrado para carta física y versión digital.' },
    { nombre: 'Kit de Redes LF Estudio', cliente: 'Lucía Fernández', tipo: 'Social Media', deadline: '2025-05-01', monto: 1200000, status: 'Por iniciar', avance: 0, descripcion: 'Pack de 20 plantillas editables para Instagram y Stories.' },
    { nombre: 'Logo Mora Café v2', cliente: 'Sebastián Mora', tipo: 'Logo', deadline: '2025-03-20', monto: 600000, status: 'Entregado', avance: 100, descripcion: 'Rediseño del isotipo con versión horizontal y vertical.' },
  ];
  const proyectosWithIds = proyectosSeed.map((p) => {
    const { cliente, ...rest } = p;
    return {
      ...rest,
      id: crypto.randomUUID(),
      clienteId: byNombre[cliente] || null,
    };
  });
  const byProyectoNombre = Object.fromEntries(proyectosWithIds.map((p) => [p.nombre, p.id]));

  const tareasSeed = [
    { texto: 'Enviar propuesta de colores a Valentina', prioridad: 'Alta', tiempoEstimado: '30min', proyecto: 'Branding Bloom Agency', contexto: 'Compartir el moodboard con las 3 paletas propuestas. Ella prefiere tonos pastel con un acento fuerte. Revisar feedback del brief inicial antes de enviar.', foto: null, completada: false },
    { texto: 'Exportar archivos finales del menú', prioridad: 'Alta', tiempoEstimado: '1h', proyecto: 'Menú Digital Mora Café', contexto: 'Exportar en PDF alta resolución, PNG fondo transparente y versión web optimizada. Subir a Google Drive y compartir link.', foto: null, completada: false },
    { texto: 'Revisar feedback de Sebastián sobre el logo', prioridad: 'Media', tiempoEstimado: '20min', proyecto: 'Logo Mora Café v2', contexto: 'Sebastián dejó comentarios en el documento compartido. Revisar y anotar los cambios solicitados antes de la llamada del jueves.', foto: null, completada: false },
    { texto: 'Crear estructura de plantillas para redes', prioridad: 'Media', tiempoEstimado: '2h', proyecto: 'Kit de Redes LF Estudio', contexto: 'Definir grid de 9 templates base: 3 de feed estático, 3 de carrusel y 3 de stories. Usar la paleta ya aprobada por Lucía.', foto: null, completada: false },
    { texto: 'Actualizar portfolio con proyectos Q1', prioridad: 'Baja', tiempoEstimado: '1.5h', proyecto: '', contexto: 'Agregar los últimos 3 proyectos terminados al portfolio de Behance y actualizar la web personal con los mockups nuevos.', foto: null, completada: false },
    { texto: 'Facturar proyecto Logo Mora Café v2', prioridad: 'Alta', tiempoEstimado: '15min', proyecto: 'Logo Mora Café v2', contexto: 'Generar factura por $600.000 COP. Enviar al correo sebas@moracafe.com con el detalle del servicio y datos bancarios.', foto: null, completada: false },
    { texto: 'Responder emails pendientes', prioridad: 'Baja', tiempoEstimado: '45min', proyecto: '', contexto: 'Hay 3 correos sin responder: consulta de nuevo cliente, seguimiento de Valentina y un proveedor de impresión.', foto: null, completada: false },
  ];
  const tareasWithIds = tareasSeed.map((t) => ({
    texto: t.texto,
    prioridad: t.prioridad,
    tiempoEstimado: t.tiempoEstimado,
    proyectoId: t.proyecto ? byProyectoNombre[t.proyecto] || null : null,
    contexto: t.contexto || null,
    foto: t.foto || null,
    completada: t.completada,
    id: crypto.randomUUID(),
  }));

  return { clientes: clientesWithIds, proyectos: proyectosWithIds, tareas: tareasWithIds };
}

function getInitialData() {
  const seeded = localStorage.getItem(STORAGE_KEYS.seeded);
  if (seeded === 'true') {
    return {
      clientes: loadFromStorage(STORAGE_KEYS.clientes, []),
      proyectos: loadFromStorage(STORAGE_KEYS.proyectos, []),
      tareas: loadFromStorage(STORAGE_KEYS.tareas, []),
    };
  }
  const allEmpty =
    !localStorage.getItem(STORAGE_KEYS.clientes) &&
    !localStorage.getItem(STORAGE_KEYS.proyectos) &&
    !localStorage.getItem(STORAGE_KEYS.tareas);
  if (allEmpty) {
    const seed = getSeedData();
    localStorage.setItem(STORAGE_KEYS.seeded, 'true');
    try {
      saveToStorage(STORAGE_KEYS.clientes, seed.clientes);
      saveToStorage(STORAGE_KEYS.proyectos, seed.proyectos);
      saveToStorage(STORAGE_KEYS.tareas, seed.tareas);
    } catch (e) {
      console.warn('Error seeding data:', e);
    }
    return seed;
  }
  return {
    clientes: loadFromStorage(STORAGE_KEYS.clientes, []),
    proyectos: loadFromStorage(STORAGE_KEYS.proyectos, []),
    tareas: loadFromStorage(STORAGE_KEYS.tareas, []),
  };
}

const StudioContext = createContext(null);

export function StudioProvider({ children }) {
  const initial = getInitialData();
  const [clientes, setClientes] = useState(initial.clientes);
  const [proyectos, setProyectos] = useState(initial.proyectos);
  const [tareas, setTareas] = useState(initial.tareas);
  const [mood, setMoodState] = useState(() => loadFromStorage(STORAGE_KEYS.mood, null));

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.clientes, clientes);
  }, [clientes]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.proyectos, proyectos);
  }, [proyectos]);

  useEffect(() => {
    try {
      saveToStorage(STORAGE_KEYS.tareas, tareas);
    } catch (e) {
      console.warn('Error saving tasks to localStorage:', e);
    }
  }, [tareas]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.mood, mood);
  }, [mood]);

  const setMood = useCallback((value) => setMoodState(value), []);

  const addCliente = useCallback((cliente) => {
    const id = crypto.randomUUID();
    setClientes((prev) => [...prev, { ...cliente, id }]);
    return id;
  }, []);

  const editCliente = useCallback((id, data) => {
    setClientes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    );
  }, []);

  const deleteCliente = useCallback((id) => {
    setClientes((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addProyecto = useCallback((proyecto) => {
    const id = crypto.randomUUID();
    setProyectos((prev) => [...prev, { ...proyecto, id }]);
    return id;
  }, []);

  const editProyecto = useCallback((id, data) => {
    setProyectos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
  }, []);

  const deleteProyecto = useCallback((id) => {
    setProyectos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addTarea = useCallback((tarea) => {
    const id = crypto.randomUUID();
    setTareas((prev) => [
      ...prev,
      {
        ...tarea,
        id,
        completada: tarea.completada ?? false,
        contexto: tarea.contexto ?? null,
        foto: tarea.foto ?? null,
      },
    ]);
    return id;
  }, []);

  const editTarea = useCallback((id, data) => {
    setTareas((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t))
    );
  }, []);

  const toggleTarea = useCallback((id) => {
    setTareas((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completada: !t.completada } : t))
    );
  }, []);

  const deleteTarea = useCallback((id) => {
    setTareas((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = {
    clientes,
    proyectos,
    tareas,
    mood,
    setMood,
    addCliente,
    editCliente,
    deleteCliente,
    addProyecto,
    editProyecto,
    deleteProyecto,
    addTarea,
    editTarea,
    toggleTarea,
    deleteTarea,
  };

  return (
    <StudioContext.Provider value={value}>{children}</StudioContext.Provider>
  );
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error('useStudio must be used within StudioProvider');
  return ctx;
}
