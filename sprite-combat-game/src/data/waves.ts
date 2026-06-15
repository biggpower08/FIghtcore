export interface WaveDefinition {
  wave: number;
  enemies: Array<{
    enemyId: string;
    count: number;
  }>;
  isBoss: boolean;
  bossId?: string;
}

export const waveDefinitions: WaveDefinition[] = [
  { wave: 1, enemies: [{ enemyId: 'monkey-grunt', count: 3 }], isBoss: false },
  {
    wave: 2,
    enemies: [
      { enemyId: 'monkey-grunt', count: 4 },
      { enemyId: 'striker-monkey', count: 1 },
    ],
    isBoss: false,
  },
  {
    wave: 3,
    enemies: [
      { enemyId: 'monkey-grunt', count: 5 },
      { enemyId: 'striker-monkey', count: 2 },
      { enemyId: 'cyber-monkey-grappler', count: 1 },
    ],
    isBoss: false,
  },
  { wave: 4, enemies: [], isBoss: true, bossId: 'cyber-monkey-alpha' },
  {
    wave: 5,
    enemies: [
      { enemyId: 'monkey-grunt', count: 4 },
      { enemyId: 'striker-monkey', count: 3 },
      { enemyId: 'cyber-monkey-grappler', count: 2 },
    ],
    isBoss: false,
  },
];
