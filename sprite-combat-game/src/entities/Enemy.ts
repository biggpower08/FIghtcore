import { Fighter } from './Fighter';
import { ENEMY_RADIUS, ENEMY_BASE_SPEED } from '../game/constants';
import type { EnemyDefinition } from '../data/enemies';
import type { MoveDefinition } from '../data/moves';

export class Enemy extends Fighter {
  definition: EnemyDefinition;
  attackRange: number;

  constructor(id: string, definition: EnemyDefinition, x: number, y: number, move: MoveDefinition) {
    super(id, x, y, ENEMY_RADIUS, definition.maxHealth, 100, ENEMY_BASE_SPEED, [move]);
    this.definition = definition;
    this.attackRange = definition.attackRange;
  }
}
