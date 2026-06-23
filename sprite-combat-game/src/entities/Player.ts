import { Fighter } from './Fighter';
import { PLAYER_RADIUS } from '../game/constants';
import type { CharacterDefinition } from '../data/characters';
import type { CharacterLoadout } from '../data/characterLoadouts';
import type { MoveDefinition } from '../data/moves';
import { specialAbilityByCharacterId, type SpecialAbilityDefinition } from '../data/specialAbilities';

export interface PlayerUpgradeState {
  damageLevel: number;
  staminaLevel: number;
  cooldownLevel: number;
  abilityLevel: number;
  healthRegenLevel: number;
  speedLevel: number;
  dashLevel: number;
  maxStaminaLevel: number;
  defenseLevel: number;
  waveHealLevel: number;
  critLevel: number;
  knockbackLevel: number;
  abilityCooldownLevel: number;
  activityGainLevel: number;
  activityDecayLevel: number;
  flowDamageLevel: number;
  flowRecoveryLevel: number;
  dashActivityLevel: number;
  highActivityDefenseLevel: number;
  killHealLevel: number;
  roninChainLevel: number;
  roninCrossLevel: number;
  roninCalfLevel: number;
  emperorHeavyActivityLevel: number;
  emperorHighActivityDamageLevel: number;
  emperorExecutionLevel: number;
  emperorArmorLevel: number;
  emperorKillHealLevel: number;
}

export class Player extends Fighter {
  character: CharacterDefinition;
  loadout: CharacterLoadout;
  dashMs = 0;
  dashCooldownMs = 0;
  ability: SpecialAbilityDefinition | undefined;
  abilityCooldownMs = 0;
  abilityActiveMs = 0;
  abilityStatus = '';
  criticalOverloadArmedMs = 0;
  momentumStacks = 0;
  meditationMs = 0;
  meditationStatusMs = 0;
  thugItOutSurvivalUsed = false;
  recentDamageMs = 0;
  activity = 18;
  maxActivity = 100;
  flowStateMs = 0;
  lastLandedMoveId = '';
  moveUpgradeLevels = new Map<string, number>();
  upgrades: PlayerUpgradeState = {
    damageLevel: 0,
    staminaLevel: 0,
    cooldownLevel: 0,
    abilityLevel: 0,
    healthRegenLevel: 0,
    speedLevel: 0,
    dashLevel: 0,
    maxStaminaLevel: 0,
    defenseLevel: 0,
    waveHealLevel: 0,
    critLevel: 0,
    knockbackLevel: 0,
    abilityCooldownLevel: 0,
    activityGainLevel: 0,
    activityDecayLevel: 0,
    flowDamageLevel: 0,
    flowRecoveryLevel: 0,
    dashActivityLevel: 0,
    highActivityDefenseLevel: 0,
    killHealLevel: 0,
    roninChainLevel: 0,
    roninCrossLevel: 0,
    roninCalfLevel: 0,
    emperorHeavyActivityLevel: 0,
    emperorHighActivityDamageLevel: 0,
    emperorExecutionLevel: 0,
    emperorArmorLevel: 0,
    emperorKillHealLevel: 0,
  };

  constructor(character: CharacterDefinition, loadout: CharacterLoadout, moves: MoveDefinition[]) {
    super(character.id, 520, 720, PLAYER_RADIUS, loadout.stats.maxHealth, loadout.stats.stamina, loadout.stats.speed, moves);
    this.character = character;
    this.loadout = loadout;
    this.ability = specialAbilityByCharacterId.get(character.id);
  }

  override getStaminaCost(move: MoveDefinition): number {
    const moveLevel = this.getMoveUpgradeLevel(move.id, 'efficiency');
    const discount = Math.min(0.5, this.upgrades.staminaLevel * 0.08 + moveLevel * 0.08);
    return Math.max(1, Math.round(move.staminaCost * 0.42 * (1 - discount)));
  }

