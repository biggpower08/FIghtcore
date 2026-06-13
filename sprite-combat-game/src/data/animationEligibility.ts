import { getSpriteAtlasAnimation } from './spriteAtlases';
import { getSpriteAnimation, getKnownAnimationKeys } from './spriteAnimations';

export type AnimationHealth = 'ready' | 'blocked' | 'missing';

export interface AnimationEligibility {
  characterId: string;
  animationKey: string;
  health: AnimationHealth;
  reason: string;
}

export function getAnimationEligibility(characterId: string, animationKey: string): AnimationEligibility {
  const definition = getSpriteAnimation(characterId, animationKey);
  const atlas = getSpriteAtlasAnimation(characterId, animationKey);
  const hasKnownKey = getKnownAnimationKeys(characterId).includes(animationKey);
  if (!definition && !atlas && !hasKnownKey) {
    return { characterId, animationKey, health: 'missing', reason: 'No registered animation key, frame folder, or atlas crop exists.' };
  }

  const hasFrames = Boolean(definition?.frames.length || atlas?.frames.length || hasKnownKey);
  if (!hasFrames) {
    return { characterId, animationKey, health: 'missing', reason: 'Animation exists but has no usable frames.' };
  }

  return { characterId, animationKey, health: 'ready', reason: 'Animation has a registered frame folder or atlas crop.' };
}

export function isGameplayReadyAnimation(characterId: string, animationKey: string): boolean {
  return getAnimationEligibility(characterId, animationKey).health === 'ready';
}

export function getGameplayReadyAnimationKeys(characterId: string): string[] {
  return getKnownAnimationKeys(characterId).filter((animationKey) => isGameplayReadyAnimation(characterId, animationKey));
}
