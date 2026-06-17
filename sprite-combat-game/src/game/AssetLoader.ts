import { getSpriteAnimation, type SpriteAnimationDefinition, type SpriteFrameRef, type SpriteFrameSource } from '../data/spriteAnimations';
import { getSpriteAtlasAnimation, type SpriteAtlasAnimation } from '../data/spriteAtlases';
import { getCleanedSpriteAnimation } from '../data/cleanedSpriteFrames';
import { getAlphaHoleSpriteFrame } from '../data/alphaHoleSpriteFrames';
import { spriteRegistryById, spriteSourceSheetById } from '../data/spriteRegistry';
import { publicAssetUrl } from './publicAssetUrl';

export interface ResolvedSpriteFrame {
  source: SpriteFrameSource;
  entityId?: string;
  animationKey?: string;
  frameIndex?: number;
  durationMs: number;
  image?: HTMLImageElement;
  sheetImage?: HTMLImageElement;
  sheetId?: string;
  sheetPath?: string;
  framePath?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  anchorX: number;
  anchorY: number;
  feetY?: number;
  rawCropAvailable?: boolean;
  cleanedFrameAvailable?: boolean;
  repairedFrameAvailable?: boolean;
  usingRepairedAlpha?: boolean;
  invalidHollowFrame?: boolean;
  alphaHoleCount?: number;
  repairedAlphaHoles?: number;
  bodyAnchorComputed?: boolean;
  bodyAnchorSource?: string;
  foregroundBounds?: SpriteFrameBounds;
  bodyBounds?: SpriteFrameBounds;
  notes?: string;
}

export interface SpriteFrameBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  pixels?: number;
}

export interface ResolvedSpriteAnimation {
  entityId: string;
  animationKey: string;
  loop: boolean;
  status: SpriteFrameSource;
  frames: ResolvedSpriteFrame[];
  fallbackAnimation?: string;
  notes?: string;
}

export interface AssetLoadContext {
  entityId?: string;
  animationKey?: string;
  frameIndex?: number;
  kind?: string;
}

export interface AssetLoadReport {
  totalSpriteFramesExpected: number;
  totalSpriteFramesLoaded: number;
  failedUrls: Array<{
    originalPath: string;
    resolvedUrl: string;
    entityId?: string;
    animationKey?: string;
    frameIndex?: number;
    kind?: string;
  }>;
  backgrounds: Array<{ path: string; loaded: boolean }>;
  usingFallback: boolean;
  fallbackAnimations: Array<{ entityId: string; animationKey: string; status: SpriteFrameSource }>;
}

export class AssetLoader {
  private readonly images = new Map<string, HTMLImageElement>();
  private readonly missing = new Set<string>();
  private readonly resolvedByPath = new Map<string, string>();
  private readonly failedLoads = new Map<string, AssetLoadContext & { originalPath: string; resolvedUrl: string }>();
  private readonly frameCache = new Map<string, HTMLImageElement[]>();
  private readonly sheetCache = new Map<string, HTMLImageElement | null>();
  private readonly animationCache = new Map<string, ResolvedSpriteAnimation>();
  private readonly warnedMissing = new Set<string>();
  private readonly warnedBroken = new Set<string>();

  async loadImage(path: string, context: AssetLoadContext = {}): Promise<HTMLImageElement | null> {
    const cached = this.images.get(path);
    if (cached) return cached;
    if (this.missing.has(path)) return null;

    const resolvedUrl = publicAssetUrl(path);
    this.resolvedByPath.set(path, resolvedUrl);
    const image = new Image();
    image.src = resolvedUrl;

    const loaded = await new Promise<boolean>((resolve) => {
      image.onload = () => resolve(true);
      image.onerror = () => {
        this.missing.add(path);
        this.failedLoads.set(path, { ...context, originalPath: path, resolvedUrl });
        this.warnFailedImage(path, resolvedUrl, context);
        resolve(false);
      };
    });

    if (!loaded) return null;
    if (shouldHealthCheckImage(context) && !isSpriteFrameHealthy(image)) {
      this.missing.add(path);
      this.warnBrokenFrame(path, 'Loaded image failed runtime sprite health checks and was blocked from normal gameplay.');
      return null;
    }

    this.images.set(path, image);
    return image;
  }

