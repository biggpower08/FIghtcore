import { ARENA_HEIGHT, ARENA_WIDTH } from '../game/constants';
import type { AttackHitbox } from './CombatSystem';
import type { AnimationSystem } from './AnimationSystem';
import { Boss } from '../entities/Boss';
import { Enemy } from '../entities/Enemy';
import type { Entity } from '../entities/Entity';
import { Fighter } from '../entities/Fighter';
import type { Obstacle } from '../entities/Obstacle';
import { Player } from '../entities/Player';
import type { AssetLoader, ResolvedSpriteAnimation, ResolvedSpriteFrame } from '../game/AssetLoader';
import type { Camera } from '../game/Camera';
import { spriteRegistryById } from '../data/spriteRegistry';
import { getFrameQuality } from '../data/frameQuality';

export interface DustPuff {
  x: number;
  y: number;
  lifeMs: number;
}

export interface ImpactSpark {
  x: number;
  y: number;
  lifeMs: number;
  color: string;
  label?: string;
}

export interface GrappleSuppressionRenderInfo {
  hiddenEntityId: string;
  sourceEntityId: string;
  sourceAnimationKey: string;
  remainingMs: number;
  startFrame: number;
  endFrame: number;
}

export interface GrappleDebugRenderInfo {
  activeCharacter: string;
  activeMove: string;
  targetSearchRadius: number;
  nearbyTargetCount: number;
  primaryTargetId?: string;
  secondaryTargetIds: string[];
  suppressionActive: boolean;
  failedNoTarget: boolean;
}

const DESERT_ARENA_BACKGROUND_PATH = '/assets/fightcore/backgrounds/desert-arena/day.png';
const DEBUG_SPRITE_BOXES_PARAM = 'debugSpriteBoxes';
const DEBUG_GRAPPLE_SUPPRESSION_PARAM = 'debugGrappleSuppression';
const blockedFrameWarnings = new Set<string>();

export class RenderSystem {
  private readonly bodyDrawCounts = new Map<string, number>();

  constructor(
    private readonly animation: AnimationSystem,
    private readonly assets: AssetLoader,
  ) {}

  draw(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    player: Player,
    enemies: Enemy[],
    boss: Boss | null,
    obstacles: Obstacle[],
    hitboxes: AttackHitbox[],
    dust: DustPuff[],
    impacts: ImpactSpark[] = [],
    suppressedEntityIds: Set<string> = new Set(),
    grappleSuppressions: GrappleSuppressionRenderInfo[] = [],
    grappleDebug?: GrappleDebugRenderInfo,
    screenShakeMs = 0,
  ): void {
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();
    const shake = screenShakeMs > 0 ? Math.min(7, screenShakeMs / 28) : 0;
    ctx.translate(-camera.x + (Math.random() - 0.5) * shake, -camera.y + (Math.random() - 0.5) * shake);
    this.bodyDrawCounts.clear();
    this.drawArena(ctx);
    for (const obstacle of obstacles) this.drawObstacle(ctx, obstacle);
    for (const puff of dust) this.drawDust(ctx, puff);

    const actors: Entity[] = [player, ...enemies.filter((enemy) => enemy.alive)].filter(
      (actor) => !suppressedEntityIds.has(actor.id),
    );
    if (boss?.alive && !suppressedEntityIds.has(boss.id)) actors.push(boss);
    actors.sort((a, b) => a.y - b.y);
    for (const actor of actors) this.drawFighter(ctx, actor, actor === player ? '#38a3ff' : actor === boss ? '#ad56ff' : '#c54c36');

    for (const hitbox of hitboxes) this.drawHitbox(ctx, hitbox);
    for (const impact of impacts) this.drawImpactSpark(ctx, impact);
    if (shouldDrawGrappleSuppressionDebug()) this.drawGrappleSuppressionDebug(ctx, grappleSuppressions, grappleDebug);
    ctx.restore();
  }

