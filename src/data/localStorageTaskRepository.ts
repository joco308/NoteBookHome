import type { Task } from '../domain/task';
import type { TaskRepository } from './taskRepository';

const STORAGE_KEY = 'notebookhome.tasks.v1';

export class LocalStorageTaskRepository implements TaskRepository {
  public constructor(private readonly storage: Storage) {}

  public getAll(): readonly Task[] {
    const raw = this.storage.getItem(STORAGE_KEY);
    if (raw === null) {
      return [];
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter(isTask);
    } catch (error) {
      console.error('No se pudieron leer las tareas guardadas.', error);
      return [];
    }
  }

  public save(tasks: readonly Task[]): void {
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('No se pudieron guardar las tareas.', error);
    }
  }
}

function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.subject === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.date === 'string' &&
    typeof candidate.createdAt === 'string'
  );
}