  getImage(path: string): HTMLImageElement | undefined {
    return this.images.get(path);
  }

  async loadFrames(character: string, move: string, frameCount = 4): Promise<HTMLImageElement[]> {
    const padded = (frame: number) => String(frame).padStart(4, '0');
    const paths = Array.from(
      { length: frameCount },
      (_, index) => `/sprites/frames/${character}/${move}/${padded(index + 1)}.png`,
    );
    const frames = await Promise.all(
      paths.map((path, index) => this.loadImage(path, { entityId: character, animationKey: move, frameIndex: index + 1, kind: 'sprite-frame' })),
    );
    return frames.filter((frame): frame is HTMLImageElement => Boolean(frame));
  }

  async loadOptionalFrames(assetId: string, animation: string, frameCount = 4): Promise<HTMLImageElement[]> {
    const key = `${assetId}:${animation}`;
    const cached = this.frameCache.get(key);
    if (cached) return cached;

    const frames: HTMLImageElement[] = [];
    for (let frame = 1; frame <= frameCount; frame += 1) {
      const alphaHole = getAlphaHoleSpriteFrame(assetId, animation, frame - 1);
      const path = alphaHole?.repairedFramePath ?? `/sprites/frames/${assetId}/${animation}/${String(frame).padStart(4, '0')}.png`;
      if (isKnownBrokenFrame(path)) {
        this.warnBrokenFrame(path, 'Known hollow or low-coverage frame is blocked from normal gameplay.');
        continue;
      }
      const image = await this.loadImage(path, {
        entityId: assetId,
        animationKey: animation,
        frameIndex: frame,
        kind: 'sprite-frame',
      });
      if (!image) {
        if (frame === 1) break;
      } else {
        frames.push(image);
      }
    }

    this.frameCache.set(key, frames);
    return frames;
  }

  getFrames(assetId: string, animation: string): HTMLImageElement[] {
    return this.frameCache.get(`${assetId}:${animation}`) ?? [];
  }

  async loadSheet(sheetId: string): Promise<HTMLImageElement | null> {
    if (this.sheetCache.has(sheetId)) return this.sheetCache.get(sheetId) ?? null;
    const sheet = spriteSourceSheetById.get(sheetId);
    if (!sheet) {
      this.warnOnce(`sheet:${sheetId}`, `Missing sprite sheet registry entry: ${sheetId}`);
      this.sheetCache.set(sheetId, null);
      return null;
    }

    const image = await this.loadImage(sheet.path, { entityId: sheet.linkedSpriteIds.join(','), kind: `source-sheet:${sheetId}` });
    if (!image) this.warnOnce(`sheet-image:${sheetId}`, `Missing sprite sheet image: ${sheet.path}`);
    this.sheetCache.set(sheetId, image);
    return image;
  }

  async loadFrame(path: string): Promise<HTMLImageElement | null> {
    const image = await this.loadImage(path, { kind: 'explicit-frame' });
    if (!image) this.warnOnce(`frame:${path}`, `Missing sprite frame: ${path}`);
    return image;
  }

  async resolveAnimation(entityId: string, animationKey: string): Promise<ResolvedSpriteAnimation> {
    const cacheKey = `${entityId}:${animationKey}`;
    const cached = this.animationCache.get(cacheKey);
    if (cached) return cached;

    const definition = getSpriteAnimation(entityId, animationKey);
    const resolved =
      (await this.resolvePreSlicedFrames(entityId, animationKey, definition)) ??
      (await this.resolveAtlasAnimation(entityId, animationKey)) ??
      (definition ? await this.resolveDefinition(definition) : null) ??
      fallbackAnimation(entityId, animationKey, definition);

    this.animationCache.set(cacheKey, resolved);
    return resolved;
  }

  private async resolveAtlasAnimation(entityId: string, animationKey: string): Promise<ResolvedSpriteAnimation | null> {
    const atlas = getSpriteAtlasAnimation(entityId, animationKey);
    if (!atlas) return null;

    const resolved = await this.resolveAtlasDefinition(atlas);
    if (!resolved) return null;
    return resolved;
  }

