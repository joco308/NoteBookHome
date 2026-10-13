# MEMORY.md NoteBookHome

Memoria del proyecto entre sesiones. Máximo 50 líneas: resume o elimina lo que no aporte.

## Estado Actual
- v3 (cerrada): responsive de escritorio a móvil, arrastre de tareas con dedo y color de la materia.
- Crear tarea con Materia + Descripción (sin Título).
- Ver tareas en el calendario y en el panel del día; abrir detalle; editar; eliminar.
- Arrastrar chips del calendario y del panel del día sobre cualquier celda para cambiar la fecha,
  ahora con ratón (arrastre inmediato) y en táctil (pulsación larga de 300 ms).
- Responsive por breakpoints: ≥1024 dos columnas · 700–1023 apilado · <700 móvil.
- En móvil el formulario de alta está oculto hasta pulsar "+ Nueva tarea"; en escritorio sigue visible.
- Tema visual "Vertex Digital Infrastructure" (DESIGN.md): modo oscuro monocromo, etiquetas en mono.
- Persistencia en localStorage; build con Vite.
- Verificado (v3): `npm run typecheck` sin errores y prueba manual correcta en escritorio, tablet y móvil.

## Decisiones (y por qué)
- Sin backend, solo Vite por el momento.
- Tarea = Materia + Descripción: se quitó el Título para simplificar la v1.
- El día completo es clickeable (botón transparente) conservando el estilo del número.
- Capas domain/data/services/ui con TaskRepository como interfaz (para cambiar a backend luego).
- Campos Materia/Descripción centralizados en `src/ui/taskFields.ts` (alta y edición, sin duplicar).
- Arrastre centralizado en `src/ui/dragController.ts` (Pointer Events), creado una sola vez en
  `main.ts` y enganchado a `document.body`; el calendario solo expone `resolveDropTarget`.
- Se eliminó `src/ui/taskDrag.ts` (DnD nativo HTML5) porque no funciona en táctil.
- Gesto: ratón activa al mover 4px; táctil/lápiz exige 300 ms de pulsación larga sin superar 12px.
- Clases del arrastre: `is-drag-target` (celda), `is-dragging-source` (origen), `is-dragging` (body) y `.drag-ghost`; auto-scroll vertical cerca de los bordes.
- Chips del calendario: siempre solo la Materia; la Descripción se lee en el panel y el modal.
- Color del arrastre: el origen expone `data-drag-color` y el controlador publica `--drag-color` en el body.
  Lo usan el fantasma (color tal cual, como el chip) y el anillo de la celda destino, aclarado al 80%.
- Diseño guiado por `DESIGN.md`: tokens en `base.css`. La paleta cruda (primary/accent #000000,
  bg/secondary #111111, surface #191C21, text #FFFFFF, text-secondary/border #A1A1AA) se mapea a
  roles semánticos; el acento interactivo es blanco (por contraste) y el negro es la tinta sobre
  controles claros. Bordes con alpha del token border. Mono para etiquetas técnicas.

## Aprendizajes y errores a evitar
- No superponer contenido con un botón absoluto cuya altura se reserva con padding calculado;
  usar flujo normal para evitar que las tareas tapen el número del día.
- En táctil el navegador captura el puntero implícitamente y puede iniciar el scroll: hay que
  cancelar la pulsación larga si el dedo se mueve (±12px) y bloquear el scroll con un `touchmove`
  no pasivo (`preventDefault`) mientras el arrastre está activo. `touch-action: manipulation`.
- Tras un arrastre real hay que suprimir el `click` siguiente (un `click` en captura sobre
  `document`); la bandera debe reiniciarse en todo `pointerdown`, no solo sobre una tarea.
- Limpiar siempre el estado en `pointercancel` y al perder el puntero, y ubicar el destino con
  `document.elementFromPoint` porque el fantasma del arrastre tapa la celda.
- Los efectos `:hover` se quedan "pegados" en táctil: se anulan en `@media (hover: none)`.

## Próximos pasos
- (vacío por ahora)
