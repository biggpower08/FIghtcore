import { ARENA_HEIGHT, ARENA_WIDTH } from '../game/constants';
import type { AttackHitbox } from './CombatSystem';
import type { AnimationSystem } from './AnimationSystem';
import type { Boss } from '../entities/Boss';
import type { Enemy } from '../entities/Enemy';
import type { Entity } from '../entities/Entity';
import { Fighter } from '../entities/Fighter';
import type { Obstacle } from '../entities/Obstacle';
import type { Player } from '../entities/Player';
import type { Camera } from '../game/Camera';

export interface DustPuff {
  x: number;
  y: number;
  lifeMs: number;
}

export class RenderSystem {
  constructor(private readonly animation: AnimationSystem) {}

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
    ctx.fillStyle = 'rgba(42, 23, 13, 0.34)';
    ctx.beginPath();
    ctx.ellipse(entity.x, entity.y + entity.radius * 0.82, entity.radius * 1.05, entity.radius * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();

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

    ctx.fillStyle = '#1b130d';
    ctx.fillRect(entity.x - entity.radius, entity.y - entity.radius * 1.55, entity.radius * 2, 5);
    ctx.fillStyle = '#f65a45';
    ctx.fillRect(entity.x - entity.radius, entity.y - entity.radius * 1.55, entity.radius * 2 * (entity.health / entity.maxHealth), 5);
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
