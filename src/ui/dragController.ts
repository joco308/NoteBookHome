/**
 * Controlador de arrastre de tareas basado en Pointer Events.
 *
 * Un único gesto sirve para todos los dispositivos: con ratón el arrastre empieza al
 * mover unos píxeles y en táctil o lápiz requiere una pulsación larga, de modo que
 * mover una tarea de día funciona también en móvil y tablet.
 */

const LONG_PRESS_DELAY_MS = 300;
const MOUSE_MOVE_THRESHOLD_PX = 4;
const TOUCH_MOVE_TOLERANCE_PX = 12;
const AUTO_SCROLL_EDGE_PX = 72;
const AUTO_SCROLL_MAX_STEP_PX = 14;

const DRAG_COLOR_PROPERTY = '--drag-color';
const DRAG_TARGET_CLASS = 'is-drag-target';
const DRAG_SOURCE_CLASS = 'is-dragging-source';
const DRAGGING_BODY_CLASS = 'is-dragging';
const GHOST_CLASS = 'drag-ghost';

export interface DragTarget<TValue> {
  /** Elemento que se resalta mientras es el destino del arrastre. */
  readonly element: HTMLElement;
  /** Dato asociado al destino; en este proyecto, la fecha ISO. */
  readonly value: TValue;
}

export interface DragControllerOptions<TValue> {
  /** Resuelve el destino que hay bajo un punto de la pantalla, o null si no hay ninguno. */
  readonly resolveTarget: (clientX: number, clientY: number) => DragTarget<TValue> | null;
  /** Se invoca al soltar una tarea sobre un destino válido. */
  readonly onDrop: (taskId: string, target: DragTarget<TValue>) => void;
}

/** Origen de un arrastre: el elemento con `data-task-id` sobre el que se pulsó. */
interface DragSource {
  readonly element: HTMLElement;
  readonly taskId: string;
  readonly label: string;
  readonly color: string;
  readonly pointerId: number;
  readonly pointerType: string;
  readonly startX: number;
  readonly startY: number;
}

export class DragController<TValue> {
  private readonly abortController = new AbortController();

  private pending: DragSource | null = null;
  private active: DragSource | null = null;
  private ghost: HTMLElement | null = null;
  private currentTarget: DragTarget<TValue> | null = null;
  private longPressTimer: number | null = null;
  private autoScrollFrame: number | null = null;
  private autoScrollStep = 0;
  private pointerX = 0;
  private pointerY = 0;
  private suppressClick = false;

  public constructor(private readonly options: DragControllerOptions<TValue>) {}

  /** Escucha desde un contenedor que englobe todos los orígenes de arrastre. */
  public attach(root: HTMLElement): void {
    const { signal } = this.abortController;

    root.addEventListener('pointerdown', (event) => {
      this.handlePointerDown(event);
    }, { signal });
    document.addEventListener('pointermove', (event) => {
      this.handlePointerMove(event);
    }, { passive: false, signal });
    document.addEventListener('pointerup', (event) => {
      this.handlePointerUp(event);
    }, { signal });
    document.addEventListener('pointercancel', () => {
      this.cancel();
    }, { signal });
    document.addEventListener('keydown', (event) => {
      this.handleKeyDown(event);
    }, { signal });
    document.addEventListener('contextmenu', (event) => {
      this.handleContextMenu(event);
    }, { signal });
    document.addEventListener('click', (event) => {
      this.handleClick(event);
    }, { capture: true, signal });
    document.addEventListener('touchmove', (event) => {
      this.handleTouchMove(event);
    }, { passive: false, signal });
  }

  /** Libera los escuchas globales y cualquier arrastre en curso. */
  public detach(): void {
    this.cancel();
    this.abortController.abort();
  }

  private handlePointerDown(event: PointerEvent): void {
    this.suppressClick = false;
    if (this.active !== null) {
      this.cancel();
    }
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const element = target.closest<HTMLElement>('[data-task-id]');
    if (element === null) {
      return;
    }
    const taskId = element.dataset.taskId;
    if (taskId === undefined) {
      return;
    }

    const source: DragSource = {
      element,
      taskId,
      label: element.dataset.dragLabel ?? element.textContent?.trim() ?? '',
      color: element.dataset.dragColor ?? '',
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      startX: event.clientX,
      startY: event.clientY,
    };
    this.pending = source;

    // Con ratón basta con mover el puntero; en táctil hace falta pulsación larga.
    if (event.pointerType === 'mouse') {
      return;
    }
    this.longPressTimer = window.setTimeout(() => {
      this.activate(source);
    }, LONG_PRESS_DELAY_MS);
  }

  private handlePointerMove(event: PointerEvent): void {
    const active = this.active;
    if (active !== null) {
      if (event.pointerId !== active.pointerId) {
        return;
      }
      this.updateDrag(event.clientX, event.clientY);
      return;
    }

    const pending = this.pending;
    if (pending === null || event.pointerId !== pending.pointerId) {
      return;
    }
    const distance = Math.hypot(event.clientX - pending.startX, event.clientY - pending.startY);

    if (pending.pointerType === 'mouse') {
      if (distance < MOUSE_MOVE_THRESHOLD_PX) {
        return;
      }
      this.activate(pending);
      this.updateDrag(event.clientX, event.clientY);
      return;
    }

    // Si el dedo se desplaza antes de la pulsación larga, el gesto es un scroll.
    if (distance > TOUCH_MOVE_TOLERANCE_PX) {
      this.cancelPending();
    }
  }

