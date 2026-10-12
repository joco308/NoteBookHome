import { formatLongDate } from '../domain/date';
import type { Task } from '../domain/task';
import { createElement } from './dom';
import { subjectColor } from './subjectColor';

export interface TaskDialogOptions {
  readonly onDelete: (taskId: string) => void;
}

export class TaskDialogView {
  private currentTaskId: string | null = null;

  private readonly subject = createElement('h2', { className: 'modal__title' });
  private readonly date = createElement('p', { className: 'modal__date' });
  private readonly description = createElement('p', { className: 'modal__description' });
  private readonly content = createElement('div', {
    className: 'modal__content',
    attributes: { role: 'dialog', 'aria-modal': 'true' },
  });

  public constructor(
    private readonly root: HTMLElement,
    private readonly options: TaskDialogOptions,
  ) {
    const deleteButton = createElement('button', {
      className: 'modal__delete',
      text: 'Eliminar',
      attributes: { type: 'button' },
    });
    deleteButton.addEventListener('click', () => {
      this.handleDelete();
    });

    const closeButton = createElement('button', {
      className: 'modal__close',
      text: 'Cerrar',
      attributes: { type: 'button' },
    });
    closeButton.addEventListener('click', () => {
      this.close();
    });

    const actions = createElement('div', { className: 'modal__actions' });
    actions.append(deleteButton, closeButton);

    this.content.append(this.subject, this.date, this.description, actions);
    this.root.append(this.content);

    this.root.addEventListener('click', (event) => {
      if (event.target === this.root) {
        this.close();
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.close();
      }
    });

    this.close();
  }

  public open(task: Task | null): void {
    if (task === null) {
      return;
    }
    this.currentTaskId = task.id;
    this.subject.textContent = task.subject;
    this.subject.style.setProperty('--task-color', subjectColor(task.subject));
    this.date.textContent = formatLongDate(task.date);
    this.description.textContent = task.description;
    this.root.hidden = false;
  }

  public close(): void {
    this.currentTaskId = null;
    this.root.hidden = true;
  }

  private handleDelete(): void {
    const taskId = this.currentTaskId;
    if (taskId === null) {
      return;
    }
    this.options.onDelete(taskId);
    this.close();
  }
}
