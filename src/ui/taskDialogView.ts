import { formatLongDate } from '../domain/date';
import type { NewTaskInput, Task } from '../domain/task';
import { validateNewTask } from '../domain/taskValidation';
import { createElement } from './dom';
import { subjectColor } from './subjectColor';
import { TaskFields } from './taskFields';

export interface TaskDialogOptions {
  readonly onDelete: (taskId: string) => void;
  readonly onUpdate: (taskId: string, input: NewTaskInput) => Task;
}

type DialogMode = 'view' | 'edit';

export class TaskDialogView {
  private task: Task | null = null;
  private mode: DialogMode = 'view';

  private readonly content = createElement('div', {
    className: 'modal__content',
    attributes: { role: 'dialog', 'aria-modal': 'true' },
  });

  private readonly viewSection = createElement('div', { className: 'modal__section' });
  private readonly subject = createElement('h2', { className: 'modal__title' });
  private readonly date = createElement('p', { className: 'modal__date' });
  private readonly description = createElement('p', { className: 'modal__description' });

  private readonly editSection = createElement('div', { className: 'modal__section' });
  private readonly editFields = new TaskFields('task-edit');
  private readonly editError = createElement('p', { className: 'task-form__status' });

  public constructor(
    private readonly root: HTMLElement,
    private readonly options: TaskDialogOptions,
  ) {
    this.buildViewSection();
    this.buildEditSection();
    this.content.append(this.viewSection, this.editSection);
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
    this.task = task;
    this.enterView();
    this.root.hidden = false;
  }

  public close(): void {
    this.task = null;
    this.mode = 'view';
    this.editFields.clear();
    this.editError.textContent = '';
    this.root.hidden = true;
  }

  private buildViewSection(): void {
    const editButton = createElement('button', {
      className: 'modal__edit',
      text: 'Editar',
      attributes: { type: 'button' },
    });
    editButton.addEventListener('click', () => {
      this.enterEdit();
    });

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
    actions.append(deleteButton, editButton, closeButton);

    this.viewSection.append(this.subject, this.date, this.description, actions);
  }

  private buildEditSection(): void {
    const cancelButton = createElement('button', {
      className: 'modal__cancel',
      text: 'Cancelar',
      attributes: { type: 'button' },
    });
    cancelButton.addEventListener('click', () => {
      this.enterView();
    });

    const saveButton = createElement('button', {
      className: 'modal__save',
      text: 'Guardar',
      attributes: { type: 'submit' },
    });

    const actions = createElement('div', { className: 'modal__actions' });
    actions.append(cancelButton, saveButton);

    const form = createElement('form', { className: 'modal__edit-form' });
    form.append(this.editFields.element, this.editError, actions);
    form.addEventListener('submit', (event) => {
      this.handleSave(event);
    });

    this.editSection.append(createElement('h2', { className: 'modal__title', text: 'Editar tarea' }), form);
  }

  private enterView(): void {
    this.mode = 'view';
    this.editFields.clear();
    this.editError.textContent = '';
    this.render();
  }

  private enterEdit(): void {
    const task = this.task;
    if (task === null) {
      return;
    }
    this.mode = 'edit';
    this.editFields.fill({ subject: task.subject, description: task.description });
    this.editError.textContent = '';
    this.editFields.clear();
    this.render();
  }

  private render(): void {
    const task = this.task;
    if (task === null) {
      return;
    }

    const editing = this.mode === 'edit';
    this.viewSection.hidden = editing;
    this.editSection.hidden = !editing;

    if (!editing) {
      this.subject.textContent = task.subject;
      this.subject.style.setProperty('--task-color', subjectColor(task.subject));
      this.date.textContent = formatLongDate(task.date);
      this.description.textContent = task.description;
    }
  }

  private handleSave(event: SubmitEvent): void {
    event.preventDefault();
    const task = this.task;
    if (task === null) {
      return;
    }

    const values = this.editFields.values();
    const input: NewTaskInput = {
      subject: values.subject,
      description: values.description,
      date: task.date,
    };

    const result = validateNewTask(input);
    this.editFields.showIssues(result.issues);
    this.editError.textContent = '';
    if (!result.valid) {
      return;
    }

    try {
      const updated = this.options.onUpdate(task.id, input);
      this.task = updated;
      this.enterView();
    } catch (error) {
      this.editError.textContent = error instanceof Error ? error.message : 'No se pudo guardar la tarea.';
    }
  }

  private handleDelete(): void {
    const task = this.task;
    if (task === null) {
      return;
    }
    this.options.onDelete(task.id);
    this.close();
  }
}
