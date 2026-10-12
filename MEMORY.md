# MEMORY.md NoteBookHome

Memoria del proyecto entre sesiones. Máximo 50 líneas: resume o elimina lo que no aporte.

## Estado Actual
- v2 (línea base desde hoy): todo lo de v1 más edición y arrastrar y soltar.
- Crear tarea con Materia + Descripción (sin Título).
- Ver tareas en el calendario y en el panel del día; abrir detalle; editar; eliminar.
- Arrastrar chips del calendario y del panel del día sobre cualquier celda para cambiar la fecha.
- Tema visual "Vertex Digital Infrastructure" (DESIGN.md): modo oscuro monocromo, etiquetas en mono.
- Persistencia en localStorage; build con Vite.

## Decisiones (y por qué)
- Sin backend, solo Vite por el momento.
- Tarea = Materia + Descripción: se quitó el Título para simplificar la v1.
- El día completo es clickeable (botón transparente) conservando el estilo del número.
- Capas domain/data/services/ui con TaskRepository como interfaz (para cambiar a backend luego).
- Campos Materia/Descripción centralizados en `src/ui/taskFields.ts` (alta y edición, sin duplicar).
- Transporte del id de tarea al arrastrar centralizado en `src/ui/taskDrag.ts` (dataTransfer tipado, sin `any`).
- DnD con la API nativa HTML5; no funciona en táctil (fuera de alcance por ahora).
- Diseño guiado por `DESIGN.md`: tokens en `base.css`. La paleta cruda (primary/accent #000000,
  bg/secondary #111111, surface #191C21, text #FFFFFF, text-secondary/border #A1A1AA) se mapea a
  roles semánticos; el acento interactivo es blanco (por contraste) y el negro es la tinta sobre
  controles claros. Bordes con alpha del token border. Mono para etiquetas técnicas.

## Aprendizajes y errores a evitar
- No superponer contenido con un botón absoluto cuya altura se reserva con padding calculado;
  usar flujo normal para evitar que las tareas tapen el número del día.
- Para DnD delegado hay que hacer `preventDefault()` en `dragover` y `drop`; sin eso no se suelta.
- Limpiar el resaltado de la celda con un `dragend` a nivel de `document`: el origen del arrastre
  puede estar en otro componente (panel del día) y no propaga al calendario.

## Próximos pasos
- (vacío por ahora)
