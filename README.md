# NoteBookHome

Calendario web para **gestionar y anotar tareas por día**. Sin backend: todo se guarda en el
`localStorage` del navegador.

## Stack
- **TypeScript** estricto (prohibido `any`).
- **HTML5 / CSS3** modernos, sin frameworks de UI: se usa la API nativa del DOM.
- **Vite** como servidor de desarrollo y empaquetado.

## Funcionalidad (v3)
- Crear tareas con **Materia + Descripción** (sin Título).
- Verlas en el calendario mensual y en el panel del día, abrir el detalle, editar y eliminar.
- **Cambiar una tarea de día arrastrándola**, con ratón (arrastre inmediato) y en táctil (pulsación
  larga de 300 ms). La previsualización y la celda destino conservan el color de la materia.
- Responsive: `≥1024px` dos columnas (calendario + panel del día) · `700–1023px` apilado ·
  `<700px` móvil, donde el formulario de alta se abre desde **"+ Nueva tarea"**.

## Comandos
> Se ejecutan en la terminal local de Windows, no desde WSL.

| Comando | Para qué |
| --- | --- |
| `npm run dev` | Servidor de desarrollo de Vite |
| `npm run typecheck` | Comprobación de tipos (`tsc`) |
| `npm run build` | Comprobación de tipos + build de producción |
| `npm run preview` | Sirve el build de producción |

## Estructura
- `src/domain/` — tipos y funciones puras (sin DOM ni almacenamiento).
- `src/data/` — repositorios: interfaz + implementación sobre `localStorage`.
- `src/services/` — lógica de negocio y notificación de cambios.
- `src/ui/` — componentes de interfaz que renderizan y emiten eventos.
- `src/main.ts` — composition root: inyecta dependencias y arranca la aplicación.
- `public/styles/` — `base.css` (tokens y layout) y `calendar.css` (componentes).

## Documentación del proyecto
- `AGENTS.md` — directivas, calidad de código y protocolo de trabajo.
- `MEMORY.md` — estado y decisiones entre sesiones.
- `DESIGN.md` — sistema de diseño "Vertex Digital Infrastructure" y ajustes responsive/interacción.
