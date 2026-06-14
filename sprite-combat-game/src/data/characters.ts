import { getLoadoutMoves } from './characterLoadouts';

export interface CharacterDefinition {
  id: string;
  name: string;
  identity: string;
  maxHealth: number;
  speed: number;
  iconPath?: string;
}

export const characters: CharacterDefinition[] = [
  {
    id: 'cyber-ninja',
    name: 'Cyber Ninja',
    identity: 'Fast blade / side-kick fighter',
    maxHealth: 86,
    speed: 304,
    iconPath: '/assets/fightcore/sprites/cyber-ninja/icon-full-body.png',
  },
  {
    id: 'cyber-ninja-blue',
    name: 'Cyber Ninja Blue',
    identity: 'Fast kickboxing / kung fu fighter',
    maxHealth: 82,
    speed: 300,
  },
  {
    id: 'shadow-striker-purple',
    name: 'Shadow Striker',
    identity: 'Boxing / jiu-jitsu / counter fighter',
    maxHealth: 94,
    speed: 270,
  },
  {
    id: 'cyber-monk-orange',
    name: 'Cyber Monk',
    identity: 'Muay thai / judo / heavy striker',
    maxHealth: 120,
    speed: 228,
  },
  {
    id: 'neo-operative-green',
    name: 'Neo Operative',
    identity: 'Wrestling / ground-control fighter',
    maxHealth: 108,
    speed: 248,
  },
];

export function getCharacterMoves(character: CharacterDefinition) {
  return getLoadoutMoves(character.id);
}
