import type { Player } from '../entities/Player';
import type { SpecialAbilityId } from './specialAbilities';

export type RewardKind = 'move' | 'upgrade';
export type UpgradeCategory = 'General' | 'Character' | 'Move' | 'Ability';
export type UpgradeId =
  | 'iron_momentum'
  | 'breath_economy'
  | 'rhythm_reset'
  | 'vital_reserve'
  | 'cellular_patch'
  | 'footwork_drills'
  | 'shorter_dash'
  | 'deeper_gas_tank'
  | 'guard_conditioning'
  | 'second_wind'
  | 'momentum_heal'
  | 'clean_footwork'
  | 'pressure_engine'
  | 'relentless'
  | 'sharp_entry'
  | 'perfect_rhythm'
  | 'density_control'
  | 'counter_step'
  | 'calf_breaker'
  | 'flow_guard'
  | 'clean_cross'
  | 'pressure_chain'
  | 'instant_death_focus'
  | 'emperor_coolant'
  | 'royal_pressure'
  | 'crown_crush'
  | 'emperors_tempo'
  | 'golden_threat'
  | 'execution_chance'
  | 'dominance_armor'
  | 'imperial_finish';

export interface UpgradeDefinition {
  id: UpgradeId;
  name: string;
  category: UpgradeCategory;
  description: string;
  maxLevel: number;
  characterId?: string;
  moveId?: string;
  abilityId?: SpecialAbilityId;
  apply(player: Player): void;
  currentLevel(player: Player): number;
  valueText(player: Player): string;
  isAvailable?(player: Player): boolean;
}

export const upgrades: UpgradeDefinition[] = [
  stat('iron_momentum', 'Iron Momentum', 'All attacks hit a little harder.', 4, 'damageLevel', 'Damage'),
  stat('breath_economy', 'Breath Economy', 'Attacks spend less stamina, keeping stamina as a soft limiter.', 4, 'staminaLevel', 'Stamina economy'),
  stat('rhythm_reset', 'Rhythm Reset', 'Moves recover faster and chain more comfortably.', 4, 'cooldownLevel', 'Move recovery'),
  stat('cellular_patch', 'Cellular Patch', 'Slowly regenerate more health when you have not been hit recently.', 3, 'healthRegenLevel', 'Health regen'),
  stat('footwork_drills', 'Footwork Drills', 'Move 5% faster per level.', 3, 'speedLevel', 'Move speed'),
  stat('shorter_dash', 'Shorter Dash Reset', 'Dash cooldown drops by 90ms per level.', 3, 'dashLevel', 'Dash cooldown'),
  stat('second_wind', 'Focused Breathing', 'Wave-clear recovery gains a small extra buffer.', 3, 'waveHealLevel', 'Wave recovery'),
  stat('momentum_heal', 'Momentum Heal', 'Entering max Activity heals a small amount.', 3, 'killHealLevel', 'Flow heal'),
  stat('clean_footwork', 'Clean Footwork', 'Dashing near enemies grants more Activity.', 3, 'dashActivityLevel', 'Dash Activity'),
  stat('pressure_engine', 'Pressure Engine', 'Activity decays more slowly.', 3, 'activityDecayLevel', 'Activity decay'),
  stat('relentless', 'Relentless', 'High Activity improves ability recharge and flow damage.', 3, 'flowDamageLevel', 'Flow pressure'),
  stat('sharp_entry', 'Sharp Entry', 'High Activity adds stronger control and knockback.', 3, 'knockbackLevel', 'Control'),
  stamina('deeper_gas_tank', 'Deeper Gas Tank', 'Increase max stamina and refill it immediately.', 3),
  maxHealth('vital_reserve', 'Vital Reserve', 'Increase maximum health and immediately heal the added amount.', 4),

  characterField('perfect_rhythm', 'Perfect Rhythm', 'ronin', 'Ronin chains recover faster when you keep attacking.', 3, 'roninChainLevel', 'Rhythm'),
  ability('density_control', 'Density Control', 'ronin', 'density', 'Density lasts longer and feeds the survivor path.', 3),
  characterField('counter_step', 'Counter Step', 'ronin', 'Dashing close to enemies grants more Activity.', 3, 'dashActivityLevel', 'Counter Activity'),
  characterField('calf_breaker', 'Calf Breaker', 'ronin', 'Calf Kick gets stronger control and damage pressure.', 3, 'roninCalfLevel', 'Calf pressure'),
  characterField('flow_guard', 'Flow Guard', 'ronin', 'High Activity grants damage reduction.', 3, 'highActivityDefenseLevel', 'Flow guard'),
  characterField('clean_cross', 'Clean Cross', 'ronin', 'Cross deals bonus damage after Jab connects.', 3, 'roninCrossLevel', 'Jab to cross'),
  characterField('pressure_chain', 'Pressure Chain', 'ronin', 'Landed pressure improves recovery and Activity gain.', 3, 'flowRecoveryLevel', 'Pressure chain'),

  ability('instant_death_focus', 'Instant Death Focus', 'supreme-emperor', 'instant_death', 'Instant Death lasts longer and procs more often.', 4),
  abilityCooldown('emperor_coolant', 'Emperor Coolant', 'supreme-emperor', 'instant_death', 'Instant Death comes back faster.'),
  characterField('royal_pressure', 'Royal Pressure', 'supreme-emperor', 'Heavy hits generate extra Activity.', 3, 'emperorHeavyActivityLevel', 'Royal pressure'),
  characterField('crown_crush', 'Crown Crush', 'supreme-emperor', 'High Activity makes heavy hits hit harder.', 3, 'emperorHighActivityDamageLevel', 'Crown crush'),
  characterField('emperors_tempo', "Emperor's Tempo", 'supreme-emperor', 'Jab-Cross and heavy chains recover faster at high Activity.', 3, 'flowRecoveryLevel', 'Tempo'),
  characterField('golden_threat', 'Golden Threat', 'supreme-emperor', 'Heavy strikes gain more damage and control.', 3, 'knockbackLevel', 'Threat'),
  characterField('execution_chance', 'Execution Chance', 'supreme-emperor', 'Instant Death chance rises only near max Activity.', 3, 'emperorExecutionLevel', 'Execution'),
  characterField('dominance_armor', 'Dominance Armor', 'supreme-emperor', 'High Activity grants armor during attacks.', 3, 'emperorArmorLevel', 'Dominance armor'),
  characterField('imperial_finish', 'Imperial Finish', 'supreme-emperor', 'Defeating enemies grants a small heal and helps sustain pressure.', 3, 'emperorKillHealLevel', 'Finish heal'),
];

