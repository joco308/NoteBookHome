import { formatLongDate } from '../domain/date';
import type { NewTaskInput } from '../domain/task';
import { validateNewTask, type ValidationIssue } from '../domain/taskValidation';
import { createElement } from './dom';

export interface TaskFormOptions {
  readonly onCreate: (input: NewTaskInput) => void;
}

export class TaskFormView {
  private date: string | null = null;

  private readonly form = createElement('form', { className: 'task-form' });
  private readonly heading = createElement('h2', { className: 'task-form__title', text: 'Selecciona una fecha' });

  private readonly subjectInput = createElement('input', {
    className: 'task-form__control',
    attributes: {
      id: 'task-subject',
      type: 'text',
      name: 'subject',
      maxlength: '60',
      placeholder: 'Ej. Matemáticas',
    },
  });
  private readonly subjectError = createElement('p', { className: 'task-form__error' });

  private readonly descriptionInput = createElement('textarea', {
    className: 'task-form__control',
    attributes: {
      id: 'task-description',
      name: 'description',
      rows: '4',
      maxlength: '500',
      placeholder: 'Detalles de la tarea…',
    },
  });
  private readonly descriptionError = createElement('p', { className: 'task-form__error' });

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
    this.form.append(
      this.heading,
      this.buildField('task-subject', 'Materia', this.subjectInput, this.subjectError),
      this.buildField('task-description', 'Descripción', this.descriptionInput, this.descriptionError),
      this.submitButton,
      this.statusError,
    );
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

  private buildField(id: string, labelText: string, control: HTMLElement, error: HTMLElement): HTMLElement {
    const wrapper = createElement('div', { className: 'task-form__field' });
    const label = createElement('label', { className: 'task-form__label', text: labelText, attributes: { for: id } });
    wrapper.append(label, control, error);
    return wrapper;
  }

  private handleSubmit(event: SubmitEvent): void {
    event.preventDefault();
    if (this.date === null) {
      return;
    }

    const input: NewTaskInput = {
      subject: this.subjectInput.value,
      description: this.descriptionInput.value,
      date: this.date,
    };

    const result = validateNewTask(input);
    this.showIssues(result.issues);
    if (!result.valid) {
      return;
    }

    try {
      this.options.onCreate(input);
      this.reset();
    } catch (error) {
      this.statusError.textContent = error instanceof Error ? error.message : 'No se pudo guardar la tarea.';
    }
  }

  private showIssues(issues: readonly ValidationIssue[]): void {
    this.subjectError.textContent = '';
    this.descriptionError.textContent = '';
    this.statusError.textContent = '';
    for (const issue of issues) {
      this.errorElementFor(issue.field).textContent = issue.message;
    }
  }

  private errorElementFor(field: ValidationIssue['field']): HTMLParagraphElement {
    switch (field) {
      case 'subject':
        return this.subjectError;
      case 'description':
        return this.descriptionError;
    }
  }

  private reset(): void {
    this.form.reset();
    this.subjectError.textContent = '';
    this.descriptionError.textContent = '';
    this.statusError.textContent = '';
  }

  private setDisabled(disabled: boolean): void {
    this.subjectInput.disabled = disabled;
    this.descriptionInput.disabled = disabled;
    this.submitButton.disabled = disabled;
  }
}
