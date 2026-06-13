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

export interface DustPuff {
  x: number;
  y: number;
  lifeMs: number;
}

export class RenderSystem {
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
  ): void {
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    this.drawArena(ctx);
    for (const obstacle of obstacles) this.drawObstacle(ctx, obstacle);
    for (const puff of dust) this.drawDust(ctx, puff);

    const actors: Entity[] = [player, ...enemies.filter((enemy) => enemy.alive)];
    if (boss?.alive) actors.push(boss);
    actors.sort((a, b) => a.y - b.y);
    for (const actor of actors) this.drawFighter(ctx, actor, actor === player ? '#38a3ff' : actor === boss ? '#ad56ff' : '#c54c36');

    for (const hitbox of hitboxes) this.drawHitbox(ctx, hitbox);
    ctx.restore();
  }

  private drawArena(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#b87935';
    ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

    ctx.strokeStyle = '#6d3d1d';
    ctx.lineWidth = 36;
    ctx.strokeRect(18, 18, ARENA_WIDTH - 36, ARENA_HEIGHT - 36);

    ctx.globalAlpha = 0.16;
    ctx.fillStyle = '#5f3419';
    for (let x = 120; x < ARENA_WIDTH; x += 170) {
      for (let y = 90; y < ARENA_HEIGHT; y += 130) {
        ctx.fillRect(x + ((x * y) % 41), y, 42, 3);
      }
    }
    ctx.globalAlpha = 1;

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

  private drawObstacle(ctx: CanvasRenderingContext2D, obstacle: Obstacle): void {
    if (obstacle.kind === 'rock') {
      ctx.fillStyle = '#554535';
      ctx.beginPath();
      ctx.ellipse(obstacle.x, obstacle.y, obstacle.radius * 1.2, obstacle.radius * 0.82, -0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#74604d';
      ctx.fillRect(obstacle.x - obstacle.radius * 0.45, obstacle.y - obstacle.radius * 0.45, obstacle.radius, 8);
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
    const pose = entity instanceof Fighter ? this.animation.getPose(entity) : 'idle';
    const assetId = this.getAssetId(entity);
    const animationKey = this.animation.getCurrentAnimationKey(entity);
    const resolvedAnimation = this.assets.getResolvedAnimation(assetId, animationKey) ?? this.assets.getResolvedAnimation(assetId, 'idle');
    ctx.fillStyle = 'rgba(42, 23, 13, 0.34)';
    ctx.beginPath();
    ctx.ellipse(entity.x, entity.y + entity.radius * 0.82, entity.radius * 1.05, entity.radius * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();

    if (resolvedAnimation && ['frame-png', 'sheet-crop'].includes(resolvedAnimation.status)) {
      this.drawResolvedSpriteFrame(ctx, entity, resolvedAnimation);
      this.drawHealthBar(ctx, entity);
      return;
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

  private drawResolvedSpriteFrame(ctx: CanvasRenderingContext2D, entity: Entity, animation: ResolvedSpriteAnimation): void {
    const index = this.animation.getFrameIndex(
      entity,
      animation.frames.map((frame) => frame.durationMs),
    );
    const frame = animation.frames[index] ?? animation.frames[0];
    if (!frame) return;

    const sourceWidth = frame.width ?? frame.image?.width ?? 64;
    const sourceHeight = frame.height ?? frame.image?.height ?? 64;
    const scale = entity instanceof Boss ? 1.45 : entity instanceof Enemy ? 0.82 : 1;
    const width = Math.max(entity.radius * 3.2, sourceWidth * scale);
    const height = width * (sourceHeight / sourceWidth);
    const dx = -width * frame.anchorX;
    const dy = -height * frame.anchorY + entity.radius * 0.82;

    ctx.save();
    ctx.translate(entity.x, entity.y - entity.radius * 0.45);
    ctx.scale(entity.facing, 1);
    this.drawFrameImage(ctx, frame, dx, dy, width, height);
    ctx.restore();
  }

  private drawFrameImage(
    ctx: CanvasRenderingContext2D,
    frame: ResolvedSpriteFrame,
    dx: number,
    dy: number,
    width: number,
    height: number,
  ): void {
    if (frame.image) {
      ctx.drawImage(frame.image, dx, dy, width, height);
      return;
    }

    if (
      frame.sheetImage &&
      frame.x !== undefined &&
      frame.y !== undefined &&
      frame.width !== undefined &&
      frame.height !== undefined
    ) {
      ctx.drawImage(frame.sheetImage, frame.x, frame.y, frame.width, frame.height, dx, dy, width, height);
    }
  }

  private drawCyberMonkeyPlaceholder(ctx: CanvasRenderingContext2D, entity: Entity, color: string, pose: string): void {
    const bodyWidth = entity.radius * (entity instanceof Boss ? 2.2 : 1.8);
    const bodyHeight = entity.radius * (entity instanceof Boss ? 1.35 : 1.05);
    const lean = pose === 'move' ? entity.facing * 7 : 0;

    ctx.fillStyle = color;
    ctx.fillRect(entity.x - bodyWidth / 2 + lean, entity.y - bodyHeight * 0.75, bodyWidth, bodyHeight);
    ctx.fillStyle = '#17120c';
    ctx.fillRect(entity.x - entity.facing * entity.radius * 0.15, entity.y - bodyHeight * 0.58, entity.facing * entity.radius * 0.72, 5);
    ctx.strokeStyle = '#2debd3';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(entity.x + entity.facing * entity.radius * 0.42, entity.y - bodyHeight * 0.42, 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#28231f';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(entity.x - entity.facing * bodyWidth * 0.45, entity.y - bodyHeight * 0.2);
    ctx.quadraticCurveTo(entity.x - entity.facing * bodyWidth, entity.y - bodyHeight * 0.9, entity.x - entity.facing * bodyWidth * 1.15, entity.y);
    ctx.stroke();

    ctx.fillStyle = '#f0c36a';
    if (pose === 'attack') {
      ctx.fillRect(entity.x + entity.facing * entity.radius * 0.25, entity.y - bodyHeight * 0.35, entity.facing * entity.radius * 1.05, 8);
    }
  }

  private getAssetId(entity: Entity): string {
    if (entity instanceof Player) return entity.character.id;
    if (entity instanceof Enemy || entity instanceof Boss) return entity.definition.id;
    return entity.id;
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
}
