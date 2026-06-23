import { ARENA_HEIGHT, ARENA_WIDTH } from './constants';
import type { Entity } from '../entities/Entity';

export class Camera {
  x = 0;
  y = 0;
  distance: 'close' | 'normal' | 'far' = 'normal';

  follow(target: Entity, viewWidth: number, viewHeight: number): void {
    const lookAhead = this.distance === 'close' ? 0 : this.distance === 'far' ? 120 : 64;
    const verticalLift = this.distance === 'close' ? 0 : this.distance === 'far' ? 42 : 24;
    this.x = Math.max(0, Math.min(ARENA_WIDTH - viewWidth, target.x - viewWidth / 2 + lookAhead * Math.sign(target.vx || 0)));
    this.y = Math.max(0, Math.min(ARENA_HEIGHT - viewHeight, target.y - viewHeight / 2 - verticalLift));
  }
}
