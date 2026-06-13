import type { Entity } from '../entities/Entity';
import type { Fighter } from '../entities/Fighter';
import type { MoveDefinition } from '../data/moves';

export interface AttackHitbox {
  id: string;
  owner: Fighter;
  move: MoveDefinition;
  x: number;
  y: number;
  width: number;
  height: number;
  remainingMs: number;
  hitIds: Set<string>;
}

export class CombatSystem {
  private nextAttackId = 1;

  startAttack(attacker: Fighter, move: MoveDefinition): AttackHitbox | null {
    if (!attacker.canUseMove(move)) return null;

    attacker.stamina -= move.staminaCost;
    attacker.moveCooldowns.set(move.id, move.cooldownMs);
    attacker.attackLockMs = move.windupMs + move.activeMs + move.recoveryMs;
    attacker.activeMove = move;
    attacker.activeMoveMs = move.windupMs + move.activeMs;

    return {
      id: `attack_${this.nextAttackId++}`,
      owner: attacker,
      move,
      x: attacker.x + attacker.facing * move.range,
      y: attacker.y,
      width: move.hitboxWidth,
      height: move.hitboxHeight,
      remainingMs: move.windupMs + move.activeMs,
      hitIds: new Set<string>(),
    };
  }

  updateHitboxes(hitboxes: AttackHitbox[], deltaMs: number): AttackHitbox[] {
    for (const hitbox of hitboxes) {
      hitbox.remainingMs -= deltaMs;
      hitbox.x = hitbox.owner.x + hitbox.owner.facing * hitbox.move.range;
      hitbox.y = hitbox.owner.y;
    }

    return hitboxes.filter((hitbox) => hitbox.remainingMs > 0);
  }

  applyHitbox(hitbox: AttackHitbox, targets: Entity[]): void {
    const activeWindowStarted = hitbox.remainingMs <= hitbox.move.activeMs;
    if (!activeWindowStarted) return;

    for (const target of targets) {
      if (!target.alive || target.id === hitbox.owner.id || hitbox.hitIds.has(target.id)) continue;
      if (!this.intersects(hitbox, target)) continue;

      target.takeDamage(hitbox.move.damage);
      target.stunMs = Math.max(target.stunMs, hitbox.move.stunMs);
      const direction = Math.sign(target.x - hitbox.owner.x) || hitbox.owner.facing;
      const force = hitbox.move.knockback * target.knockbackResistance;
      target.vx += direction * force;
      target.vy += (target.y - hitbox.owner.y > 0 ? 1 : -1) * force * 0.18;
      hitbox.hitIds.add(target.id);
    }
  }

  updateFighterTimers(fighter: Fighter, deltaMs: number): void {
    fighter.attackLockMs = Math.max(0, fighter.attackLockMs - deltaMs);
    fighter.activeMoveMs = Math.max(0, fighter.activeMoveMs - deltaMs);
    fighter.stunMs = Math.max(0, fighter.stunMs - deltaMs);

    if (fighter.activeMoveMs <= 0) {
      fighter.activeMove = null;
    }

    for (const [moveId, remaining] of fighter.moveCooldowns) {
      const next = remaining - deltaMs;
      if (next <= 0) {
        fighter.moveCooldowns.delete(moveId);
      } else {
        fighter.moveCooldowns.set(moveId, next);
      }
    }
  }

  private intersects(hitbox: AttackHitbox, target: Entity): boolean {
    const left = hitbox.x - hitbox.width / 2;
    const right = hitbox.x + hitbox.width / 2;
    const top = hitbox.y - hitbox.height / 2;
    const bottom = hitbox.y + hitbox.height / 2;
    const closestX = Math.max(left, Math.min(target.x, right));
    const closestY = Math.max(top, Math.min(target.y, bottom));
    return Math.hypot(target.x - closestX, target.y - closestY) <= target.radius;
  }
}
