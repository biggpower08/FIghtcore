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
      slot('J', 'jab'),
      slot('K', 'slice'),
      slot('L', 'side_kick'),
    ],
    stats: { maxHealth: 86, speed: 304, stamina: 104, damageMultiplier: 1 },
  },
  {
    characterId: 'cyber-ninja-blue',
    slots: [
      slot('H', 'jab'),
      slot('J', 'cross'),
      slot('K', 'roundhouse_kick'),
      slot('L', 'low_kick'),
    ],
    stats: { maxHealth: 82, speed: 300, stamina: 100, damageMultiplier: 1 },
  },
  {
    characterId: 'shadow-striker-purple',
    slots: [
      slot('H', 'jab'),
      slot('J', 'cross'),
      slot('K', 'short_elbow'),
      slot('L', 'shadow_counter'),
    ],
    stats: { maxHealth: 94, speed: 270, stamina: 100, damageMultiplier: 1 },
  },
  {
    characterId: 'cyber-monk-orange',
    slots: [
      slot('H', 'palm_strike'),
      slot('J', 'spinning_kick'),
      slot('K', 'clinch_knee'),
      slot('L', 'hip_throw'),
    ],
    stats: { maxHealth: 120, speed: 228, stamina: 112, damageMultiplier: 1.05 },
  },
  {
    characterId: 'neo-operative-green',
    slots: [
      slot('H', 'low_kick'),
      slot('J', 'sprawl_counter'),
      slot('K', 'double_leg_takedown'),
      slot('L', 'hip_throw'),
    ],
    stats: { maxHealth: 108, speed: 248, stamina: 108, damageMultiplier: 1 },
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
