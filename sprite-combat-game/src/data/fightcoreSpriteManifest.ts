export interface FightcoreAnimationManifestEntry {
  key: string;
  stripPath: string;
  row: number;
  frameCount: number;
  fps: number;
  loop: boolean;
}

export interface FightcoreSpriteManifestEntry {
  entityId: string;
  sheetId: string;
  sheetPath: string;
  frameWidth: number;
  frameHeight: number;
  columns: number;
  rows: number;
  atlasWidth: number;
  atlasHeight: number;
  animations: FightcoreAnimationManifestEntry[];
}

export const fightcoreSpriteManifest: FightcoreSpriteManifestEntry[] = [
  {
    entityId: 'cyber-ninja',
    sheetId: 'fightcore-cyber-ninja-atlas',
    sheetPath: '/assets/fightcore/sprites/cyber-ninja/atlas.png',
    frameWidth: 96,
    frameHeight: 96,
    columns: 9,
    rows: 10,
    atlasWidth: 864,
    atlasHeight: 960,
    animations: [
      animation('idle', 0, 4, true, 8),
      animation('walk', 1, 6, true, 10),
      animation('dash', 2, 5, false, 14),
      animation('jab', 3, 5, false, 16),
      animation('slice', 4, 6, false, 14),
      animation('high_kick', 5, 7, false, 13),
      animation('side_kick', 9, 6, false, 13),
      animation('hit_react', 6, 3, false, 12),
      animation('recovery', 7, 5, false, 8),
      animation('standup', 8, 6, false, 8),
    ],
  },
  {
    entityId: 'monkey-grunt',
    sheetId: 'fightcore-monkey-grunt-atlas',
    sheetPath: '/assets/fightcore/sprites/monkey-grunt/atlas.png',
    frameWidth: 96,
    frameHeight: 96,
    columns: 9,
    rows: 8,
    atlasWidth: 864,
    atlasHeight: 768,
    animations: [
      animation('idle', 0, 4, true, 8),
      animation('run', 1, 6, true, 12),
      animation('jab', 2, 5, false, 14),
      animation('cross', 3, 5, false, 14),
      animation('grab', 4, 6, false, 12),
      animation('hit_react', 5, 3, false, 12),
      animation('knockdown', 6, 5, false, 8),
      animation('death', 7, 7, false, 8),
    ],
  },
  {
    entityId: 'shadow-striker',
    sheetId: 'fightcore-shadow-striker-atlas',
    sheetPath: '/assets/fightcore/sprites/shadow-striker/atlas.png',
    frameWidth: 96,
    frameHeight: 96,
    columns: 7,
    rows: 9,
    atlasWidth: 627,
    atlasHeight: 864,
    animations: [
      animation('idle', 0, 5, true, 8),
      animation('walk', 1, 6, true, 10),
      animation('dash', 2, 5, false, 14),
      animation('roundhouse_kick', 3, 5, false, 13),
      animation('teep_kick', 4, 5, false, 13),
      animation('cross', 5, 3, false, 14),
      animation('jab', 6, 5, false, 16),
      animation('hit_react', 7, 4, false, 12),
      animation('recovery', 8, 7, false, 8),
    ],
  },
];

function animation(
  key: string,
  row: number,
  frameCount: number,
  loop: boolean,
  fps: number,
): FightcoreAnimationManifestEntry {
  return { key, stripPath: `${key.replace(/_/g, '-')}-strip.png`, row, frameCount, loop, fps };
}
