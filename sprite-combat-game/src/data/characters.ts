import { getLoadoutMoves } from './characterLoadouts';

export interface CharacterDefinition {
  id: string;
  name: string;
  identity: string;
  maxHealth: number;
  speed: number;
  iconPath?: string;
  logoPath?: string;
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
    id: 'shadow-striker',
    name: 'Shadow Striker',
    identity: 'Muay Thai / kickboxing / boxing striker',
    maxHealth: 96,
    speed: 276,
    iconPath: '/assets/fightcore/sprites/shadow-striker/icon-full-body.png',
    logoPath: '/assets/fightcore/sprites/shadow-striker/logo-emblem.png',
  },
];

export function getCharacterMoves(character: CharacterDefinition) {
  return getLoadoutMoves(character.id);
}
