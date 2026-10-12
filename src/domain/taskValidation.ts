import type { NewTaskInput } from './task';

export interface ValidationIssue {
  readonly field: 'subject' | 'description';
  readonly message: string;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
}

const MAX_SUBJECT_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 500;

export function validateNewTask(input: NewTaskInput): ValidationResult {
  const issues: ValidationIssue[] = [];
  const subject = input.subject.trim();
  const description = input.description.trim();

  if (subject.length === 0) {
    issues.push({ field: 'subject', message: 'La materia es obligatoria.' });
  } else if (subject.length > MAX_SUBJECT_LENGTH) {
    issues.push({ field: 'subject', message: `Máximo ${MAX_SUBJECT_LENGTH} caracteres.` });
  }

  if (description.length === 0) {
    issues.push({ field: 'description', message: 'La descripción es obligatoria.' });
  } else if (description.length > MAX_DESCRIPTION_LENGTH) {
    issues.push({ field: 'description', message: `Máximo ${MAX_DESCRIPTION_LENGTH} caracteres.` });
  }

  return { valid: issues.length === 0, issues };
}
