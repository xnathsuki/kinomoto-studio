import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEYS = {
  clientes: 'studio-yume-clientes',
  proyectos: 'studio-yume-proyectos',
  tareas: 'studio-yume-tareas',
  columnas: 'studio-yume-columnas',
  mood: 'studio-yume-mood',
  seeded: 'studio_seeded',
};

const COLUMNA_COLORS = ['--pink', '--mint', '--amber', '--lila', '--red'];

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

function parseTiempoToMinutes(val) {
  if (val == null || val === '') return null;
  if (typeof val === 'number') return val;
  const s = String(val).toLowerCase().trim();
  const m = s.match(/^(\d+)\s*min$/);
  if (m) return parseInt(m[1], 10);
  const h = s.match(/^(\d+(?:\.\d+)?)\s*h/);
  if (h) return Math.round(parseFloat(h[1]) * 60);
  const num = parseInt(s, 10);
  if (!isNaN(num)) return num;
  return null;
}

function migrateTarea(t) {
  const adjuntos = [...(t.adjuntos ?? [])];
  if (t.foto && !adjuntos.some((a) => a.data === t.foto)) {
    adjuntos.push({
      id: crypto.randomUUID(),
      nombre: 'imagen',
      tipo: 'imagen',
      data: t.foto,
      fecha: Date.now(),
    });
  }
  const { foto, ...rest } = t;
  return {
    ...rest,
    columnaId: t.columnaId ?? null,
    checklists: t.checklists ?? [],
    camposPersonalizados: t.camposPersonalizados ?? [],
    etiquetas: t.etiquetas ?? [],
    actividad: t.actividad ?? [],
    adjuntos,
    tiempoEstimado: typeof t.tiempoEstimado === 'number' ? t.tiempoEstimado : parseTiempoToMinutes(t.tiempoEstimado) ?? null,
    tiempoReal: t.tiempoReal ?? null,
    deadline: t.deadline ?? null,
    orden: t.orden ?? 0,
  };
}

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
    { texto: 'Enviar propuesta de colores a Valentina', prioridad: 'Alta', tiempoEstimado: 30, proyecto: 'Branding Bloom Agency', contexto: 'Compartir el moodboard con las 3 paletas propuestas.', completada: false, checklists: [], camposPersonalizados: [], etiquetas: ['Urgente', 'Cliente'], actividad: [], adjuntos: [], deadline: null, orden: 0 },
    { texto: 'Exportar archivos finales del menú', prioridad: 'Alta', tiempoEstimado: 60, proyecto: 'Menú Digital Mora Café', contexto: 'Exportar en PDF alta resolución, PNG fondo transparente.', completada: false, checklists: [], camposPersonalizados: [], etiquetas: ['Entrega'], actividad: [], adjuntos: [], deadline: null, orden: 1 },
    { texto: 'Revisar feedback de Sebastián sobre el logo', prioridad: 'Media', tiempoEstimado: 20, proyecto: 'Logo Mora Café v2', contexto: 'Sebastián dejó comentarios en el documento compartido.', completada: false, checklists: [], camposPersonalizados: [], etiquetas: ['Revisión'], actividad: [], adjuntos: [], deadline: null, orden: 2 },
    { texto: 'Crear estructura de plantillas para redes', prioridad: 'Media', tiempoEstimado: 120, proyecto: 'Kit de Redes LF Estudio', contexto: 'Definir grid de 9 templates base.', completada: false, checklists: [], camposPersonalizados: [], etiquetas: [], actividad: [], adjuntos: [], deadline: null, orden: 3 },
    { texto: 'Actualizar portfolio con proyectos Q1', prioridad: 'Baja', tiempoEstimado: 90, proyecto: '', contexto: 'Agregar los últimos 3 proyectos terminados al portfolio.', completada: false, checklists: [], camposPersonalizados: [], etiquetas: ['Personal'], actividad: [], adjuntos: [], deadline: null, orden: 4 },
    { texto: 'Facturar proyecto Logo Mora Café v2', prioridad: 'Alta', tiempoEstimado: 15, proyecto: 'Logo Mora Café v2', contexto: 'Generar factura por $600.000 COP.', completada: false, checklists: [], camposPersonalizados: [], etiquetas: ['Admin'], actividad: [], adjuntos: [], deadline: null, orden: 5 },
    { texto: 'Responder emails pendientes', prioridad: 'Baja', tiempoEstimado: 45, proyecto: '', contexto: 'Hay 3 correos sin responder.', completada: false, checklists: [], camposPersonalizados: [], etiquetas: ['Admin'], actividad: [], adjuntos: [], deadline: null, orden: 6 },
  ];
  const tareasWithIds = tareasSeed.map((t, i) => migrateTarea({
    texto: t.texto,
    prioridad: t.prioridad,
    tiempoEstimado: t.tiempoEstimado,
    proyectoId: t.proyecto ? byProyectoNombre[t.proyecto] || null : null,
    contexto: t.contexto || null,
    completada: t.completada,
    checklists: t.checklists,
    camposPersonalizados: t.camposPersonalizados,
    etiquetas: t.etiquetas,
    actividad: [{ id: crypto.randomUUID(), tipo: 'creada', descripcion: 'Tarea creada', fecha: Date.now() - (7 - i) * 3600000 }],
    adjuntos: t.adjuntos,
    deadline: t.deadline,
    orden: t.orden,
    id: crypto.randomUUID(),
  }));

  return { clientes: clientesWithIds, proyectos: proyectosWithIds, tareas: tareasWithIds };
}

