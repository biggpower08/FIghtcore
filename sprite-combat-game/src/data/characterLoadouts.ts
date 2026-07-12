import { isGameplayReadyAnimation } from './animationEligibility';
import { moveById, type MoveDefinition } from './moves';
import { isRoninIntendedMoveAnimation } from './roninMoveScope';

export type MoveSlotKey = 'H' | 'J' | 'K';

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
}

const loadouts: CharacterLoadout[] = [
  {
    characterId: 'ronin',
    slots: [slot('H', 'jab'), slot('J', 'cross'), slot('K', 'roundhouse_kick')],
    stats: { maxHealth: 146, speed: 286, stamina: 124, damageMultiplier: 1.05 },
  },
  {
    characterId: 'supreme-emperor',
    slots: [
      slot('H', 'jab_cross'),
      slot('J', 'feint_rear_hook'),
      slot('K', 'tornado_kick'),
    ],
    stats: { maxHealth: 188, speed: 280, stamina: 142, damageMultiplier: 1.62 },
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
  if (characterId === 'ronin' && !isRoninIntendedMoveAnimation(move.animationKey)) return false;
  return isGameplayReadyAnimation(characterId, move.animationKey);
}

export function isMoveInIntendedCharacterScope(characterId: string, move: MoveDefinition): boolean {
  if (characterId === 'ronin') return isRoninIntendedMoveAnimation(move.animationKey);
  return true;
}

function slot(key: MoveSlotKey, moveId: string): EquippedMoveSlot {
  const move = moveById.get(moveId);
  return { key, moveId, label: move?.name ?? moveId };
}

function validateLoadout(loadout: CharacterLoadout): CharacterLoadout {
  if (loadout.slots.length !== 3) throw new Error(`Loadout must have exactly three slots: ${loadout.characterId}`);
  const expectedKeys: MoveSlotKey[] = ['H', 'J', 'K'];
  for (const expectedKey of expectedKeys) {
    if (!loadout.slots.some((entry) => entry.key === expectedKey)) {
      throw new Error(`Loadout is missing ${expectedKey}: ${loadout.characterId}`);
    }
  }

  const cleanSlots = loadout.slots.filter((entry) => {
    const move = moveById.get(entry.moveId);
    return Boolean(move && isMoveInIntendedCharacterScope(loadout.characterId, move));
  });
  if (cleanSlots.length !== 3) {
    throw new Error(`Loadout contains unavailable animations: ${loadout.characterId}`);
  }

  return { ...loadout, slots: cleanSlots };
}
