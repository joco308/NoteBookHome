import { formatLongDate } from '../domain/date';
import type { Task } from '../domain/task';
import { createElement } from './dom';
import { subjectColor } from './subjectColor';
import { writeTaskId } from './taskDrag';

export interface DayPanelOptions {
  readonly onOpenTask: (taskId: string) => void;
  readonly onCreateRequest: () => void;
}

export class DayPanelView {
  private date: string | null = null;
  private tasks: readonly Task[] = [];

  public constructor(
    private readonly root: HTMLElement,
    private readonly options: DayPanelOptions,
  ) {}

  public setDate(isoDate: string): void {
    this.date = isoDate;
    this.render();
  }

  public setTasks(tasks: readonly Task[]): void {
    this.tasks = tasks;
    this.render();
  }

  private render(): void {
    this.root.replaceChildren();
    if (this.date === null) {
      this.root.append(createElement('p', { className: 'day-panel__empty', text: 'Selecciona una fecha.' }));
      return;
    }

    const header = createElement('div', { className: 'day-panel__header' });
    header.append(createElement('h2', { className: 'day-panel__title', text: formatLongDate(this.date) }));

    const addButton = createElement('button', {
      className: 'day-panel__add',
      text: '+ Nueva tarea',
      attributes: { type: 'button' },
    });
    addButton.addEventListener('click', () => {
      this.options.onCreateRequest();
    });
    header.append(addButton);
    this.root.append(header);

    const dayTasks = this.tasks.filter((task) => task.date === this.date);
    if (dayTasks.length === 0) {
      this.root.append(createElement('p', { className: 'day-panel__empty', text: 'Sin tareas para este día.' }));
      return;
    }

    const list = createElement('ul', { className: 'day-panel__list' });
    for (const task of dayTasks) {
      list.append(this.renderItem(task));
    }
    this.root.append(list);
  }

  private renderItem(task: Task): HTMLElement {
    const item = createElement('li', { className: 'day-panel__item' });
    const button = createElement('button', {
      className: 'day-panel__item-button',
      attributes: { type: 'button', draggable: 'true', 'data-task-id': task.id },
    });

    const subject = createElement('span', { className: 'day-panel__subject', text: task.subject });
    subject.style.setProperty('--task-color', subjectColor(task.subject));

    button.append(subject, createElement('span', { className: 'day-panel__item-description', text: task.description }));
    button.addEventListener('click', () => {
      this.options.onOpenTask(task.id);
    });
    button.addEventListener('dragstart', (event) => {
      writeTaskId(event, task.id);
      button.classList.add('day-panel__item-button--dragging');
    });
    button.addEventListener('dragend', () => {
      button.classList.remove('day-panel__item-button--dragging');
    });
    item.append(button);
    return item;
  }
}
