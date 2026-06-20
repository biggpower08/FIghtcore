import type { Entity } from '../entities/Entity';
import { Fighter } from '../entities/Fighter';
import type { MoveDefinition } from '../data/moves';
import { getCombatMoveProfile, frameToMs, type CombatMoveProfile } from '../data/combatMoveProfiles';
import { getCharacterVisualProfile } from '../data/characterVisualProfiles';
import { Player } from '../entities/Player';
import { Boss } from '../entities/Boss';
import { Enemy } from '../entities/Enemy';
import { TEST_BALANCE } from '../game/testBalance';

export interface AttackHitbox {
  id: string;
  owner: Fighter;
  move: MoveDefinition;
  x: number;
  y: number;
  width: number;
  height: number;
  elapsedMs: number;
  totalMs: number;
  remainingMs: number;
  activeFrames: number[];
  profile: CombatMoveProfile;
  hitIds: Set<string>;
}

export interface HitImpact {
  attacker: Fighter;
  target: Entity;
  move: MoveDefinition;
  damage: number;
  heavy: boolean;
  hitstopMs: number;
  hitstunMs: number;
  x: number;
  y: number;
}

export class CombatSystem {
  private nextAttackId = 1;

  startAttack(attacker: Fighter, move: MoveDefinition): AttackHitbox | null {
    if (!attacker.canUseMove(move)) return null;

    attacker.stamina -= attacker.getStaminaCost(move);
    attacker.moveCooldowns.set(move.id, attacker.getCooldownMs(move));
    attacker.attackLockMs = attacker instanceof Player ? attacker.getAttackLockMs(move) : move.windupMs + move.activeMs + move.recoveryMs;
    attacker.activeMove = move;
    attacker.activeMoveMs = move.windupMs + move.activeMs;
    const profile = getCombatMoveProfile(move);
    const totalMs = frameToMs(profile.startupFrames + profile.activeFrames.length + profile.recoveryFrames);

    return {
      id: `attack_${this.nextAttackId++}`,
      owner: attacker,
      move,
      x: attacker.x + attacker.facing * profile.hitbox.x,
      y: attacker.y + profile.hitbox.y,
      width: profile.hitbox.w,
      height: profile.hitbox.h,
      elapsedMs: 0,
      totalMs,
      remainingMs: totalMs,
      activeFrames: profile.activeFrames,
      profile,
      hitIds: new Set<string>(),
    };
  }

  updateHitboxes(hitboxes: AttackHitbox[], deltaMs: number): AttackHitbox[] {
    for (const hitbox of hitboxes) {
      hitbox.elapsedMs += deltaMs;
      hitbox.remainingMs -= deltaMs;
      hitbox.x = hitbox.owner.x + hitbox.owner.facing * hitbox.profile.hitbox.x;
      hitbox.y = hitbox.owner.y + hitbox.profile.hitbox.y;
    }

    return hitboxes.filter((hitbox) => hitbox.remainingMs > 0);
  }

  applyHitbox(hitbox: AttackHitbox, targets: Entity[]): HitImpact[] {
    const impacts: HitImpact[] = [];
    if (!this.isHitboxActive(hitbox)) return impacts;

    for (const target of targets) {
      if (!target.alive || target.id === hitbox.owner.id || hitbox.hitIds.has(target.id)) continue;
      if (!this.intersects(hitbox, target)) continue;

      const damageMultiplier = hitbox.owner instanceof Player ? hitbox.owner.getDamageMultiplier() : TEST_BALANCE.enemyDamageMultiplier;
      const instantDeath =
        hitbox.owner instanceof Player &&
        hitbox.owner.ability?.id === 'instant_death' &&
        hitbox.owner.abilityActiveMs > 0 &&
        !(target instanceof Boss) &&
        Math.random() < 0.5;
      const damage = instantDeath ? target.health : hitbox.move.damage * damageMultiplier;
      target.takeDamage(damage);
      const direction = Math.sign(target.x - hitbox.owner.x) || hitbox.owner.facing;
      const resistance = target.knockbackResistance;
      const heavy = damage >= 18 || Math.abs(hitbox.profile.knockback.x) >= 170 || Math.abs(hitbox.profile.knockback.y) >= 48;
      const hitstunMs = frameToMs(hitbox.profile.hitstunFrames);
      target.stunMs = Math.max(target.stunMs, Math.min(hitstunMs, heavy ? 620 : 360));
      target.vx += direction * hitbox.profile.knockback.x * resistance;
      target.vy += hitbox.profile.knockback.y * resistance;
      if (!target.alive && target instanceof Fighter) {
        target.activeMove = null;
        target.activeMoveMs = 0;
        target.attackLockMs = 0;
      }
      hitbox.hitIds.add(target.id);
      impacts.push({
        attacker: hitbox.owner,
        target,
        move: hitbox.move,
        damage,
        heavy,
        hitstopMs: frameToMs(hitbox.profile.hitstopFrames),
        hitstunMs,
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

  private isHitboxActive(hitbox: AttackHitbox): boolean {
    const frame = Math.floor(hitbox.elapsedMs / (1000 / 60)) + 1;
    return hitbox.activeFrames.includes(frame);
  }

  private intersects(hitbox: AttackHitbox, target: Entity): boolean {
    const left = hitbox.x - hitbox.width / 2;
    const right = hitbox.x + hitbox.width / 2;
    const top = hitbox.y - hitbox.height / 2;
    const bottom = hitbox.y + hitbox.height / 2;
    const hurtbox = this.hurtboxFor(target);
    return left < hurtbox.right && right > hurtbox.left && top < hurtbox.bottom && bottom > hurtbox.top;
  }

  private hurtboxFor(target: Entity): { left: number; right: number; top: number; bottom: number } {
    const id = target instanceof Player ? target.character.id : target instanceof Enemy || target instanceof Boss ? target.definition.id : target.id;
    const size = getCharacterVisualProfile(id).hurtboxSize;
    const width = size.w || target.radius * 2;
    const height = size.h || target.radius * 2;
    return {
      left: target.x - width / 2,
      right: target.x + width / 2,
      top: target.y - height,
      bottom: target.y,
    };
  }
}
