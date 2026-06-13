import { ARENA_HEIGHT, ARENA_WIDTH } from './constants';
import type { Entity } from '../entities/Entity';

export class Camera {
  x = 0;
  y = 0;

  follow(target: Entity, viewWidth: number, viewHeight: number): void {
    this.x = Math.max(0, Math.min(ARENA_WIDTH - viewWidth, target.x - viewWidth / 2));
    this.y = Math.max(0, Math.min(ARENA_HEIGHT - viewHeight, target.y - viewHeight / 2));
  }
}
