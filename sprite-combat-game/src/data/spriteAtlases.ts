import { spriteAnimations, type SpriteAnimationDefinition, type SpriteFrameRef } from './spriteAnimations';
import { spriteSourceSheetById } from './spriteRegistry';

export interface SpriteAtlasFrame {
  entityId: string;
  animationKey: string;
  sheetId: string;
  sheetPath: string;
  x: number;
  y: number;
  width: number;
  height: number;
  anchorX: number;
  anchorY: number;
  feetY: number;
  durationMs: number;
  frameIndex: number;
  notes?: string;
}

export interface SpriteAtlasAnimation {
  entityId: string;
  animationKey: string;
  loop: boolean;
  frames: SpriteAtlasFrame[];
  fallbackAnimation?: string;
  notes?: string;
}

export const spriteAtlasAnimations: SpriteAtlasAnimation[] = spriteAnimations
  .map(toAtlasAnimation)
  .filter((animation): animation is SpriteAtlasAnimation => Boolean(animation));

export const spriteAtlasAnimationByKey = new Map(
  spriteAtlasAnimations.map((animation) => [`${animation.entityId}:${animation.animationKey}`, animation]),
);

export function getSpriteAtlasAnimation(entityId: string, animationKey: string): SpriteAtlasAnimation | undefined {
  return spriteAtlasAnimationByKey.get(`${entityId}:${animationKey}`);
}

function toAtlasAnimation(animation: SpriteAnimationDefinition): SpriteAtlasAnimation | null {
  const frames = animation.frames
    .map((frame, index) => toAtlasFrame(animation.entityId, animation.animationKey, frame, index))
    .filter((frame): frame is SpriteAtlasFrame => Boolean(frame));

  if (frames.length === 0) return null;

  return {
    entityId: animation.entityId,
    animationKey: animation.animationKey,
    loop: animation.loop,
    frames,
    fallbackAnimation: animation.fallbackAnimation,
    notes: animation.notes,
  };
}

function toAtlasFrame(entityId: string, animationKey: string, frame: SpriteFrameRef, index: number): SpriteAtlasFrame | null {
  if (!frame.sheetId || frame.x === undefined || frame.y === undefined || !frame.width || !frame.height) return null;
  const sheet = spriteSourceSheetById.get(frame.sheetId);
  if (!sheet) return null;

  return {
    entityId,
    animationKey,
    sheetId: frame.sheetId,
    sheetPath: sheet.path,
    x: frame.x,
    y: frame.y,
    width: frame.width,
    height: frame.height,
    anchorX: frame.anchorX ?? 0.5,
    anchorY: frame.anchorY ?? 0.86,
    feetY: frame.feetY ?? Math.round(frame.height * (frame.anchorY ?? 0.86)),
    durationMs: frame.durationMs,
    frameIndex: index,
    notes: frame.notes,
  };
}
