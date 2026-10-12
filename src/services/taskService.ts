import type { TaskRepository } from '../data/taskRepository';
import { parseIsoDate } from '../domain/date';
import { createId } from '../domain/id';
import type { NewTaskInput, Task } from '../domain/task';
import { validateNewTask, type ValidationIssue } from '../domain/taskValidation';

export class TaskValidationError extends Error {
  public readonly issues: readonly ValidationIssue[];

  public constructor(issues: readonly ValidationIssue[]) {
    super('La tarea no es válida.');
    this.name = 'TaskValidationError';
    this.issues = issues;
  }
}

export class TaskNotFoundError extends Error {
  public constructor(taskId: string) {
    super(`No se encontró la tarea con id ${taskId}.`);
    this.name = 'TaskNotFoundError';
  }
}

export type TaskListener = (tasks: readonly Task[]) => void;

export class TaskService {
  private tasks: readonly Task[];
  private readonly listeners = new Set<TaskListener>();

  public constructor(private readonly repository: TaskRepository) {
    this.tasks = repository.getAll();
  }

  public list(): readonly Task[] {
    return this.tasks;
  }

  public find(id: string): Task | null {
    return this.tasks.find((task) => task.id === id) ?? null;
  }

  public add(input: NewTaskInput): Task {
    const result = validateNewTask(input);
    if (!result.valid) {
      throw new TaskValidationError(result.issues);
    }
    const task: Task = {
      id: createId(),
      subject: input.subject.trim(),
      description: input.description.trim(),
      date: input.date,
      createdAt: new Date().toISOString(),
    };
    this.tasks = [...this.tasks, task];
    this.commit();
    return task;
  }

  public update(id: string, input: NewTaskInput): Task {
    const result = validateNewTask(input);
    if (!result.valid) {
      throw new TaskValidationError(result.issues);
    }
    const current = this.find(id);
    if (current === null) {
      throw new TaskNotFoundError(id);
    }
    const updated: Task = {
      ...current,
      subject: input.subject.trim(),
      description: input.description.trim(),
      date: input.date,
    };
    this.tasks = this.tasks.map((task) => (task.id === id ? updated : task));
    this.commit();
    return updated;
  }

  public moveToDate(id: string, isoDate: string): void {
    if (parseIsoDate(isoDate) === null) {
      throw new RangeError(`Fecha inválida: ${isoDate}`);
    }
    const current = this.find(id);
    if (current === null) {
      throw new TaskNotFoundError(id);
    }
    if (current.date === isoDate) {
      return;
    }
    const moved: Task = { ...current, date: isoDate };
    this.tasks = this.tasks.map((task) => (task.id === id ? moved : task));
    this.commit();
  }

  public remove(id: string): void {
    const remaining = this.tasks.filter((task) => task.id !== id);
    if (remaining.length === this.tasks.length) {
      return;
    }
    this.tasks = remaining;
    this.commit();
  }

  public subscribe(listener: TaskListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private commit(): void {
    this.repository.save(this.tasks);
    for (const listener of this.listeners) {
      listener(this.tasks);
    }
  }
}
