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
  {
    id: 'puppetmaster',
    name: 'Puppetmaster',
    identity: 'Wrestling / judo / jiujitsu control fighter',
    maxHealth: 118,
    speed: 258,
    iconPath: '/assets/fightcore/sprites/puppetmaster/icon-full-body.png',
    logoPath: '/assets/fightcore/sprites/puppetmaster/logo-emblem.png',
  },
  {
    id: 'combat-monk',
    name: 'Combat Monk',
    identity: 'Kung fu / Ba Gua Zhang / mantis style',
    maxHealth: 108,
    speed: 292,
    iconPath: '/assets/fightcore/sprites/combat-monk/icon-full-body.png',
    logoPath: '/assets/fightcore/sprites/combat-monk/logo-emblem.png',
  },
];

export function getCharacterMoves(character: CharacterDefinition) {
  return getLoadoutMoves(character.id);
}
