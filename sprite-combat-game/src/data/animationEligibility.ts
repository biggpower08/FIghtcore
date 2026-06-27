import { getSpriteAtlasAnimation } from './spriteAtlases';
import { getSpriteAnimation, getKnownAnimationKeys } from './spriteAnimations';
import { hasInvalidBodyFrames } from './frameQuality';
import { getSemiRealisticSpriteAnimation } from './semiRealisticSpriteFrames';
import { getGeneratedSpritePackAnimation } from './generatedSpriteRegistry';
import { getActiveRuntimeSpriteQa } from './activeRuntimeSpriteQa';
import { isRoninRuntimeAnimation } from './roninMoveScope';

export type AnimationHealth = 'ready' | 'blocked' | 'missing';

export interface AnimationEligibility {
  characterId: string;
  animationKey: string;
  health: AnimationHealth;
  reason: string;
}

export function getAnimationEligibility(characterId: string, animationKey: string): AnimationEligibility {
  if (characterId === 'ronin' && !isRoninRuntimeAnimation(animationKey)) {
    return { characterId, animationKey, health: 'blocked', reason: 'Animation is outside the current Ronin runtime move/state scope.' };
  }

  const definition = getSpriteAnimation(characterId, animationKey);
  const atlas = getSpriteAtlasAnimation(characterId, animationKey);
  const semiRealistic = getSemiRealisticSpriteAnimation(characterId, animationKey);
  const generatedPack = getGeneratedSpritePackAnimation(characterId, animationKey);
  const hasKnownKey = getKnownAnimationKeys(characterId).includes(animationKey) || semiRealistic.length > 0 || Boolean(generatedPack);
  if (!definition && !atlas && !hasKnownKey && semiRealistic.length === 0 && !generatedPack) {
    return { characterId, animationKey, health: 'missing', reason: 'No registered animation key, frame folder, or atlas crop exists.' };
  }

  const hasFrames = Boolean(generatedPack?.frames.length || semiRealistic.length || definition?.frames.length || atlas?.frames.length || hasKnownKey);
  if (!hasFrames) {
    return { characterId, animationKey, health: 'missing', reason: 'Animation exists but has no usable frames.' };
  }

  if (hasInvalidBodyFrames(characterId, animationKey)) {
    return { characterId, animationKey, health: 'blocked', reason: 'Animation has a multi-pose body crop and is not gameplay-ready.' };
  }

  const runtimeQa = getActiveRuntimeSpriteQa(characterId, animationKey);
  if (runtimeQa?.verdict === 'NOT_GAMEPLAY_READY') {
    return { characterId, animationKey, health: 'blocked', reason: `Active-runtime QA verdict is ${runtimeQa.readinessBadge}.` };
  }

  return { characterId, animationKey, health: 'ready', reason: 'Animation has a registered frame folder, atlas crop, semi-realistic frame set, or normalized sprite-pack frame set.' };
}

export function isGameplayReadyAnimation(characterId: string, animationKey: string): boolean {
  return getAnimationEligibility(characterId, animationKey).health === 'ready';
}

export function getGameplayReadyAnimationKeys(characterId: string): string[] {
  return getKnownAnimationKeys(characterId).filter((animationKey) => isGameplayReadyAnimation(characterId, animationKey));
}