  override getCooldownMs(move: MoveDefinition): number {
    if (this.character.id === 'shadow-striker') {
      const shadowReduction = ['jab', 'cross'].includes(move.id) ? 0.82 : move.style === 'kickboxing' || move.style === 'muay-thai' ? 0.74 : 0.66;
      return Math.max(45, Math.round(move.cooldownMs * (1 - shadowReduction)));
    }
    const activityReduction = this.getActivityTier() === 'high' ? 0.1 : this.getActivityTier() === 'flow' ? 0.16 : 0;
    const reduction = Math.min(0.45, this.upgrades.cooldownLevel * 0.06 + this.upgrades.flowRecoveryLevel * 0.04 + activityReduction);
    return Math.max(120, Math.round(move.cooldownMs * (1 - reduction)));
  }

  override canUseMove(move: MoveDefinition): boolean {
    if (this.ability?.id === 'density' && this.abilityActiveMs > 0) return false;
    return super.canUseMove(move);
  }

  getAttackLockMs(move: MoveDefinition): number {
    const base = move.windupMs + move.activeMs + move.recoveryMs;
    const activityRecovery = this.getActivityTier() === 'flow' ? 0.74 : this.getActivityTier() === 'high' ? 0.82 : this.getActivityTier() === 'medium' ? 0.9 : 1;
    const characterFlow = this.character.id === 'ronin' ? 0.78 - this.upgrades.roninChainLevel * 0.04 : 0.92;
    if (this.character.id !== 'shadow-striker') return Math.max(130, Math.round(base * activityRecovery * characterFlow));
    const isPunch = move.style === 'boxing';
    const isKick = move.style === 'kickboxing' || move.style === 'muay-thai';
    const fastLock = isPunch ? 0.34 : isKick ? 0.42 : 0.5;
    return Math.max(isPunch ? 95 : 140, Math.round(base * fastLock * activityRecovery));
  }

  override getDamageMultiplier(): number {
    const activeMoveLevel = this.activeMove ? this.getMoveUpgradeLevel(this.activeMove.id, 'damage') : 0;
    let multiplier = this.loadout.stats.damageMultiplier + this.upgrades.damageLevel * 0.12 + activeMoveLevel * 0.1;
    const activityDamage = this.getActivityTier() === 'flow' ? 0.14 : this.getActivityTier() === 'high' ? 0.08 : 0;
    multiplier *= 1 + activityDamage + this.upgrades.flowDamageLevel * 0.04;
    if (this.character.id === 'supreme-emperor' && this.activity >= 70) multiplier *= 1 + this.upgrades.emperorHighActivityDamageLevel * 0.07;
    if (this.character.id === 'ronin' && this.activeMove?.id === 'cross' && this.lastLandedMoveId === 'jab') multiplier *= 1 + this.upgrades.roninCrossLevel * 0.12;
    if (this.character.id === 'ronin' && this.activeMove?.id === 'calf_kick') multiplier *= 1 + this.upgrades.roninCalfLevel * 0.08;
    if (this.criticalOverloadArmedMs > 0) multiplier *= 2.35 + this.upgrades.abilityLevel * 0.15;
    if (this.abilityActiveMs > 0 && this.ability?.id === 'momentum_flow') multiplier *= 1 + this.momentumStacks * 0.18;
    if (this.abilityActiveMs > 0 && this.ability?.id === 'thug_it_out') multiplier *= 1.28 + this.upgrades.abilityLevel * 0.08;
    return multiplier;
  }

  getSpeedMultiplier(): number {
    const activitySpeed = this.getActivityTier() === 'flow' ? 0.08 : this.getActivityTier() === 'high' ? 0.04 : 0;
    const upgradeSpeed = 1 + this.upgrades.speedLevel * 0.05 + activitySpeed;
    if (this.abilityActiveMs > 0 && this.ability?.id === 'thug_it_out') return upgradeSpeed * (1.18 + this.upgrades.abilityLevel * 0.04);
    return upgradeSpeed;
  }

  getAbilityCooldownMs(): number {
    if (!this.ability) return 0;
    return Math.max(2800, Math.round(this.ability.cooldownMs * (1 - Math.min(0.35, this.upgrades.abilityCooldownLevel * 0.08))));
  }

  getInstantDeathChance(): number {
    const base = this.ability?.id === 'instant_death' ? 0.34 : 0;
    const executionBonus = this.activity >= 95 ? this.upgrades.emperorExecutionLevel * 0.05 : 0;
    return Math.min(0.78, base + this.upgrades.abilityLevel * 0.04 + this.upgrades.critLevel * 0.03 + executionBonus);
  }

