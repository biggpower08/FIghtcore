import { ARENA_HEIGHT, ARENA_WIDTH } from '../game/constants';
import type { Entity } from '../entities/Entity';
import { Player } from '../entities/Player';

export class MovementSystem {
  update(entity: Entity, deltaSeconds: number): void {
    entity.x += entity.vx * deltaSeconds;
    entity.y += entity.vy * deltaSeconds;
    entity.x = Math.max(entity.radius, Math.min(ARENA_WIDTH - entity.radius, entity.x));
    entity.y = Math.max(entity.radius, Math.min(ARENA_HEIGHT - entity.radius, entity.y));

    if (entity instanceof Player) return;
    if (entity.vx < -1) entity.facing = -1;
    if (entity.vx > 1) entity.facing = 1;
  }
}
