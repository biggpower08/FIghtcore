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
  {
    entityId: 'striker-monkey',
    sheetId: 'fightcore-striker-monkey-atlas',
    sheetPath: '/assets/fightcore/sprites/striker-monkey/atlas.png',
    frameWidth: 96,
    frameHeight: 96,
    columns: 10,
    rows: 9,
    atlasWidth: 941,
    atlasHeight: 864,
    animations: [
      animation('idle', 0, 4, true, 8),
      animation('run', 1, 5, true, 12),
      animation('jab', 2, 3, false, 14),
      animation('cross', 3, 4, false, 14),
      animation('hook', 4, 4, false, 13),
      animation('round_kick', 5, 4, false, 12),
      animation('hit_react', 6, 4, false, 12),
      animation('knockdown', 7, 5, false, 8),
      animation('death', 8, 5, false, 8),
    ],
  },
  {
    entityId: 'cyber-monkey-grappler',
    sheetId: 'fightcore-cyber-monkey-grappler-atlas',
    sheetPath: '/assets/fightcore/sprites/cyber-monkey-grappler/atlas.png',
    frameWidth: 96,
    frameHeight: 96,
    columns: 11,
    rows: 10,
    atlasWidth: 987,
    atlasHeight: 960,
    animations: [
      animation('idle', 0, 7, true, 8),
      animation('run', 1, 2, true, 11),
      animation('charge', 2, 5, false, 10),
      animation('dash', 3, 1, false, 14),
      animation('ground_slam', 4, 7, false, 10),
      animation('seoi_nage', 5, 6, false, 10),
      animation('armbar', 6, 7, false, 8),
      animation('o_goshi', 7, 7, false, 9),
      animation('guillotine', 8, 6, false, 8),
      animation('death', 9, 6, false, 8),
    ],
  },
  {
    entityId: 'puppetmaster',
    sheetId: 'fightcore-puppetmaster-atlas',
    sheetPath: '/assets/fightcore/sprites/puppetmaster/atlas.png',
    frameWidth: 96,
    frameHeight: 96,
    columns: 9,
    rows: 10,
    atlasWidth: 810,
    atlasHeight: 960,
    animations: [
      animation('idle', 0, 5, true, 8),
      animation('walk', 1, 7, true, 10),
      animation('dash', 2, 3, false, 14),
      animation('hit_react', 3, 8, false, 12),
      animation('recovery', 4, 5, false, 8),
      animation('standup', 5, 6, false, 8),
      animation('double_leg_shot', 6, 7, false, 10),
      animation('o_goshi', 7, 4, false, 9),
      animation('armbar', 8, 5, false, 8),
      animation('duck_under_mat_return_slam', 9, 5, false, 8),
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
