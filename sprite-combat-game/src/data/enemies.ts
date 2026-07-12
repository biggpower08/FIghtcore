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
    name: 'Cyber Monkey',
    maxHealth: 48,
    speed: 158,
    attackRange: 48,
    moveId: 'cross',
    attackAnimation: 'cross',
  },
  {
    id: 'striker-monkey',
    name: 'Cyber Striker',
    maxHealth: 78,
    speed: 148,
    attackRange: 64,
    moveId: 'round_kick',
    attackAnimation: 'round_kick',
  },
];
