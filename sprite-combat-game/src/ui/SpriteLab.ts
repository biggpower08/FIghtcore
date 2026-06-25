import { getKnownAnimationKeys, printSpriteCoverageReport } from '../data/spriteAnimations';
import { getAnimationEligibility } from '../data/animationEligibility';
import { getActiveRuntimeSpriteQa } from '../data/activeRuntimeSpriteQa';
import { characterLoadoutById } from '../data/characterLoadouts';
import { getFrameQuality } from '../data/frameQuality';
import { getCharacterVisualProfile } from '../data/characterVisualProfiles';
import { getCombatMoveProfileByAnimation } from '../data/combatMoveProfiles';
import { spriteRegistry } from '../data/spriteRegistry';
import type { AssetLoader, ResolvedSpriteAnimation, ResolvedSpriteFrame } from '../game/AssetLoader';

const coreLabEntityIds = [
  'ronin',
  'supreme-emperor',
  'monkey-grunt',
  'striker-monkey',
];

interface SpriteScaleDiagnostics {
  sourcePriority: string;
  visibleBodyHeight?: number;
  finalRenderedBodyHeight?: number;
  runtimeScale: number;
  characterVisualScale?: number;
  canonicalBodyHeight?: number;
  framePackTargetBodyHeight?: number;
  framePackManifestVisualScale?: number;
  framePackMetadataBodyHeight?: number;
  bodyBounds?: string;
  generatedPackBodyBounds?: string;
  baseline?: number;
  visibleBodyWidth?: number;
  widthToHeightRatio?: number;
  widthVsIdlePercent?: number;
  heightVsIdlePercent?: number;
  torsoCoreWidthEstimate?: number;
  legSpreadWidthEstimate?: number;
  feetSpanWidthEstimate?: number;
  approximateTorsoZone?: string;
  approximateLegZone?: string;
  approximateFeetSpanZone?: string;
  approximateArmReachZone?: string;
  warningBadges?: string[];
  isDoubleScaled: boolean;
}

function labEntityIds(scope: 'current' | 'legacy'): string[] {
  const registered = spriteRegistry.map((sprite) => sprite.id);
  if (scope === 'current') return coreLabEntityIds;
  return [...new Set(registered)].filter((id) => !coreLabEntityIds.includes(id));
}

function estimateHoldCount(frames: ResolvedSpriteFrame[], framePosition: number): number {
  const durations = frames.map((frame) => frame.durationMs).filter((duration) => duration > 0);
  const base = Math.min(...durations);
  if (!Number.isFinite(base) || base <= 0) return 1;
  return Math.max(1, Math.round((frames[framePosition]?.durationMs ?? base) / base));
}

export class SpriteLab {
  private frameIndex = 0;
  private animation: ResolvedSpriteAnimation | null = null;
  private playbackId = 0;
  private readonly options = {
    checkerboard: true,
    whiteBackground: false,
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
          <label><span>Scope</span><select data-field="scope">
            <option value="current">Current</option>
            <option value="legacy">Dev/Legacy</option>
          </select></label>
          <label><span>Entity</span><select data-field="entity"></select></label>
          <label><span>Animation / Move</span><select data-field="animation"></select></label>
        </div>
        <div class="sprite-lab-toggles">
          <label><input type="checkbox" data-toggle="checkerboard" checked /> Checkerboard</label>
          <label><input type="checkbox" data-toggle="whiteBackground" /> White background</label>
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

    const scopeSelect = this.root.querySelector<HTMLSelectElement>('[data-field="scope"]');
    const entitySelect = this.root.querySelector<HTMLSelectElement>('[data-field="entity"]');
    const animationSelect = this.root.querySelector<HTMLSelectElement>('[data-field="animation"]');
    if (!scopeSelect || !entitySelect || !animationSelect) return;

    const refreshEntities = (): void => {
      const scope = scopeSelect.value === 'legacy' ? 'legacy' : 'current';
      entitySelect.innerHTML = labEntityIds(scope).map((id) => option(id, spriteRegistry.find((sprite) => sprite.id === id)?.id ?? id)).join('');
    };
    const refreshAnimations = (): void => {
      const keys = getKnownAnimationKeys(entitySelect.value);
      animationSelect.innerHTML =
        keys.length > 0
          ? keys.map((key) => option(key, `${key} (${getAnimationEligibility(entitySelect.value, key).health})`)).join('')
          : option('idle', 'idle fallback');
    };

    const refresh = (): void => {
      void this.loadAndDraw(entitySelect.value, animationSelect.value);
    };

    refreshEntities();
    refreshAnimations();
    refresh();

    scopeSelect.addEventListener('change', () => {
      refreshEntities();
      refreshAnimations();
      refresh();
    });
    entitySelect.addEventListener('change', () => {
      refreshAnimations();
      refresh();
    });
    animationSelect.addEventListener('change', refresh);

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
    const step = (): void => {
      if (!this.animation) return;
      this.frameIndex += 1;
      this.draw();
      this.playbackId = window.setTimeout(step, Math.max(45, this.animation.frames[this.frameIndex % this.animation.frames.length]?.durationMs ?? 120));
    };
    this.playbackId = window.setTimeout(step, Math.max(45, this.animation.frames[this.frameIndex % this.animation.frames.length]?.durationMs ?? 120));
  }