function stat(
  id: UpgradeId,
  name: string,
  description: string,
  maxLevel: number,
  field: keyof Player['upgrades'],
  label: string,
): UpgradeDefinition {
  return {
    id,
    name,
    category: 'General',
    description,
    maxLevel,
    apply: (player) => {
      player.upgrades[field] += 1;
    },
    currentLevel: (player) => player.upgrades[field],
    valueText: (player) => `${label} level ${player.upgrades[field] + 1}`,
  };
}

function maxHealth(id: UpgradeId, name: string, description: string, maxLevel: number): UpgradeDefinition {
  return {
    id,
    name,
    category: 'General',
    description,
    maxLevel,
    apply: (player) => {
      player.maxHealth += 14;
      player.heal(14);
    },
    currentLevel: (player) => Math.max(0, Math.round((player.maxHealth - player.loadout.stats.maxHealth) / 14)),
    valueText: (player) => `Max health +${14 * (Math.max(0, Math.round((player.maxHealth - player.loadout.stats.maxHealth) / 14)) + 1)}`,
  };
}

function stamina(id: UpgradeId, name: string, description: string, maxLevel: number): UpgradeDefinition {
  return {
    id,
    name,
    category: 'General',
    description,
    maxLevel,
    apply: (player) => {
      player.upgrades.maxStaminaLevel += 1;
      player.maxStamina += 12;
      player.stamina = player.maxStamina;
    },
    currentLevel: (player) => player.upgrades.maxStaminaLevel,
    valueText: (player) => `Max stamina level ${player.upgrades.maxStaminaLevel + 1}`,
  };
}

function ability(
  id: UpgradeId,
  name: string,
  characterId: string,
  abilityId: SpecialAbilityId,
  description: string,
  maxLevel: number,
): UpgradeDefinition {
  return {
    id,
    name,
    category: 'Ability',
    characterId,
    abilityId,
    description,
    maxLevel,
    apply: (player) => {
      player.upgrades.abilityLevel += 1;
    },
    currentLevel: (player) => player.upgrades.abilityLevel,
    valueText: (player) => `${player.ability?.name ?? name} level ${player.upgrades.abilityLevel + 1}`,
    isAvailable: (player) => player.character.id === characterId && player.ability?.id === abilityId,
  };
}

function abilityCooldown(id: UpgradeId, name: string, characterId: string, abilityId: SpecialAbilityId, description: string): UpgradeDefinition {
  return {
    id,
    name,
    category: 'Ability',
    characterId,
    abilityId,
    description,
    maxLevel: 3,
    apply: (player) => {
      player.upgrades.abilityCooldownLevel += 1;
    },
    currentLevel: (player) => player.upgrades.abilityCooldownLevel,
    valueText: (player) => `Ability cooldown level ${player.upgrades.abilityCooldownLevel + 1}`,
    isAvailable: (player) => player.character.id === characterId && player.ability?.id === abilityId,
  };
}

function characterField(
  id: UpgradeId,
  name: string,
  characterId: string,
  description: string,
  maxLevel: number,
  field: keyof Player['upgrades'],
  label: string,
): UpgradeDefinition {
  return {
    id,
    name,
    category: 'Character',
    characterId,
    description,
    maxLevel,
    apply: (player) => {
      player.upgrades[field] += 1;
    },
    currentLevel: (player) => player.upgrades[field],
    valueText: (player) => `${label} level ${player.upgrades[field] + 1}`,
    isAvailable: (player) => player.character.id === characterId,
  };
}
