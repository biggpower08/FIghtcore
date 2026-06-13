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
    id: 'cyber-monkey-grunt',
    name: 'Cyber Monkey Grunt',
    maxHealth: 30,
    speed: 155,
    attackRange: 46,
    moveId: 'palm_strike',
    attackAnimation: 'claw_swipe',
  },
  {
    id: 'cyber-monkey-scrapper',
    name: 'Cyber Monkey Scrapper',
    maxHealth: 52,
    speed: 138,
    attackRange: 58,
    moveId: 'low_kick',
    attackAnimation: 'claw_combo',
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
