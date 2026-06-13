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
  { wave: 1, enemies: [{ enemyId: 'cyber-monkey-grunt', count: 3 }], isBoss: false },
  {
    wave: 2,
    enemies: [
      { enemyId: 'cyber-monkey-grunt', count: 4 },
      { enemyId: 'cyber-monkey-scrapper', count: 1 },
    ],
    isBoss: false,
  },
  {
    wave: 3,
    enemies: [
      { enemyId: 'cyber-monkey-grunt', count: 5 },
      { enemyId: 'cyber-monkey-scrapper', count: 2 },
    ],
    isBoss: false,
  },
  { wave: 4, enemies: [], isBoss: true, bossId: 'cyber-monkey-alpha' },
];
