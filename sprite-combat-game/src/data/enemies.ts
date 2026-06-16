export interface EnemyDefinition {
  id: string;
  name: string;
  maxHealth: number;
  speed: number;
  attackRange: number;
  moveId: string;
  attackAnimation: string;
}

export const enemyDefinitions: EnemyDefinition[] = [
  {
    id: 'monkey-grunt',
    name: 'Monkey Grunt',
    maxHealth: 48,
    speed: 158,
    attackRange: 48,
    moveId: 'cross',
    attackAnimation: 'cross',
  },
  {
    id: 'striker-monkey',
    name: 'Cyber Monkey Scrapper',
    maxHealth: 78,
    speed: 148,
    attackRange: 64,
    moveId: 'round_kick',
    attackAnimation: 'round_kick',
  },
  {
    id: 'cyber-monkey-grappler',
    name: 'Cyber Monkey Grappler',
    maxHealth: 112,
    speed: 136,
    attackRange: 62,
    moveId: 'seoi_nage',
    attackAnimation: 'seoi_nage',
  },
];