  private pause(): void {
    if (!this.playbackId) return;
    window.clearTimeout(this.playbackId);
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
    if (this.options.whiteBackground) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (this.options.checkerboard) this.drawCheckerboard(ctx, canvas.width, canvas.height);
    else {
      ctx.fillStyle = '#17120c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const frameCount = Math.max(1, this.animation.frames.length);
    const framePosition = this.frameIndex % frameCount;
    const frame = this.animation.frames[framePosition];
    const frameQuality = frame ? getFrameQuality(this.animation.entityId, this.animation.animationKey, framePosition) : undefined;
    const floorY = canvas.height / 2 + 74;
    if (this.options.ground) this.drawGroundLine(ctx, canvas.width, floorY);
    if (frame) this.drawFrame(ctx, frame, canvas.width / 2, floorY, framePosition);
    else this.drawMissingImageFallback(ctx, canvas.width / 2, floorY, 'IMAGE LOAD FAILED');
    if (this.options.anchor) this.drawAnchor(ctx, canvas.width / 2, floorY);
    const alpha = frame ? this.getAlphaInfo(frame) : undefined;
    const imageStatus = this.getImageStatus(frame);
    const scaleDiagnostics = frame ? this.getScaleDiagnostics(frame, alpha) : undefined;
    const warningBadges = frame ? this.getProportionWarningBadges(frame, scaleDiagnostics, alpha, framePosition) : [];
    const combatProfile = getCombatMoveProfileByAnimation(this.animation.animationKey);
    const manualOverridePath = `C:\\dev\\FIghtcore-codex-work\\sprite-combat-game\\public\\sprites\\manual-overrides\\${this.animation.entityId}\\${this.animation.animationKey}\\${String(framePosition + 1).padStart(4, '0')}.png`;
    const activeRuntimeQa = getActiveRuntimeSpriteQa(this.animation.entityId, this.animation.animationKey);
    const equippedSlot = characterLoadoutById.get(this.animation.entityId)?.slots.find((slot) => slot.moveId === this.animation?.animationKey);

    info.textContent = JSON.stringify(
      {
        entityId: this.animation.entityId,
        animationKey: this.animation.animationKey,
        status: this.animation.status,
        frame: `${framePosition + 1}/${this.animation.frames.length}`,
        expectedFrameCount: this.animation.frames.length,
        actualRuntimeFrameCount: this.animation.frames.length,
        frameIndex: framePosition,
        frameDurationMs: frame?.durationMs,
        gameplayEnabled: Boolean(equippedSlot),
        gameplaySlot: equippedSlot?.key,
        activeRuntimeQaStatus: activeRuntimeQa?.verdict,
        activeRuntimeReadinessBadge: activeRuntimeQa?.readinessBadge,
        notGameplayReady: activeRuntimeQa?.verdict === 'NOT_GAMEPLAY_READY',
        activeRuntimeQaFolder: activeRuntimeQa?.qaFolder,
        activeRuntimeQaChecks: activeRuntimeQa
          ? {
              transparentStrip: `${activeRuntimeQa.qaFolder}/active-runtime-transparent-strip.png`,
              whiteCheck: `${activeRuntimeQa.qaFolder}/active-runtime-white-check.png`,
              darkCheck: `${activeRuntimeQa.qaFolder}/active-runtime-dark-check.png`,
              tealCheck: `${activeRuntimeQa.qaFolder}/active-runtime-teal-check.png`,
              redCheck: `${activeRuntimeQa.qaFolder}/active-runtime-red-check.png`,
              report: `${activeRuntimeQa.qaFolder}/active-runtime-alpha-hole-report.json`,
              summary: `${activeRuntimeQa.qaFolder}/active-runtime-cleanliness-summary.json`,
            }
          : undefined,
        activeRuntimeFailedFrames: activeRuntimeQa?.failedFrames,
        activeRuntimeUnusableFrames: activeRuntimeQa?.unusableFrames,
        activeRuntimeFrameStatuses: activeRuntimeQa?.frameStatuses,
        currentFrameVisualQa: activeRuntimeQa?.frameStatuses[framePosition],
        activeRuntimeSource: activeRuntimeQa?.activeRuntimeSources,
        activeRuntimeFramePath: activeRuntimeQa?.activeRuntimeFramePaths[framePosition],
        frameHoldCount: frame?.generatedPackHoldCount ?? estimateHoldCount(this.animation.frames, framePosition),
        activeHitboxFrames60fps: combatProfile?.activeFrames,
        visualActiveFrames: combatProfile?.visualActiveFrames,
        currentFrameIsVisualActive: combatProfile?.visualActiveFrames?.includes(framePosition + 1) ?? false,
        impactFrame: combatProfile?.impactFrame,
        placeholderFrames: this.animation.frames
          .filter((candidate) => candidate.placeholderFrame)
          .map((candidate) => ({
            frame: (candidate.frameIndex ?? 0) + 1,
            from: candidate.placeholderFromFrameIndex !== undefined ? candidate.placeholderFromFrameIndex + 1 : undefined,
            missing: candidate.missingFramePath,
            reason: candidate.placeholderReason,
          })),
        currentFramePlaceholder: Boolean(frame?.placeholderFrame),
        placeholderFromFrame: frame?.placeholderFromFrameIndex !== undefined ? frame.placeholderFromFrameIndex + 1 : undefined,
        missingFramePath: frame?.missingFramePath,
        sheetId: frame?.sheetId,
        sourceSheet: frame?.sheetPath,
        framePath: frame?.framePath,
        manualOverridePath,
        currentFrameManualOverridePath: activeRuntimeQa?.manualOverridePaths[framePosition] ?? manualOverridePath,
        currentSourcePriorityLabel: scaleDiagnostics?.sourcePriority,
        proportionWarningBadges: warningBadges,
        sourceKind: frame?.source,
        sourceDescription: this.describeFrameSource(frame),
        imageLoad: imageStatus,
        rawCropAvailable: frame?.rawCropAvailable,
        cleanedFrameAvailable: Boolean(frame?.cleanedFrameAvailable),
        referenceFrameAvailable: Boolean(frame?.referenceFrameAvailable),
        usingReferenceExtracted: Boolean(frame?.usingReferenceExtracted),
        referenceSourceSheet: frame?.referenceSourceSheet,
        referenceCrop: frame?.referenceCrop,
        referenceBaselineY: frame?.referenceBaselineY,
        referenceBackgroundRemoved: frame?.referenceBackgroundRemoved,
        repairedFrameAvailable: Boolean(frame?.repairedFrameAvailable),
        usingRepairedAlpha: Boolean(frame?.usingRepairedAlpha),
        invalidHollowFrame: Boolean(frameQuality?.invalidHollowFrame),
        hasAdjacentFrameBleed: Boolean(frameQuality?.hasAdjacentFrameBleed),
        bleedFromNextFrame: Boolean(frameQuality?.bleedFromNextFrame),
        alphaHoleCount: frameQuality?.alphaHoleCount ?? 0,
        repairedAlphaHoles: frameQuality?.repairedAlphaHoles ?? 0,
        lightArtifactPixels: frameQuality?.lightArtifactPixels ?? 0,
        qaRecommendation: frameQuality?.recommendation,
        frameDimensions: {
          width: frame?.width ?? frame?.image?.width,
          height: frame?.height ?? frame?.image?.height,
        },
        anchors: frame
          ? {
              anchorX: frame.anchorX,
              anchorY: frame.anchorY,
              feetY: frame.feetY,
              bodyAnchorComputed: Boolean(frame.bodyAnchorComputed),
              bodyAnchorSource: frame.bodyAnchorSource,
            }
          : undefined,
        foregroundBounds: frame?.foregroundBounds,
        bodyBounds: frame?.bodyBounds,
        scaleDiagnostics,
        bodyHeightComparison: this.getBodyHeightComparison(scaleDiagnostics?.finalRenderedBodyHeight),
        alpha,
        frameQuality,
        qa: frame ? this.getFrameQa(frame, alpha, framePosition) : undefined,
        eligibility: getAnimationEligibility(this.animation.entityId, this.animation.animationKey),
        visualProfile: getCharacterVisualProfile(this.animation.entityId),
        combatProfile,
        fallbackUsed: this.animation.status === 'fallback' || this.animation.status === 'missing',
        invalidFrame: frame ? this.isInvalidFrame(frame, framePosition) : 'missing-frame',
        warning:
          frame?.placeholderFrame
            ? `Frame ${framePosition + 1} is a placeholder copied from frame ${(frame.placeholderFromFrameIndex ?? 0) + 1}; replace ${frame.missingFramePath ?? 'the missing slot'} with a manual override when ready.`
            : 
          frame && this.isInvalidFrame(frame, framePosition)
            ? frameQuality?.invalidMultiPoseFrame || frameQuality?.multiPoseCrop
              ? 'This body frame contains multiple poses and is blocked from gameplay-ready rendering.'
              : frameQuality?.invalidHollowFrame
                ? 'This body frame has a large enclosed transparent body gap and is blocked from gameplay-ready rendering.'
              : 'This frame looks like a source strip/contact sheet and is blocked from normal gameplay rendering.'
            : warningBadges.length > 0
              ? `Proportion warnings: ${warningBadges.join(', ')}`
              : undefined,
        rect: frame?.x === undefined ? undefined : { x: frame.x, y: frame.y, width: frame.width, height: frame.height },
        notes: frame?.notes ?? this.animation.notes,
      },
      null,
      2,
    );
  }

  private drawFrame(
    ctx: CanvasRenderingContext2D,
    frame: ResolvedSpriteFrame,
    centerX: number,
    floorY: number,
    framePosition: number,
  ): void {
    const sourceWidth = frame.width ?? frame.image?.width ?? 80;
    const sourceHeight = frame.height ?? frame.image?.height ?? 80;
    const frameQuality = this.animation
      ? getFrameQuality(this.animation.entityId, this.animation.animationKey, framePosition)
      : undefined;
    if (this.isInvalidFrame(frame, framePosition)) {
      this.drawBadCropFallback(
        ctx,
        centerX,
        floorY,
        frameQuality?.invalidMultiPoseFrame || frameQuality?.multiPoseCrop
          ? 'BAD MULTI-POSE CROP'
          : frameQuality?.invalidHollowFrame
            ? 'BAD HOLLOW FRAME'
            : 'BAD FRAME CROP',
      );
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
    const visualProfile = this.animation ? getCharacterVisualProfile(this.animation.entityId) : undefined;
    const combatProfile = this.animation ? getCombatMoveProfileByAnimation(this.animation.animationKey) : undefined;

    if (this.options.hurtbox) {
      ctx.strokeStyle = 'rgba(35, 213, 221, 0.82)';
      ctx.lineWidth = 2;
      ctx.strokeRect(dx, dy, width, height);
      if (visualProfile) {
        ctx.strokeStyle = 'rgba(56, 163, 255, 0.9)';
        ctx.strokeRect(centerX - visualProfile.hurtboxSize.w / 2, floorY - visualProfile.hurtboxSize.h, visualProfile.hurtboxSize.w, visualProfile.hurtboxSize.h);
        ctx.strokeStyle = 'rgba(255, 110, 90, 0.9)';
        ctx.strokeRect(centerX - visualProfile.collisionSize.w / 2, floorY - visualProfile.collisionSize.h, visualProfile.collisionSize.w, visualProfile.collisionSize.h);
      }
    }
    if (this.options.hitbox) {
      const active = combatProfile?.visualActiveFrames?.includes(framePosition + 1) ?? combatProfile?.activeFrames.includes(framePosition + 1) ?? false;
      ctx.strokeStyle = active ? 'rgba(255, 237, 135, 0.96)' : 'rgba(255, 237, 135, 0.36)';
      ctx.fillStyle = active ? 'rgba(255, 237, 135, 0.16)' : 'rgba(255, 237, 135, 0.06)';
      ctx.lineWidth = 2;
      const hitbox = combatProfile?.hitbox ?? { x: 46, y: -82, w: 92, h: 76 };
      const hitboxX = centerX + hitbox.x - hitbox.w / 2;
      const hitboxY = floorY + hitbox.y - hitbox.h / 2;
      ctx.fillRect(hitboxX, hitboxY, hitbox.w, hitbox.h);
      ctx.strokeRect(hitboxX, hitboxY, hitbox.w, hitbox.h);
    }
    this.drawProportionOverlay(ctx, centerX, floorY, frame, width, height);

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

  private drawProportionOverlay(ctx: CanvasRenderingContext2D, centerX: number, floorY: number, frame: ResolvedSpriteFrame, width: number, height: number): void {
    if (!this.options.hurtbox || !frame.bodyBounds) return;
    const sourceWidth = Math.max(1, frame.width ?? frame.image?.width ?? width);
    const sourceHeight = Math.max(1, frame.height ?? frame.image?.height ?? height);
    const scaleX = width / sourceWidth;
    const scaleY = height / sourceHeight;
    const left = centerX - width * frame.anchorX + frame.bodyBounds.minX * scaleX;
    const top = floorY - height * frame.anchorY + frame.bodyBounds.minY * scaleY;
    const bodyWidth = frame.bodyBounds.width * scaleX;
    const bodyHeight = frame.bodyBounds.height * scaleY;
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(173, 86, 255, 0.72)';
    ctx.strokeRect(left, top, bodyWidth, bodyHeight);
    ctx.strokeStyle = 'rgba(99, 247, 166, 0.72)';
    ctx.strokeRect(left + bodyWidth * 0.18, top + bodyHeight * 0.22, bodyWidth * 0.64, bodyHeight * 0.34);
    ctx.strokeStyle = 'rgba(255, 176, 90, 0.72)';
    ctx.strokeRect(left + bodyWidth * 0.12, top + bodyHeight * 0.56, bodyWidth * 0.76, bodyHeight * 0.42);
    ctx.strokeStyle = 'rgba(255, 92, 92, 0.78)';
    ctx.strokeRect(left + bodyWidth * 0.04, top + bodyHeight * 0.84, bodyWidth * 0.92, bodyHeight * 0.16);
    ctx.restore();
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
    framePosition = 0,
  ): Record<string, string | boolean | number | undefined> {
    const width = frame.width ?? frame.image?.width ?? frame.sheetImage?.width;
    const height = frame.height ?? frame.image?.height ?? frame.sheetImage?.height;
    const bounds = alpha?.bounds;
    const anchorPixelY = height ? Math.round(height * frame.anchorY) : undefined;
    const groundGapPx = bounds && anchorPixelY !== undefined ? anchorPixelY - bounds.maxY : undefined;
    const fillRatio = alpha && width && height ? alpha.foregroundPixels / (width * height) : undefined;
    const frameQuality = this.animation ? getFrameQuality(this.animation.entityId, this.animation.animationKey, framePosition) : undefined;
    return {
      'is sprite hollow?': fillRatio !== undefined ? fillRatio < 0.06 : 'unknown',
      'does frame have transparency?': Boolean(alpha?.hasTransparency),
      'does frame have dark box?': alpha ? !alpha.hasTransparency || (fillRatio ?? 0) > 0.82 : 'unknown',
      'does sprite touch ground line?': groundGapPx !== undefined ? groundGapPx >= -2 && groundGapPx <= 10 : 'unknown',
      'feet position delta px': groundGapPx,
      'body anchor computed': Boolean(frame.bodyAnchorComputed),
      'body anchor source': frame.bodyAnchorSource,
      'foreground bounds': frame.foregroundBounds ? `${frame.foregroundBounds.width}x${frame.foregroundBounds.height}` : undefined,
      'body bounds': frame.bodyBounds ? `${frame.bodyBounds.width}x${frame.bodyBounds.height}` : undefined,
      'does current animation use fallback?': this.animation?.status === 'fallback' || this.animation?.status === 'missing',
      'frame bounds': bounds ? `${bounds.width}x${bounds.height}` : 'none',
      'does frame look like full strip?': this.isInvalidFrame(frame, framePosition),
      'invalidMultiPoseFrame': Boolean(frameQuality?.invalidMultiPoseFrame),
      'multiPoseCrop': Boolean(frameQuality?.multiPoseCrop),
      'invalidHollowFrame': Boolean(frameQuality?.invalidHollowFrame),
      'hasAdjacentFrameBleed': Boolean(frameQuality?.hasAdjacentFrameBleed),
      'bleedFromNextFrame': Boolean(frameQuality?.bleedFromNextFrame),
      'disconnected neighbor blob': Boolean(frameQuality?.disconnectedNeighborBlob),
      'alphaHoleCount': frameQuality?.alphaHoleCount ?? 0,
      'repairedAlphaHoles': frameQuality?.repairedAlphaHoles ?? 0,
      'light artifact pixels': frameQuality?.lightArtifactPixels ?? 0,
      'QA recommendation': frameQuality?.recommendation,
      'using repaired alpha': Boolean(frame.usingRepairedAlpha || frameQuality?.usingRepairedAlpha),
      'frame source': frameQuality?.frameSource ?? frame.source,
      'source sheet': frameQuality?.sourceSheet,
      'crop box': frameQuality?.cropBox,
      'baseline y': frameQuality?.baselineY,
      'reference frame size': frameQuality?.frameSize,
      'background removed': frameQuality?.backgroundRemoved,
      'component count': frameQuality?.componentCount,
      'silhouette count': frameQuality?.silhouetteCount,
      'width outlier': Boolean(frameQuality?.widthOutlier),
      'frame role': frameQuality?.role,
    };
  }

  private getScaleDiagnostics(
    frame: ResolvedSpriteFrame,
    alpha?: ReturnType<SpriteLab['getAlphaInfo']>,
  ): SpriteScaleDiagnostics {
    const profile = this.animation ? getCharacterVisualProfile(this.animation.entityId) : undefined;
    const visibleBodyHeight = frame.bodyBounds?.height ?? alpha?.bounds?.height;
    const visibleBodyWidth = frame.bodyBounds?.width ?? alpha?.bounds?.width;
    const widthToHeightRatio = visibleBodyHeight && visibleBodyWidth ? visibleBodyWidth / visibleBodyHeight : undefined;
    const torsoCoreWidthEstimate = frame.bodyBounds ? Math.round(frame.bodyBounds.width * 0.64) : undefined;
    const legSpreadWidthEstimate = frame.bodyBounds ? Math.round(frame.bodyBounds.width * 0.76) : undefined;
    const feetSpanWidthEstimate = frame.bodyBounds ? Math.round(frame.bodyBounds.width * 0.92) : undefined;
    const normalizedPackBodyHeight = frame.generatedPackBodyBounds?.h ?? frame.generatedPackTargetBodyHeight;
    const runtimeScale =
      frame.usingGeneratedPackFrame || frame.framePath?.startsWith('/sprites/frames-pack/')
        ? visibleBodyHeight && profile
          ? profile.canonicalBodyHeight / visibleBodyHeight
          : 1
        : profile?.visualScale ?? 1;
    const finalRenderedBodyHeight = visibleBodyHeight ? visibleBodyHeight * runtimeScale : undefined;
    return {
      sourcePriority: this.describeFrameSource(frame),
      visibleBodyHeight,
      finalRenderedBodyHeight,
      runtimeScale,
      characterVisualScale: profile?.visualScale,
      canonicalBodyHeight: profile?.canonicalBodyHeight,
      framePackTargetBodyHeight: frame.generatedPackTargetBodyHeight,
      framePackManifestVisualScale: frame.generatedPackVisualScale,
      framePackMetadataBodyHeight: normalizedPackBodyHeight,
      bodyBounds: frame.bodyBounds ? `${frame.bodyBounds.width}x${frame.bodyBounds.height}` : undefined,
      generatedPackBodyBounds: frame.generatedPackBodyBounds
        ? `${frame.generatedPackBodyBounds.w}x${frame.generatedPackBodyBounds.h}`
        : undefined,
      baseline: frame.feetY ?? frame.referenceBaselineY,
      visibleBodyWidth,
      widthToHeightRatio,
      widthVsIdlePercent: visibleBodyWidth && profile ? Math.round((visibleBodyWidth / Math.max(1, profile.bodyBounds.w)) * 100) : undefined,
      heightVsIdlePercent: visibleBodyHeight && profile ? Math.round((visibleBodyHeight / Math.max(1, profile.canonicalBodyHeight)) * 100) : undefined,
      torsoCoreWidthEstimate,
      legSpreadWidthEstimate,
      feetSpanWidthEstimate,
      approximateTorsoZone: frame.bodyBounds
        ? `${Math.round(frame.bodyBounds.minX + frame.bodyBounds.width * 0.18)},${Math.round(frame.bodyBounds.minY + frame.bodyBounds.height * 0.22)} ${Math.round(frame.bodyBounds.width * 0.64)}x${Math.round(frame.bodyBounds.height * 0.34)}`
        : undefined,
      approximateLegZone: frame.bodyBounds
        ? `${Math.round(frame.bodyBounds.minX + frame.bodyBounds.width * 0.12)},${Math.round(frame.bodyBounds.minY + frame.bodyBounds.height * 0.56)} ${Math.round(frame.bodyBounds.width * 0.76)}x${Math.round(frame.bodyBounds.height * 0.42)}`
        : undefined,
      approximateFeetSpanZone: frame.bodyBounds
        ? `${Math.round(frame.bodyBounds.minX + frame.bodyBounds.width * 0.04)},${Math.round(frame.bodyBounds.minY + frame.bodyBounds.height * 0.84)} ${Math.round(frame.bodyBounds.width * 0.92)}x${Math.round(frame.bodyBounds.height * 0.16)}`
        : undefined,
      approximateArmReachZone: frame.bodyBounds
        ? `${frame.bodyBounds.minX},${Math.round(frame.bodyBounds.minY + frame.bodyBounds.height * 0.18)} ${frame.bodyBounds.width}x${Math.round(frame.bodyBounds.height * 0.38)}`
        : undefined,
      warningBadges: this.getProportionWarningBadges(frame, undefined, alpha),
      isDoubleScaled: Boolean((frame.usingGeneratedPackFrame || frame.framePath?.startsWith('/sprites/frames-pack/')) && profile && profile.visualScale < 0.5),
    };
  }

  private getProportionWarningBadges(
    frame: ResolvedSpriteFrame,
    diagnostics?: SpriteScaleDiagnostics,
    alpha?: ReturnType<SpriteLab['getAlphaInfo']>,
    framePosition = 0,
  ): string[] {
    const profile = this.animation ? getCharacterVisualProfile(this.animation.entityId) : undefined;
    const frameQuality = this.animation ? getFrameQuality(this.animation.entityId, this.animation.animationKey, framePosition) : undefined;
    const bodyHeight = diagnostics?.visibleBodyHeight ?? frame.bodyBounds?.height ?? alpha?.bounds?.height;
    const bodyWidth = diagnostics?.visibleBodyWidth ?? frame.bodyBounds?.width ?? alpha?.bounds?.width;
    const baseline = diagnostics?.baseline ?? frame.feetY ?? frame.referenceBaselineY;
    const badges: string[] = [];
    if (bodyHeight && profile) {
      const heightRatio = bodyHeight / Math.max(1, profile.canonicalBodyHeight);
      if (heightRatio < 0.9 || heightRatio > 1.1) badges.push('height mismatch');
    }
    if (bodyWidth && profile) {
      const widthRatio = bodyWidth / Math.max(1, profile.bodyBounds.w);
      const widePose = this.animation ? /kick|sweep|dash|tornado/.test(this.animation.animationKey) : false;
      if (widthRatio < 0.8 || widthRatio > (widePose ? 2.25 : 1.45)) badges.push('width mismatch');
      const ratio = bodyHeight ? bodyWidth / bodyHeight : undefined;
      const idleRatio = profile.bodyBounds.w / Math.max(1, profile.canonicalBodyHeight);
      if (ratio && idleRatio > 0) {
        const ratioVsIdle = ratio / idleRatio;
        if (ratioVsIdle < 0.85 || ratioVsIdle > (widePose ? 1.9 : 1.15)) badges.push('ratio mismatch');
      }
      const torsoRatio = bodyWidth * 0.64 / Math.max(1, profile.bodyBounds.w * 0.64);
      if (torsoRatio < 0.85 || torsoRatio > 1.15) badges.push('torso mismatch');
      const feetSpanRatio = bodyWidth * 0.92 / Math.max(1, profile.bodyBounds.w * 0.92);
      if (feetSpanRatio > (widePose ? 2.1 : 1.45)) badges.push('leg spread warning');
    }
    if (baseline !== undefined && frame.height && Math.abs(baseline - frame.height * frame.anchorY) > 4) badges.push('baseline mismatch');
    if (alpha?.bounds && frame.height && (alpha.bounds.minY <= 1 || alpha.bounds.maxY >= frame.height - 2)) badges.push('crop risk');
    if (frame.placeholderFrame || this.animation?.status === 'fallback' || this.animation?.status === 'missing') badges.push('source priority mismatch');
    if (frame.usingCleanedAlphaFrame && (frameQuality?.hasAdjacentFrameBleed || frameQuality?.disconnectedNeighborBlob || frameQuality?.invalidHollowFrame)) badges.push('cleanup risk');
    if ((frameQuality?.alphaHoleCount ?? 0) > 0) badges.push('alpha-hole warning');
    if ((frameQuality?.lightArtifactPixels ?? 0) > 0) badges.push('white-fringe warning');
    if (badges.some((badge) => ['width mismatch', 'ratio mismatch', 'torso mismatch', 'leg spread warning'].includes(badge))) badges.push('source-art likely issue');
    return [...new Set(badges)];
  }

  private getBodyHeightComparison(currentFinalBodyHeight?: number): Record<string, number | undefined> {
    return {
      'Ronin target': getCharacterVisualProfile('ronin').canonicalBodyHeight,
      'Supreme Emperor target': getCharacterVisualProfile('supreme-emperor').canonicalBodyHeight,
      'Monkey Grunt target': getCharacterVisualProfile('monkey-grunt').canonicalBodyHeight,
      'Monkey Striker target': getCharacterVisualProfile('striker-monkey').canonicalBodyHeight,
      'Current final rendered body height': currentFinalBodyHeight,
    };
  }

  private describeFrameSource(frame?: ResolvedSpriteFrame): string {
    if (!frame) return 'missing frame';
    if (frame.usingManualOverrideFrame || frame.framePath?.startsWith('/sprites/manual-overrides/')) return 'manual override PNG frame';
    if (frame.usingRepairedAlpha || frame.framePath?.startsWith('/sprites/frames-alpha-repaired/')) return 'repaired alpha-hole PNG frame';
    if (frame.usingCleanedAlphaFrame || frame.framePath?.startsWith('/sprites/frames-cleaned/')) return 'alpha-cleaned PNG frame';
    if (frame.usingGeneratedPackFrame || frame.framePath?.startsWith('/sprites/frames-pack/')) return 'normalized sprite-pack PNG frame';
    if (frame.usingReferenceExtracted || frame.framePath?.startsWith('/sprites/frames-reference/')) return 'reference-extracted PNG frame';
    if (frame.usingSemiRealisticFrame || frame.framePath?.startsWith('/sprites/frames-semi-realistic/')) return 'semi-realistic PNG frame';
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

  private isInvalidFrame(frame: ResolvedSpriteFrame, framePosition = 0): boolean {
    if (this.animation) {
      const frameQuality = getFrameQuality(this.animation.entityId, this.animation.animationKey, framePosition);
      if (frameQuality.invalidMultiPoseFrame || frameQuality.multiPoseCrop || frameQuality.invalidHollowFrame || frameQuality.role === 'invalid') return true;
    }
    const width = frame.width ?? frame.image?.width ?? 0;
    const height = frame.height ?? frame.image?.height ?? 0;
    if (width <= 0 || height <= 0) return true;
    if (frame.usingManualOverrideFrame || frame.framePath?.startsWith('/sprites/manual-overrides/')) return false;
    if (frame.usingRepairedAlpha || frame.framePath?.startsWith('/sprites/frames-alpha-repaired/')) return false;
    if (frame.usingCleanedAlphaFrame || frame.framePath?.startsWith('/sprites/frames-cleaned/')) return false;
    if (frame.usingGeneratedPackFrame || frame.framePath?.startsWith('/sprites/frames-pack/')) return false;
    if (frame.usingReferenceExtracted || frame.framePath?.startsWith('/sprites/frames-reference/')) return false;
    if (frame.usingSemiRealisticFrame || frame.framePath?.startsWith('/sprites/frames-semi-realistic/')) return false;
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