  private async resolveAtlasDefinition(atlas: SpriteAtlasAnimation): Promise<ResolvedSpriteAnimation | null> {
    const frames: ResolvedSpriteFrame[] = [];

    for (const frame of atlas.frames) {
      const sheetImage = await this.loadImage(frame.sheetPath, {
        entityId: frame.entityId,
        animationKey: frame.animationKey,
        frameIndex: frame.frameIndex + 1,
        kind: `atlas-crop:${frame.sheetId}`,
      });
      if (!sheetImage) continue;
      if (isInvalidAtlasFrame(frame, sheetImage)) {
        this.warnBrokenFrame(
          `${frame.sheetPath}:${frame.animationKey}:${frame.frameIndex}`,
          'Atlas frame looked like a full strip/contact sheet or invalid crop and was blocked.',
        );
        continue;
      }
      frames.push(
        applyBodyAwareAnchor({
          source: 'atlas-crop',
          entityId: frame.entityId,
          animationKey: frame.animationKey,
          frameIndex: frame.frameIndex,
          durationMs: frame.durationMs,
          sheetImage,
          sheetId: frame.sheetId,
          sheetPath: frame.sheetPath,
          x: frame.x,
          y: frame.y,
          width: frame.width,
          height: frame.height,
          anchorX: frame.anchorX,
          anchorY: frame.anchorY,
          feetY: frame.feetY,
          rawCropAvailable: true,
          notes: frame.notes,
        }),
      );
    }

    if (frames.length === 0) return null;

    return {
      entityId: atlas.entityId,
      animationKey: atlas.animationKey,
      loop: atlas.loop,
      status: 'atlas-crop',
      frames,
      fallbackAnimation: atlas.fallbackAnimation,
      notes: atlas.notes,
    };
  }

  getResolvedAnimation(entityId: string, animationKey: string): ResolvedSpriteAnimation | undefined {
    return this.animationCache.get(`${entityId}:${animationKey}`);
  }

  printAssetLoadReport(): void {
    console.table(this.getAssetLoadReport().failedUrls);
    console.info('Asset load report', this.getAssetLoadReport());
  }

  getAssetLoadReport(): AssetLoadReport {
    const animations = [...this.animationCache.values()];
    return {
      totalSpriteFramesExpected: animations.reduce((total, animation) => total + animation.frames.length, 0),
      totalSpriteFramesLoaded: animations.reduce(
        (total, animation) => total + animation.frames.filter((frame) => frame.image || frame.sheetImage).length,
        0,
      ),
      failedUrls: [...this.failedLoads.values()].map((entry) => ({ ...entry })),
      backgrounds: [...new Set([...this.images.keys(), ...this.failedLoads.keys()])]
        .filter((path) => path.startsWith('/backgrounds/') || path.startsWith('/assets/fightcore/backgrounds/'))
        .map((path) => ({ path, loaded: this.images.has(path) })),
      usingFallback: animations.some((animation) => animation.status === 'fallback' || animation.status === 'missing'),
      fallbackAnimations: animations
        .filter((animation) => animation.status === 'fallback' || animation.status === 'missing')
        .map((animation) => ({ entityId: animation.entityId, animationKey: animation.animationKey, status: animation.status })),
    };
  }

