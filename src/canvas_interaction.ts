import { DisposeBag } from "@goldenratio/karlib";
import type { EventEmitterLike, EventEmitterOnOffLike, Mutable, Point, Rectangle } from "@goldenratio/karlib";
import type { VirtualJoyStick } from "./joystick.js";

function get_pos_from_event(source: unknown, event: PointerEvent | MouseEvent): Point {
  // Map client coordinates to canvas pixel coordinates (accounting for CSS scaling & DPR)
  if (typeof source === "object" && "getBoundingClientRect" in source) {
    const c = source as HTMLCanvasElement;
    const rect = c.getBoundingClientRect();
    const scaleX = c.width / rect.width;
    const scaleY = c.height / rect.height;
    return { x: (event.clientX - rect.left) * scaleX, y: (event.clientY - rect.top) * scaleY };
  }

  return { x: event.x, y: event.y };
}

const PRIMARY_BUTTON = 0;

export interface CanvasInteractionOptions {
  readonly source: EventEmitterLike | EventEmitterOnOffLike;
  readonly joystick?: VirtualJoyStick;
}

export class CanvasInteraction {
  private readonly dispose_bag = new DisposeBag();

  private pointer_down_map = new Map<number, boolean>();
  private pointer_up_map = new Map<number, boolean>();
  private pointer_position: Mutable<Point> = { x: 0, y: 0 };

  constructor(options: CanvasInteractionOptions) {
    const { source, joystick } = options;

    if (joystick) {
      joystick.set_on_update((x, y, state) => {
        const px = x * 800;
        const py = y * 600;
        // console.log("jp: ", px, py, state);
        if (state === 1) {
          this.pointer_down_map.set(PRIMARY_BUTTON, true);
          this.pointer_up_map.set(PRIMARY_BUTTON, false);
        } else {
          this.pointer_up_map.set(PRIMARY_BUTTON, true);
          this.pointer_down_map.set(PRIMARY_BUTTON, false);
        }
        this.pointer_position.x = px;
        this.pointer_position.y = py;
      });
    }

    const handle_down = (event: PointerEvent | MouseEvent) => {
      const button = event.button ?? PRIMARY_BUTTON;
      this.pointer_down_map.set(button, true);
      this.pointer_up_map.set(button, false);

      const pos = get_pos_from_event(source, event);
      this.pointer_position.x = pos.x;
      this.pointer_position.y = pos.y;
      event.stopPropagation?.();
      event.preventDefault?.();
    };

    const handle_up = (event: PointerEvent | MouseEvent) => {
      const button = event.button ?? PRIMARY_BUTTON;
      this.pointer_up_map.set(button, true);
      this.pointer_down_map.set(button, false);

      const pos = get_pos_from_event(source, event);
      this.pointer_position.x = pos.x;
      this.pointer_position.y = pos.y;
      event.stopPropagation?.();
      event.preventDefault?.();
    };

    const handle_move = (event: PointerEvent | MouseEvent) => {
      // Only gate on isPrimary when it's actually a PointerEvent (prevents multi-touch noise)
      const isPrimary = "isPrimary" in event ? event.isPrimary : true;
      if (!isPrimary) return;

      const pos = get_pos_from_event(source, event);
      this.pointer_position.x = pos.x;
      this.pointer_position.y = pos.y;
      event.stopPropagation?.();
      event.preventDefault?.();
    };

    const supportsPointer = "onpointerdown" in source;
    if (supportsPointer) {
      this.dispose_bag.from_event(source, "pointerdown", handle_down);
      this.dispose_bag.from_event(source, "pointerup", handle_up);
      this.dispose_bag.from_event(source, "pointermove", handle_move);
      this.dispose_bag.from_event(source, "pointercancel", handle_up);
      if (typeof window !== 'undefined') {
        this.dispose_bag.from_event(window, "pointermove", handle_move);
        this.dispose_bag.from_event(window, "pointerup", handle_up);
      }
    } else {
      this.dispose_bag.from_event(source, "mousedown", handle_down);
      this.dispose_bag.from_event(source, "mouseup", handle_up);
      this.dispose_bag.from_event(source, "mousemove", handle_move);
    }
  }

  is_primary_pointer_down(hit_area?: Rectangle): boolean {
    // TODO: include hit_area
    return this.pointer_down_map.get(PRIMARY_BUTTON) ?? false;
  }

  is_primary_pointer_up(hit_area?: Rectangle): boolean {
    // TODO: include hit_area
    return this.pointer_up_map.get(PRIMARY_BUTTON) ?? false;
  }

  get_pointer_x(): number {
    return this.pointer_position.x;
  }

  get_pointer_y(): number {
    return this.pointer_position.y;
  }

  dispose(): void {
    this.dispose_bag.dispose();
  }
}
