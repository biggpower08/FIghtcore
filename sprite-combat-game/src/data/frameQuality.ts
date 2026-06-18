import { fightcoreGeneratedFrameMetadata } from './fightcoreGeneratedFrameMetadata';
import { hasCleanedSpriteAnimation } from './cleanedSpriteFrames';
import { getAlphaHoleSpriteFrame } from './alphaHoleSpriteFrames';
import { getBodyCropSpriteFrameQuality } from './bodyCroppedSpriteFrames';
import { getReferenceSpriteFrame } from './referenceSpriteFrames';

export type FrameRole = 'body' | 'effect' | 'invalid';

export interface FrameQuality {
  role: FrameRole;
  invalidMultiPoseFrame: boolean;
  multiPoseCrop: boolean;
  componentCount?: number;
  silhouetteCount?: number;
  invalidHollowFrame: boolean;
  alphaHoleFrame: boolean;
  alphaHoleCount: number;
  repairedAlphaHoles: number;
  usingRepairedAlpha: boolean;
  widthOutlier: boolean;
  cleanedFrameAvailable: boolean;
  hasAdjacentFrameBleed: boolean;
  bleedFromNextFrame: boolean;
  disconnectedNeighborBlob: boolean;
  frameSource?: string;
  sourceSheet?: string;
  sourceSheetLabel?: string;
  cropBox?: string;
  baselineY?: number;
  frameSize?: string;
  backgroundRemoved?: boolean;
  reason?: string;
}

const knownMultiPoseFrames = new Map<string, string>([
  [frameKey('shadow-striker', 'teep_kick', 2), 'Frame crop contains more than one Shadow Striker pose.'],
  [frameKey('shadow-striker', 'roundhouse_kick', 2), 'Frame crop contains more than one Shadow Striker pose.'],
  [frameKey('combat-monk', 'high_kick', 3), 'Frame crop contains more than one Combat Monk pose.'],
  [frameKey('striker-monkey', 'idle', 0), 'Frame crop contains multiple monkey body/tail poses.'],
]);

const bodylessEffectFrames = new Set<string>();

