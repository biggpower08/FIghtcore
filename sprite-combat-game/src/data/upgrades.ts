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
  | 'cruel_edge'
  | 'impact_transfer'
  | 'density_duration'
  | 'density_coolant'
  | 'ronin_survivor'
  | 'jab_accelerator'
  | 'cross_compression'
  | 'calf_kick_chop'
  | 'knee_clinch'
  | 'instant_death_focus'
  | 'emperor_coolant'
  | 'heavy_armor'
  | 'jab_cross_breaker'
  | 'feint_hook_crush'
  | 'roundhouse_torque'
  | 'tornado_terror';

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
  stat('iron_momentum', 'Iron Momentum', 'All attacks deal 12% more damage per level.', 5, 'damageLevel', 'Damage'),
  stat('breath_economy', 'Breath Economy', 'All equipped moves cost 8% less stamina per level.', 5, 'staminaLevel', 'Stamina cost'),
  stat('rhythm_reset', 'Rhythm Reset', 'All equipped moves recover 6% faster per level.', 5, 'cooldownLevel', 'Move cooldown'),
  stat('cellular_patch', 'Cellular Patch', 'Slowly regenerate more health when you have not been hit recently.', 3, 'healthRegenLevel', 'Health regen'),
  stat('footwork_drills', 'Footwork Drills', 'Move 5% faster per level.', 4, 'speedLevel', 'Move speed'),
  stat('shorter_dash', 'Shorter Dash Reset', 'Dash cooldown drops by 90ms per level.', 4, 'dashLevel', 'Dash cooldown'),
  stat('guard_conditioning', 'Guard Conditioning', 'Reduce incoming damage by 6% per level.', 5, 'defenseLevel', 'Defense'),
  stat('second_wind', 'Second Wind', 'Wave-clear recovery gains a small extra buffer.', 3, 'waveHealLevel', 'Wave recovery'),
  stat('cruel_edge', 'Cruel Edge', 'Proc and burst effects become slightly more reliable.', 4, 'critLevel', 'Proc chance'),
  stat('impact_transfer', 'Impact Transfer', 'Player knockback is 10% stronger per level.', 3, 'knockbackLevel', 'Knockback'),
  stamina('deeper_gas_tank', 'Deeper Gas Tank', 'Increase max stamina and refill it immediately.', 3),
  maxHealth('vital_reserve', 'Vital Reserve', 'Increase maximum health and immediately heal the added amount.', 4),

  ability('density_duration', 'Dense Window', 'ronin', 'density', 'Density lasts longer.', 3),
  abilityCooldown('density_coolant', 'Density Coolant', 'ronin', 'density', 'Density comes back faster.'),
  characterStat('ronin_survivor', 'Ronin Survivor', 'ronin', 'Ronin takes less damage and recovers better between waves.', 3, (player) => {
    player.upgrades.defenseLevel += 1;
    player.upgrades.waveHealLevel += 1;
  }),
  moveUpgrade('jab_accelerator', 'Jab Accelerator', 'ronin', 'jab', 'efficiency', 'Jab costs less stamina.'),
  moveUpgrade('cross_compression', 'Cross Compression', 'ronin', 'cross', 'damage', 'Cross deals more damage.'),
  moveUpgrade('calf_kick_chop', 'Calf Kick Chop', 'ronin', 'calf_kick', 'control', 'Calf Kick pushes and staggers harder.'),
  moveUpgrade('knee_clinch', 'Knee Clinch', 'ronin', 'knee', 'damage', 'Knee hits harder.'),

  ability('instant_death_focus', 'Instant Death Focus', 'supreme-emperor', 'instant_death', 'Instant Death lasts longer and procs more often.', 4),
  abilityCooldown('emperor_coolant', 'Emperor Coolant', 'supreme-emperor', 'instant_death', 'Instant Death comes back faster.'),
  characterStat('heavy_armor', 'Heavy Armor', 'supreme-emperor', 'Take less damage while committing to heavy strikes.', 3, (player) => {
    player.upgrades.defenseLevel += 1;
    player.upgrades.knockbackLevel += 1;
  }),
  moveUpgrade('jab_cross_breaker', 'Jab-Cross Breaker', 'supreme-emperor', 'jab_cross', 'damage', 'Jab-Cross deals more damage.'),
  moveUpgrade('feint_hook_crush', 'Feint-Hook Crush', 'supreme-emperor', 'feint_rear_hook', 'control', 'Feint-Rear Hook causes stronger hitstun.'),
  moveUpgrade('roundhouse_torque', 'Roundhouse Torque', 'supreme-emperor', 'roundhouse_kick', 'control', 'Roundhouse Kick knocks enemies back harder.'),
  moveUpgrade('tornado_terror', 'Tornado Terror', 'supreme-emperor', 'tornado_kick', 'damage', 'Tornado Kick deals more damage.'),
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

function characterStat(
  id: UpgradeId,
  name: string,
  characterId: string,
  description: string,
  maxLevel: number,
  apply: (player: Player) => void,
): UpgradeDefinition {
  return {
    id,
    name,
    category: 'Character',
    characterId,
    description,
    maxLevel,
    apply,
    currentLevel: (player) => Math.min(player.upgrades.defenseLevel, player.upgrades.waveHealLevel + player.upgrades.knockbackLevel),
    valueText: () => `${name} level up`,
    isAvailable: (player) => player.character.id === characterId,
  };
}

function moveUpgrade(
  id: UpgradeId,
  name: string,
  characterId: string,
  moveId: string,
  type: 'damage' | 'efficiency' | 'control',
  description: string,
): UpgradeDefinition {
  return {
    id,
    name,
    category: 'Move',
    characterId,
    moveId,
    description,
    maxLevel: 3,
    apply: (player) => player.addMoveUpgrade(moveId, type),
    currentLevel: (player) => player.getMoveUpgradeLevel(moveId, type),
    valueText: (player) => `${moveDisplayName(moveId)} ${typeLabel(type)} level ${player.getMoveUpgradeLevel(moveId, type) + 1}`,
    isAvailable: (player) => player.character.id === characterId && player.equippedMoves.some((move) => move.id === moveId),
  };
}

function moveDisplayName(moveId: string): string {
  return moveId
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function typeLabel(type: 'damage' | 'efficiency' | 'control'): string {
  if (type === 'damage') return 'damage';
  if (type === 'control') return 'control';
  return 'efficiency';
}
