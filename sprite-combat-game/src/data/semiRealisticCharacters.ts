import { hasSemiRealisticCharacterAssets } from './semiRealisticSpriteFrames';
import { roninRuntimeAnimationKeys } from './roninMoveScope';

export const roninRequiredAnimations = [...roninRuntimeAnimationKeys] as const;

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
