export interface BodyCropSpriteFrameQuality {
  entityId: string;
  animationKey: string;
  frameIndex: number;
  cleanedFrameAvailable: boolean;
  hasAdjacentFrameBleed: boolean;
  bleedFromNextFrame: boolean;
  disconnectedNeighborBlob: boolean;
  frameSource: 'cleaned-body-crop' | 'raw-crop-flagged';
  reason: string;
}

const repairedBodyCropAnimations = new Set([
  'shadow-striker:teep_kick',
  'shadow-striker:roundhouse_kick',
  'shadow-striker:hit_react',
  'combat-monk:high_kick',
  'combat-monk:palm_strike',
  'striker-monkey:idle',
  'cyber-ninja:slice',
  'puppetmaster:o_goshi',
]);

const knownAdjacentBleedFrames = new Set([
  frameKey('shadow-striker', 'teep_kick', 2),
  frameKey('shadow-striker', 'roundhouse_kick', 2),
  frameKey('combat-monk', 'high_kick', 3),
  frameKey('striker-monkey', 'idle', 0),
]);

export function getBodyCropSpriteFrameQuality(
  entityId: string,
  animationKey: string,
  frameIndex: number,
): BodyCropSpriteFrameQuality | undefined {
  const key = frameKey(entityId, animationKey, frameIndex);
  const cleanedFrameAvailable = repairedBodyCropAnimations.has(`${entityId}:${animationKey}`);
  const hasAdjacentFrameBleed = knownAdjacentBleedFrames.has(key);
  if (!cleanedFrameAvailable && !hasAdjacentFrameBleed) return undefined;

  return {
    entityId,
    animationKey,
    frameIndex,
    cleanedFrameAvailable,
    hasAdjacentFrameBleed,
    bleedFromNextFrame: hasAdjacentFrameBleed,
    disconnectedNeighborBlob: hasAdjacentFrameBleed,
    frameSource: cleanedFrameAvailable ? 'cleaned-body-crop' : 'raw-crop-flagged',
    reason: cleanedFrameAvailable
      ? 'Body-aware cleaned frame is available and preferred over the raw crop.'
      : 'Raw crop is flagged for likely adjacent-frame body bleed.',
  };
}

function frameKey(entityId: string, animationKey: string, frameIndex: number): string {
  return `${entityId}:${animationKey}:${frameIndex}`;
}
