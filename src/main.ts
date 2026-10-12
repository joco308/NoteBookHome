import { LocalStorageTaskRepository } from './data/localStorageTaskRepository';
import { toIsoDate, todayParts } from './domain/date';
import { TaskService } from './services/taskService';
import { CalendarView } from './ui/calendarView';
import { DayPanelView } from './ui/dayPanelView';
import { selectElement } from './ui/dom';
import { TaskDialogView } from './ui/taskDialogView';
import { TaskFormView } from './ui/taskFormView';

function bootstrap(): void {
  const repository = new LocalStorageTaskRepository(window.localStorage);
  const service = new TaskService(repository);

  const calendarRoot = selectElement<HTMLElement>(document, '#calendar');
  const dayPanelRoot = selectElement<HTMLElement>(document, '#day-panel');
  const formRoot = selectElement<HTMLElement>(document, '#task-form');
  const dialogRoot = selectElement<HTMLElement>(document, '#task-dialog');

  const dialog = new TaskDialogView(dialogRoot, {
    onDelete: (taskId) => {
      service.remove(taskId);
    },
  });

  const dayPanel = new DayPanelView(dayPanelRoot, {
    onOpenTask: (taskId) => {
      dialog.open(service.find(taskId));
    },
    onCreateRequest: () => {
      formRoot.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
  });

  const form = new TaskFormView(formRoot, {
    onCreate: (input) => {
      service.add(input);
    },
  });

  const calendar = new CalendarView(calendarRoot, {
    onSelectDate: (isoDate) => {
      calendar.setSelectedDate(isoDate);
      dayPanel.setDate(isoDate);
      form.setDate(isoDate);
    },
    onOpenTask: (taskId) => {
      dialog.open(service.find(taskId));
    },
  });

  service.subscribe((tasks) => {
    calendar.setTasks(tasks);
    dayPanel.setTasks(tasks);
  });

  const today = toIsoDate(todayParts());
  calendar.setTasks(service.list());
  dayPanel.setTasks(service.list());
  calendar.setSelectedDate(today);
  dayPanel.setDate(today);
  form.setDate(today);
}

bootstrap();
