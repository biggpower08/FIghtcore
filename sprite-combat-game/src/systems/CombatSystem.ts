import type { Entity } from '../entities/Entity';
import type { Fighter } from '../entities/Fighter';
import type { MoveDefinition } from '../data/moves';
import { Player } from '../entities/Player';
import { TEST_BALANCE } from '../game/testBalance';

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

export interface HitImpact {
  attacker: Fighter;
  target: Entity;
  move: MoveDefinition;
  damage: number;
  heavy: boolean;
  x: number;
  y: number;
}

export class CombatSystem {
  private nextAttackId = 1;

  startAttack(attacker: Fighter, move: MoveDefinition): AttackHitbox | null {
    if (!attacker.canUseMove(move)) return null;

    attacker.stamina -= attacker.getStaminaCost(move);
    attacker.moveCooldowns.set(move.id, attacker.getCooldownMs(move));
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

  applyHitbox(hitbox: AttackHitbox, targets: Entity[]): HitImpact[] {
    const impacts: HitImpact[] = [];
    const activeWindowStarted = hitbox.remainingMs <= hitbox.move.activeMs;
    if (!activeWindowStarted) return impacts;

    for (const target of targets) {
      if (!target.alive || target.id === hitbox.owner.id || hitbox.hitIds.has(target.id)) continue;
      if (!this.intersects(hitbox, target)) continue;

      const damageMultiplier = hitbox.owner instanceof Player ? hitbox.owner.getDamageMultiplier() : TEST_BALANCE.enemyDamageMultiplier;
      const damage = hitbox.move.damage * damageMultiplier;
      target.takeDamage(damage);
      const direction = Math.sign(target.x - hitbox.owner.x) || hitbox.owner.facing;
      const force = hitbox.move.knockback * target.knockbackResistance;
      const heavy = damage >= 18 || hitbox.move.knockback >= 170;
      if (heavy || hitbox.move.stunMs >= 300) target.stunMs = Math.max(target.stunMs, Math.min(hitbox.move.stunMs, 420));
      target.vx += direction * force;
      target.vy += (target.y - hitbox.owner.y > 0 ? 1 : -1) * force * 0.18;
      hitbox.hitIds.add(target.id);
      impacts.push({
        attacker: hitbox.owner,
        target,
        move: hitbox.move,
        damage,
        heavy,
        x: target.x,
        y: target.y - target.radius * 0.75,
      });
    }

    return impacts;
  }

  updateFighterTimers(fighter: Fighter, deltaMs: number): void {
    fighter.attackLockMs = Math.max(0, fighter.attackLockMs - deltaMs);
    fighter.activeMoveMs = Math.max(0, fighter.activeMoveMs - deltaMs);
    fighter.stunMs = Math.max(0, fighter.stunMs - deltaMs);
    fighter.damageFlashMs = Math.max(0, fighter.damageFlashMs - deltaMs);
    fighter.healFlashMs = Math.max(0, fighter.healFlashMs - deltaMs);

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