  private async resolvePreSlicedFrames(
    entityId: string,
    animationKey: string,
    definition?: SpriteAnimationDefinition,
  ): Promise<ResolvedSpriteAnimation | null> {
    const cleaned = getCleanedSpriteAnimation(entityId, animationKey);
    const images = await this.loadOptionalFrames(entityId, animationKey, 8);
    if (images.length === 0) return null;
    const expectedFrameCount = Math.min(8, cleaned?.frames.length ?? definition?.frames.length ?? minimumFrameCount(animationKey));
    if (images.length < expectedFrameCount && getSpriteAtlasAnimation(entityId, animationKey)) {
      this.warnOnce(
        `atlas-better:${entityId}:${animationKey}`,
        `Sprite frame folder is incomplete or failed health checks for ${entityId}/${animationKey}; using atlas crop as the safer gameplay source.`,
      );
      return null;
    }
    const renderProfile = spriteRegistryById.get(entityId)?.render;

    const frames = images.map<ResolvedSpriteFrame>((image, index) =>
      applyBodyAwareAnchor({
        source: 'frame-png',
        entityId,
        animationKey,
        frameIndex: index,
        durationMs: cleaned?.frames[index]?.durationMs ?? definition?.frames[index]?.durationMs ?? timingForAnimation(animationKey, index, images.length),
        image,
        framePath: cleaned?.frames[index]?.path ?? `/sprites/frames/${entityId}/${animationKey}/${String(index + 1).padStart(4, '0')}.png`,
        width: cleaned?.frames[index]?.width,
        height: cleaned?.frames[index]?.height,
        anchorX: cleaned?.frames[index]?.anchorX ?? renderProfile?.anchorX ?? definition?.frames[index]?.anchorX ?? 0.5,
        anchorY: cleaned?.frames[index]?.anchorY ?? renderProfile?.anchorY ?? definition?.frames[index]?.anchorY ?? 0.86,
        feetY: cleaned?.frames[index]?.feetY ?? renderProfile?.feetY,
        rawCropAvailable: Boolean(getSpriteAtlasAnimation(entityId, animationKey)?.frames[index]),
        cleanedFrameAvailable: Boolean(cleaned?.frames[index]),
        notes: cleaned?.frames[index]?.splitFromDirtyCrop ? 'Cleaned frame split from a multi-pose raw crop.' : undefined,
      }),
    );
    for (const [index, frame] of frames.entries()) {
      const alphaHole = getAlphaHoleSpriteFrame(entityId, animationKey, index);
      if (!alphaHole) continue;
      frame.framePath = alphaHole.repairedFramePath ?? frame.framePath;
      frame.repairedFrameAvailable = Boolean(alphaHole.repairedFramePath);
      frame.usingRepairedAlpha = Boolean(alphaHole.repairedFramePath);
      frame.invalidHollowFrame = alphaHole.invalidHollowFrame;
      frame.alphaHoleCount = alphaHole.alphaHoleCount;
      frame.repairedAlphaHoles = alphaHole.repairedAlphaHoles;
      frame.notes = alphaHole.repairedFramePath
        ? appendNote(frame.notes, 'Using repaired alpha-hole PNG frame.')
        : appendNote(frame.notes, alphaHole.reason);
    }

    return {
      entityId,
      animationKey,
      loop: definition?.loop ?? ['idle', 'ready', 'walk', 'run'].includes(animationKey),
      status: 'frame-png',
      frames,
      fallbackAnimation: definition?.fallbackAnimation,
      notes: cleaned ? 'Resolved from cleaned single-pose PNG frame folder.' : 'Resolved from pre-sliced PNG frame folder.',
    };
  }

  private async resolveDefinition(definition: SpriteAnimationDefinition): Promise<ResolvedSpriteAnimation | null> {
    const frames: ResolvedSpriteFrame[] = [];

    for (const [index, frame] of definition.frames.entries()) {
      const resolved = await this.resolveFrameRef(frame, definition.entityId, definition.animationKey, index);
      if (resolved) frames.push(resolved);
    }

    if (frames.length === 0) return null;
    const status = frames.some((frame) => frame.source === 'sheet-crop') ? 'sheet-crop' : frames[0].source;

    return {
      entityId: definition.entityId,
      animationKey: definition.animationKey,
      loop: definition.loop,
      status,
      frames,
      fallbackAnimation: definition.fallbackAnimation,
      notes: definition.notes,
    };
  }

