import {
  addMonths,
  daysInMonth,
  firstWeekdayOfMonth,
  formatLongDate,
  formatMonthLabel,
  parseIsoDate,
  toIsoDate,
  todayParts,
  toYearMonth,
  WEEKDAY_LABELS,
  type YearMonth,
} from '../domain/date';
import type { Task } from '../domain/task';
import { createElement } from './dom';
import type { DragTarget } from './dragController';
import { subjectColor } from './subjectColor';

export interface CalendarViewOptions {
  readonly onSelectDate: (isoDate: string) => void;
  readonly onOpenTask: (taskId: string) => void;
}

export class CalendarView {
  private yearMonth: YearMonth;
  private selectedDate: string | null = null;
  private readonly tasksByDate = new Map<string, Task[]>();

  public constructor(
    private readonly root: HTMLElement,
    private readonly options: CalendarViewOptions,
  ) {
    this.yearMonth = toYearMonth(todayParts());
  }

  public setSelectedDate(isoDate: string): void {
    this.selectedDate = isoDate;
    const parts = parseIsoDate(isoDate);
    if (parts !== null) {
      this.yearMonth = { year: parts.year, month: parts.month };
    }
    this.render();
  }

  public setTasks(tasks: readonly Task[]): void {
    this.tasksByDate.clear();
    for (const task of tasks) {
      const bucket = this.tasksByDate.get(task.date);
      if (bucket === undefined) {
        this.tasksByDate.set(task.date, [task]);
      } else {
        bucket.push(task);
      }
    }
    this.render();
  }

  /**
   * Localiza la celda-día que hay bajo un punto de la pantalla.
   * La usa el DragController para saber sobre qué fecha se está soltando la tarea.
   */
  public resolveDropTarget(clientX: number, clientY: number): DragTarget<string> | null {
    const element = document.elementFromPoint(clientX, clientY);
    if (!(element instanceof HTMLElement)) {
      return null;
    }
    const cell = element.closest<HTMLElement>('.calendar__cell');
    if (cell === null) {
      return null;
    }
    const isoDate = cell.dataset.date;
    if (isoDate === undefined) {
      return null;
    }
    return { element: cell, value: isoDate };
  }

  private render(): void {
    this.root.replaceChildren(this.renderToolbar(), this.renderGrid());
  }

  private renderToolbar(): HTMLElement {
    const toolbar = createElement('div', { className: 'calendar__toolbar' });

    const previous = createElement('button', {
      className: 'calendar__nav',
      text: '‹',
      attributes: { type: 'button', 'aria-label': 'Mes anterior' },
    });
    previous.addEventListener('click', () => {
      this.yearMonth = addMonths(this.yearMonth, -1);
      this.render();
    });

    const label = createElement('h2', {
      className: 'calendar__label',
      text: formatMonthLabel(this.yearMonth),
    });

    const next = createElement('button', {
      className: 'calendar__nav',
      text: '›',
      attributes: { type: 'button', 'aria-label': 'Mes siguiente' },
    });
    next.addEventListener('click', () => {
      this.yearMonth = addMonths(this.yearMonth, 1);
      this.render();
    });

    const today = createElement('button', {
      className: 'calendar__today',
      text: 'Hoy',
      attributes: { type: 'button' },
    });
    today.addEventListener('click', () => {
      this.options.onSelectDate(toIsoDate(todayParts()));
    });

    toolbar.append(previous, label, next, today);
    return toolbar;
  }

  private renderGrid(): HTMLElement {
    const grid = createElement('div', { className: 'calendar__grid' });

    for (const dayLabel of WEEKDAY_LABELS) {
      grid.append(createElement('div', { className: 'calendar__weekday', text: dayLabel }));
    }

    const leadingBlanks = firstWeekdayOfMonth(this.yearMonth.year, this.yearMonth.month);
    for (let index = 0; index < leadingBlanks; index += 1) {
      grid.append(createElement('div', { className: 'calendar__cell calendar__cell--empty' }));
    }

    const totalDays = daysInMonth(this.yearMonth.year, this.yearMonth.month);
    const todayIso = toIsoDate(todayParts());
    for (let day = 1; day <= totalDays; day += 1) {
      const isoDate = toIsoDate({ year: this.yearMonth.year, month: this.yearMonth.month, day });
      grid.append(this.renderDayCell(isoDate, day, todayIso));
    }

    return grid;
  }

  private renderDayCell(isoDate: string, day: number, todayIso: string): HTMLElement {
    const classNames = ['calendar__cell'];
    if (isoDate === todayIso) {
      classNames.push('calendar__cell--today');
    }
    if (isoDate === this.selectedDate) {
      classNames.push('calendar__cell--selected');
    }
    const cell = createElement('div', {
      className: classNames.join(' '),
      attributes: { 'data-date': isoDate },
    });

    // Botón transparente que cubre toda la celda: cualquier punto del día es clickeable.
    const dayButton = createElement('button', {
      className: 'calendar__day',
      attributes: { type: 'button', 'aria-label': formatLongDate(isoDate) },
    });
    dayButton.addEventListener('click', () => {
      this.options.onSelectDate(isoDate);
    });

    // Capa de contenido en flujo, por encima del botón; no intercepta clics salvo los chips.
    const content = createElement('div', { className: 'calendar__cell-content' });
    content.append(createElement('span', { className: 'calendar__day-number', text: String(day) }));

    const tasks = this.tasksByDate.get(isoDate) ?? [];
    if (tasks.length > 0) {
      const list = createElement('ul', { className: 'calendar__tasks' });
      for (const task of tasks) {
        list.append(this.renderTaskChip(task));
      }
      content.append(list);
    }

    cell.append(dayButton, content);
    return cell;
  }

  private renderTaskChip(task: Task): HTMLElement {
    const item = createElement('li', { className: 'calendar__task' });
    const color = subjectColor(task.subject);
    const button = createElement('button', {
      className: 'calendar__task-button',
      text: task.subject,
      attributes: {
        type: 'button',
        'data-task-id': task.id,
        'data-drag-label': task.subject,
        'data-drag-color': color,
        title: `${task.subject}: ${task.description}`,
      },
    });
    button.style.setProperty('--task-color', color);
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      this.options.onOpenTask(task.id);
    });
    item.append(button);
    return item;
  }
}
