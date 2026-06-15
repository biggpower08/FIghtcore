import { fightcoreSpriteManifest } from './fightcoreSpriteManifest';
import { fightcoreGeneratedFrameMetadata } from './fightcoreGeneratedFrameMetadata';

export type SpriteKind = 'hero' | 'villain' | 'effect' | 'desert-prop';

export interface SpriteRegistration {
  id: string;
  kind: SpriteKind;
  basePath: string;
  animations: string[];
  sourceSheetIds?: string[];
  render?: SpriteRenderProfile;
}

export interface SpriteRenderProfile {
  anchorX: number;
  anchorY: number;
  feetY: number;
  scale: number;
  shadowOffsetY: number;
  hitboxOffsetY: number;
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
  registerCharacter('cyber-ninja', 'hero', manifestAnimations('cyber-ninja'), ['fightcore-cyber-ninja-atlas'], heroRenderProfile()),
  registerCharacter('shadow-striker', 'hero', manifestAnimations('shadow-striker'), ['fightcore-shadow-striker-atlas'], heroRenderProfile()),
  registerCharacter('puppetmaster', 'hero', manifestAnimations('puppetmaster'), ['fightcore-puppetmaster-atlas'], {
    ...heroRenderProfile(),
    scale: 0.98,
  }),
  registerCharacter('combat-monk', 'hero', manifestAnimations('combat-monk'), ['fightcore-combat-monk-atlas'], {
    ...heroRenderProfile(),
    scale: 0.98,
  }),
  registerCharacter('monkey-grunt', 'villain', manifestAnimations('monkey-grunt'), ['fightcore-monkey-grunt-atlas'], {
    anchorX: 0.5,
    anchorY: 0.88,
    feetY: 84,
    scale: 1,
    shadowOffsetY: 8,
    hitboxOffsetY: -8,
  }),
  registerCharacter('striker-monkey', 'villain', manifestAnimations('striker-monkey'), ['fightcore-striker-monkey-atlas'], {
    anchorX: 0.5,
    anchorY: 0.88,
    feetY: 84,
    scale: 1,
    shadowOffsetY: 8,
    hitboxOffsetY: -8,
  }),
  registerCharacter('cyber-monkey-grappler', 'villain', manifestAnimations('cyber-monkey-grappler'), ['fightcore-cyber-monkey-grappler-atlas'], {
    anchorX: 0.5,
    anchorY: 0.9,
    feetY: 88,
    scale: 1.04,
    shadowOffsetY: 9,
    hitboxOffsetY: -10,
  }),
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
  ], ['cyber-ninja-blue-sheet', 'hero-sparring-reference-sheet', 'martial-arts-move-matrix-sheet', 'grappling-sequences-reference-sheet'], heroRenderProfile()),
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
  ], ['shadow-striker-purple-sheet', 'hero-sparring-reference-sheet', 'martial-arts-move-matrix-sheet', 'grappling-sequences-reference-sheet'], heroRenderProfile()),
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
  ], ['cyber-monk-orange-sheet', 'hero-sparring-reference-sheet', 'martial-arts-move-matrix-sheet', 'grappling-sequences-reference-sheet'], heroRenderProfile()),
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
  ], ['neo-operative-green-sheet', 'hero-sparring-reference-sheet', 'martial-arts-move-matrix-sheet', 'grappling-sequences-reference-sheet'], heroRenderProfile()),
  registerCharacter('cyber-monkey-grunt', 'villain', [
    'idle',
    'run',
    'leap',
    'claw_swipe',
    'palm_strike',
    'hit_react',
    'knockdown',
    'death',
  ], ['cyber-monkey-grunt-sheet'], { anchorX: 0.5, anchorY: 0.88, feetY: 84, scale: 0.92, shadowOffsetY: 8, hitboxOffsetY: -8 }),
  registerCharacter('cyber-monkey-scrapper', 'villain', [
    'idle',
    'run',
    'leap',
    'claw_combo',
    'low_kick',
    'hit_react',
    'knockdown',
    'death',
  ], ['cyber-monkey-scrapper-sheet'], { anchorX: 0.5, anchorY: 0.88, feetY: 98, scale: 0.96, shadowOffsetY: 8, hitboxOffsetY: -10 }),
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
  ], ['cyber-monkey-alpha-sheet'], { anchorX: 0.5, anchorY: 0.9, feetY: 144, scale: 1.18, shadowOffsetY: 12, hitboxOffsetY: -18 }),
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
    basePath: '/assets/fightcore/backgrounds/desert-arena',
    animations: ['day', 'sand_tile', 'rock_small', 'rock_large', 'dead_bush', 'bone_pile', 'arena_boundary_marker', 'dust_overlay'],
  },
];

export const spriteRegistryById = new Map(spriteRegistry.map((sprite) => [sprite.id, sprite]));

export const spriteSourceSheets: SpriteSourceSheet[] = [
  ...fightcoreSpriteSheets(),
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
  render?: SpriteRenderProfile,
): SpriteRegistration {
  return {
    id,
    kind,
    basePath: `/sprites/frames/${id}`,
    animations,
    sourceSheetIds,
    render,
  };
}

function heroRenderProfile(): SpriteRenderProfile {
  return { anchorX: 0.5, anchorY: 0.86, feetY: 82, scale: 1, shadowOffsetY: 8, hitboxOffsetY: -12 };
}

function manifestAnimations(entityId: string): string[] {
  return fightcoreSpriteManifest.find((entry) => entry.entityId === entityId)?.animations.map((animation) => animation.key) ?? [];
}

function fightcoreSpriteSheets(): SpriteSourceSheet[] {
  return fightcoreSpriteManifest.flatMap((entry) => [
    {
      id: entry.sheetId,
      path: entry.sheetPath,
      width: entry.atlasWidth,
      height: entry.atlasHeight,
      frameSize: { width: entry.frameWidth, height: entry.frameHeight },
      linkedSpriteIds: [entry.entityId],
      animationHints: entry.animations.map((animation) => animation.key),
      notes: 'Prepared FIghtcore atlas assembled from normalized detected frames. Runtime uses strip sheets for easier debugging.',
    },
    ...entry.animations.map((animation) => ({
      id: fightcoreStripSheetId(entry.sheetId, animation.key),
      path: fightcoreStripPath(entry.entityId, animation.stripPath),
      width: fightcoreStripWidth(entry.entityId, animation.key) ?? animation.frameCount * entry.frameWidth,
      height: fightcoreStripHeight(entry.entityId, animation.key) ?? entry.frameHeight,
      linkedSpriteIds: [entry.entityId],
      animationHints: [animation.key],
      notes: 'Prepared FIghtcore horizontal animation strip assembled from detected variable-width frames.',
    })),
  ]);
}

export function fightcoreStripSheetId(sheetId: string, animationKey: string): string {
  return `${sheetId}-${animationKey}-strip`;
}

function fightcoreStripPath(entityId: string, stripPath: string): string {
  return `/assets/fightcore/sprites/${entityId}/${stripPath}`;
}

function fightcoreStripWidth(entityId: string, animationKey: string): number | undefined {
  const metadata = fightcoreGeneratedFrameMetadata.find((entry) => entry.entityId === entityId && entry.animationKey === animationKey);
  const lastFrame = metadata?.frames.at(-1);
  return lastFrame ? lastFrame.x + lastFrame.w : undefined;
}

function fightcoreStripHeight(entityId: string, animationKey: string): number | undefined {
  return fightcoreGeneratedFrameMetadata.find((entry) => entry.entityId === entityId && entry.animationKey === animationKey)?.frameHeight;
}