  private async resolveFrameRef(
    frame: SpriteFrameRef,
    entityId: string,
    animationKey: string,
    frameIndex: number,
  ): Promise<ResolvedSpriteFrame | null> {
    if (frame.framePath) {
      const image = await this.loadFrame(frame.framePath);
      if (!image) return null;
      return applyBodyAwareAnchor({
        source: 'frame-png',
        entityId,
        animationKey,
        frameIndex,
        durationMs: frame.durationMs,
        image,
        framePath: frame.framePath,
        anchorX: frame.anchorX ?? 0.5,
        anchorY: frame.anchorY ?? 0.84,
        notes: frame.notes,
      });
    }

    if (frame.sheetId && frame.x !== undefined && frame.y !== undefined && frame.width && frame.height) {
      const sheetImage = await this.loadSheet(frame.sheetId);
      if (!sheetImage) return null;
      return applyBodyAwareAnchor({
        source: 'sheet-crop',
        entityId,
        animationKey,
        frameIndex,
        durationMs: frame.durationMs,
        sheetImage,
        sheetId: frame.sheetId,
        sheetPath: spriteSourceSheetById.get(frame.sheetId)?.path,
        x: frame.x,
        y: frame.y,
        width: frame.width,
        height: frame.height,
        anchorX: frame.anchorX ?? 0.5,
        anchorY: frame.anchorY ?? 0.84,
        feetY: frame.feetY,
        rawCropAvailable: true,
        notes: frame.notes,
      });
    }

    return {
      source: 'fallback',
      entityId,
      animationKey,
      frameIndex,
      durationMs: frame.durationMs,
      anchorX: frame.anchorX ?? 0.5,
      anchorY: frame.anchorY ?? 0.84,
      notes: frame.notes,
    };
  }

  private warnOnce(key: string, message: string): void {
    if (this.warnedMissing.has(key)) return;
    this.warnedMissing.add(key);
    console.warn(message);
  }

  private warnFailedImage(originalPath: string, resolvedUrl: string, context: AssetLoadContext): void {
    this.warnOnce(
      `image:${resolvedUrl}`,
      [
        'Failed to load image:',
        `kind=${context.kind ?? 'image'}`,
        `entity=${context.entityId ?? 'unknown'}`,
        `animation=${context.animationKey ?? 'unknown'}`,
        `frame=${context.frameIndex ?? 'unknown'}`,
        `original=${originalPath}`,
        `resolved=${resolvedUrl}`,
      ].join('\n'),
    );
  }

  private warnBrokenFrame(path: string, reason: string): void {
    if (this.warnedBroken.has(path)) return;
    this.warnedBroken.add(path);
    console.warn(`Blocked sprite frame: ${path}\n${reason}`);
  }
}

function fallbackAnimation(
  entityId: string,
  animationKey: string,
  definition?: SpriteAnimationDefinition,
): ResolvedSpriteAnimation {
  console.warn(`Sprite fallback used: ${entityId} / ${animationKey} because runtime frames or sheet crops are missing.`);
  return {
    entityId,
    animationKey,
    loop: definition?.loop ?? true,
    status: definition ? 'fallback' : 'missing',
    frames: [
      {
        source: definition ? 'fallback' : 'missing',
        entityId,
        animationKey,
        frameIndex: 0,
        durationMs: definition?.frames[0]?.durationMs ?? 120,
        anchorX: 0.5,
        anchorY: 0.84,
        notes: definition?.notes ?? 'No registered animation or asset was found.',
      },
    ],
    fallbackAnimation: definition?.fallbackAnimation,
    notes: definition?.notes,
  };
}

