import { AssetLoader } from './AssetLoader';
import { Camera } from './Camera';
import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  DASH_COOLDOWN_MS,
  DASH_DURATION_MS,
  DASH_STAMINA_COST,
  OBSTACLE_COUNT,
  PLAYER_BASE_SPEED,
  STAMINA_REGEN_PER_SECOND,
} from './constants';
import { InputManager } from './InputManager';
import { Boss } from '../entities/Boss';
import { Enemy } from '../entities/Enemy';
import { Obstacle } from '../entities/Obstacle';
import { Player } from '../entities/Player';
import { characters, getCharacterMoves } from '../data/characters';
import { moveById } from '../data/moves';
import { spriteRegistry } from '../data/spriteRegistry';
import { AnimationSystem } from '../systems/AnimationSystem';
import { type AttackHitbox, CombatSystem } from '../systems/CombatSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { LootSystem } from '../systems/LootSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { ProgressionSystem } from '../systems/ProgressionSystem';
import { RenderSystem, type DustPuff } from '../systems/RenderSystem';
import { WaveSystem } from '../systems/WaveSystem';
import { Hud } from '../ui/Hud';
import { MenuScreen } from '../ui/MenuScreen';
import { RewardScreen } from '../ui/RewardScreen';

type GameState = 'home' | 'settings' | 'playing' | 'paused' | 'reward' | 'gameOver';

export class Game {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly input = new InputManager();
  private readonly camera = new Camera();
  private readonly assets = new AssetLoader();
  private readonly movement = new MovementSystem();
  private readonly collision = new CollisionSystem();
  private readonly combat = new CombatSystem();
  private readonly animation = new AnimationSystem();
  private readonly render = new RenderSystem(this.animation, this.assets);
  private readonly waves = new WaveSystem();
  private readonly progression = new ProgressionSystem();
  private readonly loot = new LootSystem();
  private readonly hud = new Hud();
  private readonly menuScreen: MenuScreen;
  private readonly rewardScreen: RewardScreen;
  private readonly obstacles = this.createObstacles();
  private player = this.createPlayer();
  private enemies: Enemy[] = [];
  private boss: Boss | null = null;
  private hitboxes: AttackHitbox[] = [];
  private dust: DustPuff[] = [];
  private lastTime = 0;
  private state: GameState = 'home';
  private settingsReturnState: GameState = 'home';

  constructor(
    private readonly canvas: HTMLCanvasElement,
    menuRoot: HTMLDivElement,
    rewardRoot: HTMLDivElement,
  ) {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('2D canvas context is unavailable.');
    this.ctx = context;
    this.menuScreen = new MenuScreen(menuRoot);
    this.rewardScreen = new RewardScreen(rewardRoot);
    this.menuScreen.bind({
      onStart: () => this.startNewRun(),
      onSettings: () => this.openSettings(),
      onControls: () => this.openControls(),
      onBack: () => this.closeMenuPanel(),
      onResume: () => this.resumeGame(),
      onHome: () => this.returnHome(),
    });
    this.resize();
    window.addEventListener('resize', this.resize);
    this.camera.follow(this.player, this.canvas.width, this.canvas.height);
    this.menuScreen.showHome();
    void this.preloadBeginningSprites();
  }

  start(): void {
    requestAnimationFrame(this.loop);
  }

  private readonly loop = (timestamp: number): void => {
    const deltaMs = Math.min(34, timestamp - this.lastTime || 16.67);
    this.lastTime = timestamp;
    this.handleStateInput();

    if (this.state === 'playing') {
      this.update(deltaMs);
    }

    this.draw();
    this.input.endFrame();
    requestAnimationFrame(this.loop);
  };

  private update(deltaMs: number): void {
    const deltaSeconds = deltaMs / 1000;
    this.updatePlayer(deltaSeconds);
    this.updateEnemies(deltaMs);
    this.updateTimers(deltaMs);

    this.hitboxes = this.combat.updateHitboxes(this.hitboxes, deltaMs);
    for (const hitbox of this.hitboxes) {
      const targets = hitbox.owner === this.player ? this.livingEnemies() : [this.player];
      this.combat.applyHitbox(hitbox, targets);
    }

    this.enemies = this.enemies.filter((enemy) => enemy.alive);
    if (this.boss && !this.boss.alive) this.boss = null;

    if (!this.player.alive) {
      this.openGameOver();
    } else if (this.enemies.length === 0 && !this.boss) {
      this.openReward();
    }

    this.camera.follow(this.player, this.canvas.width, this.canvas.height);
  }

