export interface WaveDefinition {
  wave: number;
  enemyCount: number;
  isBoss: boolean;
}

export const waveDefinitions: WaveDefinition[] = [
  { wave: 1, enemyCount: 3, isBoss: false },
  { wave: 2, enemyCount: 5, isBoss: false },
  { wave: 3, enemyCount: 7, isBoss: false },
  { wave: 4, enemyCount: 1, isBoss: true },
];
