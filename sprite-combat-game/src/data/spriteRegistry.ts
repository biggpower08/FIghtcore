export type SpriteKind = 'hero' | 'villain' | 'effect' | 'desert-prop';

export interface SpriteRegistration {
  id: string;
  kind: SpriteKind;
  basePath: string;
  animations: string[];
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
  ]),
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
  ]),
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
  ]),
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
  ]),
  registerCharacter('cyber-monkey-grunt', 'villain', [
    'idle',
    'run',
    'leap',
    'claw_swipe',
    'palm_strike',
    'hit_react',
    'knockdown',
    'death',
  ]),
  registerCharacter('cyber-monkey-scrapper', 'villain', [
    'idle',
    'run',
    'leap',
    'claw_combo',
    'low_kick',
    'hit_react',
    'knockdown',
    'death',
  ]),
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
  ]),
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

function registerCharacter(id: string, kind: 'hero' | 'villain', animations: string[]): SpriteRegistration {
  return {
    id,
    kind,
    basePath: `/sprites/frames/${id}`,
    animations,
  };
}
