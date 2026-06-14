import { fightcoreSpriteManifest } from './fightcoreSpriteManifest';
import { fightcoreGeneratedFrameMetadata } from './fightcoreGeneratedFrameMetadata';
import { fightcoreStripSheetId, spriteRegistry, spriteSourceSheetById } from './spriteRegistry';

export type SpriteFrameSource = 'frame-png' | 'atlas-crop' | 'sheet-crop' | 'fallback' | 'missing';

export interface SpriteFrameRef {
  sheetId?: string;
  framePath?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  durationMs: number;
  anchorX?: number;
  anchorY?: number;
  feetY?: number;
  notes?: string;
}

export interface SpriteAnimationDefinition {
  entityId: string;
  animationKey: string;
  loop: boolean;
  fallbackAnimation?: string;
  frames: SpriteFrameRef[];
  notes?: string;
}

export interface SpriteCoverageRow {
  entityId: string;
  animationKey: string;
  status: SpriteFrameSource;
  frameCount: number;
  sheetId?: string;
  notes?: string;
}

const cyberNinjaSheet = 'cyber-ninja-blue-sheet';
const shadowSheet = 'shadow-striker-purple-sheet';
const monkSheet = 'cyber-monk-orange-sheet';
const neoSheet = 'neo-operative-green-sheet';

export const enemyAttackAnimationByMove: Record<string, string> = {
  jab: 'jab',
  cross: 'cross',
  grab: 'grab',
  palm_strike: 'claw_swipe',
  low_kick: 'claw_combo',
  clinch_knee: 'ground_slam',
};

export const spriteAnimations: SpriteAnimationDefinition[] = [
  ...fightcoreManifestAnimations(),
  ...characterSheetAnimations('cyber-ninja-blue', cyberNinjaSheet, {
    idle: row(cyberNinjaSheet, 70, 122, 220, 178, 4, 218, 150),
    ready: row(cyberNinjaSheet, 70, 354, 220, 152, 4, 218, 120),
    walk: row(cyberNinjaSheet, 70, 555, 245, 156, 4, 260, 110),
    dash: row(cyberNinjaSheet, 70, 555, 245, 156, 4, 260, 70),
    jab: [crop(cyberNinjaSheet, 55, 755, 255, 145, 95), crop(cyberNinjaSheet, 405, 755, 255, 145, 105)],
    cross: [crop(cyberNinjaSheet, 405, 755, 255, 145, 95), crop(cyberNinjaSheet, 55, 755, 255, 145, 105)],
    low_kick: [crop(cyberNinjaSheet, 1105, 755, 245, 145, 120), crop(cyberNinjaSheet, 294, 944, 226, 112, 110)],
    roundhouse_kick: [crop(cyberNinjaSheet, 755, 755, 255, 145, 140), crop(cyberNinjaSheet, 1105, 755, 245, 145, 110)],
    hit_react: [crop(cyberNinjaSheet, 55, 944, 226, 112, 120)],
    knockdown: [crop(cyberNinjaSheet, 55, 944, 226, 112, 140)],
    recovery: row(cyberNinjaSheet, 55, 944, 226, 112, 3, 240, 120),
  }),
  ...characterSheetAnimations('shadow-striker-purple', shadowSheet, {
    idle: row(shadowSheet, 55, 212, 135, 162, 5, 114, 150),
    ready: row(shadowSheet, 760, 228, 136, 146, 5, 114, 130),
    walk: row(shadowSheet, 55, 440, 128, 146, 6, 115, 120),
    dash: row(shadowSheet, 760, 438, 128, 146, 5, 112, 90),
    jab: row(shadowSheet, 55, 862, 130, 155, 3, 118, 90),
    cross: row(shadowSheet, 55, 862, 130, 155, 3, 118, 90),
    short_elbow: row(shadowSheet, 55, 862, 130, 155, 4, 118, 95),
    shadow_counter: row(shadowSheet, 740, 650, 150, 150, 4, 122, 110),
    hit_react: [crop(shadowSheet, 55, 862, 130, 155, 130)],
    knockdown: [crop(shadowSheet, 1110, 650, 155, 150, 160)],
    recovery: row(shadowSheet, 760, 862, 130, 155, 4, 114, 130),
  }),
  ...characterSheetAnimations('cyber-monk-orange', monkSheet, {
    idle: row(monkSheet, 285, 89, 112, 120, 5, 160, 150),
    ready: row(monkSheet, 285, 232, 112, 120, 5, 160, 130),
    walk: row(monkSheet, 285, 386, 112, 120, 4, 160, 120),
    dash: row(monkSheet, 285, 386, 112, 120, 4, 160, 80),
    palm_strike: row(monkSheet, 285, 836, 140, 120, 4, 160, 95),
    spinning_kick: row(monkSheet, 285, 604, 150, 112, 5, 160, 95),
    clinch_knee: row(monkSheet, 285, 515, 122, 120, 3, 160, 120),
    hip_throw: row(monkSheet, 285, 604, 150, 112, 4, 160, 115),
    hit_react: [crop(monkSheet, 285, 724, 120, 95, 140)],
    knockdown: [crop(monkSheet, 445, 724, 120, 95, 160)],
    recovery: row(monkSheet, 285, 962, 112, 100, 4, 160, 130),
  }),
  ...characterSheetAnimations('neo-operative-green', neoSheet, {
    idle: row(neoSheet, 100, 155, 120, 180, 4, 158, 150),
    ready: row(neoSheet, 770, 155, 120, 180, 4, 158, 130),
    walk: row(neoSheet, 100, 415, 112, 155, 6, 120, 115),
    dash: row(neoSheet, 280, 635, 152, 135, 3, 210, 90),
    double_leg_takedown: row(neoSheet, 640, 635, 170, 135, 4, 210, 105),
    sprawl_counter: row(neoSheet, 990, 825, 140, 150, 3, 160, 115),
    hip_throw: row(neoSheet, 640, 635, 170, 135, 3, 210, 115),
    low_kick: row(neoSheet, 100, 635, 150, 135, 3, 180, 100),
    hit_react: [crop(neoSheet, 990, 825, 140, 150, 140)],
    knockdown: [crop(neoSheet, 100, 825, 140, 150, 160)],
    recovery: row(neoSheet, 990, 825, 140, 150, 3, 160, 130),
  }),
  ...fallbackOnly('cyber-monkey-grunt', ['idle', 'run', 'leap', 'claw_swipe', 'palm_strike', 'hit_react', 'knockdown', 'death']),
  ...fallbackOnly('cyber-monkey-scrapper', ['idle', 'run', 'leap', 'claw_combo', 'low_kick', 'hit_react', 'knockdown', 'death']),
  ...fallbackOnly('cyber-monkey-alpha', [
    'idle',
    'run',
    'taunt',
    'ground_slam',
    'leap_slam',
    'clinch_knee',
    'hit_react',
    'enrage',
    'knockdown',
    'death',
  ]),
];