function timingForAnimation(animationKey: string, index: number, frameCount: number): number {
  const attackTiming: Record<string, number[]> = {
    jab: [105, 125, 140, 155],
    cross: [115, 135, 155, 175],
    low_kick: [115, 135, 150, 155, 170],
    roundhouse_kick: [135, 155, 175, 190, 175, 200],
    short_elbow: [115, 135, 150, 165, 175],
    shadow_counter: [130, 150, 170, 170, 185, 200],
    palm_strike: [115, 140, 155, 175, 185],
    spinning_kick: [135, 155, 175, 190, 200, 215],
    spinning_sweep: [150, 180, 200],
    slice: [115, 135, 155, 170, 190],
    clinch_knee: [130, 150, 170, 185, 195],
    hip_throw: [150, 175, 195, 215, 230],
    o_goshi: [170, 200, 230, 260, 250, 230],
    seoi_nage: [160, 190, 215, 240, 230],
    armbar: [160, 185, 210, 235, 245],
    double_leg_shot: [140, 165, 190, 210, 230, 245],
    double_leg_takedown: [140, 165, 190, 210, 230, 245],
    duck_under_mat_return_slam: [160, 185, 210, 235, 255],
    sprawl_counter: [140, 165, 190, 210, 230],
    claw_swipe: [115, 135, 150, 170, 185],
    claw_combo: [115, 135, 150, 170, 185, 205],
    ground_slam: [145, 165, 185, 210, 235, 215, 200],
  };

  if (animationKey === 'idle' || animationKey === 'ready') return 150;
  if (animationKey === 'walk' || animationKey === 'run') return 110;
  if (animationKey === 'dash') return 68;
  if (animationKey === 'hit_react') return 130;
  if (animationKey === 'recovery') return 120;
  if (animationKey === 'death') return 135;
  if (animationKey === 'knockdown') return 125;

  const sequence = attackTiming[animationKey];
  return sequence?.[index] ?? sequence?.[sequence.length - 1] ?? Math.max(120, Math.round(860 / Math.max(1, frameCount)));
}

function isInvalidAtlasFrame(
  frame: { width: number; height: number; x: number; y: number; sheetPath: string },
  sheetImage: HTMLImageElement,
): boolean {
  if (frame.width <= 0 || frame.height <= 0) return true;
  if (frame.x < 0 || frame.y < 0 || frame.x + frame.width > sheetImage.width || frame.y + frame.height > sheetImage.height) return true;
  const isPreparedStrip = frame.sheetPath.includes('/assets/fightcore/sprites/') && frame.sheetPath.endsWith('-strip.png');
  if (!isPreparedStrip) return false;
  if (frame.width >= sheetImage.width && sheetImage.width > 180) return true;
  if (frame.width > 260) return true;
  return false;
}

function isKnownBrokenFrame(path: string): boolean {
  return knownBrokenFrames.has(path);
}

function appendNote(current: string | undefined, note: string): string {
  return current ? `${current} ${note}` : note;
}

function applyBodyAwareAnchor(frame: ResolvedSpriteFrame): ResolvedSpriteFrame {
  const analysis = analyzeSpriteBody(frame);
  if (!analysis) return frame;

  const bodyCenterX = (analysis.bodyBounds.minX + analysis.bodyBounds.maxX + 1) / 2;
  const bodyFootY = analysis.bodyBounds.maxY + 1;
  const proposedAnchorX = bodyCenterX / Math.max(1, analysis.width);
  const proposedAnchorY = bodyFootY / Math.max(1, analysis.height);

  return {
    ...frame,
    anchorX: clampNumber(proposedAnchorX, Math.max(0.25, frame.anchorX - 0.18), Math.min(0.75, frame.anchorX + 0.18)),
    anchorY: clampNumber(proposedAnchorY, Math.max(0.78, frame.anchorY - 0.08), Math.min(0.98, frame.anchorY + 0.08)),
    feetY: Math.round(bodyFootY),
    bodyAnchorComputed: true,
    bodyAnchorSource: analysis.source,
    foregroundBounds: analysis.foregroundBounds,
    bodyBounds: analysis.bodyBounds,
    notes: appendNote(frame.notes, 'Using body-aware silhouette anchor.'),
  };
}

function analyzeSpriteBody(
  frame: ResolvedSpriteFrame,
):
  | {
      width: number;
      height: number;
      source: string;
      foregroundBounds: SpriteFrameBounds;
      bodyBounds: SpriteFrameBounds;
    }
  | undefined {
  if (typeof document === 'undefined') return undefined;
  const image = frame.image ?? frame.sheetImage;
  if (!image) return undefined;
  const width = frame.width ?? frame.image?.width ?? image.width;
  const height = frame.height ?? frame.image?.height ?? image.height;
  if (width <= 0 || height <= 0) return undefined;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return undefined;

  if (frame.image) {
    context.drawImage(frame.image, 0, 0, width, height);
  } else if (frame.sheetImage && frame.x !== undefined && frame.y !== undefined && frame.width && frame.height) {
    context.drawImage(frame.sheetImage, frame.x, frame.y, frame.width, frame.height, 0, 0, width, height);
  } else {
    return undefined;
  }

  const pixels = context.getImageData(0, 0, width, height).data;
  const foregroundBounds = findForegroundBounds(pixels, width, height);
  if (!foregroundBounds || (foregroundBounds.pixels ?? 0) < 80) return undefined;
  const bodyBounds = findPrimaryBodyBounds(pixels, width, height, foregroundBounds);
  if (!bodyBounds) return undefined;

  return {
    width,
    height,
    source: frame.image ? 'frame-png-alpha' : 'sheet-crop-alpha',
    foregroundBounds,
    bodyBounds,
  };
}

