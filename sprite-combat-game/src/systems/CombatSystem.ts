import type { Entity } from '../entities/Entity';
import { Fighter } from '../entities/Fighter';
import type { MoveDefinition } from '../data/moves';
import { getCombatMoveProfile, frameToMs, type CombatHitWindow, type CombatMoveProfile } from '../data/combatMoveProfiles';
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

  startAttack(attacker: Fighter, move: MoveDefinition, options: { ignoreAttackLock?: boolean; ignoreCooldown?: boolean } = {}): AttackHitbox | null {
    const canUse = options.ignoreAttackLock
      ? (attacker instanceof Player || attacker.stamina >= attacker.getStaminaCost(move)) && (options.ignoreCooldown || (attacker.moveCooldowns.get(move.id) ?? 0) <= 0)
      : attacker.canUseMove(move);
    if (!canUse) return null;

    if (!(attacker instanceof Player)) attacker.stamina -= attacker.getStaminaCost(move);
    attacker.moveCooldowns.set(move.id, attacker.getCooldownMs(move));
    attacker.attackLockMs = attacker instanceof Player ? attacker.getAttackLockMs(move) : move.windupMs + move.activeMs + move.recoveryMs;
    attacker.activeMove = move;
    attacker.activeMoveMs = move.windupMs + move.activeMs;
    const profile = getCombatMoveProfile(move);
    const finalActiveFrame = Math.max(profile.startupFrames, ...profile.hits.flatMap((hit) => hit.activeFrames));
    const totalMs = frameToMs(finalActiveFrame + profile.recoveryFrames);
    const initialHit = profile.hits[0];
    const initialHitbox = initialHit.hitbox ?? profile.hitbox;

    return {
      id: `attack_${this.nextAttackId++}`,
      owner: attacker,
      move,
      x: attacker.x + attacker.facing * initialHitbox.x,
      y: attacker.y + initialHitbox.y,
      width: initialHitbox.w,
      height: initialHitbox.h,
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
      const activeHit = this.currentHitWindow(hitbox) ?? hitbox.profile.hits[0];
      const rect = activeHit.hitbox ?? hitbox.profile.hitbox;
      hitbox.x = hitbox.owner.x + hitbox.owner.facing * rect.x;
      hitbox.y = hitbox.owner.y + rect.y;
      hitbox.width = rect.w;
      hitbox.height = rect.h;
    }

    return hitboxes.filter((hitbox) => hitbox.remainingMs > 0);
  }

  applyHitbox(hitbox: AttackHitbox, targets: Entity[]): HitImpact[] {
    const impacts: HitImpact[] = [];
    const activeHit = this.currentHitWindow(hitbox);
    if (!activeHit) return impacts;
    const activeRect = activeHit.hitbox ?? hitbox.profile.hitbox;
    hitbox.x = hitbox.owner.x + hitbox.owner.facing * activeRect.x;
    hitbox.y = hitbox.owner.y + activeRect.y;
    hitbox.width = activeRect.w;
    hitbox.height = activeRect.h;

    for (const target of targets) {
      const hitKey = `${activeHit.hitId}:${target.id}`;
      if (!target.alive || target.id === hitbox.owner.id || hitbox.hitIds.has(hitKey)) continue;
      if (!this.intersects(hitbox, target)) continue;

      const damageMultiplier = hitbox.owner instanceof Player ? hitbox.owner.getDamageMultiplier() : TEST_BALANCE.enemyDamageMultiplier;
      const instantDeath =
        hitbox.owner instanceof Player &&
        hitbox.owner.ability?.id === 'instant_death' &&
        hitbox.owner.abilityActiveMs > 0 &&
        !(target instanceof Boss) &&
        Math.random() < hitbox.owner.getInstantDeathChance();
      const baseDamage = activeHit.damage ?? hitbox.move.damage;
      const activeMoveControlLevel = hitbox.owner instanceof Player
        ? hitbox.owner.getMoveUpgradeLevel(hitbox.move.id, 'control') + (hitbox.owner.character.id === 'ronin' && hitbox.move.id === 'calf_kick' ? hitbox.owner.upgrades.roninCalfLevel : 0)
        : 0;
      const controlMultiplier = hitbox.owner instanceof Player ? hitbox.owner.getKnockbackMultiplier() + activeMoveControlLevel * 0.08 : 1;
      const knockback = activeHit.knockback ?? hitbox.profile.knockback;
      const hitstunFrames = Math.round((activeHit.hitstunFrames ?? hitbox.profile.hitstunFrames) * (1 + activeMoveControlLevel * 0.08));
      const hitstopFrames = activeHit.hitstopFrames ?? hitbox.profile.hitstopFrames;
      const damage = instantDeath ? target.health : baseDamage * damageMultiplier;
      target.takeDamage(damage);
      const direction = Math.sign(target.x - hitbox.owner.x) || hitbox.owner.facing;
      const resistance = target.knockbackResistance;
      const heavy = damage >= 18 || Math.abs(knockback.x) >= 170 || Math.abs(knockback.y) >= 48;
      const hitstunMs = frameToMs(hitstunFrames);
      target.stunMs = Math.max(target.stunMs, Math.min(hitstunMs, heavy ? 620 : 360));
      target.vx += direction * knockback.x * resistance * controlMultiplier;
      target.vy += knockback.y * resistance * controlMultiplier;
      if (!target.alive && target instanceof Fighter) {
        target.activeMove = null;
        target.activeMoveMs = 0;
        target.attackLockMs = 0;
      }
      hitbox.hitIds.add(hitKey);
      impacts.push({
        attacker: hitbox.owner,
        target,
        move: hitbox.move,
        damage,
        heavy,
        hitstopMs: frameToMs(hitstopFrames),
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

  private currentHitWindow(hitbox: AttackHitbox): CombatHitWindow | undefined {
    const frame = Math.floor(hitbox.elapsedMs / (1000 / 60)) + 1;
    return hitbox.profile.hits.find((hit) => hit.activeFrames.includes(frame));
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
