import { fightcoreGeneratedFrameMetadata } from './fightcoreGeneratedFrameMetadata';

export interface GrappleVisualSuppressionMetadata {
  entityId: string;
  animationKey: string;
  startFrame: number;
  endFrame: number;
}

export function getGrappleVisualSuppression(
  entityId: string,
  animationKey: string,
): GrappleVisualSuppressionMetadata | undefined {
  const metadata = fightcoreGeneratedFrameMetadata.find(
    (entry) => entry.entityId === entityId && entry.animationKey === animationKey,
  );
  if (!metadata?.hideTargetSprite) return undefined;

  return {
    entityId,
    animationKey,
    startFrame: metadata.targetSuppressionStartFrame ?? 0,
    endFrame: metadata.targetSuppressionEndFrame ?? Math.max(0, metadata.frameCount - 1),
  };
}

export function shouldHideGrappleTargetSprite(entityId: string, animationKey: string): boolean {
  return Boolean(getGrappleVisualSuppression(entityId, animationKey));
}
