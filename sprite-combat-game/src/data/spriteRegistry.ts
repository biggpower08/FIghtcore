export type SpriteKind = 'hero' | 'villain' | 'effect' | 'desert-prop';

export interface SpriteRegistration {
  id: string;
  kind: SpriteKind;
  basePath: string;
  animations: string[];
  sourceSheetIds?: string[];
}

export interface SpriteSourceSheet {
  id: string;
  path: string;
  width: number;
  height: number;
  frameSize?: {
    width: number;
    height: number;
  };
  linkedSpriteIds: string[];
  animationHints: string[];
  notes: string;
}

export const spriteRegistry: SpriteRegistration[] = [
  registerCharacter('cyber-ninja-blue', 'hero', [
    'idle',
    'ready',
    'walk',
    'dash',
    'jab',
    'cross',
    'low_kick',
    'roundhouse_kick',
    'hit_react',
    'knockdown',
    'recovery',
  ], ['cyber-ninja-blue-sheet', 'hero-sparring-reference-sheet', 'martial-arts-move-matrix-sheet', 'grappling-sequences-reference-sheet']),
  registerCharacter('shadow-striker-purple', 'hero', [
    'idle',
    'ready',
    'walk',
    'dash',
    'jab',
    'cross',
    'short_elbow',
    'shadow_counter',
    'hit_react',
    'knockdown',
    'recovery',
  ], ['shadow-striker-purple-sheet', 'hero-sparring-reference-sheet', 'martial-arts-move-matrix-sheet', 'grappling-sequences-reference-sheet']),
  registerCharacter('cyber-monk-orange', 'hero', [
    'idle',
    'ready',
    'walk',
    'dash',
    'palm_strike',
    'spinning_kick',
    'clinch_knee',
    'hip_throw',
    'hit_react',
    'knockdown',
    'recovery',
  ], ['cyber-monk-orange-sheet', 'hero-sparring-reference-sheet', 'martial-arts-move-matrix-sheet', 'grappling-sequences-reference-sheet']),
  registerCharacter('neo-operative-green', 'hero', [
    'idle',
    'ready',
    'walk',
    'dash',
    'double_leg_takedown',
    'sprawl_counter',
    'hip_throw',
    'low_kick',
    'hit_react',
    'knockdown',
    'recovery',
  ], ['neo-operative-green-sheet', 'hero-sparring-reference-sheet', 'martial-arts-move-matrix-sheet', 'grappling-sequences-reference-sheet']),
  registerCharacter('cyber-monkey-grunt', 'villain', [
    'idle',
    'run',
    'leap',
    'claw_swipe',
    'palm_strike',
    'hit_react',
    'knockdown',
    'death',
  ], ['cyber-monkey-grunt-sheet']),
  registerCharacter('cyber-monkey-scrapper', 'villain', [
    'idle',
    'run',
    'leap',
    'claw_combo',
    'low_kick',
    'hit_react',
    'knockdown',
    'death',
  ], ['cyber-monkey-scrapper-sheet']),
  registerCharacter('cyber-monkey-alpha', 'villain', [
    'idle',
    'run',
    'taunt',
    'ground_slam',
    'leap_slam',
    'clinch_knee',
    'hit_react',
    'enrage',
    'knockdown',
    'death',
  ], ['cyber-monkey-alpha-sheet']),
  {
    id: 'beginning-effects',
    kind: 'effect',
    basePath: '/sprites/effects',
    animations: [
      'dust_puff',
      'dash_trail_blue',
      'impact_spark_cyan',
      'impact_spark_orange',
      'impact_spark_green',
      'hit_flash',
      'ground_slam_dust',
      'reward_glow_common',
      'reward_glow_uncommon',
      'reward_glow_rare',
      'reward_glow_epic',
    ],
  },
  {
    id: 'desert-stage',
    kind: 'desert-prop',
    basePath: '/backgrounds/desert',
    animations: ['sand_tile', 'rock_small', 'rock_large', 'dead_bush', 'bone_pile', 'arena_boundary_marker', 'dust_overlay'],
  },
];

export const spriteRegistryById = new Map(spriteRegistry.map((sprite) => [sprite.id, sprite]));