  private updatePlayer(deltaSeconds: number): void {
    const axis = this.input.getMovementAxis();
    const speedBoost = this.player.dashMs > 0 ? 2.7 : 1;
    const canMove = this.player.stunMs <= 0;
    const speed = (this.player.speed || PLAYER_BASE_SPEED) * speedBoost;

    this.player.vx = canMove ? axis.x * speed : this.player.vx * 0.92;
    this.player.vy = canMove ? axis.y * speed : this.player.vy * 0.92;

    if (this.input.wasPressed(' ') && this.player.dashCooldownMs <= 0 && this.player.stamina >= DASH_STAMINA_COST) {
      this.player.stamina -= DASH_STAMINA_COST;
      this.player.dashMs = DASH_DURATION_MS;
      this.player.dashCooldownMs = DASH_COOLDOWN_MS;
      this.dust.push({ x: this.player.x, y: this.player.y + 14, lifeMs: 300 });
    }

    this.handleAttackInput();
    this.movement.update(this.player, deltaSeconds);
    this.collision.resolveObstacleCollision(this.player, this.obstacles);
  }

  private updateEnemies(deltaMs: number): void {
    for (const enemy of this.enemies.filter((actor) => actor.alive)) {
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const distance = Math.hypot(dx, dy) || 1;
      const canMove = enemy.stunMs <= 0 && enemy.attackLockMs <= 0;

      if (canMove && distance > enemy.attackRange) {
        enemy.vx = (dx / distance) * enemy.speed;
        enemy.vy = (dy / distance) * enemy.speed;
      } else {
        enemy.vx *= 0.86;
        enemy.vy *= 0.86;
      }

      enemy.facing = this.player.x < enemy.x ? -1 : 1;
      if (distance <= enemy.attackRange + 20 && enemy.stunMs <= 0) {
        this.tryEnemyAttack(enemy);
      }

      this.movement.update(enemy, deltaMs / 1000);
      this.collision.resolveObstacleCollision(enemy, this.obstacles);
    }

    if (this.boss?.alive) {
      const boss = this.boss;
      const dx = this.player.x - boss.x;
      const dy = this.player.y - boss.y;
      const distance = Math.hypot(dx, dy) || 1;
      boss.facing = this.player.x < boss.x ? -1 : 1;
      boss.telegraphMs = Math.max(0, boss.telegraphMs - deltaMs);

      if (boss.stunMs <= 0 && boss.attackLockMs <= 0 && distance > boss.definition.attackRange) {
        boss.vx = (dx / distance) * boss.speed;
        boss.vy = (dy / distance) * boss.speed;
      } else {
        boss.vx *= 0.88;
        boss.vy *= 0.88;
      }

      if (distance <= boss.definition.attackRange + 30 && boss.stunMs <= 0) {
        if (boss.telegraphMs <= 0 && boss.attackLockMs <= 0) {
          boss.telegraphMs = 420;
        } else if (boss.telegraphMs < 90) {
          this.tryEnemyAttack(boss);
          boss.telegraphMs = 0;
        }
      }

      this.movement.update(boss, deltaMs / 1000);
      this.collision.resolveObstacleCollision(boss, this.obstacles);
    }
  }

  private updateTimers(deltaMs: number): void {
    this.combat.updateFighterTimers(this.player, deltaMs);
    this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + STAMINA_REGEN_PER_SECOND * (deltaMs / 1000));
    this.player.dashMs = Math.max(0, this.player.dashMs - deltaMs);
    this.player.dashCooldownMs = Math.max(0, this.player.dashCooldownMs - deltaMs);

    for (const enemy of this.livingEnemies()) this.combat.updateFighterTimers(enemy, deltaMs);

