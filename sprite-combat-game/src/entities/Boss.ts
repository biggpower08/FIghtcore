import { Fighter } from './Fighter';
import { BOSS_RADIUS } from '../game/constants';
import type { EnemyDefinition } from '../data/enemies';
import type { MoveDefinition } from '../data/moves';

export class Boss extends Fighter {
  definition: EnemyDefinition;
  telegraphMs = 0;

  constructor(id: string, definition: EnemyDefinition, x: number, y: number, move: MoveDefinition) {
    super(id, x, y, BOSS_RADIUS, definition.maxHealth, 140, definition.speed, [move]);
    this.definition = definition;
    this.knockbackResistance = 0.45;
  }
}
