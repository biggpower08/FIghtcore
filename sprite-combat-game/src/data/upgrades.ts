import type { Player } from '../entities/Player';
import type { SpecialAbilityId } from './specialAbilities';

export type RewardKind = 'move' | 'upgrade';
export type UpgradeCategory = 'General' | 'Character' | 'Move' | 'Ability';
export type UpgradeId =
  | 'iron_momentum'
  | 'breath_economy'
  | 'rhythm_reset'
  | 'vital_reserve'
  | 'critical_circuit'
  | 'assassins_rhythm'
  | 'flow_state'
  | 'shin_conditioning'
  | 'breath_control'
  | 'iron_calm'
  | 'grapplers_grit'
  | 'last_stand'
  | 'jab_accelerator'
  | 'slice_amplifier'
  | 'side_kick_drive'
  | 'cross_compression'
  | 'teep_pressure'
  | 'roundhouse_torque'
  | 'palm_precision'
  | 'high_kick_reach'
  | 'sweep_balance'
  | 'shot_penetration'
  | 'hip_toss_control'
  | 'armbar_clamp'
  | 'overload_conductor'
  | 'flow_extension'
  | 'meditative_recovery'
  | 'thug_reserve';

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
  general('iron_momentum', 'Iron Momentum', 'All attacks deal 12% more damage per level.', 5, 'damageLevel', 'Damage'),
  general('breath_economy', 'Breath Economy', 'All equipped moves cost 8% less stamina per level.', 5, 'staminaLevel', 'Stamina cost'),
  general('rhythm_reset', 'Rhythm Reset', 'All equipped moves recover 6% faster per level.', 5, 'cooldownLevel', 'Cooldown'),
  general('vital_reserve', 'Vital Reserve', 'Increase maximum health and immediately heal the added amount.', 3, 'health', 'Max health'),
  character('critical_circuit', 'Critical Circuit', 'cyber-ninja', 'Critical Overload hits harder.', 3),
  character('assassins_rhythm', "Assassin's Rhythm", 'cyber-ninja', 'Cyber Ninja ability windows last longer.', 3),
  character('flow_state', 'Flow State', 'shadow-striker', 'Momentum Flow lasts longer and rewards clean chains.', 3),
  character('shin_conditioning', 'Shin Conditioning', 'shadow-striker', 'Shadow Striker kicks gain extra efficiency.', 3),
  character('breath_control', 'Breath Control', 'combat-monk', 'Meditation restores more health and stamina.', 3),
  character('iron_calm', 'Iron Calm', 'combat-monk', 'Combat Monk sustain upgrades last longer.', 3),
  character('grapplers_grit', "Grappler's Grit", 'puppetmaster', 'Puppetmaster gains stronger Thug It Out bonuses.', 3),
  character('last_stand', 'Last Stand', 'puppetmaster', 'Thug It Out survival and duration improve.', 3),
  moveUpgrade('jab_accelerator', 'Jab Accelerator', 'cyber-ninja', 'jab', 'efficiency', 'Jab costs less stamina.'),
  moveUpgrade('slice_amplifier', 'Slice Amplifier', 'cyber-ninja', 'slice', 'damage', 'Slice deals more damage.'),
  moveUpgrade('side_kick_drive', 'Side Kick Drive', 'cyber-ninja', 'side_kick', 'damage', 'Side Kick hits harder.'),
  moveUpgrade('cross_compression', 'Cross Compression', 'shadow-striker', 'cross', 'damage', 'Cross deals more damage.'),
  moveUpgrade('teep_pressure', 'Teep Pressure', 'shadow-striker', 'teep_kick', 'efficiency', 'Teep Kick costs less stamina.'),
  moveUpgrade('roundhouse_torque', 'Roundhouse Torque', 'shadow-striker', 'roundhouse_kick', 'damage', 'Roundhouse Kick deals more damage.'),
  moveUpgrade('palm_precision', 'Palm Precision', 'combat-monk', 'palm_strike', 'damage', 'Palm Strike deals more damage.'),
  moveUpgrade('high_kick_reach', 'High Kick Reach', 'combat-monk', 'high_kick', 'damage', 'High Kick deals more damage.'),
  moveUpgrade('sweep_balance', 'Sweep Balance', 'combat-monk', 'spinning_sweep', 'efficiency', 'Spinning Sweep costs less stamina.'),
  moveUpgrade('shot_penetration', 'Shot Penetration', 'puppetmaster', 'double_leg_shot', 'damage', 'Double Leg Shot hits harder.'),
  moveUpgrade('hip_toss_control', 'Hip Toss Control', 'puppetmaster', 'o_goshi', 'damage', 'O Goshi hits harder.'),
  moveUpgrade('armbar_clamp', 'Armbar Clamp', 'puppetmaster', 'armbar', 'damage', 'Armbar deals more damage.'),
  ability('overload_conductor', 'Overload Conductor', 'cyber-ninja', 'critical_overload', 'Critical Overload damage and duration improve.'),
  ability('flow_extension', 'Flow Extension', 'shadow-striker', 'momentum_flow', 'Momentum Flow duration and stack value improve.'),
  ability('meditative_recovery', 'Meditative Recovery', 'combat-monk', 'meditation', 'Meditation heals more health and stamina.'),
  ability('thug_reserve', 'Thug Reserve', 'puppetmaster', 'thug_it_out', 'Thug It Out lasts longer and boosts harder.'),
];

