import type { ValidationIssue } from '../domain/taskValidation';
import { createElement } from './dom';

export interface TaskFieldValues {
  readonly subject: string;
  readonly description: string;
}

/**
 * Grupo reutilizable de campos Materia + Descripción con sus mensajes de error.
 * Se usa tanto en el formulario de alta como en la edición del modal.
 */
export class TaskFields {
  public readonly element: HTMLElement;

  private readonly subjectInput: HTMLInputElement;
  private readonly subjectError: HTMLParagraphElement;
  private readonly descriptionInput: HTMLTextAreaElement;
  private readonly descriptionError: HTMLParagraphElement;

  public constructor(idPrefix: string) {
    const subjectId = `${idPrefix}-subject`;
    const descriptionId = `${idPrefix}-description`;

    this.subjectInput = createElement('input', {
      className: 'task-form__control',
      attributes: {
        id: subjectId,
        type: 'text',
        name: 'subject',
        maxlength: '60',
        placeholder: 'Ej. Matemáticas',
      },
    });
    this.subjectError = createElement('p', { className: 'task-form__error' });

    this.descriptionInput = createElement('textarea', {
      className: 'task-form__control',
      attributes: {
        id: descriptionId,
        name: 'description',
        rows: '4',
        maxlength: '500',
        placeholder: 'Detalles de la tarea…',
      },
    });
    this.descriptionError = createElement('p', { className: 'task-form__error' });

    this.element = createElement('div', { className: 'task-fields' });
    this.element.append(
      buildField(subjectId, 'Materia', this.subjectInput, this.subjectError),
      buildField(descriptionId, 'Descripción', this.descriptionInput, this.descriptionError),
    );
  }

  public values(): TaskFieldValues {
    return { subject: this.subjectInput.value, description: this.descriptionInput.value };
  }

  public fill(values: TaskFieldValues): void {
    this.subjectInput.value = values.subject;
    this.descriptionInput.value = values.description;
  }

  public showIssues(issues: readonly ValidationIssue[]): void {
    this.clear();
    for (const issue of issues) {
      this.errorElementFor(issue.field).textContent = issue.message;
    }
  }

  public reset(): void {
    this.subjectInput.value = '';
    this.descriptionInput.value = '';
    this.clear();
  }

  public clear(): void {
    this.subjectError.textContent = '';
    this.descriptionError.textContent = '';
  }

  /** Lleva el foco al campo Materia sin desplazar la página. */
  public focusSubject(): void {
    this.subjectInput.focus({ preventScroll: true });
  }

  public setDisabled(disabled: boolean): void {
    this.subjectInput.disabled = disabled;
    this.descriptionInput.disabled = disabled;
  }

  private errorElementFor(field: ValidationIssue['field']): HTMLParagraphElement {
    switch (field) {
      case 'subject':
        return this.subjectError;
      case 'description':
        return this.descriptionError;
    }
  }
}

function buildField(id: string, labelText: string, control: HTMLElement, error: HTMLElement): HTMLElement {
  const wrapper = createElement('div', { className: 'task-form__field' });
  const label = createElement('label', { className: 'task-form__label', text: labelText, attributes: { for: id } });
  wrapper.append(label, control, error);
  return wrapper;
}
