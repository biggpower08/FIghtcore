import type { Entity } from '../entities/Entity';
import { clampEntityToPlayableArena } from '../game/arenaBounds';

export class MovementSystem {
  update(entity: Entity, deltaSeconds: number): void {
    entity.x += entity.vx * deltaSeconds;
    entity.y += entity.vy * deltaSeconds;
    clampEntityToPlayableArena(entity);
  }
}
