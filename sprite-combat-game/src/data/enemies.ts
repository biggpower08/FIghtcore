export interface EnemyDefinition {
  id: string;
  name: string;
  maxHealth: number;
  speed: number;
  attackRange: number;
  moveId: string;
}

export const enemyDefinitions: EnemyDefinition[] = [
  {
    id: 'dust_raider',
    name: 'Dust Raider',
    maxHealth: 34,
    speed: 132,
    attackRange: 54,
    moveId: 'palm_strike',
  },
  {
    id: 'arena_warlord',
    name: 'Arena Warlord',
    maxHealth: 240,
    speed: 96,
    attackRange: 78,
    moveId: 'clinch_knee',
  },
];