  private handlePointerUp(event: PointerEvent): void {
    const active = this.active;
    if (active !== null) {
      if (event.pointerId !== active.pointerId) {
        return;
      }
      const target = this.options.resolveTarget(event.clientX, event.clientY);
      const taskId = active.taskId;
      this.cancel();
      if (target !== null) {
        this.options.onDrop(taskId, target);
      }
      return;
    }

    const pending = this.pending;
    if (pending !== null && event.pointerId === pending.pointerId) {
      this.cancelPending();
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && (this.active !== null || this.pending !== null)) {
      this.cancel();
    }
  }

  private handleContextMenu(event: MouseEvent): void {
    if (this.active !== null || this.pending !== null) {
      event.preventDefault();
    }
  }

  private handleClick(event: MouseEvent): void {
    if (!this.suppressClick) {
      return;
    }
    // Evita que el clic posterior al arrastre abra la tarea.
    this.suppressClick = false;
    event.preventDefault();
    event.stopPropagation();
  }

  private handleTouchMove(event: TouchEvent): void {
    // Con el arrastre activo se bloquea el scroll de la página.
    if (this.active !== null) {
      event.preventDefault();
    }
  }

  private activate(source: DragSource): void {
    if (this.active !== null || this.pending !== source) {
      return;
    }
    this.clearLongPress();
    this.pending = null;
    this.active = source;
    this.suppressClick = true;

    document.body.classList.add(DRAGGING_BODY_CLASS);
    if (source.color !== '') {
      // Color de la tarea en curso: lo consumen el fantasma y la celda destino.
      document.body.style.setProperty(DRAG_COLOR_PROPERTY, source.color);
    }
    source.element.classList.add(DRAG_SOURCE_CLASS);

    const ghost = document.createElement('div');
    ghost.className = GHOST_CLASS;
    ghost.setAttribute('aria-hidden', 'true');
    ghost.textContent = source.label;
    this.ghost = ghost;
    document.body.append(ghost);

    this.updateGhost(source.startX, source.startY);
  }

  private updateDrag(clientX: number, clientY: number): void {
    this.pointerX = clientX;
    this.pointerY = clientY;
    this.updateGhost(clientX, clientY);
    this.refreshTarget();
    this.updateAutoScroll(clientY);
  }

  private updateGhost(clientX: number, clientY: number): void {
    const ghost = this.ghost;
    if (ghost === null) {
      return;
    }
    ghost.style.transform = `translate3d(${clientX}px, ${clientY}px, 0) translate(-50%, -150%)`;
  }

  private refreshTarget(): void {
    const target = this.options.resolveTarget(this.pointerX, this.pointerY);
    if (target !== null && this.currentTarget !== null && this.currentTarget.element === target.element) {
      this.currentTarget = target;
      return;
    }
    if (this.currentTarget !== null) {
      this.currentTarget.element.classList.remove(DRAG_TARGET_CLASS);
    }
    this.currentTarget = target;
    if (target !== null) {
      target.element.classList.add(DRAG_TARGET_CLASS);
    }
  }

  private updateAutoScroll(clientY: number): void {
    const height = window.innerHeight;
    if (clientY < AUTO_SCROLL_EDGE_PX) {
      this.autoScrollStep = -this.computeAutoScrollStep(AUTO_SCROLL_EDGE_PX - clientY);
    } else if (clientY > height - AUTO_SCROLL_EDGE_PX) {
      this.autoScrollStep = this.computeAutoScrollStep(clientY - (height - AUTO_SCROLL_EDGE_PX));
    } else {
      this.autoScrollStep = 0;
    }

    if (this.autoScrollStep === 0) {
      this.stopAutoScroll();
    } else {
      this.startAutoScroll();
    }
  }

  private computeAutoScrollStep(overflow: number): number {
    const ratio = Math.min(overflow / AUTO_SCROLL_EDGE_PX, 1);
    return Math.max(1, Math.ceil(ratio * AUTO_SCROLL_MAX_STEP_PX));
  }

  private startAutoScroll(): void {
    if (this.autoScrollFrame !== null) {
      return;
    }
    const step = (): void => {
      if (this.active === null || this.autoScrollStep === 0) {
        this.autoScrollFrame = null;
        return;
      }
      window.scrollBy(0, this.autoScrollStep);
      this.refreshTarget();
      this.autoScrollFrame = window.requestAnimationFrame(step);
    };
    this.autoScrollFrame = window.requestAnimationFrame(step);
  }

  private stopAutoScroll(): void {
    if (this.autoScrollFrame !== null) {
      window.cancelAnimationFrame(this.autoScrollFrame);
      this.autoScrollFrame = null;
    }
  }

  private cancelPending(): void {
    this.clearLongPress();
    this.pending = null;
  }

  private cancel(): void {
    this.clearLongPress();
    this.stopAutoScroll();
    this.pending = null;

    const active = this.active;
    this.active = null;
    if (active !== null) {
      active.element.classList.remove(DRAG_SOURCE_CLASS);
    }
    if (this.ghost !== null) {
      this.ghost.remove();
      this.ghost = null;
    }
    if (this.currentTarget !== null) {
      this.currentTarget.element.classList.remove(DRAG_TARGET_CLASS);
      this.currentTarget = null;
    }
    this.autoScrollStep = 0;
    document.body.classList.remove(DRAGGING_BODY_CLASS);
    document.body.style.removeProperty(DRAG_COLOR_PROPERTY);
  }

  private clearLongPress(): void {
    if (this.longPressTimer !== null) {
      window.clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }
}