export const spriteAnimationByKey = new Map(spriteAnimations.map((animation) => [animationKey(animation.entityId, animation.animationKey), animation]));

export function getSpriteAnimation(entityId: string, animation: string): SpriteAnimationDefinition | undefined {
  return spriteAnimationByKey.get(animationKey(entityId, animation));
}

export function getKnownAnimationKeys(entityId: string): string[] {
  const registered = spriteRegistry.find((sprite) => sprite.id === entityId)?.animations ?? [];
  const mapped = spriteAnimations.filter((animation) => animation.entityId === entityId).map((animation) => animation.animationKey);
  return [...new Set([...registered, ...mapped])];
}

export function getSpriteCoverageRows(): SpriteCoverageRow[] {
  return spriteAnimations.map((animation) => {
    const sheetId = animation.frames.find((frame) => frame.sheetId)?.sheetId;
    const hasSheet = sheetId ? spriteSourceSheetById.has(sheetId) : false;
    const hasFramePng = animation.frames.some((frame) => frame.framePath);
    const hasCrop = animation.frames.some((frame) => frame.sheetId && frame.x !== undefined);
    const status: SpriteFrameSource = hasFramePng ? 'frame-png' : hasCrop && hasSheet ? 'sheet-crop' : 'fallback';
    return {
      entityId: animation.entityId,
      animationKey: animation.animationKey,
      status,
      frameCount: animation.frames.length,
      sheetId,
      notes: animation.notes,
    };
  });
}

export function printSpriteCoverageReport(): void {
  console.table(getSpriteCoverageRows());
}

function characterSheetAnimations(
  entityId: string,
  sheetId: string,
  animations: Record<string, SpriteFrameRef[]>,
): SpriteAnimationDefinition[] {
  return Object.entries(animations).map(([animationKey, frames]) => ({
    entityId,
    animationKey,
    loop: ['idle', 'ready', 'walk', 'run', 'dash'].includes(animationKey),
    fallbackAnimation: animationKey === 'idle' ? undefined : 'idle',
    frames,
    notes: `Approximate source-sheet crops from ${sheetId}. Tune rectangles after exact slicing.`,
  }));
}

function fallbackOnly(entityId: string, animationKeys: string[]): SpriteAnimationDefinition[] {
  return animationKeys.map((animationKey) => ({
    entityId,
    animationKey,
    loop: ['idle', 'run'].includes(animationKey),
    fallbackAnimation: animationKey === 'idle' ? undefined : 'idle',
    frames: [{ durationMs: 120, notes: 'Pre-sliced frame folders are preferred; procedural drawing remains as a safety fallback.' }],
    notes: 'Cyber Monkey runtime animation key with frame-folder priority and procedural fallback.',
  }));
}

function fightcoreManifestAnimations(): SpriteAnimationDefinition[] {
  return fightcoreSpriteManifest.flatMap((entry) => {
    return entry.animations.map((animation) => {
      const metadata = fightcoreGeneratedFrameMetadata.find(
        (generated) => generated.entityId === entry.entityId && generated.animationKey === animation.key,
      );
      const durationMs = Math.round(1000 / animation.fps);
      return {
        entityId: entry.entityId,
        animationKey: animation.key,
        loop: metadata?.loop ?? animation.loop,
        fallbackAnimation: animation.key === 'idle' ? undefined : 'idle',
        frames:
          metadata?.frames.map((frame) => ({
            sheetId: fightcoreStripSheetId(entry.sheetId, animation.key),
            x: frame.x,
            y: 0,
            width: frame.w,
            height: frame.h,
            durationMs,
            anchorX: frame.anchorX / Math.max(1, frame.w),
            anchorY: frame.anchorY / Math.max(1, frame.h),
            feetY: frame.anchorY,
          })) ?? [],
        notes: `Prepared FIghtcore strip ${metadata?.stripPath ?? animation.stripPath} from detected variable-width frames.`,
      };
    });
  });
}

function row(
  sheetId: string,
  startX: number,
  y: number,
  width: number,
  height: number,
  count: number,
  stepX: number,
  durationMs: number,
): SpriteFrameRef[] {
  return Array.from({ length: count }, (_, index) => crop(sheetId, startX + index * stepX, y, width, height, durationMs));
}

function crop(sheetId: string, x: number, y: number, width: number, height: number, durationMs: number): SpriteFrameRef {
  return { sheetId, x, y, width, height, durationMs, anchorX: 0.5, anchorY: 0.84 };
}

function animationKey(entityId: string, animation: string): string {
  return `${entityId}:${animation}`;
}
