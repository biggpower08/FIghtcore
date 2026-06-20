export interface SemiRealisticSpriteFrameMetadata {
  entityId: string;
  animationKey: string;
  frameIndex: number;
  framePath: string;
  sourceSheet: string;
  sourceSheetLabel: string;
  frameSize: { width: number; height: number };
  anchorX: number;
  anchorY: number;
  durationMs: number;
  foregroundBounds?: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number; pixels: number };
}

export const semiRealisticSpriteFrameMetadata: SemiRealisticSpriteFrameMetadata[] = [

];

export function getSemiRealisticSpriteAnimation(entityId: string, animationKey: string): SemiRealisticSpriteFrameMetadata[] {
  return semiRealisticSpriteFrameMetadata.filter((frame) => frame.entityId === entityId && frame.animationKey === animationKey);
}

export function getSemiRealisticSpriteFrame(
  entityId: string,
  animationKey: string,
  frameIndex: number,
): SemiRealisticSpriteFrameMetadata | undefined {
  return semiRealisticSpriteFrameMetadata.find(
    (frame) => frame.entityId === entityId && frame.animationKey === animationKey && frame.frameIndex === frameIndex,
  );
}

export function hasSemiRealisticCharacterAssets(entityId: string, requiredAnimations: string[]): boolean {
  return requiredAnimations.every((animationKey) => getSemiRealisticSpriteAnimation(entityId, animationKey).length > 0);
}