  private drawArena(ctx: CanvasRenderingContext2D): void {
    const desertArena = this.assets.getImage(DESERT_ARENA_BACKGROUND_PATH);
    if (desertArena) {
      this.drawDesertArenaImage(ctx, desertArena);
      return;
    }

    ctx.fillStyle = '#b87935';
    ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
    this.drawDistantDesertBackdrop(ctx);

    ctx.strokeStyle = '#6d3d1d';
    ctx.lineWidth = 36;
    ctx.strokeRect(18, 18, ARENA_WIDTH - 36, ARENA_HEIGHT - 36);

    this.drawArenaMarkers(ctx);
    this.drawSandTexture(ctx);
    this.drawStageDebris(ctx);

    const gradient = ctx.createRadialGradient(
      ARENA_WIDTH / 2,
      ARENA_HEIGHT / 2,
      220,
      ARENA_WIDTH / 2,
      ARENA_HEIGHT / 2,
      1220,
    );
    gradient.addColorStop(0, 'rgba(255, 221, 151, 0)');
    gradient.addColorStop(1, 'rgba(48, 25, 12, 0.28)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
  }

  private drawDesertArenaImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement): void {
    const imageAspect = image.width / image.height;
    const arenaAspect = ARENA_WIDTH / ARENA_HEIGHT;
    const sourceWidth = imageAspect > arenaAspect ? image.height * arenaAspect : image.width;
    const sourceHeight = imageAspect > arenaAspect ? image.height : image.width / arenaAspect;
    const sourceX = (image.width - sourceWidth) / 2;
    const sourceY = (image.height - sourceHeight) / 2;

    ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, ARENA_WIDTH, ARENA_HEIGHT);

    const vignette = ctx.createRadialGradient(
      ARENA_WIDTH / 2,
      ARENA_HEIGHT / 2,
      420,
      ARENA_WIDTH / 2,
      ARENA_HEIGHT / 2,
      1250,
    );
    vignette.addColorStop(0, 'rgba(255, 221, 151, 0)');
    vignette.addColorStop(1, 'rgba(18, 11, 8, 0.34)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
  }

