export interface ActiveRuntimeSpriteQa {
  entityId: string;
  animationKey: string;
  verdict: 'ACTIVE_RUNTIME_READY' | 'NOT_GAMEPLAY_READY';
  activeRuntimeSources: string[];
  failedFrames: string[];
  qaFolder: string;
  activeRuntimeFramePaths: string[];
  manualOverridePaths: string[];
}

export const activeRuntimeSpriteQa: ActiveRuntimeSpriteQa[] = [
  {
    entityId: 'ronin',
    animationKey: 'roundhouse_kick',
    verdict: 'ACTIVE_RUNTIME_READY',
    activeRuntimeSources: ['frames-alpha-repaired'],
    failedFrames: [],
    qaFolder: 'public/sprites/qa/ronin/roundhouse_kick',
    activeRuntimeFramePaths: [
      '/sprites/frames-alpha-repaired/ronin/roundhouse_kick/0001.png',
      '/sprites/frames-alpha-repaired/ronin/roundhouse_kick/0002.png',
      '/sprites/frames-alpha-repaired/ronin/roundhouse_kick/0003.png',
      '/sprites/frames-alpha-repaired/ronin/roundhouse_kick/0004.png',
      '/sprites/frames-alpha-repaired/ronin/roundhouse_kick/0005.png',
      '/sprites/frames-alpha-repaired/ronin/roundhouse_kick/0006.png',
    ],
    manualOverridePaths: [
      'public/sprites/manual-overrides/ronin/roundhouse_kick/0001.png',
      'public/sprites/manual-overrides/ronin/roundhouse_kick/0002.png',
      'public/sprites/manual-overrides/ronin/roundhouse_kick/0003.png',
      'public/sprites/manual-overrides/ronin/roundhouse_kick/0004.png',
      'public/sprites/manual-overrides/ronin/roundhouse_kick/0005.png',
      'public/sprites/manual-overrides/ronin/roundhouse_kick/0006.png',
    ],
  },
  {
    entityId: 'ronin',
    animationKey: 'side_kick',
    verdict: 'NOT_GAMEPLAY_READY',
    activeRuntimeSources: ['frames-alpha-repaired'],
    failedFrames: ['0002.png', '0005.png'],
    qaFolder: 'public/sprites/qa/ronin/side_kick',
    activeRuntimeFramePaths: [
      '/sprites/frames-alpha-repaired/ronin/side_kick/0001.png',
      '/sprites/frames-alpha-repaired/ronin/side_kick/0002.png',
      '/sprites/frames-alpha-repaired/ronin/side_kick/0003.png',
      '/sprites/frames-alpha-repaired/ronin/side_kick/0004.png',
      '/sprites/frames-alpha-repaired/ronin/side_kick/0005.png',
      '/sprites/frames-alpha-repaired/ronin/side_kick/0006.png',
    ],
    manualOverridePaths: [
      'public/sprites/manual-overrides/ronin/side_kick/0001.png',
      'public/sprites/manual-overrides/ronin/side_kick/0002.png',
      'public/sprites/manual-overrides/ronin/side_kick/0003.png',
      'public/sprites/manual-overrides/ronin/side_kick/0004.png',
      'public/sprites/manual-overrides/ronin/side_kick/0005.png',
      'public/sprites/manual-overrides/ronin/side_kick/0006.png',
    ],
  },
];

export function getActiveRuntimeSpriteQa(entityId: string, animationKey: string): ActiveRuntimeSpriteQa | undefined {
  return activeRuntimeSpriteQa.find((entry) => entry.entityId === entityId && entry.animationKey === animationKey);
}
