import type { TaskRepository } from '../data/taskRepository';
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
