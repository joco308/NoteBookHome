import { formatLongDate } from '../domain/date';
import type { NewTaskInput } from '../domain/task';
import { validateNewTask } from '../domain/taskValidation';
import { createElement } from './dom';
import { TaskFields } from './taskFields';

export interface TaskFormOptions {
  readonly onCreate: (input: NewTaskInput) => void;
}

/** Clase que hace visible el formulario en móvil (en escritorio siempre se muestra). */
const OPEN_CLASS = 'task-form-host--open';

export class TaskFormView {
  private date: string | null = null;

  private readonly form = createElement('form', { className: 'task-form' });
  private readonly heading = createElement('h2', { className: 'task-form__title', text: 'Selecciona una fecha' });
  private readonly closeButton = createElement('button', {
    className: 'task-form__close',
    text: 'Cerrar',
    attributes: { type: 'button', 'aria-label': 'Cerrar el formulario de nueva tarea' },
  });
  private readonly header = createElement('div', { className: 'task-form__header' });
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
    this.header.append(this.heading, this.closeButton);
    this.form.append(this.header, this.fields.element, this.submitButton, this.statusError);
    this.form.addEventListener('submit', (event) => {
      this.handleSubmit(event);
    });
    this.closeButton.addEventListener('click', () => {
      this.close();
    });
    this.root.append(this.form);
    this.setDisabled(true);
  }

  /** Muestra el formulario (en móvil está oculto hasta que se pide crear una tarea). */
  public open(): void {
    this.root.classList.add(OPEN_CLASS);
    this.root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (this.date !== null) {
      this.fields.focusSubject();
    }
  }

  public close(): void {
    this.root.classList.remove(OPEN_CLASS);
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
