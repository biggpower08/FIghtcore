import { getSpriteAnimation, type SpriteAnimationDefinition, type SpriteFrameRef, type SpriteFrameSource } from '../data/spriteAnimations';
import { getSpriteAtlasAnimation, type SpriteAtlasAnimation } from '../data/spriteAtlases';
import { spriteRegistryById, spriteSourceSheetById } from '../data/spriteRegistry';
import { publicAssetUrl } from './publicAssetUrl';

export interface ResolvedSpriteFrame {
  source: SpriteFrameSource;
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
  notes?: string;
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
      const path = `/sprites/frames/${assetId}/${animation}/${String(frame).padStart(4, '0')}.png`;
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
      frames.push({
        source: 'atlas-crop',
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
      });
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
        .filter((path) => path.startsWith('/backgrounds/'))
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
    const images = await this.loadOptionalFrames(entityId, animationKey, 8);
    if (images.length === 0) return null;
    const expectedFrameCount = Math.min(8, definition?.frames.length ?? minimumFrameCount(animationKey));
    if (images.length < expectedFrameCount && getSpriteAtlasAnimation(entityId, animationKey)) {
      this.warnOnce(
        `atlas-better:${entityId}:${animationKey}`,
        `Sprite frame folder is incomplete or failed health checks for ${entityId}/${animationKey}; using atlas crop as the safer gameplay source.`,
      );
      return null;
    }
    const renderProfile = spriteRegistryById.get(entityId)?.render;

    const frames = images.map<ResolvedSpriteFrame>((image, index) => ({
      source: 'frame-png',
      durationMs: definition?.frames[index]?.durationMs ?? timingForAnimation(animationKey, index, images.length),
      image,
      framePath: `/sprites/frames/${entityId}/${animationKey}/${String(index + 1).padStart(4, '0')}.png`,
      anchorX: renderProfile?.anchorX ?? definition?.frames[index]?.anchorX ?? 0.5,
      anchorY: renderProfile?.anchorY ?? definition?.frames[index]?.anchorY ?? 0.86,
      feetY: renderProfile?.feetY,
      rawCropAvailable: Boolean(getSpriteAtlasAnimation(entityId, animationKey)?.frames[index]),
    }));

    return {
      entityId,
      animationKey,
      loop: definition?.loop ?? ['idle', 'ready', 'walk', 'run'].includes(animationKey),
      status: 'frame-png',
      frames,
      fallbackAnimation: definition?.fallbackAnimation,
      notes: 'Resolved from pre-sliced PNG frame folder.',
    };
  }

  private async resolveDefinition(definition: SpriteAnimationDefinition): Promise<ResolvedSpriteAnimation | null> {
    const frames: ResolvedSpriteFrame[] = [];

    for (const frame of definition.frames) {
      const resolved = await this.resolveFrameRef(frame);
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

  private async resolveFrameRef(frame: SpriteFrameRef): Promise<ResolvedSpriteFrame | null> {
    if (frame.framePath) {
      const image = await this.loadFrame(frame.framePath);
      if (!image) return null;
      return {
        source: 'frame-png',
        durationMs: frame.durationMs,
        image,
        framePath: frame.framePath,
        anchorX: frame.anchorX ?? 0.5,
        anchorY: frame.anchorY ?? 0.84,
        notes: frame.notes,
      };
    }

    if (frame.sheetId && frame.x !== undefined && frame.y !== undefined && frame.width && frame.height) {
      const sheetImage = await this.loadSheet(frame.sheetId);
      if (!sheetImage) return null;
      return {
        source: 'sheet-crop',
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
      };
    }

    return {
      source: 'fallback',
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
    jab: [85, 105, 120, 135],
    cross: [95, 115, 130, 150],
    low_kick: [95, 110, 130, 130, 145],
    roundhouse_kick: [105, 120, 135, 145, 135, 155],
    short_elbow: [95, 110, 130, 140, 150],
    shadow_counter: [105, 120, 135, 135, 150, 165],
    palm_strike: [95, 115, 130, 145, 155],
    spinning_kick: [105, 120, 135, 150, 160, 170],
    spinning_sweep: [125, 155, 170],
    slice: [95, 115, 135, 145, 155, 170],
    clinch_knee: [105, 125, 145, 155, 165],
    hip_throw: [115, 135, 150, 165, 175],
    o_goshi: [120, 145, 165, 180, 170],
    seoi_nage: [120, 145, 165, 180, 170],
    armbar: [125, 145, 165, 180, 185],
    double_leg_shot: [110, 130, 150, 165, 180, 190],
    double_leg_takedown: [110, 130, 150, 165, 180, 190],
    duck_under_mat_return_slam: [125, 145, 165, 185, 200],
    sprawl_counter: [110, 130, 150, 165, 180],
    claw_swipe: [95, 110, 125, 140, 155],
    claw_combo: [95, 110, 125, 140, 155, 170],
    ground_slam: [120, 135, 150, 170, 190, 175, 165],
  };

  if (animationKey === 'idle' || animationKey === 'ready') return 150;
  if (animationKey === 'walk' || animationKey === 'run') return 95;
  if (animationKey === 'dash') return 68;
  if (animationKey === 'hit_react') return 95;
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