    for (const puff of this.dust) puff.lifeMs -= deltaMs;
    this.dust = this.dust.filter((puff) => puff.lifeMs > 0);
  }

  private handleAttackInput(): void {
    const light = moveById.get('jab');
    const heavy = moveById.get('cross') ?? moveById.get('roundhouse_kick');
    const grapple = moveById.get('low_kick');

    const selected =
      (this.input.wasPressed('j') && light) ||
      (this.input.wasPressed('k') && heavy) ||
      (this.input.wasPressed('l') && grapple) ||
      this.slotMovePressed();

    if (!selected) return;
    const hitbox = this.combat.startAttack(this.player, selected);
    if (hitbox) this.hitboxes.push(hitbox);
  }

  private slotMovePressed() {
    for (let index = 0; index < 4; index += 1) {
      if (this.input.wasPressed(String(index + 1))) {
        return this.player.equippedMoves[index];
      }
    }
    return undefined;
  }

  private tryEnemyAttack(enemy: Enemy | Boss): void {
    const move = enemy.equippedMoves[0];
    const hitbox = this.combat.startAttack(enemy, move);
    if (hitbox) this.hitboxes.push(hitbox);
  }

  private openReward(): void {
    this.state = 'reward';
    this.menuScreen.hide();
    const options = this.progression.getRewardOptions(this.player, this.waves.wave);
    if (options.length === 0) {
      this.spawnWave();
      return;
    }

    this.rewardScreen.show(options, (move) => {
      this.progression.learnMove(this.player, move);
      this.loot.restoreAfterWave(this.player);
      this.spawnWave();
    });
  }

  private spawnWave(): void {
    const spawned = this.waves.spawnNextWave();
    this.enemies = spawned.enemies;
    this.boss = spawned.boss;
    this.hitboxes = [];
    this.state = 'playing';
  }

  private livingEnemies(): Array<Enemy | Boss> {
    const actors: Array<Enemy | Boss> = this.enemies.filter((enemy) => enemy.alive);
    if (this.boss?.alive) actors.push(this.boss);
    return actors;
  }

  private draw(): void {
    this.render.draw(this.ctx, this.camera, this.player, this.enemies, this.boss, this.obstacles, this.hitboxes, this.dust);
    this.drawBossTelegraph();
    if (['playing', 'paused', 'reward', 'gameOver'].includes(this.state)) {
      this.hud.draw(this.ctx, this.player, this.waves.wave, this.boss);
    }
  }

  private drawBossTelegraph(): void {
    if (!this.boss?.alive || this.boss.telegraphMs <= 0) return;
    this.ctx.save();
    this.ctx.translate(-this.camera.x, -this.camera.y);
    this.ctx.strokeStyle = '#ffef78';
    this.ctx.lineWidth = 5;
    this.ctx.beginPath();
    this.ctx.arc(this.boss.x, this.boss.y, this.boss.radius + 10, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.restore();
  }

  private createObstacles(): Obstacle[] {
    const obstacles: Obstacle[] = [];
    for (let i = 0; i < OBSTACLE_COUNT; i += 1) {
      const x = 180 + ((i * 257) % (ARENA_WIDTH - 360));
      const y = 160 + ((i * 173) % (ARENA_HEIGHT - 320));
      const kind = i % 4 === 0 ? 'dead_bush' : 'rock';
      const radius = kind === 'rock' ? 26 + (i % 3) * 8 : 22;
      obstacles.push(new Obstacle(`obstacle_${i}`, kind, x, y, radius));
    }
    return obstacles;
  }

  private readonly resize = (): void => {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };

  private handleStateInput(): void {
    if (this.input.wasPressed('escape')) {
      if (this.state === 'playing') this.pauseGame();
      else if (this.state === 'paused') this.resumeGame();
      else if (this.state === 'settings') this.closeMenuPanel();
    }
  }

  private startNewRun(): void {
    this.player = this.createPlayer();
    this.enemies = [];
    this.boss = null;
    this.hitboxes = [];
    this.dust = [];
    this.waves.wave = 0;
    this.rewardScreen.hide();
    this.menuScreen.hide();
    this.spawnWave();
    this.camera.follow(this.player, this.canvas.width, this.canvas.height);
  }

  private pauseGame(): void {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.menuScreen.showPaused();
  }

  private resumeGame(): void {
    if (this.state !== 'paused' && this.state !== 'settings') return;
    this.state = 'playing';
    this.menuScreen.hide();
  }

  private openSettings(): void {
    if (this.state !== 'home' && this.state !== 'paused') return;
    this.settingsReturnState = this.state;
    this.state = 'settings';
    this.menuScreen.showSettings();
  }

  private openControls(): void {
    if (this.state !== 'home') return;
    this.settingsReturnState = 'home';
    this.menuScreen.showControls();
  }

  private closeMenuPanel(): void {
    if (this.settingsReturnState === 'paused') {
      this.state = 'paused';
      this.menuScreen.showPaused();
      return;
    }

    this.state = 'home';
    this.menuScreen.showHome();
  }

  private openGameOver(): void {
    this.state = 'gameOver';
    this.rewardScreen.hide();
    this.menuScreen.showGameOver();
  }

  private returnHome(): void {
    this.state = 'home';
    this.enemies = [];
    this.boss = null;
    this.hitboxes = [];
    this.dust = [];
    this.rewardScreen.hide();
    this.menuScreen.showHome();
  }

  private createPlayer(): Player {
    return new Player(characters[0], getCharacterMoves(characters[0]));
  }

  private async preloadBeginningSprites(): Promise<void> {
    await Promise.all(
      spriteRegistry.flatMap((sprite) =>
        sprite.animations.map((animation) => this.assets.loadOptionalFrames(sprite.id, animation)),
      ),
    );
  }
}