  private drawDistantDesertBackdrop(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = 0.24;
    ctx.fillStyle = '#8a5228';
    for (let x = -120; x < ARENA_WIDTH + 120; x += 260) {
      ctx.beginPath();
      ctx.moveTo(x, 150);
      ctx.lineTo(x + 80, 88 + (x % 3) * 18);
      ctx.lineTo(x + 170, 150);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#523622';
    for (let x = 150; x < ARENA_WIDTH; x += 520) {
      ctx.fillRect(x, 112, 86, 12);
      ctx.fillRect(x + 22, 86, 10, 28);
      ctx.fillRect(x + 54, 96, 8, 20);
    }
    ctx.restore();
  }

  private drawArenaMarkers(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (let x = 92; x < ARENA_WIDTH; x += 230) {
      this.drawMarkerPost(ctx, x, 42, '#23d5dd');
      this.drawMarkerPost(ctx, x + 80, ARENA_HEIGHT - 42, '#f0c36a');
    }
    for (let y = 132; y < ARENA_HEIGHT; y += 220) {
      this.drawMarkerPost(ctx, 42, y, '#ad56ff');
      this.drawMarkerPost(ctx, ARENA_WIDTH - 42, y + 68, '#23d5dd');
    }
    ctx.restore();
  }

  private drawMarkerPost(ctx: CanvasRenderingContext2D, x: number, y: number, glow: string): void {
    ctx.fillStyle = '#362516';
    ctx.fillRect(x - 6, y - 18, 12, 36);
    ctx.fillStyle = glow;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(x - 9, y - 4, 18, 8);
    ctx.globalAlpha = 1;
  }

  private drawSandTexture(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = 0.18;
    for (let x = 90; x < ARENA_WIDTH; x += 130) {
      for (let y = 92; y < ARENA_HEIGHT; y += 96) {
        const offset = (x * 17 + y * 11) % 47;
        ctx.fillStyle = (x + y) % 3 === 0 ? '#f0bd70' : '#5f3419';
        ctx.fillRect(x + offset, y, 38 + (offset % 36), 3);
        ctx.fillRect(x - offset * 0.35, y + 34, 18, 2);
      }
    }
    ctx.restore();
  }

  private drawStageDebris(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (let index = 0; index < 22; index += 1) {
      const x = 160 + ((index * 389) % (ARENA_WIDTH - 320));
      const y = 180 + ((index * 251) % (ARENA_HEIGHT - 360));
      if (index % 3 === 0) this.drawBonePile(ctx, x, y);
      else if (index % 3 === 1) this.drawCyberScrap(ctx, x, y);
      else this.drawDustPatch(ctx, x, y);
    }
    ctx.restore();
  }

  private drawBonePile(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.strokeStyle = '#d4c0a1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 18, y + 6);
    ctx.lineTo(x + 18, y - 6);
    ctx.moveTo(x - 12, y - 8);
    ctx.lineTo(x + 24, y + 8);
    ctx.stroke();
    ctx.fillStyle = '#e3d3b9';
    ctx.fillRect(x - 25, y + 2, 8, 8);
    ctx.fillRect(x + 18, y - 11, 8, 8);
  }

  private drawCyberScrap(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#3a3e42';
    ctx.fillRect(x - 20, y - 10, 38, 14);
    ctx.fillStyle = '#22262a';
    ctx.fillRect(x + 4, y - 20, 12, 26);
    ctx.fillStyle = '#23d5dd';
    ctx.globalAlpha = 0.75;
    ctx.fillRect(x - 14, y - 6, 20, 3);
    ctx.globalAlpha = 1;
  }

  private drawDustPatch(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#f0c36a';
    ctx.beginPath();
    ctx.ellipse(x, y, 42, 10, -0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  private drawObstacle(ctx: CanvasRenderingContext2D, obstacle: Obstacle): void {
    if (obstacle.kind === 'rock') {
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = '#2b2018';
      ctx.beginPath();
      ctx.ellipse(obstacle.x, obstacle.y, obstacle.radius * 0.9, obstacle.radius * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.strokeStyle = '#5b3219';
    ctx.lineWidth = 4;
    for (let i = 0; i < 5; i += 1) {
      const angle = -Math.PI / 2 + (i - 2) * 0.42;
      ctx.beginPath();
      ctx.moveTo(obstacle.x, obstacle.y + obstacle.radius * 0.45);
      ctx.lineTo(obstacle.x + Math.cos(angle) * obstacle.radius, obstacle.y + Math.sin(angle) * obstacle.radius);
      ctx.stroke();
    }
  }

  private drawFighter(ctx: CanvasRenderingContext2D, entity: Entity, color: string): void {
    this.countBodyDraw(entity);
    const pose = entity instanceof Fighter ? this.animation.getPose(entity) : 'idle';
    const assetId = this.getAssetId(entity);
    const animationKey = this.animation.getCurrentAnimationKey(entity);
    const resolvedAnimation = this.assets.getResolvedAnimation(assetId, animationKey) ?? this.assets.getResolvedAnimation(assetId, 'idle');
    const profile = spriteRegistryById.get(assetId)?.render;
    ctx.fillStyle = 'rgba(42, 23, 13, 0.34)';
    ctx.beginPath();
    ctx.ellipse(entity.x, entity.y + (profile?.shadowOffsetY ?? 8), entity.radius * 1.05, entity.radius * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();

    if (resolvedAnimation && ['frame-png', 'atlas-crop', 'sheet-crop'].includes(resolvedAnimation.status)) {
      if (this.drawResolvedSpriteFrame(ctx, entity, resolvedAnimation)) {
        this.drawHealthBar(ctx, entity);
        return;
      }
    }

    if (assetId.startsWith('cyber-monkey')) {
      this.drawCyberMonkeyPlaceholder(ctx, entity, color, pose);
      this.drawHealthBar(ctx, entity);
      return;
    }

    ctx.fillStyle = color;
    ctx.fillRect(entity.x - entity.radius * 0.55, entity.y - entity.radius * 1.1, entity.radius * 1.1, entity.radius * 1.6);
    ctx.fillStyle = '#17120c';
    ctx.fillRect(entity.x + entity.facing * entity.radius * 0.1, entity.y - entity.radius * 0.82, entity.facing * entity.radius * 0.48, 5);

    if (pose === 'attack') {
      ctx.fillStyle = '#ffe38a';
      ctx.fillRect(entity.x + entity.facing * entity.radius * 0.4, entity.y - 8, entity.facing * 34, 10);
    } else if (pose === 'stunned') {
      ctx.strokeStyle = '#fff2b7';
      ctx.lineWidth = 3;
      ctx.strokeRect(entity.x - entity.radius * 0.65, entity.y - entity.radius * 1.24, entity.radius * 1.3, entity.radius * 1.78);
    }

    this.drawHealthBar(ctx, entity);
  }

  private drawHealthBar(ctx: CanvasRenderingContext2D, entity: Entity): void {
    ctx.fillStyle = '#1b130d';
    ctx.fillRect(entity.x - entity.radius, entity.y - entity.radius * 1.55, entity.radius * 2, 5);
    ctx.fillStyle = '#f65a45';
    ctx.fillRect(entity.x - entity.radius, entity.y - entity.radius * 1.55, entity.radius * 2 * (entity.health / entity.maxHealth), 5);
  }

  private drawResolvedSpriteFrame(ctx: CanvasRenderingContext2D, entity: Entity, animation: ResolvedSpriteAnimation): boolean {
    const index = this.animation.getFrameIndex(
      entity,
      animation.frames.map((frame) => frame.durationMs),
    );
    const frame = animation.frames[index] ?? animation.frames[0];
    if (!frame || isInvalidResolvedFrame(frame)) return false;

    const sourceWidth = frame.width ?? frame.image?.width ?? 64;
    const sourceHeight = frame.height ?? frame.image?.height ?? 64;
    const profileScale = spriteRegistryById.get(this.getAssetId(entity))?.render?.scale ?? 1;
    const scale = profileScale * (entity instanceof Boss ? 1.08 : 1);
    const usesPreparedFightcoreStrip = frame.sheetPath?.startsWith('/assets/fightcore/sprites/') ?? false;
    const height = usesPreparedFightcoreStrip ? sourceHeight * scale : Math.max(entity.radius * 3.2, sourceWidth * scale) * (sourceHeight / sourceWidth);
    const width = usesPreparedFightcoreStrip ? sourceWidth * scale : Math.max(entity.radius * 3.2, sourceWidth * scale);
    const dx = -width * frame.anchorX;
    const dy = -height * frame.anchorY;

    ctx.save();
    ctx.translate(entity.x, entity.y);
    ctx.scale(entity.facing, 1);
    const drewFrame = this.drawFrameImage(ctx, frame, dx, dy, width, height);
    if (drewFrame) this.drawFlashOverlay(ctx, entity, dx, dy, width, height);
    ctx.restore();
    if (!drewFrame) return false;

    if (shouldDrawSpriteDebug()) {
      this.drawSpriteDebug(ctx, entity, animation, frame, index, dx, dy, width, height);
    }
    return true;
  }

  private drawFlashOverlay(ctx: CanvasRenderingContext2D, entity: Entity, dx: number, dy: number, width: number, height: number): void {
    if (entity.damageFlashMs <= 0 && entity.healFlashMs <= 0) return;
    ctx.globalCompositeOperation = 'source-atop';
    ctx.globalAlpha = entity.healFlashMs > 0 ? Math.min(0.48, entity.healFlashMs / 540) : Math.min(0.55, entity.damageFlashMs / 260);
    ctx.fillStyle = entity.healFlashMs > 0 ? '#63f7a6' : '#ffffff';
    ctx.fillRect(dx, dy, width, height);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  private drawSpriteDebug(
    ctx: CanvasRenderingContext2D,
    entity: Entity,
    animation: ResolvedSpriteAnimation,
    frame: ResolvedSpriteFrame,
    frameIndex: number,
    dx: number,
    dy: number,
    width: number,
    height: number,
  ): void {
    const drawX = entity.x + dx;
    const drawY = entity.y + dy;
    ctx.save();
    ctx.strokeStyle = '#23d5dd';
    ctx.lineWidth = 2;
    ctx.strokeRect(drawX, drawY, width, height);
    ctx.fillStyle = '#ffef78';
    ctx.fillRect(entity.x - 2, entity.y - 2, 4, 4);
    ctx.fillStyle = '#101820';
    ctx.globalAlpha = 0.78;
    ctx.fillRect(drawX, drawY - 38, 260, 34);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#f7f2d5';
    ctx.font = '12px monospace';
    ctx.fillText(`${animation.entityId}:${animation.animationKey} frame ${frameIndex + 1}/${animation.frames.length}`, drawX + 4, drawY - 22);
    ctx.fillText(`src ${frame.x ?? 0},${frame.y ?? 0},${frame.width ?? frame.image?.width ?? 0}x${frame.height ?? frame.image?.height ?? 0}`, drawX + 4, drawY - 8);
    ctx.restore();
  }

  private drawFrameImage(
    ctx: CanvasRenderingContext2D,
    frame: ResolvedSpriteFrame,
    dx: number,
    dy: number,
    width: number,
    height: number,
  ): boolean {
    if (!isFiniteRect(dx, dy, width, height)) return false;
    if (frame.image) {
      try {
        ctx.drawImage(frame.image, dx, dy, width, height);
        return true;
      } catch (error) {
        logDrawImageFailure('frame-png', frame, { dx, dy, width, height }, error);
        return false;
      }
    }

    if (
      frame.sheetImage &&
      frame.x !== undefined &&
      frame.y !== undefined &&
      frame.width !== undefined &&
      frame.height !== undefined
    ) {
      if (!isValidSourceRect(frame, frame.sheetImage)) return false;
      try {
        ctx.drawImage(frame.sheetImage, frame.x, frame.y, frame.width, frame.height, dx, dy, width, height);
        return true;
      } catch (error) {
        logDrawImageFailure('sheet-crop', frame, { dx, dy, width, height }, error);
        return false;
      }
    }

    return false;
  }

  private drawCyberMonkeyPlaceholder(ctx: CanvasRenderingContext2D, entity: Entity, color: string, pose: string): void {
    const isBoss = entity instanceof Boss;
    const isScrapper = entity instanceof Enemy && entity.definition.id.includes('scrapper');
    const bodyWidth = entity.radius * (isBoss ? 2.55 : isScrapper ? 2.05 : 1.72);
    const bodyHeight = entity.radius * (isBoss ? 1.68 : isScrapper ? 1.26 : 1.02);
    const lean = pose === 'move' ? entity.facing * (isBoss ? 4 : 9) : 0;
    const armor = isBoss ? '#5a4a65' : isScrapper ? '#5b3b31' : '#273035';

    ctx.fillStyle = armor;
    ctx.fillRect(entity.x - bodyWidth / 2 + lean, entity.y - bodyHeight * 0.74, bodyWidth, bodyHeight);
    ctx.fillStyle = color;
    ctx.fillRect(entity.x - bodyWidth * 0.32 + lean, entity.y - bodyHeight * 0.96, bodyWidth * 0.64, bodyHeight * 0.46);
    ctx.fillStyle = '#17120c';
    ctx.fillRect(entity.x - entity.facing * entity.radius * 0.15, entity.y - bodyHeight * 0.95, entity.facing * entity.radius * 0.72, 5);
    ctx.strokeStyle = '#2debd3';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(entity.x + entity.facing * entity.radius * 0.42, entity.y - bodyHeight * 0.81, 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#24282b';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(entity.x - entity.facing * bodyWidth * 0.44, entity.y - bodyHeight * 0.18);
    ctx.quadraticCurveTo(entity.x - entity.facing * bodyWidth * 0.95, entity.y - bodyHeight * 0.88, entity.x - entity.facing * bodyWidth * 1.18, entity.y);
    ctx.stroke();

    ctx.strokeStyle = '#14171a';
    ctx.lineWidth = isBoss ? 8 : 5;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(entity.x + side * bodyWidth * 0.24, entity.y - bodyHeight * 0.1);
      ctx.lineTo(entity.x + side * bodyWidth * 0.52, entity.y + bodyHeight * 0.42);
      ctx.stroke();
    }

    ctx.fillStyle = isBoss ? '#ff8a2a' : '#f0c36a';
    if (pose === 'attack') {
      ctx.fillRect(entity.x + entity.facing * entity.radius * 0.2, entity.y - bodyHeight * 0.55, entity.facing * entity.radius * (isBoss ? 1.55 : 1.12), 8);
      ctx.strokeStyle = '#ffef78';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(entity.x + entity.facing * entity.radius * 0.7, entity.y - bodyHeight * 0.42, entity.radius * 0.9, -0.7, 0.7);
      ctx.stroke();
    }
  }

  private getAssetId(entity: Entity): string {
    if (entity instanceof Player) return entity.character.id;
    if (entity instanceof Enemy || entity instanceof Boss) return entity.definition.id;
    return entity.id;
  }

  private countBodyDraw(entity: Entity): void {
    const next = (this.bodyDrawCounts.get(entity.id) ?? 0) + 1;
    this.bodyDrawCounts.set(entity.id, next);
    if (next > 1) {
      console.warn(`Duplicate body sprite draw in one frame: ${entity.id} drawn ${next} times`);
    }
  }

  private drawHitbox(ctx: CanvasRenderingContext2D, hitbox: AttackHitbox): void {
    if (hitbox.remainingMs > hitbox.move.activeMs) return;
    ctx.fillStyle = 'rgba(255, 237, 135, 0.18)';
    ctx.strokeStyle = 'rgba(255, 237, 135, 0.48)';
    ctx.lineWidth = 2;
    ctx.fillRect(hitbox.x - hitbox.width / 2, hitbox.y - hitbox.height / 2, hitbox.width, hitbox.height);
    ctx.strokeRect(hitbox.x - hitbox.width / 2, hitbox.y - hitbox.height / 2, hitbox.width, hitbox.height);
  }

  private drawDust(ctx: CanvasRenderingContext2D, puff: DustPuff): void {
    ctx.globalAlpha = Math.max(0, puff.lifeMs / 300);
    ctx.fillStyle = '#e8bd76';
    ctx.beginPath();
    ctx.ellipse(puff.x, puff.y, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  private drawImpactSpark(ctx: CanvasRenderingContext2D, spark: ImpactSpark): void {
    const alpha = Math.max(0, Math.min(1, spark.lifeMs / 260));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = spark.color;
    ctx.fillStyle = spark.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(spark.x - 12, spark.y);
    ctx.lineTo(spark.x + 12, spark.y);
    ctx.moveTo(spark.x, spark.y - 12);
    ctx.lineTo(spark.x, spark.y + 12);
    ctx.stroke();
    if (spark.label) {
      ctx.font = '15px monospace';
      ctx.fillText(spark.label, spark.x + 14, spark.y - 20 - (1 - alpha) * 18);
    }
    ctx.restore();
  }

  private drawGrappleSuppressionDebug(
    ctx: CanvasRenderingContext2D,
    suppressions: GrappleSuppressionRenderInfo[],
    grappleDebug?: GrappleDebugRenderInfo,
  ): void {
    if (suppressions.length === 0 && !grappleDebug) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const lines = [
      ...(grappleDebug
        ? [
            `actor ${grappleDebug.activeCharacter} move ${grappleDebug.activeMove}`,
            `radius ${grappleDebug.targetSearchRadius} targets ${grappleDebug.nearbyTargetCount} primary ${grappleDebug.primaryTargetId ?? 'none'}`,
            `secondary ${grappleDebug.secondaryTargetIds.join(',') || 'none'} failedNoTarget ${grappleDebug.failedNoTarget}`,
            `suppressionActive ${grappleDebug.suppressionActive}`,
          ]
        : []),
      ...suppressions.map(
        (suppression) =>
          `${suppression.sourceEntityId}:${suppression.sourceAnimationKey} hides ${suppression.hiddenEntityId} (${Math.ceil(
            suppression.remainingMs,
          )}ms)`,
      ),
    ];
    ctx.fillStyle = 'rgba(16, 24, 32, 0.78)';
    ctx.fillRect(16, 70, 520, 28 + lines.length * 18);
    ctx.fillStyle = '#f7f2d5';
    ctx.font = '12px monospace';
    ctx.fillText('Grapple debug:', 24, 88);
    lines.forEach((line, index) => ctx.fillText(line, 24, 106 + index * 18));
    ctx.restore();
  }
}

function shouldDrawSpriteDebug(): boolean {
  return typeof window !== 'undefined' && new URLSearchParams(window.location.search).has(DEBUG_SPRITE_BOXES_PARAM);
}

function shouldDrawGrappleSuppressionDebug(): boolean {
  return typeof window !== 'undefined' && new URLSearchParams(window.location.search).has(DEBUG_GRAPPLE_SUPPRESSION_PARAM);
}

function isInvalidResolvedFrame(frame: ResolvedSpriteFrame): boolean {
  if (frame.entityId && frame.animationKey && frame.frameIndex !== undefined) {
    const quality = getFrameQuality(frame.entityId, frame.animationKey, frame.frameIndex);
    if (quality.invalidMultiPoseFrame || quality.multiPoseCrop || quality.role === 'invalid') {
      const key = `${frame.entityId}:${frame.animationKey}:${frame.frameIndex}`;
      if (!blockedFrameWarnings.has(key)) {
        blockedFrameWarnings.add(key);
        console.warn('Blocked invalid multi-pose body frame from runtime rendering', {
          entityId: frame.entityId,
          animationKey: frame.animationKey,
          frameIndex: frame.frameIndex,
          quality,
        });
      }
      return true;
    }
  }
  const width = frame.width ?? frame.image?.width ?? 0;
  const height = frame.height ?? frame.image?.height ?? 0;
  if (width <= 0 || height <= 0) return true;
  const sourceWidth = frame.sheetImage?.width ?? frame.image?.width ?? width;
  const sourceStripDraw = Boolean(frame.sheetPath?.endsWith('-strip.png') && width >= sourceWidth && sourceWidth > 180);
  return sourceStripDraw || width > 300 || (width > 220 && width / height > 2.65);
}

function isFiniteRect(x: number, y: number, width: number, height: number): boolean {
  return [x, y, width, height].every(Number.isFinite) && width > 0 && height > 0;
}

function isValidSourceRect(frame: ResolvedSpriteFrame, image: HTMLImageElement): boolean {
  if (
    frame.x === undefined ||
    frame.y === undefined ||
    frame.width === undefined ||
    frame.height === undefined ||
    !isFiniteRect(frame.x, frame.y, frame.width, frame.height)
  ) {
    console.warn('Invalid sprite source rect', frame);
    return false;
  }

  const naturalWidth = image.naturalWidth || image.width;
  const naturalHeight = image.naturalHeight || image.height;
  const valid = frame.x >= 0 && frame.y >= 0 && frame.x + frame.width <= naturalWidth && frame.y + frame.height <= naturalHeight;
  if (!valid) {
    console.warn('Sprite source rect exceeds image bounds', {
      source: { x: frame.x, y: frame.y, width: frame.width, height: frame.height },
      image: { naturalWidth, naturalHeight },
      sheetPath: frame.sheetPath,
      framePath: frame.framePath,
    });
  }
  return valid;
}

function logDrawImageFailure(
  mode: string,
  frame: ResolvedSpriteFrame,
  destination: { dx: number; dy: number; width: number; height: number },
  error: unknown,
): void {
  const image = frame.image ?? frame.sheetImage;
  console.error('Runtime sprite drawImage failed', {
    mode,
    source: { x: frame.x, y: frame.y, width: frame.width, height: frame.height },
    destination,
    image: image ? { complete: image.complete, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight } : undefined,
    sheetPath: frame.sheetPath,
    framePath: frame.framePath,
    error,
  });
}
