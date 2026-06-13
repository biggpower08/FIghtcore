export class InputManager {
  private readonly held = new Set<string>();
  private readonly pressed = new Set<string>();

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.clear);
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.clear);
  }

  isHeld(key: string): boolean {
    return this.held.has(key.toLowerCase());
  }

  wasPressed(key: string): boolean {
    return this.pressed.has(key.toLowerCase());
  }

  endFrame(): void {
    this.pressed.clear();
  }

  getMovementAxis(): { x: number; y: number } {
    let x = 0;
    let y = 0;

    if (this.isHeld('a')) x -= 1;
    if (this.isHeld('d')) x += 1;
    if (this.isHeld('w')) y -= 1;
    if (this.isHeld('s')) y += 1;

    if (x !== 0 && y !== 0) {
      const scale = Math.SQRT1_2;
      x *= scale;
      y *= scale;
    }

    return { x, y };
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    const key = event.key.toLowerCase();
    if (!this.held.has(key)) {
      this.pressed.add(key);
    }
    this.held.add(key);

    if (key === ' ') {
      event.preventDefault();
    }
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    this.held.delete(event.key.toLowerCase());
  };

  private readonly clear = (): void => {
    this.held.clear();
    this.pressed.clear();
  };
}
