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
  ENEMY_STAMINA_REGEN_PER_SECOND,
} from './constants';
import { InputManager } from './InputManager';
import { Boss } from '../entities/Boss';
import { Enemy } from '../entities/Enemy';
import { Obstacle } from '../entities/Obstacle';
import { Player } from '../entities/Player';
import { characters, getCharacterMoves } from '../data/characters';
import { getCharacterLoadout, type MoveSlotKey } from '../data/characterLoadouts';
import { getGrappleVisualSuppression, shouldHideGrappleTargetSprite } from '../data/grappleVisualSuppression';
import type { MoveDefinition } from '../data/moves';
import { enemyAttackAnimationByMove, getKnownAnimationKeys, printSpriteCoverageReport } from '../data/spriteAnimations';
import { spriteRegistry } from '../data/spriteRegistry';
import { AnimationSystem } from '../systems/AnimationSystem';
import { type AttackHitbox, CombatSystem, type HitImpact } from '../systems/CombatSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { LootSystem } from '../systems/LootSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { ProgressionSystem } from '../systems/ProgressionSystem';
import {
  RenderSystem,
  type DustPuff,
  type GrappleDebugRenderInfo,
  type ImpactSpark,
  type GrappleSuppressionRenderInfo,
} from '../systems/RenderSystem';
import { WaveSystem } from '../systems/WaveSystem';
import { Hud } from '../ui/Hud';
import { MenuScreen } from '../ui/MenuScreen';
import { RewardScreen } from '../ui/RewardScreen';
import { SpriteLab } from '../ui/SpriteLab';
import { TEST_BALANCE } from './testBalance';

type GameState = 'home' | 'settings' | 'playing' | 'paused' | 'reward' | 'gameOver' | 'spriteLab';
const DESERT_ARENA_BACKGROUND_PATH = '/assets/fightcore/backgrounds/desert-arena/day.png';
const CYBER_MONKEY_GRAPPLER_ID = 'cyber-monkey-grappler';
const CYBER_MONKEY_GRAPPLER_TELEGRAPH_MS = 360;
const CYBER_MONKEY_GRAPPLER_ATTACK_RELEASE_MS = 90;

interface VisualSuppression {
  hiddenEntityId: string;
  sourceEntityId: string;
  sourceAnimationKey: string;
  remainingMs: number;
  startFrame: number;
  endFrame: number;
}