export function getFrameQuality(entityId: string, animationKey: string, frameIndex: number): FrameQuality {
  const reference = getReferenceSpriteFrame(entityId, animationKey, frameIndex);
  const alphaHole = getAlphaHoleSpriteFrame(entityId, animationKey, frameIndex);
  const bodyCrop = getBodyCropSpriteFrameQuality(entityId, animationKey, frameIndex);
  if (reference) {
    return {
      role: 'body',
      invalidMultiPoseFrame: false,
      multiPoseCrop: false,
      componentCount: 1,
      silhouetteCount: 1,
      invalidHollowFrame: false,
      alphaHoleFrame: false,
      alphaHoleCount: 0,
      repairedAlphaHoles: 0,
      usingRepairedAlpha: false,
      widthOutlier: false,
      cleanedFrameAvailable: true,
      hasAdjacentFrameBleed: false,
      bleedFromNextFrame: false,
      disconnectedNeighborBlob: false,
      frameSource: 'reference-extracted',
      sourceSheet: reference.sourceSheet,
      sourceSheetLabel: reference.sourceSheetLabel,
      cropBox: `${reference.crop.x},${reference.crop.y},${reference.crop.width}x${reference.crop.height}`,
      baselineY: reference.baselineY,
      frameSize: `${reference.frameSize.width}x${reference.frameSize.height}`,
      backgroundRemoved: reference.backgroundRemoved,
      reason: `Reference-extracted clean frame from ${reference.sourceSheetLabel}.`,
    };
  }
  if (hasCleanedSpriteAnimation(entityId, animationKey)) {
    return {
      role: 'body',
      invalidMultiPoseFrame: false,
      multiPoseCrop: false,
      componentCount: 1,
      silhouetteCount: 1,
      invalidHollowFrame: Boolean(alphaHole?.invalidHollowFrame),
      alphaHoleFrame: Boolean(alphaHole?.alphaHoleFrame),
      alphaHoleCount: alphaHole?.alphaHoleCount ?? 0,
      repairedAlphaHoles: alphaHole?.repairedAlphaHoles ?? 0,
      usingRepairedAlpha: Boolean(alphaHole?.repairedFramePath),
      widthOutlier: false,
      cleanedFrameAvailable: true,
      hasAdjacentFrameBleed: false,
      bleedFromNextFrame: false,
      disconnectedNeighborBlob: false,
      frameSource: bodyCrop?.frameSource ?? 'cleaned-body-crop',
      reason: alphaHole?.reason ?? bodyCrop?.reason ?? 'Cleaned single-pose PNG frame is available and preferred over the raw crop.',
    };
  }

  const key = frameKey(entityId, animationKey, frameIndex);
  const knownReason = knownMultiPoseFrames.get(key);
  const widthOutlier = isWidthOutlier(entityId, animationKey, frameIndex);
  if (knownReason) {
    return {
      role: 'invalid',
      invalidMultiPoseFrame: true,
      multiPoseCrop: true,
      componentCount: 2,
      silhouetteCount: 2,
      invalidHollowFrame: false,
      alphaHoleFrame: Boolean(alphaHole?.alphaHoleFrame),
      alphaHoleCount: alphaHole?.alphaHoleCount ?? 0,
      repairedAlphaHoles: alphaHole?.repairedAlphaHoles ?? 0,
      usingRepairedAlpha: Boolean(alphaHole?.repairedFramePath),
      widthOutlier,
      cleanedFrameAvailable: false,
      hasAdjacentFrameBleed: bodyCrop?.hasAdjacentFrameBleed ?? true,
      bleedFromNextFrame: bodyCrop?.bleedFromNextFrame ?? true,
      disconnectedNeighborBlob: bodyCrop?.disconnectedNeighborBlob ?? true,
      frameSource: bodyCrop?.frameSource ?? 'raw-crop-flagged',
      reason: knownReason,
    };
  }

  if (alphaHole?.invalidHollowFrame) {
    return {
      role: 'invalid',
      invalidMultiPoseFrame: false,
      multiPoseCrop: false,
      componentCount: 1,
      silhouetteCount: 1,
      invalidHollowFrame: true,
      alphaHoleFrame: true,
      alphaHoleCount: alphaHole.alphaHoleCount,
      repairedAlphaHoles: alphaHole.repairedAlphaHoles,
      usingRepairedAlpha: false,
      widthOutlier,
      cleanedFrameAvailable: false,
      hasAdjacentFrameBleed: Boolean(bodyCrop?.hasAdjacentFrameBleed),
      bleedFromNextFrame: Boolean(bodyCrop?.bleedFromNextFrame),
      disconnectedNeighborBlob: Boolean(bodyCrop?.disconnectedNeighborBlob),
      frameSource: bodyCrop?.frameSource,
      reason: alphaHole.reason,
    };
  }

  if (bodylessEffectFrames.has(key)) {
    return {
      role: 'effect',
      invalidMultiPoseFrame: false,
      multiPoseCrop: false,
      componentCount: 1,
      silhouetteCount: 0,
      invalidHollowFrame: false,
      alphaHoleFrame: Boolean(alphaHole?.alphaHoleFrame),
      alphaHoleCount: alphaHole?.alphaHoleCount ?? 0,
      repairedAlphaHoles: alphaHole?.repairedAlphaHoles ?? 0,
      usingRepairedAlpha: Boolean(alphaHole?.repairedFramePath),
      widthOutlier,
      cleanedFrameAvailable: false,
      hasAdjacentFrameBleed: Boolean(bodyCrop?.hasAdjacentFrameBleed),
      bleedFromNextFrame: Boolean(bodyCrop?.bleedFromNextFrame),
      disconnectedNeighborBlob: Boolean(bodyCrop?.disconnectedNeighborBlob),
      frameSource: bodyCrop?.frameSource,
      reason: 'Registered effect-only frame.',
    };
  }

  if (widthOutlier) {
    return {
      role: 'invalid',
      invalidMultiPoseFrame: true,
      multiPoseCrop: true,
      componentCount: 2,
      silhouetteCount: 2,
      invalidHollowFrame: false,
      alphaHoleFrame: Boolean(alphaHole?.alphaHoleFrame),
      alphaHoleCount: alphaHole?.alphaHoleCount ?? 0,
      repairedAlphaHoles: alphaHole?.repairedAlphaHoles ?? 0,
      usingRepairedAlpha: Boolean(alphaHole?.repairedFramePath),
      widthOutlier,
      cleanedFrameAvailable: false,
      hasAdjacentFrameBleed: bodyCrop?.hasAdjacentFrameBleed ?? true,
      bleedFromNextFrame: bodyCrop?.bleedFromNextFrame ?? true,
      disconnectedNeighborBlob: bodyCrop?.disconnectedNeighborBlob ?? true,
      frameSource: bodyCrop?.frameSource ?? 'raw-crop-flagged',
      reason: 'Frame width is a large outlier for this body animation and is treated as a likely multi-pose crop.',
    };
  }

  return {
    role: 'body',
    invalidMultiPoseFrame: false,
    multiPoseCrop: false,
    componentCount: 1,
    silhouetteCount: 1,
    invalidHollowFrame: false,
    alphaHoleFrame: Boolean(alphaHole?.alphaHoleFrame),
    alphaHoleCount: alphaHole?.alphaHoleCount ?? 0,
    repairedAlphaHoles: alphaHole?.repairedAlphaHoles ?? 0,
    usingRepairedAlpha: Boolean(alphaHole?.repairedFramePath),
    widthOutlier,
    cleanedFrameAvailable: Boolean(bodyCrop?.cleanedFrameAvailable),
    hasAdjacentFrameBleed: Boolean(bodyCrop?.hasAdjacentFrameBleed),
    bleedFromNextFrame: Boolean(bodyCrop?.bleedFromNextFrame),
    disconnectedNeighborBlob: Boolean(bodyCrop?.disconnectedNeighborBlob),
    frameSource: bodyCrop?.frameSource,
    reason: alphaHole?.reason,
  };
}

