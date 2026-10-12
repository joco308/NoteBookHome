import type { Task } from '../domain/task';

export interface TaskRepository {
  getAll(): readonly Task[];
  save(tasks: readonly Task[]): void;
}
