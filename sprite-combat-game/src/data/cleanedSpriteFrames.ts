export interface CleanedSpriteFrameMetadata {
  frameIndex: number;
  path: string;
  width: number;
  height: number;
  anchorX: number;
  anchorY: number;
  feetY: number;
  durationMs: number;
  sourceFrameIndex: number;
  splitFromDirtyCrop: boolean;
}

export interface CleanedSpriteAnimationMetadata {
  entityId: string;
  animationKey: string;
  frames: CleanedSpriteFrameMetadata[];
}

export const cleanedSpriteFrameMetadata: CleanedSpriteAnimationMetadata[] = [
  cleaned('shadow-striker', 'teep_kick', [
    frame(0, 64, 96, 0.5, 0.9167, 88, 77, 0, false),
    frame(1, 64, 96, 0.5, 0.9167, 88, 77, 1, false),
    frame(2, 80, 96, 0.5, 0.9167, 88, 77, 2, true),
    frame(3, 85, 96, 0.5, 0.9167, 88, 77, 2, true),
    frame(4, 64, 96, 0.4844, 0.9167, 88, 77, 3, false),
    frame(5, 64, 96, 0.5, 0.9167, 88, 77, 4, false),
  ]),
  cleaned('shadow-striker', 'roundhouse_kick', [
    frame(0, 64, 96, 0.4844, 0.9167, 88, 77, 0, false),
    frame(1, 64, 96, 0.5, 0.9167, 88, 77, 1, false),
    frame(2, 93, 96, 0.5, 0.9167, 88, 77, 2, true),
    frame(3, 66, 96, 0.5, 0.9167, 88, 77, 2, true),
    frame(4, 109, 96, 0.4954, 0.9167, 88, 77, 3, false),
    frame(5, 64, 96, 0.5, 0.9167, 88, 77, 4, false),
  ]),
  cleaned('combat-monk', 'high_kick', [
    frame(0, 64, 96, 0.5, 0.9167, 88, 77, 0, false),
    frame(1, 64, 96, 0.4844, 0.9167, 88, 77, 1, false),
    frame(2, 89, 96, 0.4944, 0.9167, 88, 77, 2, false),
    frame(3, 117, 96, 0.5, 0.9167, 88, 77, 3, true),
    frame(4, 93, 96, 0.5, 0.9167, 88, 77, 3, true),
    frame(5, 64, 96, 0.5, 0.9167, 88, 77, 4, false),
  ]),
  cleaned('combat-monk', 'palm_strike', [
    frame(0, 64, 96, 0.5, 0.9167, 88, 71, 0, false),
    frame(1, 77, 96, 0.4935, 0.9167, 88, 71, 1, false),
    frame(2, 81, 96, 0.4938, 0.9167, 88, 71, 2, false),
    frame(3, 93, 96, 0.5, 0.9167, 88, 71, 3, true),
    frame(4, 86, 96, 0.5, 0.9167, 88, 71, 3, true),
  ]),
  cleaned('striker-monkey', 'idle', [
    frame(0, 79, 96, 0.5, 0.9167, 88, 125, 0, true),
    frame(1, 74, 96, 0.5, 0.9167, 88, 125, 0, true),
    frame(2, 72, 96, 0.5, 0.9167, 88, 125, 0, true),
    frame(3, 64, 96, 0.5, 0.9167, 88, 125, 1, false),
    frame(4, 80, 96, 0.5, 0.9167, 88, 125, 2, false),
    frame(5, 82, 96, 0.5, 0.9167, 88, 125, 3, false),
  ]),
];

export function getCleanedSpriteAnimation(entityId: string, animationKey: string): CleanedSpriteAnimationMetadata | undefined {
  return cleanedSpriteFrameMetadata.find((entry) => entry.entityId === entityId && entry.animationKey === animationKey);
}

export function hasCleanedSpriteAnimation(entityId: string, animationKey: string): boolean {
  return Boolean(getCleanedSpriteAnimation(entityId, animationKey));
}

function cleaned(entityId: string, animationKey: string, frames: CleanedSpriteFrameMetadata[]): CleanedSpriteAnimationMetadata {
  return {
    entityId,
    animationKey,
    frames: frames.map((entry) => ({
      ...entry,
      path: `/sprites/frames/${entityId}/${animationKey}/${String(entry.frameIndex + 1).padStart(4, '0')}.png`,
    })),
  };
}

function frame(
  frameIndex: number,
  width: number,
  height: number,
  anchorX: number,
  anchorY: number,
  feetY: number,
  durationMs: number,
  sourceFrameIndex: number,
  splitFromDirtyCrop: boolean,
): CleanedSpriteFrameMetadata {
  return {
    frameIndex,
    path: '',
    width,
    height,
    anchorX,
    anchorY,
    feetY,
    durationMs,
    sourceFrameIndex,
    splitFromDirtyCrop,
  };
}
