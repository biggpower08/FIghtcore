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
import { moveById, type MoveDefinition } from '../data/moves';
import { enemyAttackAnimationByMove, getKnownAnimationKeys, printSpriteCoverageReport } from '../data/spriteAnimations';
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
import { SpriteLab } from '../ui/SpriteLab';

type GameState = 'home' | 'settings' | 'playing' | 'paused' | 'reward' | 'gameOver' | 'spriteLab';
const DESERT_ARENA_BACKGROUND_PATH = '/backgrounds/desert/desert-arena-main-clean.png';

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
  private readonly spriteLab: SpriteLab;
  private readonly obstacles = this.createObstacles();
  private selectedCharacterId = 'cyber-ninja-blue';
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
    this.spriteLab = new SpriteLab(menuRoot, this.assets);
    this.menuScreen.bind({
      onStart: () => this.startNewRun(),
      onSettings: () => this.openSettings(),
      onControls: () => this.openControls(),
      onSpriteLab: () => this.openSpriteLab(),
      onCharacterSelect: (characterId) => this.selectCharacter(characterId),
      onBack: () => this.closeMenuPanel(),
      onResume: () => this.resumeGame(),
      onHome: () => this.returnHome(),
    });
    this.resize();
    window.addEventListener('resize', this.resize);
    this.camera.follow(this.player, this.canvas.width, this.canvas.height);
    this.menuScreen.showHome(this.selectedCharacterId);
    void this.preloadBeginningSprites();
  }

  start(): void {
    requestAnimationFrame(this.loop);
  }

  private readonly loop = (timestamp: number): void => {
    const deltaMs = Math.min(34, timestamp - this.lastTime || 16.67);
    this.lastTime = timestamp;
    this.handleStateInput();
    this.animation.update(deltaMs);

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
      this.animation.play(this.player, 'dash', { lockForMs: DASH_DURATION_MS, fallback: 'walk' });
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
    const light = this.player.character.id === 'cyber-ninja-blue' ? moveById.get('jab') : this.player.equippedMoves[0];
    const heavy = this.player.character.id === 'cyber-ninja-blue' ? moveById.get('cross') ?? moveById.get('roundhouse_kick') : this.player.equippedMoves[1];
    const style = this.player.character.id === 'cyber-ninja-blue' ? moveById.get('roundhouse_kick') : this.player.equippedMoves[2];

    if (this.input.wasPressed('l')) {
      this.tryPlayerGrapple();
      return;
    }

    const selected =
      (this.input.wasPressed('h') && light) ||
      (this.input.wasPressed('j') && heavy) ||
      (this.input.wasPressed('k') && style) ||
      this.slotMovePressed();

    if (!selected) return;
    const hitbox = this.combat.startAttack(this.player, selected);
    if (hitbox) {
      this.hitboxes.push(hitbox);
      this.animation.play(this.player, selected.animationKey, {
        lockForMs: selected.windupMs + selected.activeMs + selected.recoveryMs,
        fallback: 'idle',
      });
    }
  }

  private slotMovePressed() {
    const slotKeys = ['n', 'o', 'p', 'm'];
    for (let index = 0; index < 4; index += 1) {
      if (this.input.wasPressed(slotKeys[index])) {
        return this.player.equippedMoves[index];
      }
    }
    return undefined;
  }

  private tryPlayerGrapple(): void {
    const move = this.getGrappleMove();
    if (!move || !this.player.canUseMove(move)) return;

    const animationKey = this.getGrappleAnimationKey();
    const grappleMove: MoveDefinition = { ...move, animationKey };
    const durationMs = Math.max(360, move.windupMs + move.activeMs + move.recoveryMs);
    this.player.stamina -= Math.min(this.player.stamina, move.staminaCost);
    this.player.moveCooldowns.set(move.id, Math.max(move.cooldownMs, 680));
    this.player.attackLockMs = durationMs;
    this.player.activeMove = grappleMove;
    this.player.activeMoveMs = Math.min(durationMs, 520);

    const target = this.findGrappleTarget();
    if (target) {
      this.player.facing = target.x < this.player.x ? -1 : 1;
      const controlX = this.player.x + this.player.facing * (this.player.radius + target.radius * 0.55);
      target.x = controlX;
      target.y = this.player.y + Math.sign(target.y - this.player.y) * 8;
      target.takeDamage(Math.max(8, Math.round(move.damage * 0.45)));
      target.stunMs = Math.max(target.stunMs, 620);
      target.vx = this.player.facing * 170 * target.knockbackResistance;
      target.vy = Math.sign(target.y - this.player.y || 1) * 28;
      this.animation.play(target, 'knockdown', { lockForMs: 420, fallback: 'hit_react' });
      this.dust.push({ x: target.x, y: target.y + 12, lifeMs: 300 });
    }

    this.animation.play(this.player, animationKey, { lockForMs: durationMs, fallback: 'idle' });
  }

  private findGrappleTarget(): Enemy | Boss | undefined {
    const maxRange = this.player.radius + 62;
    return this.livingEnemies()
      .filter((target) => {
        const dx = target.x - this.player.x;
        return Math.hypot(dx, target.y - this.player.y) <= maxRange && Math.sign(dx || this.player.facing) === this.player.facing;
      })
      .sort((a, b) => this.player.distanceTo(a) - this.player.distanceTo(b))[0];
  }

  private getGrappleMove(): MoveDefinition | undefined {
    const preferredByCharacter: Record<string, string> = {
      'cyber-ninja-blue': 'low_kick',
      'shadow-striker-purple': 'short_elbow',
      'cyber-monk-orange': 'hip_throw',
      'neo-operative-green': 'double_leg_takedown',
    };
    return moveById.get(preferredByCharacter[this.player.character.id]) ?? this.player.equippedMoves[2] ?? this.player.equippedMoves[0];
  }

  private getGrappleAnimationKey(): string {
    const animationByCharacter: Record<string, string> = {
      'cyber-ninja-blue': 'low_kick',
      'shadow-striker-purple': 'short_elbow',
      'cyber-monk-orange': 'hip_throw',
      'neo-operative-green': 'double_leg_takedown',
    };
    return animationByCharacter[this.player.character.id] ?? 'hit_react';
  }

  private tryEnemyAttack(enemy: Enemy | Boss): void {
    const move = enemy.equippedMoves[0];
    const hitbox = this.combat.startAttack(enemy, move);
    if (hitbox) {
      this.hitboxes.push(hitbox);
      this.animation.play(enemy, enemyAttackAnimationByMove[move.id] ?? enemy.definition.attackAnimation ?? move.animationKey, {
        lockForMs: move.windupMs + move.activeMs + move.recoveryMs,
        fallback: 'idle',
      });
    }
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
      else if (this.state === 'spriteLab') this.returnHome();
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
    this.spriteLab.hide();
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
    this.spriteLab.hide();
    this.menuScreen.showGameOver();
  }

  private returnHome(): void {
    this.state = 'home';
    this.enemies = [];
    this.boss = null;
    this.hitboxes = [];
    this.dust = [];
    this.rewardScreen.hide();
    this.spriteLab.hide();
    this.menuScreen.showHome(this.selectedCharacterId);
  }

  private createPlayer(): Player {
    const character = characters.find((entry) => entry.id === this.selectedCharacterId) ?? characters[0];
    return new Player(character, getCharacterMoves(character));
  }

  private async preloadBeginningSprites(): Promise<void> {
    await Promise.all([
      this.assets.loadImage(DESERT_ARENA_BACKGROUND_PATH, { kind: 'background' }),
      ...spriteRegistry.flatMap((sprite) =>
        getKnownAnimationKeys(sprite.id).map((animation) => this.assets.resolveAnimation(sprite.id, animation)),
      ),
    ]);
    if (new URLSearchParams(window.location.search).has('debugSprites')) {
      printSpriteCoverageReport();
    }
  }

  private openSpriteLab(): void {
    this.state = 'spriteLab';
    this.rewardScreen.hide();
    this.menuScreen.hide();
    this.spriteLab.show(() => this.returnHome());
    printSpriteCoverageReport();
  }

  private selectCharacter(characterId: string): void {
    this.selectedCharacterId = characterId;
    this.player = this.createPlayer();
    this.camera.follow(this.player, this.canvas.width, this.canvas.height);
    this.menuScreen.showHome(this.selectedCharacterId);
  }
}
