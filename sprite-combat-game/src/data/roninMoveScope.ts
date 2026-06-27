export const roninIntendedMoveAnimationKeys = ['jab', 'cross', 'roundhouse_kick', 'side_kick'] as const;
export const roninAbilityAnimationKeys = ['density'] as const;
export const roninStateAnimationKeys = ['idle', 'walk', 'dash', 'hit_react', 'recovery', 'stand_up'] as const;
export const roninRuntimeAnimationKeys = [...roninStateAnimationKeys, ...roninIntendedMoveAnimationKeys, ...roninAbilityAnimationKeys] as const;

export type RoninIntendedMoveAnimationKey = (typeof roninIntendedMoveAnimationKeys)[number];
export type RoninAbilityAnimationKey = (typeof roninAbilityAnimationKeys)[number];
export type RoninRuntimeAnimationKey = (typeof roninRuntimeAnimationKeys)[number];

export function isRoninIntendedMoveAnimation(animationKey: string): animationKey is RoninIntendedMoveAnimationKey {
  return roninIntendedMoveAnimationKeys.includes(animationKey as RoninIntendedMoveAnimationKey);
}

export function isRoninRuntimeAnimation(animationKey: string): animationKey is RoninRuntimeAnimationKey {
  return roninRuntimeAnimationKeys.includes(animationKey as RoninRuntimeAnimationKey);
}
