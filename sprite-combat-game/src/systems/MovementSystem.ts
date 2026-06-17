import type { Entity } from '../entities/Entity';
import { Player } from '../entities/Player';
import { clampEntityToPlayableArena } from '../game/arenaBounds';

export class MovementSystem {
  update(entity: Entity, deltaSeconds: number): void {
    entity.x += entity.vx * deltaSeconds;
    entity.y += entity.vy * deltaSeconds;
    clampEntityToPlayableArena(entity);

    if (entity instanceof Player) return;
    if (entity.vx < -1) entity.facing = -1;
    if (entity.vx > 1) entity.facing = 1;
  }
}