function findForegroundBounds(pixels: Uint8ClampedArray, width: number, height: number): SpriteFrameBounds | undefined {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let foregroundPixels = 0;

  for (let pixel = 0; pixel < width * height; pixel += 1) {
    if (pixels[pixel * 4 + 3] <= 20) continue;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    foregroundPixels += 1;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  if (maxX < minX || maxY < minY) return undefined;
  return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1, pixels: foregroundPixels };
}

function findPrimaryBodyBounds(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  foregroundBounds: SpriteFrameBounds,
): SpriteFrameBounds | undefined {
  const visited = new Uint8Array(width * height);
  let primary: SpriteFrameBounds | undefined;
  let primaryScore = 0;
  const minimumBodyPixels = Math.max(48, Math.round((foregroundBounds.pixels ?? 0) * 0.08));

  for (let y = foregroundBounds.minY; y <= foregroundBounds.maxY; y += 1) {
    for (let x = foregroundBounds.minX; x <= foregroundBounds.maxX; x += 1) {
      const start = y * width + x;
      if (visited[start] || pixels[start * 4 + 3] <= 20) continue;
      const component = floodOpaqueComponent(pixels, width, height, start, visited);
      const componentPixels = component.pixels ?? 0;
      if (componentPixels < minimumBodyPixels) continue;
      const bottomWeight = 1 + component.maxY / Math.max(1, height);
      const score = componentPixels * bottomWeight;
      if (score > primaryScore) {
        primary = component;
        primaryScore = score;
      }
    }
  }

  return primary ?? foregroundBounds;
}

function floodOpaqueComponent(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  startPixel: number,
  visited: Uint8Array,
): SpriteFrameBounds {
  const queue = [startPixel];
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let componentPixels = 0;

  while (queue.length > 0) {
    const pixel = queue.pop();
    if (pixel === undefined || visited[pixel] || pixels[pixel * 4 + 3] <= 20) continue;
    visited[pixel] = 1;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    componentPixels += 1;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    if (x > 0) queue.push(pixel - 1);
    if (x < width - 1) queue.push(pixel + 1);
    if (y > 0) queue.push(pixel - width);
    if (y < height - 1) queue.push(pixel + width);
  }

  return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1, pixels: componentPixels };
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function minimumFrameCount(animationKey: string): number {
  if (['idle', 'ready', 'walk', 'run', 'dash'].includes(animationKey)) return 4;
  return 1;
}

const knownBrokenFrames = new Set([
  '/sprites/frames/shadow-striker-purple/walk/0005.png',
  '/sprites/frames/shadow-striker-purple/short_elbow/0005.png',
  '/sprites/frames/neo-operative-green/idle/0006.png',
]);

function shouldHealthCheckImage(context: AssetLoadContext): boolean {
  return context.kind === 'sprite-frame' || context.kind === 'explicit-frame';
}

