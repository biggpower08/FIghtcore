import { Entity } from './Entity';
import type { MoveDefinition } from '../data/moves';

export class Fighter extends Entity {
  stamina: number;
  maxStamina: number;
  speed: number;
  equippedMoves: MoveDefinition[];
  learnedMoves: MoveDefinition[];
  moveCooldowns = new Map<string, number>();
  attackLockMs = 0;
  activeMove: MoveDefinition | null = null;
  activeMoveMs = 0;

  constructor(
    id: string,
    x: number,
    y: number,
    radius: number,
    maxHealth: number,
    maxStamina: number,
    speed: number,
    moves: MoveDefinition[],
  ) {
    super(id, x, y, radius, maxHealth);
    this.stamina = maxStamina;
    this.maxStamina = maxStamina;
    this.speed = speed;
    this.equippedMoves = moves.slice(0, 4);
    this.learnedMoves = [...this.equippedMoves];
  }

  canUseMove(move: MoveDefinition): boolean {
    return this.stamina >= this.getStaminaCost(move) && (this.moveCooldowns.get(move.id) ?? 0) <= 0 && this.attackLockMs <= 0;
  }

  getStaminaCost(move: MoveDefinition): number {
    return move.staminaCost;
  }

  getCooldownMs(move: MoveDefinition): number {
    return move.cooldownMs;
  }

  getDamageMultiplier(): number {
    return 1;
  }
}
