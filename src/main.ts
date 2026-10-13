import { LocalStorageTaskRepository } from './data/localStorageTaskRepository';
import { toIsoDate, todayParts } from './domain/date';
import { TaskService } from './services/taskService';
import { CalendarView } from './ui/calendarView';
import { DayPanelView } from './ui/dayPanelView';
import { selectElement } from './ui/dom';
import { DragController } from './ui/dragController';
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
    onUpdate: (taskId, input) => service.update(taskId, input),
  });

  const form = new TaskFormView(formRoot, {
    onCreate: (input) => {
      service.add(input);
    },
  });

  const dayPanel = new DayPanelView(dayPanelRoot, {
    onOpenTask: (taskId) => {
      dialog.open(service.find(taskId));
    },
    onCreateRequest: () => {
      form.open();
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

  // Un único controlador de arrastre para los chips del calendario y el panel del día.
  const dragController = new DragController<string>({
    resolveTarget: (clientX, clientY) => calendar.resolveDropTarget(clientX, clientY),
    onDrop: (taskId, target) => {
      service.moveToDate(taskId, target.value);
    },
  });
  dragController.attach(document.body);

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
