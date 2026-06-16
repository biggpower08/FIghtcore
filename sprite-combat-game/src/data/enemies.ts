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
    moveId: 'jab',
    attackAnimation: 'jab',
  },
  {
    id: 'cyber-monkey-grunt',
    name: 'Cyber Monkey Grunt',
    maxHealth: 44,
    speed: 155,
    attackRange: 46,
    moveId: 'palm_strike',
    attackAnimation: 'claw_swipe',
  },
  {
    id: 'cyber-monkey-scrapper',
    name: 'Cyber Monkey Scrapper',
    maxHealth: 74,
    speed: 138,
    attackRange: 58,
    moveId: 'low_kick',
    attackAnimation: 'claw_combo',
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
  {
    id: 'cyber-monkey-alpha',
    name: 'Cyber Monkey Alpha',
    maxHealth: 260,
    speed: 105,
    attackRange: 82,
    moveId: 'clinch_knee',
    attackAnimation: 'ground_slam',
  },
];
