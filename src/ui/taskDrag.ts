const TASK_ID_DATA_TYPE = 'text/plain';

/** Escribe el id de la tarea en el transporte de datos del arrastre. */
export function writeTaskId(event: DragEvent, taskId: string): void {
  const dataTransfer = event.dataTransfer;
  if (dataTransfer === null) {
    return;
  }
  dataTransfer.setData(TASK_ID_DATA_TYPE, taskId);
  dataTransfer.effectAllowed = 'move';
}

/** Lee el id de la tarea transportada, o null si no hay dato válido. */
export function readTaskId(event: DragEvent): string | null {
  const dataTransfer = event.dataTransfer;
  if (dataTransfer === null) {
    return null;
  }
  const taskId = dataTransfer.getData(TASK_ID_DATA_TYPE);
  return taskId.length > 0 ? taskId : null;
}
