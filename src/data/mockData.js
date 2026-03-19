// Datos de ejemplo para Studio Yume

export const clients = [
  { id: 'c1', name: 'María García', company: 'Floristería Luna', email: 'maria@lunaflores.com', phone: '+34 612 345 678', status: 'activo', label: 'VIP', avatar: null },
  { id: 'c2', name: 'Carlos Ruiz', company: 'TechStart', email: 'carlos@techstart.io', phone: '+34 698 765 432', status: 'activo', label: 'frecuente', avatar: null },
  { id: 'c3', name: 'Ana Martínez', company: 'Café Dulce', email: 'ana@cafedulce.es', phone: '+34 655 123 456', status: 'activo', label: 'nuevo', avatar: null },
  { id: 'c4', name: 'Pedro López', company: 'GymFit', email: 'pedro@gymfit.com', status: 'pausado', label: null, avatar: null },
  { id: 'c5', name: 'Laura Sánchez', company: 'Boutique Vintage', email: 'laura@boutiquevintage.es', status: 'archivado', label: null, avatar: null },
];

export const projects = [
  { id: 'p1', name: 'Rebranding Luna', clientId: 'c1', type: 'branding', status: 'en_proceso', deadline: '2025-03-22', progress: 65, amount: 1200, paymentStatus: 'parcial', notes: 'Nueva identidad visual completa' },
  { id: 'p2', name: 'Logo TechStart', clientId: 'c2', type: 'logo', status: 'en_revision', deadline: '2025-03-20', progress: 90, amount: 450, paymentStatus: 'pendiente', notes: '' },
  { id: 'p3', name: 'Redes Café Dulce', clientId: 'c3', type: 'social media', status: 'por_iniciar', deadline: '2025-03-28', progress: 0, amount: 800, paymentStatus: 'pendiente', notes: 'Contenido mensual' },
  { id: 'p4', name: 'Flyers GymFit', clientId: 'c4', type: 'print', status: 'entregado', deadline: '2025-03-15', progress: 100, amount: 350, paymentStatus: 'pagado', notes: '' },
  { id: 'p5', name: 'Packaging Boutique', clientId: 'c5', type: 'packaging', status: 'pagado', deadline: '2025-02-28', progress: 100, amount: 950, paymentStatus: 'pagado', notes: '' },
  { id: 'p6', name: 'Web Luna', clientId: 'c1', type: 'web', status: 'por_iniciar', deadline: '2025-04-05', progress: 0, amount: 2000, paymentStatus: 'pendiente', notes: 'Landing page' },
];

export const tasks = [
  { id: 't1', title: 'Revisar feedback branding Luna', projectId: 'p1', priority: 'alta', completed: false, dueDate: '2025-03-18', estimatedHours: 2 },
  { id: 't2', title: 'Enviar versión final logo TechStart', projectId: 'p2', priority: 'alta', completed: false, dueDate: '2025-03-18', estimatedHours: 1 },
  { id: 't3', title: 'Crear moodboard Café Dulce', projectId: 'p3', priority: 'media', completed: false, dueDate: '2025-03-19', estimatedHours: 3 },
  { id: 't4', title: 'Ajustes finales Luna - tipografía', projectId: 'p1', priority: 'media', completed: true, dueDate: '2025-03-17', estimatedHours: 1 },
  { id: 't5', title: 'Preparar presentación TechStart', projectId: 'p2', priority: 'baja', completed: false, dueDate: '2025-03-21', estimatedHours: 2 },
];

export const moods = [
  { id: 'energica', emoji: '⚡', label: 'Enérgica', message: '¡Hoy vas a crear cosas increíbles! 💫' },
  { id: 'tranquila', emoji: '🌸', label: 'Tranquila', message: 'Tómate tu tiempo, la creatividad fluye mejor así.' },
  { id: 'focused', emoji: '🎯', label: 'Enfocada', message: 'Un paso a la vez. ¡Tú puedes!' },
  { id: 'inspirada', emoji: '✨', label: 'Inspirada', message: 'Las ideas están en el aire. ¡A capturarlas!' },
  { id: 'cansada', emoji: '🌙', label: 'Cansada', message: 'Descansa cuando lo necesites. Mañana será otro día.' },
];

export const projectTypes = ['logo', 'branding', 'social media', 'print', 'packaging', 'web', 'ilustración', 'otro'];

export const kanbanColumns = [
  { id: 'por_iniciar', label: 'Por iniciar', color: '#c084fc' },
  { id: 'en_proceso', label: 'En proceso', color: '#67e8b1' },
  { id: 'en_revision', label: 'En revisión', color: '#ff6eb4' },
  { id: 'entregado', label: 'Entregado', color: '#a78bfa' },
  { id: 'pagado', label: 'Pagado', color: '#67e8b1' },
];
