import type { Entity } from '../entities/Entity';
import type { Obstacle } from '../entities/Obstacle';

export class CollisionSystem {
  resolveObstacleCollision(entity: Entity, obstacles: Obstacle[]): void {
    for (const obstacle of obstacles) {
      if (!obstacle.blocksMovement) continue;

      const dx = entity.x - obstacle.x;
      const dy = entity.y - obstacle.y;
      const distance = Math.hypot(dx, dy) || 1;
      const minimum = entity.radius + obstacle.radius;

      if (distance < minimum) {
        const push = minimum - distance;
        entity.x += (dx / distance) * push;
        entity.y += (dy / distance) * push;
      }
    }
  }
}