interface ActiveGrappleLock {
  attacker: Player | Enemy | Boss;
  target: Player | Enemy | Boss;
  remainingMs: number;
  totalMs: number;
  attackerStartX: number;
  attackerStartY: number;
  attackerEndX: number;
  attackerEndY: number;
  targetStartX: number;
  targetStartY: number;
  targetEndX: number;
  targetEndY: number;
}

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
  private selectedCharacterId = 'cyber-ninja';
  private player = this.createPlayer();
  private enemies: Enemy[] = [];
  private boss: Boss | null = null;
  private hitboxes: AttackHitbox[] = [];
  private dust: DustPuff[] = [];
  private impacts: ImpactSpark[] = [];
  private visualSuppressions = new Map<string, VisualSuppression>();
  private activeGrapples: ActiveGrappleLock[] = [];
  private grappleDebug?: GrappleDebugRenderInfo;
  private hitPauseMs = 0;
  private screenShakeMs = 0;
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

    if (this.state === 'playing' && this.hitPauseMs > 0) {
      this.hitPauseMs = Math.max(0, this.hitPauseMs - deltaMs);
      this.updateFeedbackTimers(deltaMs);
    } else if (this.state === 'playing') {
      this.update(deltaMs);
    }

    this.draw();
    this.input.endFrame();
    requestAnimationFrame(this.loop);
  };

  private update(deltaMs: number): void {
    const deltaSeconds = deltaMs / 1000;
    this.updateActiveGrapples(deltaMs);
    this.updatePlayer(deltaSeconds);
    this.updateEnemies(deltaMs);
    this.updateTimers(deltaMs);

    const missedPlayerAttack = this.hitboxes.some(
      (hitbox) => hitbox.owner === this.player && hitbox.remainingMs > 0 && hitbox.remainingMs - deltaMs <= 0 && hitbox.hitIds.size === 0,
    );
    this.hitboxes = this.combat.updateHitboxes(this.hitboxes, deltaMs);
    if (missedPlayerAttack) this.player.resetMomentum('Flow missed');
    for (const hitbox of this.hitboxes) {
      const targets = hitbox.owner === this.player ? this.livingEnemies() : [this.player];
      for (const impact of this.combat.applyHitbox(hitbox, targets)) {
        this.handleHitImpact(impact);
      }
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
    if (this.isGrappleLocked(this.player)) {
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.interruptMeditation('Meditation interrupted');
      return;
    }
    const speedBoost = this.player.dashMs > 0 ? 2.7 : 1;
    const canMove = this.player.stunMs <= 0;
    const speed = (this.player.speed || PLAYER_BASE_SPEED) * speedBoost * this.player.getSpeedMultiplier();

    this.player.vx = canMove ? axis.x * speed : this.player.vx * 0.92;
    this.player.vy = canMove ? axis.y * speed : this.player.vy * 0.92;
    if (canMove && axis.x !== 0) this.player.facing = axis.x < 0 ? -1 : 1;

    if (this.input.wasPressed(' ') && this.player.dashCooldownMs <= 0 && this.player.stamina >= DASH_STAMINA_COST) {
      this.player.interruptMeditation('Meditation canceled');
      this.player.stamina -= DASH_STAMINA_COST;
      this.player.dashMs = DASH_DURATION_MS;
      this.player.dashCooldownMs = DASH_COOLDOWN_MS;
      this.animation.play(this.player, 'dash', { lockForMs: DASH_DURATION_MS, fallback: 'walk' });
      this.dust.push({ x: this.player.x, y: this.player.y + 14, lifeMs: 300 });
    }

    if ((axis.x !== 0 || axis.y !== 0) && this.player.meditationMs > 0) {
      this.player.interruptMeditation('Meditation canceled');
    }
    this.handleAbilityInput();
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
      enemy.telegraphMs = Math.max(0, enemy.telegraphMs - deltaMs);
      if (this.isGrappleLocked(enemy)) {
        enemy.vx = 0;
        enemy.vy = 0;
        continue;
      }

      if (canMove && distance > enemy.attackRange) {
        enemy.vx = (dx / distance) * enemy.speed;
        enemy.vy = (dy / distance) * enemy.speed;
      } else {
        enemy.vx *= 0.86;
        enemy.vy *= 0.86;
      }

      enemy.facing = this.player.x < enemy.x ? -1 : 1;
      if (distance <= enemy.attackRange + 20 && enemy.stunMs <= 0) {
        if (this.shouldTelegraphEnemyAttack(enemy)) {
          this.updateTelegraphedEnemyAttack(enemy);
        } else {
          this.tryEnemyAttack(enemy);
        }
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
      if (this.isGrappleLocked(boss)) {
        boss.vx = 0;
        boss.vy = 0;
        return;
      }

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
    const abilityRestore = this.player.updateAbilityTimers(deltaMs);
    if (abilityRestore.healthRestored > 0 || abilityRestore.staminaRestored > 0) {
      this.impacts.push({
        x: this.player.x,
        y: this.player.y - this.player.radius * 1.8,
        lifeMs: 260,
        color: '#63f7a6',
        label: `+${Math.round(abilityRestore.healthRestored)} hp +${Math.round(abilityRestore.staminaRestored)} sta`,
      });
    }
    this.player.dashMs = Math.max(0, this.player.dashMs - deltaMs);
    this.player.dashCooldownMs = Math.max(0, this.player.dashCooldownMs - deltaMs);

    for (const enemy of this.livingEnemies()) {
      this.combat.updateFighterTimers(enemy, deltaMs);
      enemy.stamina = Math.min(enemy.maxStamina, enemy.stamina + ENEMY_STAMINA_REGEN_PER_SECOND * (deltaMs / 1000));
    }

    for (const puff of this.dust) puff.lifeMs -= deltaMs;
    this.dust = this.dust.filter((puff) => puff.lifeMs > 0);
    this.updateFeedbackTimers(deltaMs);
    this.updateVisualSuppressions(deltaMs);
  }

  private handleAttackInput(): void {
    const selected = this.slotMovePressed();

    if (!selected) return;
    this.player.interruptMeditation('Meditation canceled');
    if (shouldHideGrappleTargetSprite(this.player.character.id, selected.move.animationKey)) {
      this.tryPlayerGrapple(selected.move);
      return;
    }

    const hitbox = this.combat.startAttack(this.player, selected.move);
    if (hitbox) {
      if (selected.move.healAmount) {
        const restored = this.player.heal(selected.move.healAmount);
        if (restored > 0) {
          this.impacts.push({
            x: this.player.x,
            y: this.player.y - this.player.radius * 1.5,
            lifeMs: 520,
            color: '#63f7a6',
            label: `+${Math.round(restored)}`,
          });
        }
      }
      if (selected.move.hitboxWidth > 0 && selected.move.hitboxHeight > 0) this.hitboxes.push(hitbox);
      const totalMs = selected.move.windupMs + selected.move.activeMs + selected.move.recoveryMs;
      this.animation.play(this.player, selected.move.animationKey, {
        lockForMs: Math.round(totalMs * 1.18),
        fallback: 'idle',
      });
    }
  }

  private slotMovePressed(): { slot: MoveSlotKey; move: MoveDefinition } | undefined {
    const slotKeys: MoveSlotKey[] = ['H', 'J', 'K', 'L'];
    for (let index = 0; index < slotKeys.length; index += 1) {
      const slot = slotKeys[index];
      if (this.input.wasPressed(slot.toLowerCase())) {
        const move = this.player.equippedMoves[index];
        if (move) return { slot, move };
      }
    }
    return undefined;
  }

  private tryPlayerGrapple(move: MoveDefinition): void {
    if (!move || !this.player.canUseMove(move)) return;

    const targets = this.findGrappleTargets();
    const target = targets[0];
    if (TEST_BALANCE.grappleRequireTarget && !target) {
      this.grappleDebug = this.createGrappleDebug(this.player.character.id, move.animationKey, targets, undefined, [], false, true);
      this.animation.play(this.player, 'recovery', { lockForMs: 180, fallback: 'idle' });
      this.player.attackLockMs = Math.max(this.player.attackLockMs, 180);
      return;
    }

    const grappleMove: MoveDefinition = { ...move };
    const durationMs = Math.max(760, Math.round((move.windupMs + move.activeMs + move.recoveryMs) * 1.45));
    this.player.stamina -= Math.min(this.player.stamina, this.player.getStaminaCost(move));
    this.player.moveCooldowns.set(move.id, Math.max(this.player.getCooldownMs(move), 680));
    this.player.attackLockMs = durationMs;
    this.player.activeMove = grappleMove;
    this.player.activeMoveMs = Math.min(durationMs, 520);

    if (target) {
      const secondaryTargets = TEST_BALANCE.grappleMultiTargetEnabled
        ? targets.slice(1, 1 + TEST_BALANCE.grappleMaxSecondaryTargets)
        : [];
      this.player.facing = target.x < this.player.x ? -1 : 1;
      const controlX = this.player.x + this.player.facing * (this.player.radius + target.radius * 0.55);
      const targetStartX = target.x;
      const targetStartY = target.y;
      target.x = controlX;
      target.y = this.player.y + Math.sign(target.y - this.player.y) * 8;
      target.takeDamage(Math.max(8, Math.round(move.damage * this.player.getDamageMultiplier())));
      if (this.player.criticalOverloadArmedMs > 0) this.player.consumeCriticalOverload();
      this.player.recordMomentumHit();
      target.stunMs = Math.max(target.stunMs, 620);
      target.vx = 0;
      target.vy = 0;
      this.animation.play(target, 'knockdown', { lockForMs: Math.min(durationMs, 680), fallback: 'hit_react' });
      this.suppressTargetSprite(target.id, this.player.character.id, grappleMove.animationKey, durationMs);
      this.lockGrappleMotion(this.player, target, durationMs, {
        attackerEndX: this.player.x,
        attackerEndY: this.player.y,
        targetStartX,
        targetStartY,
        targetEndX: this.player.x + this.player.facing * (this.player.radius + target.radius + 12),
        targetEndY: this.player.y + 18,
      });
      this.applySecondaryGrappleEffects(move, secondaryTargets);
      this.grappleDebug = this.createGrappleDebug(
        this.player.character.id,
        move.animationKey,
        targets,
        target,
        secondaryTargets,
        shouldHideGrappleTargetSprite(this.player.character.id, grappleMove.animationKey),
        false,
      );
      this.dust.push({ x: target.x, y: target.y + 12, lifeMs: 300 });
    }

    this.animation.play(this.player, grappleMove.animationKey, { lockForMs: durationMs, fallback: 'idle' });
  }

  private findGrappleTargets(): Array<Enemy | Boss> {
    const maxRange = TEST_BALANCE.grappleTargetRadius;
    return this.livingEnemies()
      .filter((target) => {
        const dx = target.x - this.player.x;
        return (
          !this.visualSuppressions.has(target.id) &&
          Math.hypot(dx, target.y - this.player.y) <= maxRange &&
          Math.sign(dx || this.player.facing) === this.player.facing
        );
      })
      .sort((a, b) => this.player.distanceTo(a) - this.player.distanceTo(b));
  }

  private tryEnemyAttack(enemy: Enemy | Boss): void {
    const move = enemy.equippedMoves[0];
    const animationKey = enemyAttackAnimationByMove[move.id] ?? enemy.definition.attackAnimation ?? move.animationKey;
    if (shouldHideGrappleTargetSprite(enemy.definition.id, animationKey)) {
      const distance = enemy.distanceTo(this.player);
      const hasValidTarget = this.player.alive && distance <= TEST_BALANCE.grappleTargetRadius && !this.visualSuppressions.has(this.player.id);
      this.grappleDebug = this.createGrappleDebug(
        enemy.definition.id,
        animationKey,
        hasValidTarget ? [this.player] : [],
        hasValidTarget ? this.player : undefined,
        [],
        false,
        !hasValidTarget,
      );
      if (!hasValidTarget) return;
      this.startEnemyGrappleAttack(enemy, move, animationKey);
      return;
    }
    const hitbox = this.combat.startAttack(enemy, move);
    if (hitbox) {
      this.hitboxes.push(hitbox);
      const durationMs = move.windupMs + move.activeMs + move.recoveryMs;
      this.animation.play(enemy, animationKey, {
        lockForMs: Math.round(durationMs * 1.18),
        fallback: 'idle',
      });
      this.suppressTargetSprite(this.player.id, enemy.definition.id, animationKey, durationMs);
      if (shouldHideGrappleTargetSprite(enemy.definition.id, animationKey)) {
        this.grappleDebug = this.createGrappleDebug(enemy.definition.id, animationKey, [this.player], this.player, [], true, false);
      }
    }
  }

  private handleAbilityInput(): void {
    if (!this.input.wasPressed('u')) return;
    if (!this.player.ability) return;
    if (!this.player.activateAbility()) {
      this.impacts.push({
        x: this.player.x,
        y: this.player.y - this.player.radius * 1.8,
        lifeMs: 360,
        color: '#ffef78',
        label: `${this.player.ability.name} on cooldown`,
      });
      return;
    }
    const animationKey = this.player.ability.id;
    this.animation.play(this.player, animationKey, {
      lockForMs: this.player.ability.id === 'meditation' ? this.player.ability.durationMs : 760,
      fallback: 'idle',
    });
    this.impacts.push({
      x: this.player.x,
      y: this.player.y - this.player.radius * 1.8,
      lifeMs: 560,
      color: '#23d5dd',
      label: this.player.ability.name,
    });
  }

  private shouldTelegraphEnemyAttack(enemy: Enemy): boolean {
    return enemy.definition.id === CYBER_MONKEY_GRAPPLER_ID && enemy.attackLockMs <= 0;
  }

  private updateTelegraphedEnemyAttack(enemy: Enemy): void {
    if (enemy.telegraphMs <= 0) {
      enemy.telegraphMs = CYBER_MONKEY_GRAPPLER_TELEGRAPH_MS;
      this.animation.play(enemy, 'charge', { lockForMs: CYBER_MONKEY_GRAPPLER_TELEGRAPH_MS, fallback: 'idle' });
      return;
    }

    if (enemy.telegraphMs <= CYBER_MONKEY_GRAPPLER_ATTACK_RELEASE_MS) {
      enemy.telegraphMs = 0;
      this.tryEnemyAttack(enemy);
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

    this.rewardScreen.show(
      options,
      this.player,
      (move, slotIndex) => {
        this.progression.replaceMove(this.player, move, slotIndex);
        this.loot.restoreAfterWave(this.player);
        this.spawnWave();
      },
      (option) => {
        if (option.kind === 'upgrade') this.progression.applyUpgrade(this.player, option.upgrade);
        this.loot.restoreAfterWave(this.player);
        this.spawnWave();
      },
    );
  }

  private spawnWave(): void {
    const spawned = this.waves.spawnNextWave();
    this.enemies = spawned.enemies;
    this.boss = spawned.boss;
    this.hitboxes = [];
    this.impacts = [];
    this.visualSuppressions.clear();
    this.activeGrapples = [];
    this.state = 'playing';
  }

  private livingEnemies(): Array<Enemy | Boss> {
    const actors: Array<Enemy | Boss> = this.enemies.filter((enemy) => enemy.alive);
    if (this.boss?.alive) actors.push(this.boss);
    return actors;
  }

  private draw(): void {
    this.render.draw(
      this.ctx,
      this.camera,
      this.player,
      this.enemies,
      this.boss,
      this.obstacles,
      this.hitboxes,
      this.dust,
      this.impacts,
      this.suppressedEntityIds(),
      this.grappleSuppressionRenderInfo(),
      this.grappleDebug,
      this.screenShakeMs,
    );
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
      const radius = 22 + (i % 3) * 6;
      obstacles.push(new Obstacle(`obstacle_${i}`, 'rock', x, y, radius));
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
    this.impacts = [];
    this.visualSuppressions.clear();
    this.activeGrapples = [];
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
    this.visualSuppressions.clear();
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
    this.impacts = [];
    this.visualSuppressions.clear();
    this.activeGrapples = [];
    this.rewardScreen.hide();
    this.spriteLab.hide();
    this.menuScreen.showHome(this.selectedCharacterId);
  }

  private createPlayer(): Player {
    const character = characters.find((entry) => entry.id === this.selectedCharacterId) ?? characters[0];
    return new Player(character, getCharacterLoadout(character.id), getCharacterMoves(character));
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
    this.visualSuppressions.clear();
    this.activeGrapples = [];
    this.camera.follow(this.player, this.canvas.width, this.canvas.height);
    this.menuScreen.showHome(this.selectedCharacterId);
  }

  private suppressTargetSprite(hiddenEntityId: string, sourceEntityId: string, animationKey: string, durationMs: number): void {
    const metadata = getGrappleVisualSuppression(sourceEntityId, animationKey);
    if (!metadata) return;
    this.visualSuppressions.set(hiddenEntityId, {
      hiddenEntityId,
      sourceEntityId,
      sourceAnimationKey: animationKey,
      remainingMs: durationMs,
      startFrame: metadata.startFrame,
      endFrame: metadata.endFrame,
    });
  }

  private applySecondaryGrappleEffects(move: MoveDefinition, targets: Array<Enemy | Boss>): void {
    for (const target of targets) {
      const damage = Math.max(4, Math.round(move.damage * this.player.getDamageMultiplier() * TEST_BALANCE.grappleSecondaryDamageMultiplier));
      const stun = Math.round(move.stunMs * TEST_BALANCE.grappleSecondaryControlMultiplier);
      const knockback = move.knockback * TEST_BALANCE.grappleSecondaryControlMultiplier * target.knockbackResistance;
      const direction = Math.sign(target.x - this.player.x) || this.player.facing;
      target.takeDamage(damage);
      target.stunMs = Math.max(target.stunMs, stun);
      target.vx += direction * knockback;
      target.vy += Math.sign(target.y - this.player.y || 1) * knockback * 0.18;
      this.animation.play(target, 'hit_react', { lockForMs: Math.max(180, stun), fallback: 'idle' });
    }
  }

  private createGrappleDebug(
    activeCharacter: string,
    activeMove: string,
    nearbyTargets: Array<{ id: string }>,
    primaryTarget: { id: string } | undefined,
    secondaryTargets: Array<{ id: string }>,
    suppressionActive: boolean,
    failedNoTarget: boolean,
  ): GrappleDebugRenderInfo {
    return {
      activeCharacter,
      activeMove,
      targetSearchRadius: TEST_BALANCE.grappleTargetRadius,
      nearbyTargetCount: nearbyTargets.length,
      primaryTargetId: primaryTarget?.id,
      secondaryTargetIds: secondaryTargets.map((target) => target.id),
      suppressionActive,
      failedNoTarget,
    };
  }

  private startEnemyGrappleAttack(enemy: Enemy | Boss, move: MoveDefinition, animationKey: string): void {
    if (!enemy.canUseMove(move)) return;
    enemy.stamina -= enemy.getStaminaCost(move);
    enemy.moveCooldowns.set(move.id, enemy.getCooldownMs(move));
    const durationMs = Math.max(820, Math.round((move.windupMs + move.activeMs + move.recoveryMs) * 1.5));
    enemy.attackLockMs = durationMs;
    enemy.activeMove = move;
    enemy.activeMoveMs = Math.min(durationMs, 680);
    enemy.facing = this.player.x < enemy.x ? -1 : 1;

    const playerStartX = this.player.x;
    const playerStartY = this.player.y;
    const playerEndX = enemy.x + enemy.facing * (enemy.radius + this.player.radius + 12);
    const playerEndY = enemy.y + 18;
    this.player.takeDamage(move.damage * TEST_BALANCE.enemyDamageMultiplier);
    this.player.stunMs = Math.max(this.player.stunMs, Math.min(durationMs, 720));
    this.player.vx = 0;
    this.player.vy = 0;
    this.animation.play(enemy, animationKey, { lockForMs: durationMs, fallback: 'idle' });
    this.animation.play(this.player, 'knockdown', { lockForMs: Math.min(durationMs, 720), fallback: 'hit_react' });
    this.suppressTargetSprite(this.player.id, enemy.definition.id, animationKey, durationMs);
    this.lockGrappleMotion(enemy, this.player, durationMs, {
      attackerEndX: enemy.x,
      attackerEndY: enemy.y,
      targetStartX: playerStartX,
      targetStartY: playerStartY,
      targetEndX: playerEndX,
      targetEndY: playerEndY,
    });
    this.grappleDebug = this.createGrappleDebug(enemy.definition.id, animationKey, [this.player], this.player, [], true, false);
  }

  private lockGrappleMotion(
    attacker: Player | Enemy | Boss,
    target: Player | Enemy | Boss,
    durationMs: number,
    placement: {
      attackerEndX: number;
      attackerEndY: number;
      targetStartX: number;
      targetStartY: number;
      targetEndX: number;
      targetEndY: number;
    },
  ): void {
    this.activeGrapples = this.activeGrapples.filter((lock) => lock.attacker !== attacker && lock.target !== attacker && lock.attacker !== target && lock.target !== target);
    this.activeGrapples.push({
      attacker,
      target,
      remainingMs: durationMs,
      totalMs: durationMs,
      attackerStartX: attacker.x,
      attackerStartY: attacker.y,
      attackerEndX: placement.attackerEndX,
      attackerEndY: placement.attackerEndY,
      targetStartX: placement.targetStartX,
      targetStartY: placement.targetStartY,
      targetEndX: placement.targetEndX,
      targetEndY: placement.targetEndY,
    });
  }

  private updateActiveGrapples(deltaMs: number): void {
    for (const lock of this.activeGrapples) {
      lock.remainingMs = Math.max(0, lock.remainingMs - deltaMs);
      const progress = 1 - lock.remainingMs / Math.max(1, lock.totalMs);
      const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      lock.attacker.x = lerp(lock.attackerStartX, lock.attackerEndX, eased);
      lock.attacker.y = lerp(lock.attackerStartY, lock.attackerEndY, eased);
      lock.target.x = lerp(lock.targetStartX, lock.targetEndX, eased);
      lock.target.y = lerp(lock.targetStartY, lock.targetEndY, eased);
      lock.attacker.vx = 0;
      lock.attacker.vy = 0;
      lock.target.vx = 0;
      lock.target.vy = 0;
    }
    this.activeGrapples = this.activeGrapples.filter((lock) => lock.remainingMs > 0 && lock.attacker.alive && lock.target.alive);
  }

  private isGrappleLocked(actor: Player | Enemy | Boss): boolean {
    return this.activeGrapples.some((lock) => lock.attacker === actor || lock.target === actor);
  }

  private updateFeedbackTimers(deltaMs: number): void {
    this.screenShakeMs = Math.max(0, this.screenShakeMs - deltaMs);
    for (const spark of this.impacts) spark.lifeMs -= deltaMs;
    this.impacts = this.impacts.filter((spark) => spark.lifeMs > 0);
    for (const actor of [this.player, ...this.livingEnemies()]) {
      actor.damageFlashMs = Math.max(0, actor.damageFlashMs - deltaMs);
      actor.healFlashMs = Math.max(0, actor.healFlashMs - deltaMs);
    }
  }

  private handleHitImpact(impact: HitImpact): void {
    this.impacts.push({
      x: impact.x,
      y: impact.y,
      lifeMs: impact.heavy ? 360 : 260,
      color: impact.attacker === this.player ? '#ffef78' : '#ff6a4d',
      label: `${Math.round(impact.damage)}`,
    });
    this.hitPauseMs = Math.max(this.hitPauseMs, impact.heavy ? 70 : 42);
    if (impact.heavy) this.screenShakeMs = Math.max(this.screenShakeMs, 180);
    if (impact.attacker === this.player) {
      if (this.player.criticalOverloadArmedMs > 0) this.player.consumeCriticalOverload();
      this.player.recordMomentumHit();
    }
    this.playDamageAnimation(impact);
  }

  private playDamageAnimation(impact: HitImpact): void {
    if (!(impact.target instanceof Enemy || impact.target instanceof Boss || impact.target instanceof Player)) return;
    if (!impact.target.alive) return;
    const oldHealth = impact.target.health + impact.damage;
    const oldQuarter = Math.floor((oldHealth / impact.target.maxHealth) * 4);
    const newQuarter = Math.floor((impact.target.health / impact.target.maxHealth) * 4);
    const majorDamage = impact.heavy || newQuarter < oldQuarter;
    this.animation.play(impact.target, majorDamage ? 'knockdown' : 'hit_react', {
      lockForMs: majorDamage ? 520 : 280,
      fallback: 'hit_react',
    });
  }

  private updateVisualSuppressions(deltaMs: number): void {
    for (const [entityId, suppression] of this.visualSuppressions) {
      suppression.remainingMs -= deltaMs;
      const stillAlive =
        entityId === this.player.id
          ? this.player.alive
          : this.livingEnemies().some((actor) => actor.id === entityId);
      if (suppression.remainingMs <= 0 || !stillAlive) this.visualSuppressions.delete(entityId);
    }
  }

  private suppressedEntityIds(): Set<string> {
    return new Set(this.visualSuppressions.keys());
  }

  private grappleSuppressionRenderInfo(): GrappleSuppressionRenderInfo[] {
    return Array.from(this.visualSuppressions.values());
  }
}

function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}
