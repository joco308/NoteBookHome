# MEMORY.md NoteBookHome

Memoria del proyecto entre sesiones. Máximo 50 líneas: resume o elimina lo que no aporte.

## Estado Actual
- v1 (línea base desde hoy): calendario mensual, día completo clickeable.
- Crear tarea con Materia + Descripción (sin Título por ahora).
- Ver tareas en el calendario y en el panel del día; abrir detalle; eliminar.
- Persistencia en localStorage; build con Vite.

## Decisiones (y por qué)
- Sin backend, solo Vite por el momento.
- Tarea = Materia + Descripción: se quitó el Título para simplificar la v1.
- El día completo es clickeable (botón transparente) conservando el estilo del número.
- Capas domain/data/services/ui con TaskRepository como interfaz (para cambiar a backend luego).

## Aprendizajes y errores a evitar
- No superponer contenido con un botón absoluto cuya altura se reserva con padding calculado;
  usar flujo normal para evitar que las tareas tapen el número del día.

## Próximos pasos
- (vacío por ahora)