function isSpriteFrameHealthy(image: HTMLImageElement): boolean {
  if (image.width < 48 || image.height < 48) return false;
  if (looksLikeContactSheetFrame(image.width, image.height)) return false;

  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return true;

  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const width = canvas.width;
  const height = canvas.height;
  let foreground = 0;
  let edgeOpaque = 0;
  let edgeDark = 0;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const alpha = pixels[offset + 3];
      if (alpha <= 20) continue;

      foreground += 1;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);

      const onEdge = x === 0 || y === 0 || x === width - 1 || y === height - 1;
      if (onEdge) {
        edgeOpaque += 1;
        const brightness = pixels[offset] + pixels[offset + 1] + pixels[offset + 2];
        if (brightness < 90) edgeDark += 1;
      }
    }
  }

  if (foreground < 120) return false;
  const fillRatio = foreground / (width * height);
  if (fillRatio < 0.012) return false;

  const edgePixelCount = width * 2 + height * 2 - 4;
  if (edgeOpaque / edgePixelCount > 0.34 && edgeDark / Math.max(1, edgeOpaque) > 0.7) return false;
  if (maxX < minX || maxY < minY) return false;

  const body = estimateCentralBodyOpacity(pixels, width, minX, minY, maxX, maxY);
  if (body.sampledPixels >= 64 && body.opaqueRatio < 0.14) return false;

  const alphaHoles = detectInternalAlphaHoles(pixels, width, height);
  if (alphaHoles.largestHolePixels > 220 || alphaHoles.totalHolePixels > 360) return false;

  return true;
}

function looksLikeContactSheetFrame(width: number, height: number): boolean {
  if (height <= 0) return true;
  return width > 300 || (width > 220 && width / height > 2.65);
}

function estimateCentralBodyOpacity(
  pixels: Uint8ClampedArray,
  width: number,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
): { sampledPixels: number; opaqueRatio: number } {
  const bodyMinX = Math.floor(minX + (maxX - minX) * 0.28);
  const bodyMaxX = Math.ceil(minX + (maxX - minX) * 0.72);
  const bodyMinY = Math.floor(minY + (maxY - minY) * 0.2);
  const bodyMaxY = Math.ceil(minY + (maxY - minY) * 0.82);
  let sampledPixels = 0;
  let opaquePixels = 0;

  for (let y = bodyMinY; y <= bodyMaxY; y += 1) {
    for (let x = bodyMinX; x <= bodyMaxX; x += 1) {
      sampledPixels += 1;
      if (pixels[(y * width + x) * 4 + 3] > 20) opaquePixels += 1;
    }
  }

  return { sampledPixels, opaqueRatio: opaquePixels / Math.max(1, sampledPixels) };
}

function detectInternalAlphaHoles(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): { alphaHoleCount: number; totalHolePixels: number; largestHolePixels: number } {
  const outside = new Uint8Array(width * height);
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];
  for (let x = 0; x < width; x += 1) {
    queue.push(x, (height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y += 1) {
    queue.push(y * width, y * width + width - 1);
  }

  while (queue.length > 0) {
    const pixel = queue.pop();
    if (pixel === undefined || outside[pixel] || pixels[pixel * 4 + 3] > 8) continue;
    outside[pixel] = 1;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    if (x > 0) queue.push(pixel - 1);
    if (x < width - 1) queue.push(pixel + 1);
    if (y > 0) queue.push(pixel - width);
    if (y < height - 1) queue.push(pixel + width);
  }

  let alphaHoleCount = 0;
  let totalHolePixels = 0;
  let largestHolePixels = 0;
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    if (visited[pixel] || outside[pixel] || pixels[pixel * 4 + 3] > 8) continue;
    const area = floodInternalTransparentArea(pixels, width, height, pixel, visited, outside);
    if (area < 2) continue;
    alphaHoleCount += 1;
    totalHolePixels += area;
    largestHolePixels = Math.max(largestHolePixels, area);
  }
  return { alphaHoleCount, totalHolePixels, largestHolePixels };
}

function floodInternalTransparentArea(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  startPixel: number,
  visited: Uint8Array,
  outside: Uint8Array,
): number {
  const queue = [startPixel];
  let area = 0;
  while (queue.length > 0) {
    const pixel = queue.pop();
    if (pixel === undefined || visited[pixel] || outside[pixel] || pixels[pixel * 4 + 3] > 8) continue;
    visited[pixel] = 1;
    area += 1;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    if (x > 0) queue.push(pixel - 1);
    if (x < width - 1) queue.push(pixel + 1);
    if (y > 0) queue.push(pixel - width);
    if (y < height - 1) queue.push(pixel + width);
  }
  return area;
}
