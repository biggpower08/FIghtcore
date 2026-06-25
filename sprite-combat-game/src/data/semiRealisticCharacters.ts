import { hasSemiRealisticCharacterAssets } from './semiRealisticSpriteFrames';

export const roninRequiredAnimations = [
  'idle',
  'walk',
  'dash',
  'density',
  'jab',
  'cross',
  'calf_kick',
  'roundhouse_kick',
  'side_kick',
  'knee',
  'hit_react',
  'recovery',
  'stand_up',
] as const;

export const supremeEmperorRequiredAnimations = [
  'idle',
  'walk',
  'dash',
  'instant_death',
  'jab_cross',
  'feint_rear_hook',
  'tornado_kick',
  'roundhouse_kick',
  'hit_react',
  'recovery',
  'stand_up',
] as const;

export const semiRealisticAnimationKeysByCharacter = {
  ronin: [...roninRequiredAnimations],
  'supreme-emperor': [...supremeEmperorRequiredAnimations],
} as const;

export function hasRoninAssets(): boolean {
  return hasSemiRealisticCharacterAssets('ronin', [...roninRequiredAnimations]);
}

export function hasSupremeEmperorAssets(): boolean {
  return hasSemiRealisticCharacterAssets('supreme-emperor', [...supremeEmperorRequiredAnimations]);
}
