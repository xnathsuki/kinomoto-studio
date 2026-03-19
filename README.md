# Studio Yume ✦

Aplicación web de gestión de estudio para diseñadora gráfica freelance.

## Ejecutar la aplicación

Abre la carpeta en un servidor local (necesario para cargar los scripts correctamente):

```bash
# Con npx (Node.js)
npx serve .

# O con Python
python -m http.server 8000
```

Luego abre en el navegador: `http://localhost:3000` (serve) o `http://localhost:8000` (Python).

## Características

- **Dashboard**: estadísticas, deadlines próximos, tareas de hoy, progreso de proyectos
- **Clientes**: gestión completa con avatar, estado y etiquetas
- **Proyectos**: vista Kanban con 5 columnas
- **Tareas**: pendientes y completadas con prioridad
- **Calendario**: vista mensual con deadlines
- **Finanzas**: total cobrado, pendiente y proyectado

Los datos se guardan automáticamente en `localStorage`.
