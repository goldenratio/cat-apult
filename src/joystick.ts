export class VirtualJoyStick {
  private is_dragging: boolean = false;
  private joystick_handle: HTMLElement;
  private joystick_base: HTMLElement;
  private joystick_container: HTMLElement;
  x: number = 0;
  y: number = 0;

  private center_x: number = 0;
  private center_y: number = 0;
  private radius: number = 0;

  private state: number = 0;
  private visible: boolean = false;

  private update_fn: (x: number, y: number, state: number) => void | undefined = undefined;

  constructor() {
    const d = document;
    const w = window;
    this.joystick_container = d.getElementById('jc');
    this.joystick_base = d.getElementById('jb');
    this.joystick_handle = d.getElementById('jh');

    // Touch events
    this.joystick_base.addEventListener('touchstart', (event) => this.handle_start(event));
    w.addEventListener('touchmove', (event) => this.handle_move(event));
    w.addEventListener('touchend', (event) => this.handle_end(event));
    w.addEventListener('touchcancel', (event) => this.handle_end(event));

    this.set_visible(true);
  }

  dispose(): void {
    // remove event listeners
  }

  on_resize(width: number, height: number): void {
    const t = this;
    const visible = width < height;
    t.set_visible(visible);
    t.update_joystick_bounds();
  }

  set_on_update(fn: (x: number, y: number, state: number) => void): void {
    this.update_fn = fn;
  }

  private set_visible(visible: boolean): void {
    if (this.visible === visible) {
      return;
    }
    this.visible = visible;
    if (this.joystick_container) {
      this.joystick_container.style.display = visible ? "block" : "none";
    }
  }

  private handle_start(event: TouchEvent): void {
    const t = this;
    t.is_dragging = true;
    t.state = 1;
    t.handle_move(event);
  }

  private handle_move(event: TouchEvent): void {
    const t = this;

    // event.preventDefault();
    if (!t.is_dragging) return;
    if (!event.touches) return;

    let clientX: number, clientY: number;
    if (event.touches) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }
    const dx = clientX - t.center_x;
    const dy = clientY - t.center_y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = t.radius;

    let newX: number, newY: number;
    if (distance > maxDistance) {
      const angle = Math.atan2(dy, dx);
      newX = maxDistance * Math.cos(angle);
      newY = maxDistance * Math.sin(angle);
    } else {
      newX = dx;
      newY = dy;
    }

    t.joystick_handle.style.transform = `translate(-50%, -50%) translate(${newX}px, ${newY}px)`;

    // Normalize values to a range of -1 to 1
    const normalizedX = (newX / maxDistance);
    const normalizedY = (newY / maxDistance);

    t.x = normalizedX;
    t.y = normalizedY;

    t.update_fn?.(t.x, t.y, t.state);
  }

  private handle_end(event: TouchEvent): void {
    const t = this;
    if (!t.is_dragging) {
      return;
    }
    t.is_dragging = false;
    // Reset the handle to the center
    t.joystick_handle.style.transform = `translate(-50%, -50%)`;
    t.update_fn?.(t.x, t.y, 0);
    t.x = 0;
    t.y = 0;
    t.state = 0;
  }

  private update_joystick_bounds(): void {
    const t = this;
    const rect = t.joystick_base.getBoundingClientRect();
    t.center_x = rect.left + rect.width / 2;
    t.center_y = rect.top + rect.height / 2;
    t.radius = rect.width / 2;
  }
}
