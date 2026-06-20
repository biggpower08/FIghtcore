import { isGameplayReadyAnimation } from './animationEligibility';
import { moveById, type MoveDefinition } from './moves';

export type MoveSlotKey = 'H' | 'J' | 'K' | 'L';

export interface EquippedMoveSlot {
  key: MoveSlotKey;
  moveId: string;
  label: string;
}

export interface CharacterLoadout {
  characterId: string;
  slots: EquippedMoveSlot[];
  stats: {
    maxHealth: number;
    speed: number;
    stamina: number;
    damageMultiplier: number;
  };
  ability?: {
    id: string;
    name: string;
    description: string;
  };
}

const loadouts: CharacterLoadout[] = [
  {
    characterId: 'cyber-ninja',
    slots: [
      slot('H', 'jab'),
      slot('J', 'slice'),
      slot('K', 'side_kick'),
      slot('L', 'high_kick'),
    ],
    stats: { maxHealth: 124, speed: 304, stamina: 104, damageMultiplier: 1 },
    ability: {
      id: 'critical_overload',
      name: 'Critical Overload',
      description: 'Arm the next attack for heavy burst damage, then briefly lock attacks.',
    },
  },
  {
    characterId: 'shadow-striker',
    slots: [
      slot('H', 'roundhouse_kick'),
      slot('J', 'teep_kick'),
      slot('K', 'cross'),
      slot('L', 'jab'),
    ],
    stats: { maxHealth: 136, speed: 276, stamina: 116, damageMultiplier: 1.08 },
    ability: {
      id: 'momentum_flow',
      name: 'Momentum Flow',
      description: 'Consecutive hits increase damage.',
    },
  },
  {
    characterId: 'puppetmaster',
    slots: [
      slot('H', 'double_leg_shot'),
      slot('J', 'o_goshi'),
      slot('K', 'armbar'),
      slot('L', 'duck_under_mat_return_slam'),
    ],
    stats: { maxHealth: 158, speed: 258, stamina: 126, damageMultiplier: 1.04 },
    ability: {
      id: 'thug_it_out',
      name: 'Thug It Out',
      description: 'Built to keep pressure after heavy grappling exchanges.',
    },
  },
  {
    characterId: 'combat-monk',
    slots: [
      slot('H', 'palm_strike'),
      slot('J', 'high_kick'),
      slot('K', 'spinning_sweep'),
      slot('L', 'standing_shoulder_lock'),
    ],
    stats: { maxHealth: 148, speed: 292, stamina: 108, damageMultiplier: 1 },
    ability: {
      id: 'meditation',
      name: 'Meditation',
      description: 'Recharge health and stamina through meditation.',
    },
  },
  {
    characterId: 'ronin',
    slots: [slot('H', 'jab'), slot('J', 'cross'), slot('K', 'calf_kick'), slot('L', 'knee')],
    stats: { maxHealth: 146, speed: 286, stamina: 124, damageMultiplier: 1.05 },
    ability: {
      id: 'density',
      name: 'Density',
      description: 'Become immune to damage for a few seconds, but attacks are locked during the state.',
    },
  },
  {
    characterId: 'supreme-emperor',
    slots: [
      slot('H', 'jab_cross'),
      slot('J', 'feint_rear_hook'),
      slot('K', 'tornado_kick'),
      slot('L', 'roundhouse_kick'),
    ],
    stats: { maxHealth: 188, speed: 280, stamina: 142, damageMultiplier: 1.62 },
    ability: {
      id: 'instant_death',
      name: 'Instant Death',
      description: 'For a short window, strikes have a 50% chance to instantly kill normal enemies.',
    },
  },
];

export const characterLoadouts = loadouts.map(validateLoadout);
export const characterLoadoutById = new Map(characterLoadouts.map((loadout) => [loadout.characterId, loadout]));

export function getCharacterLoadout(characterId: string): CharacterLoadout {
  const loadout = characterLoadoutById.get(characterId);
  if (!loadout) throw new Error(`Missing character loadout: ${characterId}`);
  return loadout;
}

export function getLoadoutMoves(characterId: string): MoveDefinition[] {
  return getCharacterLoadout(characterId).slots.map((entry) => {
    const move = moveById.get(entry.moveId);
    if (!move) throw new Error(`Unknown move id in loadout: ${entry.moveId}`);
    return move;
  });
}

export function isMoveEligibleForCharacter(characterId: string, move: MoveDefinition): boolean {
  return isGameplayReadyAnimation(characterId, move.animationKey);
}

function slot(key: MoveSlotKey, moveId: string): EquippedMoveSlot {
  const move = moveById.get(moveId);
  return { key, moveId, label: move?.name ?? moveId };
}

function validateLoadout(loadout: CharacterLoadout): CharacterLoadout {
  if (loadout.slots.length !== 4) throw new Error(`Loadout must have exactly four slots: ${loadout.characterId}`);
  const expectedKeys: MoveSlotKey[] = ['H', 'J', 'K', 'L'];
  for (const expectedKey of expectedKeys) {
    if (!loadout.slots.some((entry) => entry.key === expectedKey)) {
      throw new Error(`Loadout is missing ${expectedKey}: ${loadout.characterId}`);
    }
  }

  const cleanSlots = loadout.slots.filter((entry) => {
    const move = moveById.get(entry.moveId);
    return Boolean(move && isMoveEligibleForCharacter(loadout.characterId, move));
  });
  if (cleanSlots.length !== 4) {
    throw new Error(`Loadout contains unavailable animations: ${loadout.characterId}`);
  }

  return { ...loadout, slots: cleanSlots };
}
