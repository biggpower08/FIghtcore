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
  { wave: 1, enemies: [{ enemyId: 'monkey-grunt', count: 2 }], isBoss: false },
  {
    wave: 2,
    enemies: [
      { enemyId: 'monkey-grunt', count: 2 },
      { enemyId: 'striker-monkey', count: 1 },
    ],
    isBoss: false,
  },
  {
    wave: 3,
    enemies: [
      { enemyId: 'monkey-grunt', count: 2 },
      { enemyId: 'cyber-monkey-grunt', count: 1 },
      { enemyId: 'striker-monkey', count: 1 },
    ],
    isBoss: false,
  },
  {
    wave: 4,
    enemies: [
      { enemyId: 'striker-monkey', count: 1 },
      { enemyId: 'cyber-monkey-grappler', count: 1 },
    ],
    isBoss: false,
  },
  {
    wave: 5,
    enemies: [
      { enemyId: 'monkey-grunt', count: 2 },
      { enemyId: 'cyber-monkey-grunt', count: 1 },
      { enemyId: 'striker-monkey', count: 1 },
      { enemyId: 'cyber-monkey-grappler', count: 1 },
    ],
    isBoss: false,
  },
];
