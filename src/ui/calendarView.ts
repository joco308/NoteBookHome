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
import { subjectColor } from './subjectColor';
import { readTaskId, writeTaskId } from './taskDrag';

export interface CalendarViewOptions {
  readonly onSelectDate: (isoDate: string) => void;
  readonly onOpenTask: (taskId: string) => void;
  readonly onMoveTask: (taskId: string, isoDate: string) => void;
}

export class CalendarView {
  private yearMonth: YearMonth;
  private selectedDate: string | null = null;
  private readonly tasksByDate = new Map<string, Task[]>();
  private dropTarget: HTMLElement | null = null;

  public constructor(
    private readonly root: HTMLElement,
    private readonly options: CalendarViewOptions,
  ) {
    this.yearMonth = toYearMonth(todayParts());
    this.attachDragAndDrop();
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

  private attachDragAndDrop(): void {
    this.root.addEventListener('dragstart', (event) => {
      this.handleDragStart(event);
    });
    this.root.addEventListener('dragover', (event) => {
      this.handleDragOver(event);
    });
    this.root.addEventListener('dragleave', (event) => {
      this.handleDragLeave(event);
    });
    this.root.addEventListener('drop', (event) => {
      this.handleDrop(event);
    });
    document.addEventListener('dragend', () => {
      this.handleDragEnd();
    });
  }

  private handleDragStart(event: DragEvent): void {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const chip = target.closest<HTMLElement>('.calendar__task-button');
    if (chip === null) {
      return;
    }
    const taskId = chip.dataset.taskId;
    if (taskId === undefined) {
      return;
    }
    chip.classList.add('calendar__task-button--dragging');
    writeTaskId(event, taskId);
  }

  private handleDragOver(event: DragEvent): void {
    const cell = this.findDateCell(event.target);
    if (cell === null) {
      return;
    }
    event.preventDefault();
    if (event.dataTransfer !== null) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.setDropTarget(cell);
  }

  private handleDragLeave(event: DragEvent): void {
    const cell = this.dropTarget;
    if (cell === null) {
      return;
    }
    const related = event.relatedTarget;
    if (related instanceof Node && cell.contains(related)) {
      return;
    }
    this.clearDropTarget();
  }

  private handleDrop(event: DragEvent): void {
    const cell = this.findDateCell(event.target);
    if (cell === null) {
      this.clearDropTarget();
      return;
    }
    event.preventDefault();
    const taskId = readTaskId(event);
    const isoDate = cell.dataset.date;
    this.clearDropTarget();
    if (taskId === null || isoDate === undefined) {
      return;
    }
    this.options.onMoveTask(taskId, isoDate);
  }

  private handleDragEnd(): void {
    this.clearDropTarget();
    const dragging = this.root.querySelectorAll('.calendar__task-button--dragging');
    dragging.forEach((element) => {
      element.classList.remove('calendar__task-button--dragging');
    });
  }

  private findDateCell(target: EventTarget | null): HTMLElement | null {
    if (!(target instanceof HTMLElement)) {
      return null;
    }
    const cell = target.closest<HTMLElement>('.calendar__cell');
    if (cell === null || cell.dataset.date === undefined) {
      return null;
    }
    return cell;
  }

  private setDropTarget(cell: HTMLElement): void {
    if (this.dropTarget === cell) {
      return;
    }
    this.clearDropTarget();
    this.dropTarget = cell;
    cell.classList.add('calendar__cell--drop-target');
  }

  private clearDropTarget(): void {
    if (this.dropTarget !== null) {
      this.dropTarget.classList.remove('calendar__cell--drop-target');
      this.dropTarget = null;
    }
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
    const button = createElement('button', {
      className: 'calendar__task-button',
      text: task.subject,
      attributes: {
        type: 'button',
        draggable: 'true',
        'data-task-id': task.id,
        title: `${task.subject}: ${task.description}`,
      },
    });
    button.style.setProperty('--task-color', subjectColor(task.subject));
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      this.options.onOpenTask(task.id);
    });
    item.append(button);
    return item;
  }
}
