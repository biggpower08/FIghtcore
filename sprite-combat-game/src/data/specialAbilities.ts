export type SpecialAbilityId = 'critical_overload' | 'momentum_flow' | 'meditation' | 'thug_it_out' | 'density' | 'instant_death';

export interface SpecialAbilityDefinition {
  id: SpecialAbilityId;
  aliases?: string[];
  characterId: string;
  name: string;
  cooldownMs: number;
  durationMs: number;
  description: string;
}

export const specialAbilities: SpecialAbilityDefinition[] = [
  {
    id: 'critical_overload',
    characterId: 'cyber-ninja',
    name: 'Critical Overload',
    cooldownMs: 9000,
    durationMs: 7000,
    description: 'Arms the next successful attack for heavy bonus damage, then briefly locks attacks.',
  },
  {
    id: 'momentum_flow',
    aliases: ['movement_flow'],
    characterId: 'shadow-striker',
    name: 'Momentum Flow',
    cooldownMs: 11000,
    durationMs: 6500,
    description: 'Opens a flow window where clean consecutive hits build damage stacks.',
  },
  {
    id: 'meditation',
    characterId: 'combat-monk',
    name: 'Meditation',
    cooldownMs: 12000,
    durationMs: 2800,
    description: 'Hold still to restore health and stamina. Damage, movement, dash, or attacks interrupt it.',
  },
  {
    id: 'thug_it_out',
    characterId: 'puppetmaster',
    name: 'Thug It Out',
    cooldownMs: 14000,
    durationMs: 6500,
    description: 'Temporarily boosts combat stats and prevents lethal damage during the buff.',
  },
  {
    id: 'density',
    characterId: 'ronin',
    name: 'Density',
    cooldownMs: 12000,
    durationMs: 3200,
    description: 'Become immune to incoming damage, but attacks are locked while the state is active.',
  },
  {
    id: 'instant_death',
    characterId: 'supreme-emperor',
    name: 'Instant Death',
    cooldownMs: 16000,
    durationMs: 5000,
    description: 'Strikes have a 50% chance to instantly kill normal enemies during the window.',
  },
];

export const specialAbilityByCharacterId = new Map(specialAbilities.map((ability) => [ability.characterId, ability]));
export const specialAbilityById = new Map(specialAbilities.map((ability) => [ability.id, ability]));
