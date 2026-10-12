const PALETTE: readonly string[] = [
  '#4f46e5',
  '#0891b2',
  '#059669',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#db2777',
  '#0d9488',
];

const FALLBACK_COLOR = '#4f46e5';

/** Color estable derivado del nombre de la materia. */
export function subjectColor(subject: string): string {
  let hash = 0;
  for (let index = 0; index < subject.length; index += 1) {
    hash = (hash * 31 + subject.charCodeAt(index)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length] ?? FALLBACK_COLOR;
}