  getKnockbackMultiplier(): number {
    return 1 + this.upgrades.knockbackLevel * 0.1;
  }

  gainActivity(amount: number): void {
    const gain = amount * (1 + this.upgrades.activityGainLevel * 0.08);
    const wasBelowFlow = this.activity < 100;
    this.activity = Math.min(this.maxActivity, this.activity + gain);
    if (wasBelowFlow && this.activity >= 100) {
      this.flowStateMs = 2400;
      this.heal(this.upgrades.killHealLevel > 0 ? this.upgrades.killHealLevel * 2 : 0);
    }
  }

  spendActivity(amount: number): void {
    this.activity = Math.max(0, this.activity - amount);
  }

  updateActivity(deltaMs: number, activeMovement: boolean): void {
    this.flowStateMs = Math.max(0, this.flowStateMs - deltaMs);
    if (activeMovement) this.gainActivity(2.4 * (deltaMs / 1000));
    const decay = (this.activity >= 80 ? 8 : 5) * Math.max(0.35, 1 - this.upgrades.activityDecayLevel * 0.12);
    this.activity = Math.max(0, this.activity - decay * (deltaMs / 1000));
  }

  getActivityTier(): 'low' | 'medium' | 'high' | 'flow' {
    if (this.activity >= 95 || this.flowStateMs > 0) return 'flow';
    if (this.activity >= 70) return 'high';
    if (this.activity >= 38) return 'medium';
    return 'low';
  }

  canActivateAbility(): boolean {
    return Boolean(this.ability && this.abilityCooldownMs <= 0 && this.abilityActiveMs <= 0 && this.criticalOverloadArmedMs <= 0);
  }

  activateAbility(): boolean {
    if (!this.ability || !this.canActivateAbility()) return false;

    const durationBonus = this.upgrades.abilityLevel * 450;
    if (this.ability.id === 'critical_overload') {
      this.criticalOverloadArmedMs = this.ability.durationMs + durationBonus;
      this.abilityCooldownMs = this.getAbilityCooldownMs();
      this.abilityStatus = `${this.ability.name} armed`;
      return true;
    }

    this.abilityActiveMs = this.ability.durationMs + durationBonus;
    this.abilityCooldownMs = this.getAbilityCooldownMs();
    this.abilityStatus = `${this.ability.name} active`;
    if (this.ability.id === 'momentum_flow') this.momentumStacks = 0;
    if (this.ability.id === 'meditation') this.meditationMs = this.abilityActiveMs;
    if (this.ability.id === 'thug_it_out') this.thugItOutSurvivalUsed = false;
    return true;
  }

  interruptMeditation(reason = 'Interrupted'): void {
    if (this.ability?.id !== 'meditation' || this.meditationMs <= 0) return;
    this.meditationMs = 0;
    this.abilityActiveMs = 0;
    this.meditationStatusMs = 900;
    this.abilityStatus = reason.includes(this.ability.name) ? reason : `${this.ability.name} interrupted`;
  }

  updateAbilityTimers(deltaMs: number): { healthRestored: number; staminaRestored: number } {
    this.abilityCooldownMs = Math.max(0, this.abilityCooldownMs - deltaMs);
    this.criticalOverloadArmedMs = Math.max(0, this.criticalOverloadArmedMs - deltaMs);
    this.abilityActiveMs = Math.max(0, this.abilityActiveMs - deltaMs);
    this.meditationStatusMs = Math.max(0, this.meditationStatusMs - deltaMs);
    let healthRestored = 0;
    let staminaRestored = 0;

    if (this.ability?.id === 'meditation' && this.meditationMs > 0) {
      this.meditationMs = Math.max(0, this.meditationMs - deltaMs);
      this.abilityActiveMs = this.meditationMs;
      const seconds = deltaMs / 1000;
      healthRestored = this.heal((32 + this.upgrades.abilityLevel * 8) * seconds);
      const before = this.stamina;
      this.stamina = Math.min(this.maxStamina, this.stamina + (34 + this.upgrades.abilityLevel * 5) * seconds);
      staminaRestored = this.stamina - before;
      this.meditationStatusMs = 0;
      this.abilityStatus = `${this.ability.name} active`;
    }

    if (this.abilityActiveMs <= 0 && this.ability?.id === 'thug_it_out') {
      this.thugItOutSurvivalUsed = false;
    }
    if (this.abilityActiveMs <= 0 && this.ability?.id !== 'meditation') {
      this.abilityStatus = this.abilityCooldownMs > 0 && this.ability ? `${this.ability.name} on cooldown` : '';
    }
    if (this.criticalOverloadArmedMs <= 0 && this.ability?.id === 'critical_overload') {
      this.abilityStatus = this.abilityCooldownMs > 0 && this.ability ? `${this.ability.name} on cooldown` : '';
    }
    if (this.ability?.id === 'meditation' && this.meditationMs <= 0 && this.meditationStatusMs <= 0) {
      this.abilityStatus = '';
    }
    return { healthRestored, staminaRestored };
  }