function general(
  id: UpgradeId,
  name: string,
  description: string,
  maxLevel: number,
  field: keyof Player['upgrades'] | 'health',
  label: string,
): UpgradeDefinition {
  return {
    id,
    name,
    category: 'General',
    description,
    maxLevel,
    apply: (player) => {
      if (field === 'health') {
        player.maxHealth += 12;
        player.heal(12);
      } else {
        player.upgrades[field] += 1;
      }
    },
    currentLevel: (player) => (field === 'health' ? Math.max(0, Math.round((player.maxHealth - player.loadout.stats.maxHealth) / 12)) : player.upgrades[field]),
    valueText: (player) => `${label} level ${field === 'health' ? Math.max(0, Math.round((player.maxHealth - player.loadout.stats.maxHealth) / 12)) + 1 : player.upgrades[field] + 1}`,
  };
}

function character(id: UpgradeId, name: string, characterId: string, description: string, maxLevel: number): UpgradeDefinition {
  return {
    id,
    name,
    category: 'Character',
    characterId,
    description,
    maxLevel,
    apply: (player) => {
      player.upgrades.abilityLevel += 1;
    },
    currentLevel: (player) => player.upgrades.abilityLevel,
    valueText: (player) => `${player.ability?.name ?? name} effect level ${player.upgrades.abilityLevel + 1}`,
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
    valueText: (player) => `${moveDisplayName(moveId)} ${type === 'damage' ? 'damage' : 'efficiency'} level ${player.getMoveUpgradeLevel(moveId, type) + 1}`,
    isAvailable: (player) => player.character.id === characterId && player.equippedMoves.some((move) => move.id === moveId),
  };
}

function ability(id: UpgradeId, name: string, characterId: string, abilityId: SpecialAbilityId, description: string): UpgradeDefinition {
  return {
    id,
    name,
    category: 'Ability',
    characterId,
    abilityId,
    description,
    maxLevel: 4,
    apply: (player) => {
      player.upgrades.abilityLevel += 1;
    },
    currentLevel: (player) => player.upgrades.abilityLevel,
    valueText: (player) => `${player.ability?.name ?? name} level ${player.upgrades.abilityLevel + 1}`,
    isAvailable: (player) => player.character.id === characterId && player.ability?.id === abilityId,
  };
}

function moveDisplayName(moveId: string): string {
  return moveId
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
