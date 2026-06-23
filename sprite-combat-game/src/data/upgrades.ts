import type { Player } from '../entities/Player';
import type { SpecialAbilityId } from './specialAbilities';

export type RewardKind = 'move' | 'upgrade';
export type UpgradeCategory = 'Activity/Flow' | 'Survival' | 'Move Mastery' | 'Wave Momentum' | 'Ronin Path' | 'Supreme Path' | 'Ability';
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
  stat('iron_momentum', 'Heat Check', 'All attacks hit a little harder.', 4, 'damageLevel', 'Damage', 'Move Mastery'),
  stat('breath_economy', 'Flow State', 'Build Activity faster so pressure turns into Flow more often.', 4, 'activityGainLevel', 'Activity gain', 'Activity/Flow'),
  stat('rhythm_reset', 'Relentless Hands', 'Moves recover faster and chain more comfortably.', 4, 'cooldownLevel', 'Move recovery', 'Move Mastery'),
  stat('cellular_patch', 'Damage Memory', 'Slowly regenerate more health when you have not been hit recently.', 3, 'healthRegenLevel', 'Health regen', 'Survival'),
  stat('footwork_drills', 'No Back Step', 'Move 5% faster per level.', 3, 'speedLevel', 'Move speed', 'Move Mastery'),
  stat('shorter_dash', 'Counter Step Reset', 'Dash cooldown drops by 90ms per level.', 3, 'dashLevel', 'Dash cooldown', 'Move Mastery'),
  stat('second_wind', 'Breath Between Rounds', 'Wave-clear recovery gains a small extra buffer.', 3, 'waveHealLevel', 'Wave recovery', 'Wave Momentum'),
  stat('momentum_heal', 'Flow Mending', 'Entering max Activity heals a small amount.', 3, 'killHealLevel', 'Flow heal', 'Activity/Flow'),
  stat('clean_footwork', 'Angle Tax', 'Dashing near enemies grants more Activity.', 3, 'dashActivityLevel', 'Dash Activity', 'Activity/Flow'),
  stat('pressure_engine', 'Pressure Engine', 'Activity decays more slowly.', 3, 'activityDecayLevel', 'Activity decay', 'Activity/Flow'),
  stat('relentless', 'Redline Pressure', 'High Activity improves ability recharge and flow damage.', 3, 'flowDamageLevel', 'Flow pressure', 'Activity/Flow'),
  stat('sharp_entry', 'Hard Entry', 'High Activity adds stronger control and knockback.', 3, 'knockbackLevel', 'Control', 'Move Mastery'),
  stat('deeper_gas_tank', 'Bigger Aura', 'Increase maximum Activity and immediately fill the new space.', 3, 'maxStaminaLevel', 'Activity capacity', 'Activity/Flow', (player) => {
    player.maxActivity += 12;
    player.activity = player.maxActivity;
  }),
  maxHealth('vital_reserve', 'Stay Standing', 'Increase maximum health and immediately heal the added amount.', 4),

  characterField('perfect_rhythm', 'Clean Entry', 'ronin', 'Ronin chains recover faster when you keep attacking.', 3, 'roninChainLevel', 'Rhythm'),
  ability('density_control', 'Density Breath', 'ronin', 'density', 'Density lasts longer and feeds the survivor path.', 3),
  characterField('counter_step', 'Counter Step', 'ronin', 'Dashing close to enemies grants more Activity.', 3, 'dashActivityLevel', 'Counter Activity'),
  characterField('calf_breaker', 'Low-Line Tax', 'ronin', 'Calf Kick gets stronger control and damage pressure.', 3, 'roninCalfLevel', 'Low line'),
  characterField('flow_guard', 'Second Wind Stance', 'ronin', 'High Activity grants damage reduction.', 3, 'highActivityDefenseLevel', 'Flow guard'),
  characterField('clean_cross', 'Cross Discipline', 'ronin', 'Cross deals bonus damage after Jab connects.', 3, 'roninCrossLevel', 'Jab to cross'),
  characterField('pressure_chain', 'Quiet Pressure', 'ronin', 'Landed pressure improves recovery and Activity gain.', 3, 'flowRecoveryLevel', 'Pressure chain'),

  ability('instant_death_focus', "Emperor's Decree", 'supreme-emperor', 'instant_death', 'Instant Death lasts longer and procs more often.', 4),
  abilityCooldown('emperor_coolant', 'Throne Momentum', 'supreme-emperor', 'instant_death', 'Instant Death comes back faster.'),
  characterField('royal_pressure', 'Royal Pressure', 'supreme-emperor', 'Heavy hits generate extra Activity.', 3, 'emperorHeavyActivityLevel', 'Royal pressure'),
  characterField('crown_crush', 'Crown Breaker', 'supreme-emperor', 'High Activity makes heavy hits hit harder.', 3, 'emperorHighActivityDamageLevel', 'Crown breaker'),
  characterField('emperors_tempo', 'Imperial Tempo', 'supreme-emperor', 'Jab-Cross and heavy chains recover faster at high Activity.', 3, 'flowRecoveryLevel', 'Tempo'),
  characterField('golden_threat', 'Golden Threat', 'supreme-emperor', 'Heavy strikes gain more damage and control.', 3, 'knockbackLevel', 'Threat'),
  characterField('execution_chance', 'Execution Window', 'supreme-emperor', 'Instant Death chance rises only near max Activity.', 3, 'emperorExecutionLevel', 'Execution'),
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
  category: UpgradeCategory,
  extraApply?: (player: Player) => void,
): UpgradeDefinition {
  return {
    id,
    name,
    category,
    description,
    maxLevel,
    apply: (player) => {
      player.upgrades[field] += 1;
      extraApply?.(player);
    },
    currentLevel: (player) => player.upgrades[field],
    valueText: (player) => `${label} level ${player.upgrades[field] + 1}`,
  };
}

function maxHealth(id: UpgradeId, name: string, description: string, maxLevel: number): UpgradeDefinition {
  return {
    id,
    name,
    category: 'Survival',
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
    category: characterId === 'ronin' ? 'Ronin Path' : characterId === 'supreme-emperor' ? 'Supreme Path' : 'Ability',
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
    category: characterId === 'supreme-emperor' ? 'Supreme Path' : 'Ability',
    characterId,
    abilityId,
    description,
    maxLevel: 3,
    apply: (player) => {
      player.upgrades.abilityCooldownLevel += 1;
    },
    currentLevel: (player) => player.upgrades.abilityCooldownLevel,
    valueText: (player) => `Ability reset level ${player.upgrades.abilityCooldownLevel + 1}`,
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
    category: characterId === 'ronin' ? 'Ronin Path' : characterId === 'supreme-emperor' ? 'Supreme Path' : 'Move Mastery',
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
