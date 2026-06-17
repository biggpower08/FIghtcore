import { ARENA_HEIGHT, ARENA_WIDTH } from './constants';
import type { Entity } from '../entities/Entity';

export interface ArenaBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export const PLAYABLE_ARENA_BOUNDS: ArenaBounds = {
  minX: 70,
  maxX: ARENA_WIDTH - 70,
  minY: 520,
  maxY: ARENA_HEIGHT - 90,
};

export function clampToPlayableArena(
  x: number,
  y: number,
  radius = 0,
  bounds: ArenaBounds = PLAYABLE_ARENA_BOUNDS,
): { x: number; y: number } {
  return {
    x: clamp(x, bounds.minX + radius, bounds.maxX - radius),
    y: clamp(y, bounds.minY + radius, bounds.maxY - radius),
  };
}

export function clampEntityToPlayableArena(entity: Entity, bounds: ArenaBounds = PLAYABLE_ARENA_BOUNDS): void {
  const position = clampToPlayableArena(entity.x, entity.y, entity.radius, bounds);
  entity.x = position.x;
  entity.y = position.y;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
