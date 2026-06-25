export interface ActiveRuntimeSpriteQa {
  entityId: string;
  animationKey: string;
  verdict: 'ACTIVE_RUNTIME_READY' | 'NOT_GAMEPLAY_READY';
  readinessBadge: 'SAFE FOR GAMEPLAY' | 'QA ONLY' | 'NEEDS MANUAL REPAIR';
  activeRuntimeSources: string[];
  failedFrames: string[];
  unusableFrames: string[];
  frameStatuses: Array<{
    frame: string;
    status: 'PASS' | 'NEEDS_MANUAL_REPAIR' | 'UNUSABLE_SOURCE_FRAME';
    reason: string;
  }>;
  qaFolder: string;
  activeRuntimeFramePaths: string[];
  manualOverridePaths: string[];
}

export const activeRuntimeSpriteQa: ActiveRuntimeSpriteQa[] = [
  {
    entityId: 'ronin',
    animationKey: 'roundhouse_kick',
    verdict: 'NOT_GAMEPLAY_READY',
    readinessBadge: 'NEEDS MANUAL REPAIR',
    activeRuntimeSources: ['frames-alpha-repaired'],
    failedFrames: ['0003.png', '0004.png', '0005.png'],
    unusableFrames: [],
    frameStatuses: [
      { frame: '0001.png', status: 'PASS', reason: 'Guard frame reads as Ronin; no obvious runtime-visible cuts.' },
      { frame: '0002.png', status: 'PASS', reason: 'Transition frame is compact but usable in motion.' },
      { frame: '0003.png', status: 'NEEDS_MANUAL_REPAIR', reason: 'Chamber pose has body-width/proportion drift and rough silhouette around the raised leg.' },
      { frame: '0004.png', status: 'NEEDS_MANUAL_REPAIR', reason: 'Kick setup has torso and pant silhouette roughness; not clean enough for full gameplay-ready status.' },
      { frame: '0005.png', status: 'NEEDS_MANUAL_REPAIR', reason: 'Full extension is usable as a pose but has rough leg/boot edge read and proportion drift.' },
      { frame: '0006.png', status: 'PASS', reason: 'Guard return reads consistently with Ronin idle.' },
    ],
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
    readinessBadge: 'QA ONLY',
    activeRuntimeSources: ['frames-alpha-repaired'],
    failedFrames: ['0001.png', '0002.png', '0003.png', '0004.png', '0005.png'],
    unusableFrames: ['0001.png'],
    frameStatuses: [
      { frame: '0001.png', status: 'UNUSABLE_SOURCE_FRAME', reason: 'Large pale/white torso cut is visible on the active runtime frame.' },
      { frame: '0002.png', status: 'NEEDS_MANUAL_REPAIR', reason: 'Wide stance has rough silhouette and torso-width drift; automated scan also finds pale cut pixels.' },
      { frame: '0003.png', status: 'NEEDS_MANUAL_REPAIR', reason: 'Chamber pose has awkward lower-leg/boot read and proportion drift.' },
      { frame: '0004.png', status: 'NEEDS_MANUAL_REPAIR', reason: 'Extension pose has rough leg silhouette and does not read as fully clean Ronin art.' },
      { frame: '0005.png', status: 'NEEDS_MANUAL_REPAIR', reason: 'Full extension has rough foot/leg silhouette and automated pale cut pixels.' },
      { frame: '0006.png', status: 'PASS', reason: 'Guard return reads consistently with Ronin idle.' },
    ],
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
