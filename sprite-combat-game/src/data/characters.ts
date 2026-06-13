import { moveById } from './moves';

export interface CharacterDefinition {
  id: string;
  name: string;
  identity: string;
  maxHealth: number;
  speed: number;
  moveIds: string[];
}

export const characters: CharacterDefinition[] = [
  {
    id: 'cyber-ninja-blue',
    name: 'Cyber Ninja',
    identity: 'Fast kickboxing / kung fu fighter',
    maxHealth: 82,
    speed: 300,
    moveIds: ['jab', 'cross', 'roundhouse_kick', 'low_kick'],
  },
  {
    id: 'shadow-striker-purple',
    name: 'Shadow Striker',
    identity: 'Boxing / jiu-jitsu / counter fighter',
    maxHealth: 94,
    speed: 270,
    moveIds: ['jab', 'cross', 'short_elbow', 'shadow_counter'],
  },
  {
    id: 'cyber-monk-orange',
    name: 'Cyber Monk',
    identity: 'Muay thai / judo / heavy striker',
    maxHealth: 120,
    speed: 228,
    moveIds: ['palm_strike', 'spinning_kick', 'clinch_knee', 'hip_throw'],
  },
  {
    id: 'neo-operative-green',
    name: 'Neo Operative',
    identity: 'Wrestling / ground-control fighter',
    maxHealth: 108,
    speed: 248,
    moveIds: ['double_leg_takedown', 'sprawl_counter', 'hip_throw', 'low_kick'],
  },
];

export function getCharacterMoves(character: CharacterDefinition) {
  return character.moveIds.map((id) => {
    const move = moveById.get(id);
    if (!move) throw new Error(`Unknown move id: ${id}`);
    return move;
  });
}
