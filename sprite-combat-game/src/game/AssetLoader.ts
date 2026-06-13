import { getSpriteAnimation, type SpriteAnimationDefinition, type SpriteFrameRef, type SpriteFrameSource } from '../data/spriteAnimations';
import { spriteSourceSheetById } from '../data/spriteRegistry';

export interface ResolvedSpriteFrame {
  source: SpriteFrameSource;
  durationMs: number;
  image?: HTMLImageElement;
  sheetImage?: HTMLImageElement;
  sheetId?: string;
  framePath?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  anchorX: number;
  anchorY: number;
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

export class AssetLoader {
  private readonly images = new Map<string, HTMLImageElement>();
  private readonly missing = new Set<string>();
  private readonly frameCache = new Map<string, HTMLImageElement[]>();
  private readonly sheetCache = new Map<string, HTMLImageElement | null>();
  private readonly animationCache = new Map<string, ResolvedSpriteAnimation>();
  private readonly warnedMissing = new Set<string>();

  async loadImage(path: string): Promise<HTMLImageElement | null> {
    const cached = this.images.get(path);
    if (cached) return cached;
    if (this.missing.has(path)) return null;

    const image = new Image();
    image.src = path;

    const loaded = await new Promise<boolean>((resolve) => {
      image.onload = () => resolve(true);
      image.onerror = () => {
        this.missing.add(path);
        resolve(false);
      };
    });

    if (!loaded) return null;
    this.images.set(path, image);
    return image;
  }

  async loadFrames(character: string, move: string, frameCount = 4): Promise<HTMLImageElement[]> {
    const padded = (frame: number) => String(frame).padStart(4, '0');
    const paths = Array.from(
      { length: frameCount },
      (_, index) => `/sprites/frames/${character}/${move}/${padded(index + 1)}.png`,
    );
    const frames = await Promise.all(paths.map((path) => this.loadImage(path)));
    return frames.filter((frame): frame is HTMLImageElement => Boolean(frame));
  }

  async loadOptionalFrames(assetId: string, animation: string, frameCount = 4): Promise<HTMLImageElement[]> {
    const key = `${assetId}:${animation}`;
    const cached = this.frameCache.get(key);
    if (cached) return cached;

    const frames: HTMLImageElement[] = [];
    for (let frame = 1; frame <= frameCount; frame += 1) {
      const path = `/sprites/frames/${assetId}/${animation}/${String(frame).padStart(4, '0')}.png`;
      const image = await this.loadImage(path);
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

    const image = await this.loadImage(sheet.path);
    if (!image) this.warnOnce(`sheet-image:${sheetId}`, `Missing sprite sheet image: ${sheet.path}`);
    this.sheetCache.set(sheetId, image);
    return image;
  }

  async loadFrame(path: string): Promise<HTMLImageElement | null> {
    const image = await this.loadImage(path);
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
      (definition ? await this.resolveDefinition(definition) : null) ??
      fallbackAnimation(entityId, animationKey, definition);

    this.animationCache.set(cacheKey, resolved);
    return resolved;
  }

  getResolvedAnimation(entityId: string, animationKey: string): ResolvedSpriteAnimation | undefined {
    return this.animationCache.get(`${entityId}:${animationKey}`);
  }

  private async resolvePreSlicedFrames(
    entityId: string,
    animationKey: string,
    definition?: SpriteAnimationDefinition,
  ): Promise<ResolvedSpriteAnimation | null> {
    const images = await this.loadOptionalFrames(entityId, animationKey, 8);
    if (images.length === 0) return null;

    const frames = images.map<ResolvedSpriteFrame>((image, index) => ({
      source: 'frame-png',
      durationMs: definition?.frames[index]?.durationMs ?? 100,
      image,
      anchorX: definition?.frames[index]?.anchorX ?? 0.5,
      anchorY: definition?.frames[index]?.anchorY ?? 0.84,
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
        x: frame.x,
        y: frame.y,
        width: frame.width,
        height: frame.height,
        anchorX: frame.anchorX ?? 0.5,
        anchorY: frame.anchorY ?? 0.84,
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
}

function fallbackAnimation(
  entityId: string,
  animationKey: string,
  definition?: SpriteAnimationDefinition,
): ResolvedSpriteAnimation {
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
