import { fightcoreGeneratedFrameMetadata } from './fightcoreGeneratedFrameMetadata';
import { hasCleanedSpriteAnimation } from './cleanedSpriteFrames';

export type FrameRole = 'body' | 'effect' | 'invalid';

export interface FrameQuality {
  role: FrameRole;
  invalidMultiPoseFrame: boolean;
  multiPoseCrop: boolean;
  componentCount?: number;
  silhouetteCount?: number;
  widthOutlier: boolean;
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
  if (hasCleanedSpriteAnimation(entityId, animationKey)) {
    return {
      role: 'body',
      invalidMultiPoseFrame: false,
      multiPoseCrop: false,
      componentCount: 1,
      silhouetteCount: 1,
      widthOutlier: false,
      reason: 'Cleaned single-pose PNG frame is available and preferred over the raw crop.',
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
      widthOutlier,
      reason: knownReason,
    };
  }

  if (bodylessEffectFrames.has(key)) {
    return {
      role: 'effect',
      invalidMultiPoseFrame: false,
      multiPoseCrop: false,
      componentCount: 1,
      silhouetteCount: 0,
      widthOutlier,
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
      widthOutlier,
      reason: 'Frame width is a large outlier for this body animation and is treated as a likely multi-pose crop.',
    };
  }

  return {
    role: 'body',
    invalidMultiPoseFrame: false,
    multiPoseCrop: false,
    componentCount: 1,
    silhouetteCount: 1,
    widthOutlier,
  };
}

export function hasInvalidBodyFrames(entityId: string, animationKey: string): boolean {
  if (hasCleanedSpriteAnimation(entityId, animationKey)) return false;
  const metadata = fightcoreGeneratedFrameMetadata.find((entry) => entry.entityId === entityId && entry.animationKey === animationKey);
  const frameCount = metadata?.frames.length ?? 1;
  for (let index = 0; index < frameCount; index += 1) {
    const quality = getFrameQuality(entityId, animationKey, index);
    if (quality.role === 'invalid' || quality.invalidMultiPoseFrame || quality.multiPoseCrop) return true;
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
