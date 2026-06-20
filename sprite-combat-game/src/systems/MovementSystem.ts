import type { Entity } from '../entities/Entity';
import { clampEntityToPlayableArena } from '../game/arenaBounds';

export class MovementSystem {
  update(entity: Entity, deltaSeconds: number): void {
    entity.x += entity.vx * deltaSeconds;
    entity.y += entity.vy * deltaSeconds;
    if (entity.stunMs > 0) {
      const friction = Math.pow(0.16, deltaSeconds);
      entity.vx *= friction;
      entity.vy *= friction;
    }
    clampEntityToPlayableArena(entity);
  }
}