function getInitialData() {
  const seeded = localStorage.getItem(STORAGE_KEYS.seeded);
  const rawClientes = loadFromStorage(STORAGE_KEYS.clientes, []);
  const rawProyectos = loadFromStorage(STORAGE_KEYS.proyectos, []);
  const rawTareas = loadFromStorage(STORAGE_KEYS.tareas, []);
  const columnasExtra = loadFromStorage(STORAGE_KEYS.columnas, []);

  const tareas = rawTareas.map((t, i) => migrateTarea({ ...t, orden: t.orden ?? i }));

  if (seeded === 'true') {
    return { clientes: rawClientes, proyectos: rawProyectos, tareas, columnasExtra: columnasExtra ?? [] };
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
    return { ...seed, columnasExtra: [] };
  }
  return { clientes: rawClientes, proyectos: rawProyectos, tareas, columnasExtra };
}

const StudioContext = createContext(null);

export function StudioProvider({ children }) {
  const initial = getInitialData();
  const [clientes, setClientes] = useState(initial.clientes);
  const [proyectos, setProyectos] = useState(initial.proyectos);
  const [tareas, setTareas] = useState(initial.tareas);
  const [columnasExtra, setColumnasExtra] = useState(initial.columnasExtra ?? []);
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

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.columnas, columnasExtra);
  }, [columnasExtra]);

  const setMood = useCallback((value) => setMoodState(value), []);

  const addColumna = useCallback((nombre) => {
    const id = crypto.randomUUID();
    const orden = columnasExtra.length;
    const color = COLUMNA_COLORS[orden % COLUMNA_COLORS.length];
    setColumnasExtra((prev) => [...prev, { id, nombre: nombre || 'Nueva columna', color, orden }]);
    return id;
  }, [columnasExtra.length]);

  const editColumna = useCallback((id, data) => {
    setColumnasExtra((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    );
  }, []);

  const deleteColumna = useCallback((id) => {
    setColumnasExtra((prev) => prev.filter((c) => c.id !== id));
    setTareas((prev) =>
      prev.map((t) => (t.columnaId === id ? { ...t, columnaId: null } : t))
    );
  }, []);

  const moverTareaAColumna = useCallback((tareaId, columnaId) => {
    setTareas((prev) =>
      prev.map((t) =>
        t.id === tareaId
          ? {
              ...t,
              completada: columnaId === 'completada',
              columnaId: columnaId === 'completada' ? null : columnaId,
            }
          : t
      )
    );
  }, []);

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

  const logActividad = useCallback((tareaId, tipo, descripcion) => {
    setTareas((prev) =>
      prev.map((t) =>
        t.id === tareaId
          ? {
              ...t,
              actividad: [
                { id: crypto.randomUUID(), tipo, descripcion, fecha: Date.now() },
                ...(t.actividad ?? []),
              ].slice(0, 50),
            }
          : t
      )
    );
  }, []);

  const addTarea = useCallback((tarea) => {
    const id = crypto.randomUUID();
    setTareas((prev) => {
      const maxOrden = Math.max(0, ...prev.map((t) => t.orden ?? 0));
      const nueva = migrateTarea({
        ...tarea,
        id,
        completada: tarea.completada ?? false,
        columnaId: tarea.columnaId ?? null,
        contexto: tarea.contexto ?? null,
        adjuntos: tarea.adjuntos ?? [],
        checklists: tarea.checklists ?? [],
        camposPersonalizados: tarea.camposPersonalizados ?? [],
        etiquetas: tarea.etiquetas ?? [],
        actividad: [{ id: crypto.randomUUID(), tipo: 'creada', descripcion: 'Tarea creada', fecha: Date.now() }],
        tiempoEstimado: typeof tarea.tiempoEstimado === 'number' ? tarea.tiempoEstimado : parseTiempoToMinutes(tarea.tiempoEstimado) ?? null,
        tiempoReal: tarea.tiempoReal ?? null,
        deadline: tarea.deadline ?? null,
        orden: maxOrden + 1,
      });
      return [...prev, nueva];
    });
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

  const reordenarTareas = useCallback((tareasReordenadas) => {
    const conOrden = tareasReordenadas.map((t, i) => ({ ...t, orden: i }));
    setTareas(conOrden);
  }, []);

  const addChecklist = useCallback((tareaId, titulo) => {
    const checklistId = crypto.randomUUID();
    setTareas((prev) =>
      prev.map((t) =>
        t.id === tareaId
          ? {
              ...t,
              checklists: [
                ...(t.checklists ?? []),
                { id: checklistId, titulo: titulo || 'Checklist', items: [] },
              ],
            }
          : t
      )
    );
    return checklistId;
  }, []);

  const editChecklistTitulo = useCallback((tareaId, checklistId, nuevoTitulo) => {
    setTareas((prev) =>
      prev.map((t) =>
        t.id === tareaId
          ? {
              ...t,
              checklists: (t.checklists ?? []).map((c) =>
                c.id === checklistId ? { ...c, titulo: nuevoTitulo } : c
              ),
            }
          : t
      )
    );
  }, []);

  const deleteChecklist = useCallback((tareaId, checklistId) => {
    setTareas((prev) =>
      prev.map((t) =>
        t.id === tareaId
          ? {
              ...t,
              checklists: (t.checklists ?? []).filter((c) => c.id !== checklistId),
            }
          : t
      )
    );
  }, []);

  const addChecklistItem = useCallback((tareaId, checklistId, texto) => {
    const itemId = crypto.randomUUID();
    setTareas((prev) =>
      prev.map((t) =>
        t.id === tareaId
          ? {
              ...t,
              checklists: (t.checklists ?? []).map((c) =>
                c.id === checklistId
                  ? { ...c, items: [...(c.items ?? []), { id: itemId, texto: texto || 'Nuevo ítem', done: false }] }
                  : c
              ),
            }
          : t
      )
    );
    return itemId;
  }, []);

  const toggleChecklistItem = useCallback((tareaId, checklistId, itemId) => {
    setTareas((prev) =>
      prev.map((t) =>
        t.id === tareaId
          ? {
              ...t,
              checklists: (t.checklists ?? []).map((c) =>
                c.id === checklistId
                  ? {
                      ...c,
                      items: (c.items ?? []).map((i) =>
                        i.id === itemId ? { ...i, done: !i.done } : i
                      ),
                    }
                  : c
              ),
            }
          : t
      )
    );
  }, []);

  const editChecklistItem = useCallback((tareaId, checklistId, itemId, nuevoTexto) => {
    setTareas((prev) =>
      prev.map((t) =>
        t.id === tareaId
          ? {
              ...t,
              checklists: (t.checklists ?? []).map((c) =>
                c.id === checklistId
                  ? {
                      ...c,
                      items: (c.items ?? []).map((i) =>
                        i.id === itemId ? { ...i, texto: nuevoTexto } : i
                      ),
                    }
                  : c
              ),
            }
          : t
      )
    );
  }, []);

  const deleteChecklistItem = useCallback((tareaId, checklistId, itemId) => {
    setTareas((prev) =>
      prev.map((t) =>
        t.id === tareaId
          ? {
              ...t,
              checklists: (t.checklists ?? []).map((c) =>
                c.id === checklistId
                  ? { ...c, items: (c.items ?? []).filter((i) => i.id !== itemId) }
                  : c
              ),
            }
          : t
      )
    );
  }, []);

  const convertirItemEnTarea = useCallback((tareaId, checklistId, itemId) => {
    let textoItem = '';
    let maxOrden = 0;
    const nuevaId = crypto.randomUUID();
    setTareas((prev) => {
      const tarea = prev.find((t) => t.id === tareaId);
      const checklist = tarea?.checklists?.find((c) => c.id === checklistId);
      const item = checklist?.items?.find((i) => i.id === itemId);
      textoItem = item?.texto || '';
      maxOrden = Math.max(0, ...prev.map((t) => t.orden ?? 0));
      const updated = prev.map((t) =>
        t.id === tareaId
          ? {
              ...t,
              checklists: (t.checklists ?? []).map((c) =>
                c.id === checklistId
                  ? {
                      ...c,
                      items: (c.items ?? []).map((i) =>
                        i.id === itemId ? { ...i, done: true } : i
                      ),
                    }
                  : c
              ),
            }
          : t
      );
      const nueva = migrateTarea({
        id: nuevaId,
        texto: textoItem,
        prioridad: 'Media',
        proyectoId: null,
        completada: false,
        columnaId: null,
        tiempoEstimado: null,
        tiempoReal: null,
        contexto: null,
        checklists: [],
        camposPersonalizados: [],
        etiquetas: [],
        actividad: [{ id: crypto.randomUUID(), tipo: 'creada', descripcion: 'Tarea creada (desde checklist)', fecha: Date.now() }],
        adjuntos: [],
        deadline: null,
        orden: maxOrden + 1,
      });
      return [...updated, nueva];
    });
    return nuevaId;
  }, []);

  const addCampoPersonalizado = useCallback((tareaId, campo) => {
    const id = crypto.randomUUID();
    const nuevo = { ...campo, id, valor: campo.valor ?? (campo.tipo === 'checkbox' ? false : '') };
    setTareas((prev) =>
      prev.map((t) =>
        t.id === tareaId
          ? {
              ...t,
              camposPersonalizados: [...(t.camposPersonalizados ?? []), nuevo],
            }
          : t
      )
    );
    return id;
  }, []);

  const editCampoPersonalizado = useCallback((tareaId, campoId, valor) => {
    setTareas((prev) =>
      prev.map((t) =>
        t.id === tareaId
          ? {
              ...t,
              camposPersonalizados: (t.camposPersonalizados ?? []).map((c) =>
                c.id === campoId ? { ...c, valor } : c
              ),
            }
          : t
      )
    );
  }, []);

  const deleteCampoPersonalizado = useCallback((tareaId, campoId) => {
    setTareas((prev) =>
      prev.map((t) =>
        t.id === tareaId
          ? {
              ...t,
              camposPersonalizados: (t.camposPersonalizados ?? []).filter((c) => c.id !== campoId),
            }
          : t
      )
    );
  }, []);

  const value = {
    clientes,
    proyectos,
    tareas,
    columnasExtra,
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
    logActividad,
    reordenarTareas,
    addColumna,
    editColumna,
    deleteColumna,
    moverTareaAColumna,
    addChecklist,
    editChecklistTitulo,
    deleteChecklist,
    addChecklistItem,
    toggleChecklistItem,
    editChecklistItem,
    deleteChecklistItem,
    convertirItemEnTarea,
    addCampoPersonalizado,
    editCampoPersonalizado,
    deleteCampoPersonalizado,
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