  consumeCriticalOverload(): void {
    if (this.ability?.id !== 'critical_overload' || this.criticalOverloadArmedMs <= 0) return;
    this.criticalOverloadArmedMs = 0;
    this.attackLockMs = Math.max(this.attackLockMs, 760);
    this.abilityStatus = `${this.ability.name} on cooldown`;
  }

  recordMomentumHit(): void {
    if (this.ability?.id !== 'momentum_flow' || this.abilityActiveMs <= 0) return;
    this.momentumStacks = Math.min(5, this.momentumStacks + 1);
    this.abilityStatus = `${this.ability.name} x${this.momentumStacks}`;
  }

  resetMomentum(reason = 'Flow reset'): void {
    if (this.ability?.id !== 'momentum_flow') return;
    this.momentumStacks = 0;
    if (this.abilityActiveMs > 0) this.abilityStatus = reason.includes(this.ability.name) ? reason : `${this.ability.name} reset`;
  }

  preventLethalDamage(): boolean {
    if (this.ability?.id !== 'thug_it_out' || this.abilityActiveMs <= 0 || this.thugItOutSurvivalUsed) return false;
    this.health = Math.max(1, Math.min(this.maxHealth, this.maxHealth * 0.12));
    this.alive = true;
    this.thugItOutSurvivalUsed = true;
    this.abilityStatus = `${this.ability.name} saved you`;
    return true;
  }

  getDamageReduction(): number {
    const flowReduction = this.activity >= 70 ? this.upgrades.highActivityDefenseLevel * 0.04 : 0;
    const armorReduction = this.character.id === 'supreme-emperor' && this.activity >= 70 && this.activeMove ? this.upgrades.emperorArmorLevel * 0.05 : 0;
    const generalReduction = Math.min(0.42, this.upgrades.defenseLevel * 0.06 + flowReduction + armorReduction);
    if (this.ability?.id !== 'thug_it_out' || this.abilityActiveMs <= 0) return generalReduction;
    return Math.min(0.65, generalReduction + 0.4 + this.upgrades.abilityLevel * 0.05);
  }

  getMoveUpgradeLevel(moveId: string, type: 'damage' | 'efficiency' | 'control'): number {
    return this.moveUpgradeLevels.get(`${moveId}:${type}`) ?? 0;
  }

  addMoveUpgrade(moveId: string, type: 'damage' | 'efficiency' | 'control'): void {
    const key = `${moveId}:${type}`;
    this.moveUpgradeLevels.set(key, (this.moveUpgradeLevels.get(key) ?? 0) + 1);
  }

  override takeDamage(amount: number): void {
    if (this.ability?.id === 'density' && this.abilityActiveMs > 0) {
      this.damageFlashMs = 90;
      this.abilityStatus = `${this.ability.name} absorbed damage`;
      return;
    }
    this.interruptMeditation('Meditation interrupted');
    this.resetMomentum('Flow broken');
    this.spendActivity(18);
    this.recentDamageMs = 3000;
    const reducedAmount = amount * (1 - this.getDamageReduction());
    const nextHealth = this.health - reducedAmount;
    this.damageFlashMs = 150;
    if (nextHealth <= 0 && this.preventLethalDamage()) return;
    this.health = Math.max(0, nextHealth);
    if (this.health <= 0) {
      this.alive = false;
    }
  }
}