export const spriteSourceSheets: SpriteSourceSheet[] = [
  {
    id: 'cyber-ninja-blue-sheet',
    path: '/sprites/source-generated/cyber-ninja-sheet.png',
    width: 1448,
    height: 1086,
    frameSize: { width: 64, height: 64 },
    linkedSpriteIds: ['cyber-ninja-blue'],
    animationHints: ['idle', 'ready', 'walk', 'dash', 'jab', 'cross', 'roundhouse_kick', 'low_kick', 'hit_react', 'recovery'],
    notes: 'Generated Cyber Ninja source sheet. Sliced frame folders are the live gameplay source.',
  },
  {
    id: 'shadow-striker-purple-sheet',
    path: '/sprites/source-generated/shadow-striker-sheet.png',
    width: 1448,
    height: 1086,
    frameSize: { width: 64, height: 64 },
    linkedSpriteIds: ['shadow-striker-purple'],
    animationHints: ['idle', 'ready', 'walk', 'dash', 'jab', 'cross', 'short_elbow', 'shadow_counter', 'hit_react', 'recovery'],
    notes: 'Generated Shadow Striker source sheet. Sliced frame folders are the live gameplay source.',
  },
  {
    id: 'cyber-monk-orange-sheet',
    path: '/sprites/source-generated/cyber-monk-sheet.png',
    width: 1448,
    height: 1086,
    frameSize: { width: 64, height: 64 },
    linkedSpriteIds: ['cyber-monk-orange'],
    animationHints: ['idle', 'ready', 'walk', 'dash', 'palm_strike', 'front_kick', 'spinning_kick', 'clinch_knee', 'hit_react', 'recovery'],
    notes: 'Generated Cyber Monk source sheet. Sliced frame folders are the live gameplay source.',
  },
  {
    id: 'neo-operative-green-sheet',
    path: '/sprites/source-generated/neo-operative-sheet.png',
    width: 1448,
    height: 1086,
    frameSize: { width: 64, height: 64 },
    linkedSpriteIds: ['neo-operative-green'],
    animationHints: ['idle', 'ready', 'walk', 'dash', 'crouch', 'level_change', 'double_leg_takedown', 'ground_control', 'hit_react', 'recovery'],
    notes: 'Generated Neo Operative source sheet. Sliced frame folders are the live gameplay source.',
  },
  {
    id: 'cyber-monkey-grunt-sheet',
    path: '/sprites/source-generated/cyber-monkey-grunt-sheet.png',
    width: 1448,
    height: 1086,
    frameSize: { width: 64, height: 64 },
    linkedSpriteIds: ['cyber-monkey-grunt'],
    animationHints: ['idle', 'run', 'leap', 'claw_swipe', 'palm_strike', 'hit_react', 'knockdown', 'death'],
    notes: 'Generated Cyber Monkey Grunt source sheet. Sliced frame folders are used for normal enemy gameplay.',
  },
  {
    id: 'cyber-monkey-scrapper-sheet',
    path: '/sprites/source-generated/cyber-monkey-scrapper-sheet.png',
    width: 1448,
    height: 1086,
    frameSize: { width: 64, height: 64 },
    linkedSpriteIds: ['cyber-monkey-scrapper'],
    animationHints: ['idle', 'run', 'leap', 'claw_combo', 'low_kick', 'hit_react', 'knockdown', 'death'],
    notes: 'Generated Cyber Monkey Scrapper source sheet. Sliced frame folders are used for normal enemy gameplay.',
  },
  {
    id: 'cyber-monkey-alpha-sheet',
    path: '/sprites/source-generated/cyber-monkey-alpha-sheet.png',
    width: 1448,
    height: 1086,
    frameSize: { width: 64, height: 64 },
    linkedSpriteIds: ['cyber-monkey-alpha'],
    animationHints: ['idle', 'run', 'taunt', 'ground_slam', 'leap_slam', 'clinch_knee', 'enrage', 'hit_react', 'knockdown', 'death'],
    notes: 'Generated Cyber Monkey Alpha boss source sheet. Sliced frame folders are used for normal boss gameplay.',
  },
  {
    id: 'hero-sparring-reference-sheet',
    path: '/sprites/sheets/hero-sparring-reference-sheet.png',
    width: 1448,
    height: 1086,
    linkedSpriteIds: ['cyber-ninja-blue', 'shadow-striker-purple', 'cyber-monk-orange', 'neo-operative-green'],
    animationHints: ['strike_exchange', 'throw_exchange', 'kick_takedown', 'sparring'],
    notes: 'Cross-character reference sheet for relative scale, contact poses, strikes, throws, and sparring.',
  },
  {
    id: 'martial-arts-move-matrix-sheet',
    path: '/sprites/sheets/martial-arts-move-matrix-sheet.png',
    width: 1448,
    height: 1086,
    linkedSpriteIds: ['cyber-ninja-blue', 'shadow-striker-purple', 'cyber-monk-orange', 'neo-operative-green'],
    animationHints: [
      'collar_tie',
      'single_leg',
      'body_lock_trip',
      'firemans_carry',
      'hip_throw',
      'sprawl',
      'snap_down',
      'clinch_break',
      'jab_cross_low_kick',
      'teep',
      'round_kick',
      'clinch_knee',
      'short_elbow',
      'counter',
      'switch_kick',
      'defensive_shell',
      'ready',
      'chain_punches',
      'palm_strike',
      'sweeping_kick',
      'parry_counter',
      'spinning_kick',
      'slip_recovery',
      'stance_reset',
    ],
    notes: 'Large move taxonomy reference sheet. Use for future crop maps and animation naming alignment.',
  },
  {
    id: 'grappling-sequences-reference-sheet',
    path: '/sprites/sheets/grappling-sequences-reference-sheet.png',
    width: 1448,
    height: 1086,
    linkedSpriteIds: ['cyber-ninja-blue', 'shadow-striker-purple', 'cyber-monk-orange', 'neo-operative-green'],
    animationHints: [
      'over_under_pummeling',
      'collar_tie_snap_down',
      'single_leg_run_the_pipe',
      'double_leg_lift',
      'firemans_carry',
      'hip_throw',
      'outside_trip',
      'arm_drag',
      'sprawl_go_behind',
      'guillotine_attempt',
      'rear_naked_choke',
      'triangle_armbar',
      'clinch_knee',
      'short_elbow',
      'palm_strike_sweep',
      'recovery',
    ],
    notes: 'Grappling and transition reference sheet. Good source for later throw and ground-transition animations.',
  },
];

export const spriteSourceSheetById = new Map(spriteSourceSheets.map((sheet) => [sheet.id, sheet]));

function registerCharacter(
  id: string,
  kind: 'hero' | 'villain',
  animations: string[],
  sourceSheetIds: string[] = [],
): SpriteRegistration {
  return {
    id,
    kind,
    basePath: `/sprites/frames/${id}`,
    animations,
    sourceSheetIds,
  };
}
