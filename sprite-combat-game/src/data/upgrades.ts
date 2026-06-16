import type { Player } from '../entities/Player';

export type RewardKind = 'move' | 'upgrade';
export type UpgradeId = 'damage_training' | 'stamina_efficiency' | 'cooldown_tuning' | 'ability_mastery';

export interface UpgradeDefinition {
  id: UpgradeId;
  name: string;
  description: string;
  maxLevel: number;
  apply(player: Player): void;
  currentLevel(player: Player): number;
  valueText(player: Player): string;
}

export const upgrades: UpgradeDefinition[] = [
  {
    id: 'damage_training',
    name: 'Damage Training',
    description: 'All player attacks hit harder.',
    maxLevel: 5,
    apply: (player) => {
      player.upgrades.damageLevel += 1;
    },
    currentLevel: (player) => player.upgrades.damageLevel,
    valueText: (player) => `Damage +${(player.upgrades.damageLevel + 1) * 12}%`,
  },
  {
    id: 'stamina_efficiency',
    name: 'Stamina Efficiency',
    description: 'All H/J/K/L moves cost less stamina.',
    maxLevel: 5,
    apply: (player) => {
      player.upgrades.staminaLevel += 1;
    },
    currentLevel: (player) => player.upgrades.staminaLevel,
    valueText: (player) => `Move stamina costs -${Math.min(42, (player.upgrades.staminaLevel + 1) * 8)}%`,
  },
  {
    id: 'cooldown_tuning',
    name: 'Cooldown Tuning',
    description: 'Equipped moves come back faster.',
    maxLevel: 5,
    apply: (player) => {
      player.upgrades.cooldownLevel += 1;
    },
    currentLevel: (player) => player.upgrades.cooldownLevel,
    valueText: (player) => `Move cooldowns -${Math.min(30, (player.upgrades.cooldownLevel + 1) * 6)}%`,
  },
  {
    id: 'ability_mastery',
    name: 'Ability Mastery',
    description: 'Improves the current fighter U-key ability.',
    maxLevel: 4,
    apply: (player) => {
      player.upgrades.abilityLevel += 1;
    },
    currentLevel: (player) => player.upgrades.abilityLevel,
    valueText: (player) => `${player.ability?.name ?? 'Ability'} duration/effect +1`,
  },
];
