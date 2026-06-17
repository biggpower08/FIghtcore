export interface BodyCropSpriteFrameQuality {
  entityId: string;
  animationKey: string;
  frameIndex: number;
  cleanedFrameAvailable: boolean;
  hasAdjacentFrameBleed: boolean;
  bleedFromNextFrame: boolean;
  disconnectedNeighborBlob: boolean;
  frameSource: 'cleaned-body-crop' | 'raw-crop-flagged' | 'runtime-body-anchor-qa';
  reason: string;
}

const repairedBodyCropAnimations = new Set([
  'shadow-striker:teep_kick',
  'shadow-striker:roundhouse_kick',
  'shadow-striker:hit_react',
  'combat-monk:high_kick',
  'combat-monk:palm_strike',
  'combat-monk:spinning_sweep',
  'striker-monkey:idle',
  'cyber-ninja:slice',
  'puppetmaster:o_goshi',
]);

const bodyAnchorQaAnimations = new Set([
  'striker-monkey:jab',
  'striker-monkey:cross',
  'striker-monkey:hook',
  'striker-monkey:round_kick',
  'cyber-monkey-grappler:charge',
  'cyber-monkey-grappler:dash',
  'cyber-monkey-grappler:ground_slam',
  'cyber-monkey-grappler:seoi_nage',
  'cyber-monkey-grappler:armbar',
  'cyber-monkey-grappler:o_goshi',
  'cyber-monkey-grappler:guillotine',
  'puppetmaster:dash',
  'combat-monk:dash',
  'combat-monk:standing_shoulder_lock',
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
  const animationId = `${entityId}:${animationKey}`;
  const cleanedFrameAvailable = repairedBodyCropAnimations.has(animationId);
  const bodyAnchorQa = bodyAnchorQaAnimations.has(animationId);
  const hasAdjacentFrameBleed = knownAdjacentBleedFrames.has(key);
  if (!cleanedFrameAvailable && !hasAdjacentFrameBleed && !bodyAnchorQa) return undefined;

  return {
    entityId,
    animationKey,
    frameIndex,
    cleanedFrameAvailable,
    hasAdjacentFrameBleed,
    bleedFromNextFrame: hasAdjacentFrameBleed,
    disconnectedNeighborBlob: hasAdjacentFrameBleed,
    frameSource: cleanedFrameAvailable ? 'cleaned-body-crop' : hasAdjacentFrameBleed ? 'raw-crop-flagged' : 'runtime-body-anchor-qa',
    reason: cleanedFrameAvailable
      ? 'Body-aware cleaned frame is available and preferred over the raw crop.'
      : hasAdjacentFrameBleed
        ? 'Raw crop is flagged for likely adjacent-frame body bleed.'
        : 'Animation is marked for runtime body-anchor QA; Sprite Lab reports foreground bounds and computed body anchor.',
  };
}

function frameKey(entityId: string, animationKey: string, frameIndex: number): string {
  return `${entityId}:${animationKey}:${frameIndex}`;
}
