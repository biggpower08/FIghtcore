import { printSpriteCoverageReport } from '../data/spriteAnimations';
import { getAnimationEligibility, getGameplayReadyAnimationKeys } from '../data/animationEligibility';
import { isMoveEligibleForCharacter } from '../data/characterLoadouts';
import { moves } from '../data/moves';
import { spriteRegistry } from '../data/spriteRegistry';
import type { AssetLoader, ResolvedSpriteAnimation, ResolvedSpriteFrame } from '../game/AssetLoader';

const labEntityIds = [
  'cyber-ninja',
  'shadow-striker',
  'puppetmaster',
  'combat-monk',
  'cyber-monkey-grunt',
  'cyber-monkey-scrapper',
  'striker-monkey',
  'cyber-monkey-grappler',
  'cyber-monkey-alpha',
];

export class SpriteLab {
  private frameIndex = 0;
  private animation: ResolvedSpriteAnimation | null = null;
  private playbackId = 0;
  private readonly options = {
    checkerboard: true,
    ground: true,
    anchor: true,
    hitbox: true,
    hurtbox: true,
  };

  constructor(
    private readonly root: HTMLDivElement,
    private readonly assets: AssetLoader,
  ) {}

  show(onBack: () => void): void {
    this.root.classList.remove('hidden');
    this.root.innerHTML = `
      <section class="menu-panel sprite-lab-panel">
        <div class="sprite-lab-header">
          <div>
            <p class="eyebrow">Development Tool</p>
            <h2>Sprite Lab</h2>
          </div>
          <button data-action="back">Back</button>
        </div>
        <div class="sprite-lab-controls">
          <label><span>Entity</span><select data-field="entity"></select></label>
          <label><span>Animation</span><select data-field="animation"></select></label>
          <label><span>Move</span><select data-field="move"></select></label>
        </div>
        <div class="sprite-lab-toggles">
          <label><input type="checkbox" data-toggle="checkerboard" checked /> Checkerboard</label>
          <label><input type="checkbox" data-toggle="ground" checked /> Ground</label>
          <label><input type="checkbox" data-toggle="anchor" checked /> Anchor</label>
          <label><input type="checkbox" data-toggle="hitbox" checked /> Hitbox</label>
          <label><input type="checkbox" data-toggle="hurtbox" checked /> Hurtbox</label>
        </div>
        <div class="sprite-lab-stage">
          <canvas width="420" height="280"></canvas>
          <details data-field="debug-panel" open>
            <summary>Frame debug</summary>
            <pre data-field="info"></pre>
          </details>
        </div>
        <div class="menu-actions">
          <button data-action="play">Play</button>
          <button data-action="pause">Pause</button>
          <button data-action="next">Next Frame</button>
          <button data-action="background">Background Preview</button>
          <button data-action="asset-report">Asset Report</button>
          <button data-action="report">Coverage Report</button>
        </div>
      </section>
    `;

    const entitySelect = this.root.querySelector<HTMLSelectElement>('[data-field="entity"]');
    const animationSelect = this.root.querySelector<HTMLSelectElement>('[data-field="animation"]');
    const moveSelect = this.root.querySelector<HTMLSelectElement>('[data-field="move"]');
    if (!entitySelect || !animationSelect || !moveSelect) return;

    entitySelect.innerHTML = labEntityIds.map((id) => option(id, spriteRegistry.find((sprite) => sprite.id === id)?.id ?? id)).join('');
    const refreshAnimations = (): void => {
      const keys = getGameplayReadyAnimationKeys(entitySelect.value);
      animationSelect.innerHTML = keys.length > 0 ? keys.map((key) => option(key, key)).join('') : option('idle', 'idle fallback');
      moveSelect.innerHTML = `<option value="">Gameplay-ready moves</option>${moves
        .filter((move) => isMoveEligibleForCharacter(entitySelect.value, move))
        .map((move) => option(move.animationKey, move.name))
        .join('')}`;
    };

    const refresh = (): void => {
      void this.loadAndDraw(entitySelect.value, moveSelect.value || animationSelect.value);
    };

    refreshAnimations();
    refresh();

    entitySelect.addEventListener('change', () => {
      moveSelect.value = '';
      refreshAnimations();
      refresh();
    });
    animationSelect.addEventListener('change', () => {
      moveSelect.value = '';
      refresh();
    });
    moveSelect.addEventListener('change', refresh);

    this.root.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        if (action === 'back') onBack();
        if (action === 'play') this.play();
        if (action === 'pause') this.pause();
        if (action === 'next') {
          this.pause();
          this.frameIndex += 1;
          this.draw();
        }
        if (action === 'background') this.drawBackgroundPreview();
        if (action === 'asset-report') this.drawAssetReport();
        if (action === 'report') printSpriteCoverageReport();
      });
    });

    this.root.querySelectorAll<HTMLInputElement>('[data-toggle]').forEach((toggle) => {
      toggle.addEventListener('change', () => {
        const key = toggle.dataset.toggle as keyof typeof this.options;
        this.options[key] = toggle.checked;
        this.draw();
      });
    });
  }

  hide(): void {
    this.pause();
    this.root.classList.add('hidden');
    this.root.innerHTML = '';
    this.animation = null;
  }

  private async loadAndDraw(entityId: string, animationKey: string): Promise<void> {
    this.pause();
    this.animation = await this.assets.resolveAnimation(entityId, animationKey);
    this.frameIndex = 0;
    this.draw();
  }

  private play(): void {
    this.pause();
    if (!this.animation) return;
    if (this.animation.frames.length === 0) {
      this.draw();
      return;
    }
    this.playbackId = window.setInterval(() => {
      this.frameIndex += 1;
      this.draw();
    }, Math.max(70, this.animation.frames[this.frameIndex % this.animation.frames.length]?.durationMs ?? 120));
  }

  private pause(): void {
    if (!this.playbackId) return;
    window.clearInterval(this.playbackId);
    this.playbackId = 0;
  }

  private draw(): void {
    const canvas = this.root.querySelector<HTMLCanvasElement>('canvas');
    const info = this.root.querySelector<HTMLPreElement>('[data-field="info"]');
    if (!canvas || !info || !this.animation) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (this.options.checkerboard) this.drawCheckerboard(ctx, canvas.width, canvas.height);
    else {
      ctx.fillStyle = '#17120c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const frameCount = Math.max(1, this.animation.frames.length);
    const framePosition = this.frameIndex % frameCount;
    const frame = this.animation.frames[framePosition];
    const floorY = canvas.height / 2 + 74;
    if (this.options.ground) this.drawGroundLine(ctx, canvas.width, floorY);
    if (frame) this.drawFrame(ctx, frame, canvas.width / 2, floorY);
    else this.drawMissingImageFallback(ctx, canvas.width / 2, floorY, 'IMAGE LOAD FAILED');
    if (this.options.anchor) this.drawAnchor(ctx, canvas.width / 2, floorY);
    const alpha = frame ? this.getAlphaInfo(frame) : undefined;
    const imageStatus = this.getImageStatus(frame);

    info.textContent = JSON.stringify(
      {
        entityId: this.animation.entityId,
        animationKey: this.animation.animationKey,
        status: this.animation.status,
        frame: `${framePosition + 1}/${this.animation.frames.length}`,
        frameIndex: framePosition,
        sheetId: frame?.sheetId,
        sourceSheet: frame?.sheetPath,
        framePath: frame?.framePath,
        sourceKind: frame?.source,
        sourceDescription: this.describeFrameSource(frame),
        imageLoad: imageStatus,
        rawCropAvailable: frame?.rawCropAvailable,
        cleanedFrameAvailable: Boolean(frame?.framePath),
        frameDimensions: {
          width: frame?.width ?? frame?.image?.width,
          height: frame?.height ?? frame?.image?.height,
        },
        anchors: frame
          ? {
              anchorX: frame.anchorX,
              anchorY: frame.anchorY,
              feetY: frame.feetY,
            }
          : undefined,
        alpha,
        qa: frame ? this.getFrameQa(frame, alpha) : undefined,
        eligibility: getAnimationEligibility(this.animation.entityId, this.animation.animationKey),
        fallbackUsed: this.animation.status === 'fallback' || this.animation.status === 'missing',
        invalidFrame: frame ? this.isInvalidFrame(frame) : 'missing-frame',
        warning: frame && this.isInvalidFrame(frame) ? 'This frame looks like a source strip/contact sheet and is blocked from normal gameplay rendering.' : undefined,
        rect: frame?.x === undefined ? undefined : { x: frame.x, y: frame.y, width: frame.width, height: frame.height },
        notes: frame?.notes ?? this.animation.notes,
      },
      null,
      2,
    );
  }

  private drawFrame(ctx: CanvasRenderingContext2D, frame: ResolvedSpriteFrame, centerX: number, floorY: number): void {
    const sourceWidth = frame.width ?? frame.image?.width ?? 80;
    const sourceHeight = frame.height ?? frame.image?.height ?? 80;
    if (this.isInvalidFrame(frame)) {
      this.drawBadCropFallback(ctx, centerX, floorY, 'BAD FRAME CROP');
      return;
    }
    if (!this.isFrameImageReady(frame)) {
      this.drawMissingImageFallback(ctx, centerX, floorY, 'IMAGE LOAD FAILED');
      return;
    }
    const scale = Math.min(2.4, 230 / Math.max(sourceWidth, sourceHeight));
    const width = sourceWidth * scale;
    const height = sourceHeight * scale;
    const dx = centerX - width * frame.anchorX;
    const dy = floorY - height * frame.anchorY;

    if (this.options.hurtbox) {
      ctx.strokeStyle = 'rgba(56, 163, 255, 0.82)';
      ctx.lineWidth = 2;
      ctx.strokeRect(dx, dy, width, height);
    }
    if (this.options.hitbox) {
      ctx.strokeStyle = 'rgba(255, 237, 135, 0.82)';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - 46, floorY - 82, 92, 76);
    }

    try {
      if (frame.image) {
        ctx.drawImage(frame.image, dx, dy, width, height);
      } else if (frame.sheetImage && frame.x !== undefined && frame.y !== undefined && frame.width && frame.height) {
        ctx.drawImage(frame.sheetImage, frame.x, frame.y, frame.width, frame.height, dx, dy, width, height);
      } else {
        this.drawMissingImageFallback(ctx, centerX, floorY, 'IMAGE LOAD FAILED');
      }
    } catch (error) {
      console.error('Sprite Lab drawImage failed', {
        entityId: this.animation?.entityId,
        animationKey: this.animation?.animationKey,
        frameIndex: this.frameIndex,
        source: { x: frame.x, y: frame.y, width: frame.width, height: frame.height },
        destination: { x: dx, y: dy, width, height },
        image: this.getImageStatus(frame),
        error,
      });
      this.drawBadCropFallback(ctx, centerX, floorY, 'BAD FRAME CROP');
    }
  }

  private drawMissingImageFallback(ctx: CanvasRenderingContext2D, centerX: number, floorY: number, label: string): void {
    ctx.save();
    ctx.strokeStyle = '#ff4d4d';
    ctx.fillStyle = 'rgba(255, 77, 77, 0.12)';
    ctx.lineWidth = 3;
    ctx.strokeRect(centerX - 100, floorY - 140, 200, 110);
    ctx.fillRect(centerX - 100, floorY - 140, 200, 110);
    ctx.fillStyle = '#ffb4b4';
    ctx.font = '13px monospace';
    ctx.fillText(label, centerX - 74, floorY - 86);
    ctx.restore();
  }

  private drawBadCropFallback(ctx: CanvasRenderingContext2D, centerX: number, floorY: number, label: string): void {
    ctx.save();
    ctx.strokeStyle = '#ffef78';
    ctx.fillStyle = 'rgba(255, 239, 120, 0.12)';
    ctx.lineWidth = 3;
    ctx.strokeRect(centerX - 100, floorY - 140, 200, 110);
    ctx.fillRect(centerX - 100, floorY - 140, 200, 110);
    ctx.fillStyle = '#ffef78';
    ctx.font = '13px monospace';
    ctx.fillText(label, centerX - 66, floorY - 86);
    ctx.restore();
  }

  private drawCheckerboard(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const size = 16;
    for (let y = 0; y < height; y += size) {
      for (let x = 0; x < width; x += size) {
        ctx.fillStyle = (x / size + y / size) % 2 === 0 ? '#171f2a' : '#223041';
        ctx.fillRect(x, y, size, size);
      }
    }
  }

  private drawGroundLine(ctx: CanvasRenderingContext2D, width: number, floorY: number): void {
    ctx.strokeStyle = 'rgba(255, 238, 120, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(32, floorY);
    ctx.lineTo(width - 32, floorY);
    ctx.stroke();
  }

  private drawAnchor(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#ff4fd8';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#17120c';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  private getAlphaInfo(
    frame: ResolvedSpriteFrame,
  ):
    | {
        hasTransparency: boolean;
        transparentPixels: number;
        totalPixels: number;
        foregroundPixels: number;
        bounds?: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number };
      }
    | undefined {
    const image = frame.image ?? frame.sheetImage;
    if (!image) return undefined;
    const width = frame.width ?? image.width;
    const height = frame.height ?? image.height;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    if (frame.image) {
      ctx.drawImage(frame.image, 0, 0);
    } else if (frame.sheetImage && frame.x !== undefined && frame.y !== undefined && frame.width && frame.height) {
      ctx.drawImage(frame.sheetImage, frame.x, frame.y, frame.width, frame.height, 0, 0, width, height);
    }
    const data = ctx.getImageData(0, 0, width, height).data;
    let transparentPixels = 0;
    let foregroundPixels = 0;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    for (let index = 3; index < data.length; index += 4) {
      const alpha = data[index];
      const pixel = (index - 3) / 4;
      const x = pixel % width;
      const y = Math.floor(pixel / width);
      if (alpha < 255) transparentPixels += 1;
      if (alpha > 8) {
        foregroundPixels += 1;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
    const bounds = maxX >= minX ? { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 } : undefined;
    return { hasTransparency: transparentPixels > 0, transparentPixels, totalPixels: width * height, foregroundPixels, bounds };
  }

  private getFrameQa(
    frame: ResolvedSpriteFrame,
    alpha?: ReturnType<SpriteLab['getAlphaInfo']>,
  ): Record<string, string | boolean | number | undefined> {
    const width = frame.width ?? frame.image?.width ?? frame.sheetImage?.width;
    const height = frame.height ?? frame.image?.height ?? frame.sheetImage?.height;
    const bounds = alpha?.bounds;
    const anchorPixelY = height ? Math.round(height * frame.anchorY) : undefined;
    const groundGapPx = bounds && anchorPixelY !== undefined ? anchorPixelY - bounds.maxY : undefined;
    const fillRatio = alpha && width && height ? alpha.foregroundPixels / (width * height) : undefined;
    return {
      'is sprite hollow?': fillRatio !== undefined ? fillRatio < 0.06 : 'unknown',
      'does frame have transparency?': Boolean(alpha?.hasTransparency),
      'does frame have dark box?': alpha ? !alpha.hasTransparency || (fillRatio ?? 0) > 0.82 : 'unknown',
      'does sprite touch ground line?': groundGapPx !== undefined ? groundGapPx >= -2 && groundGapPx <= 10 : 'unknown',
      'feet position delta px': groundGapPx,
      'does current animation use fallback?': this.animation?.status === 'fallback' || this.animation?.status === 'missing',
      'frame bounds': bounds ? `${bounds.width}x${bounds.height}` : 'none',
      'does frame look like full strip?': this.isInvalidFrame(frame),
    };
  }

  private describeFrameSource(frame?: ResolvedSpriteFrame): string {
    if (!frame) return 'missing frame';
    if (frame.framePath) return 'explicit PNG frame';
    if (frame.sheetPath?.endsWith('-strip.png') && frame.x !== undefined) return 'prepared source-strip crop';
    if (frame.sheetPath && frame.x !== undefined) return 'sheet crop';
    if (frame.source === 'fallback') return 'procedural fallback';
    if (frame.source === 'missing') return 'missing asset fallback';
    return frame.source;
  }

  private getImageStatus(frame?: ResolvedSpriteFrame): {
    url?: string;
    status: 'loaded' | 'loading' | 'failed' | 'none';
    naturalWidth?: number;
    naturalHeight?: number;
  } {
    if (!frame) return { status: 'none' };
    const image = frame.image ?? frame.sheetImage;
    const url = frame.framePath ?? frame.sheetPath;
    if (!image) return { url, status: url ? 'failed' : 'none' };
    if (!image.complete) return { url, status: 'loading', naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight };
    if (image.naturalWidth <= 0 || image.naturalHeight <= 0) return { url, status: 'failed', naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight };
    return { url, status: 'loaded', naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight };
  }

  private isFrameImageReady(frame: ResolvedSpriteFrame): boolean {
    const status = this.getImageStatus(frame);
    if (frame.source === 'fallback' || frame.source === 'missing') return true;
    return status.status === 'loaded';
  }

  private isInvalidFrame(frame: ResolvedSpriteFrame): boolean {
    const width = frame.width ?? frame.image?.width ?? 0;
    const height = frame.height ?? frame.image?.height ?? 0;
    if (width <= 0 || height <= 0) return true;
    const imageWidth = frame.sheetImage?.width ?? frame.image?.width ?? width;
    const looksLikeFullStrip = Boolean(frame.sheetPath?.includes('/assets/fightcore/sprites/') && frame.sheetPath.endsWith('-strip.png') && width >= imageWidth && imageWidth > 180);
    const imageHeight = frame.sheetImage?.height ?? frame.image?.height ?? height;
    const outOfBounds =
      frame.sheetImage &&
      frame.x !== undefined &&
      frame.y !== undefined &&
      frame.width !== undefined &&
      frame.height !== undefined &&
      (frame.x < 0 || frame.y < 0 || frame.x + frame.width > imageWidth || frame.y + frame.height > imageHeight);
    return outOfBounds || looksLikeFullStrip || width > 300 || (width > 220 && width / height > 2.65);
  }

  private drawBackgroundPreview(): void {
    const canvas = this.root.querySelector<HTMLCanvasElement>('canvas');
    const info = this.root.querySelector<HTMLPreElement>('[data-field="info"]');
    if (!canvas || !info) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#b87935';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#7b4926';
    for (let x = -20; x < canvas.width; x += 70) {
      ctx.beginPath();
      ctx.moveTo(x, 60);
      ctx.lineTo(x + 38, 28);
      ctx.lineTo(x + 90, 60);
      ctx.closePath();
      ctx.fill();
    }

    for (let i = 0; i < 28; i += 1) {
      const x = 34 + ((i * 61) % (canvas.width - 68));
      const y = 82 + ((i * 43) % (canvas.height - 118));
      ctx.fillStyle = i % 2 === 0 ? '#f0bd70' : '#5f3419';
      ctx.globalAlpha = 0.24;
      ctx.fillRect(x, y, 26, 2);
    }
    ctx.globalAlpha = 1;

    this.previewBush(ctx, 196, 220);
    this.previewScrap(ctx, 268, 204);
    this.previewBones(ctx, 134, 116);

    info.textContent = JSON.stringify(
      {
        mode: 'background-preview',
        status: 'procedural-placeholder',
        layers: ['sand base', 'distant ridge', 'sand streaks', 'dead bushes', 'bones', 'cyber scrap'],
        reviewFocus: ['arena readability', 'prop spacing', 'movement-safe decoration', 'desert cyberpunk identity'],
        finalArtNeeded: ['sand tile', 'distant ridge layer', 'dead bush sprite', 'bone pile sprite', 'cyber scrap sprite'],
      },
      null,
      2,
    );
  }

  private drawAssetReport(): void {
    const info = this.root.querySelector<HTMLPreElement>('[data-field="info"]');
    if (!info) return;
    const report = this.assets.getAssetLoadReport();
    this.assets.printAssetLoadReport();
    info.textContent = JSON.stringify(report, null, 2);
  }

  private previewBush(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.strokeStyle = '#5b3219';
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (i - 3) * 8, y - 22 + (i % 2) * 7);
      ctx.stroke();
    }
  }

  private previewScrap(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#3a3e42';
    ctx.fillRect(x - 24, y - 9, 44, 14);
    ctx.fillStyle = '#23d5dd';
    ctx.fillRect(x - 16, y - 4, 22, 3);
  }

  private previewBones(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.strokeStyle = '#e3d3b9';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 20, y + 5);
    ctx.lineTo(x + 18, y - 5);
    ctx.moveTo(x - 10, y - 9);
    ctx.lineTo(x + 22, y + 9);
    ctx.stroke();
  }
}

function option(value: string, label: string): string {
  return `<option value="${value}">${label}</option>`;
}
