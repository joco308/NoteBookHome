import { formatLongDate } from '../domain/date';
import type { NewTaskInput } from '../domain/task';
import { validateNewTask } from '../domain/taskValidation';
import { createElement } from './dom';
import { TaskFields } from './taskFields';

export interface TaskFormOptions {
  readonly onCreate: (input: NewTaskInput) => void;
}

export class TaskFormView {
  private date: string | null = null;

  private readonly form = createElement('form', { className: 'task-form' });
  private readonly heading = createElement('h2', { className: 'task-form__title', text: 'Selecciona una fecha' });
  private readonly fields = new TaskFields('task-form');
  private readonly statusError = createElement('p', { className: 'task-form__status' });
  private readonly submitButton = createElement('button', {
    className: 'task-form__submit',
    text: 'Agregar tarea',
    attributes: { type: 'submit' },
  });

  public constructor(
    private readonly root: HTMLElement,
    private readonly options: TaskFormOptions,
  ) {
    this.form.append(this.heading, this.fields.element, this.submitButton, this.statusError);
    this.form.addEventListener('submit', (event) => {
      this.handleSubmit(event);
    });
    this.root.append(this.form);
    this.setDisabled(true);
  }

  public setDate(isoDate: string): void {
    this.date = isoDate;
    this.heading.textContent = `Nueva tarea · ${formatLongDate(isoDate)}`;
    this.setDisabled(false);
  }

  private handleSubmit(event: SubmitEvent): void {
    event.preventDefault();
    if (this.date === null) {
      return;
    }

    const values = this.fields.values();
    const input: NewTaskInput = {
      subject: values.subject,
      description: values.description,
      date: this.date,
    };

    const result = validateNewTask(input);
    this.fields.showIssues(result.issues);
    this.statusError.textContent = '';
    if (!result.valid) {
      return;
    }

    try {
      this.options.onCreate(input);
      this.fields.reset();
    } catch (error) {
      this.statusError.textContent = error instanceof Error ? error.message : 'No se pudo guardar la tarea.';
    }
  }

  private setDisabled(disabled: boolean): void {
    this.fields.setDisabled(disabled);
    this.submitButton.disabled = disabled;
  }
}
