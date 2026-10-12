export interface Task {
  readonly id: string;
  readonly subject: string;
  readonly description: string;
  readonly date: string; // ISO 'YYYY-MM-DD'
  readonly createdAt: string; // ISO timestamp
}

/** Datos que llegan desde el formulario, antes de validar/normalizar. */
export interface NewTaskInput {
  readonly subject: string;
  readonly description: string;
  readonly date: string;
}