export function hasInvalidBodyFrames(entityId: string, animationKey: string): boolean {
  const metadata = fightcoreGeneratedFrameMetadata.find((entry) => entry.entityId === entityId && entry.animationKey === animationKey);
  const cleanedFrameCount = hasCleanedSpriteAnimation(entityId, animationKey)
    ? Math.max(...Array.from({ length: 16 }, (_, index) => (getAlphaHoleSpriteFrame(entityId, animationKey, index) ? index + 1 : 0)), 1)
    : 1;
  const frameCount = metadata?.frames.length ?? cleanedFrameCount;
  for (let index = 0; index < frameCount; index += 1) {
    const quality = getFrameQuality(entityId, animationKey, index);
    if (quality.role === 'invalid' || quality.invalidMultiPoseFrame || quality.multiPoseCrop || quality.invalidHollowFrame) return true;
  }
  return false;
}

export function frameKey(entityId: string, animationKey: string, frameIndex: number): string {
  return `${entityId}:${animationKey}:${frameIndex}`;
}

function isWidthOutlier(entityId: string, animationKey: string, frameIndex: number): boolean {
  const metadata = fightcoreGeneratedFrameMetadata.find((entry) => entry.entityId === entityId && entry.animationKey === animationKey);
  const frame = metadata?.frames[frameIndex];
  if (!metadata || !frame || metadata.frames.length < 3) return false;
  const widths = metadata.frames.map((entry) => entry.w).sort((a, b) => a - b);
  const median = widths[Math.floor(widths.length / 2)] ?? frame.w;
  return frame.w > median * 1.75 && frame.w > 140;
}
