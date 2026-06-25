import { AssetLoader } from './AssetLoader';
import { Camera } from './Camera';
import {
  DASH_COOLDOWN_MS,
  DASH_DURATION_MS,
  OBSTACLE_COUNT,
  PLAYER_BASE_SPEED,
  STAMINA_REGEN_PER_SECOND,
  ENEMY_STAMINA_REGEN_PER_SECOND,
} from './constants';
import { InputManager } from './InputManager';
import { Boss } from '../entities/Boss';
import { Enemy } from '../entities/Enemy';
import type { Fighter } from '../entities/Fighter';
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
  DESERT_ARENA_ASSET_PATHS,
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
import { PLAYABLE_ARENA_BOUNDS, clampEntityToPlayableArena, clampToPlayableArena } from './arenaBounds';
import { loadGameSettings, saveGameSettings, type GameSettings } from './settings';

type GameState = 'home' | 'settings' | 'playing' | 'paused' | 'reward' | 'gameOver' | 'spriteLab';
const CYBER_MONKEY_GRAPPLER_ID = 'cyber-monkey-grappler';
const CYBER_MONKEY_GRAPPLER_TELEGRAPH_MS = 360;
const CYBER_MONKEY_GRAPPLER_ATTACK_RELEASE_MS = 90;
const PASSIVE_HEALTH_REGEN_PER_SECOND = 1.4;
const chainVisuals: Record<string, { frames: number[]; durations: number[]; skipMs: number; note: string }> = {
  jab: { frames: [2, 3, 4], durations: [54, 92, 54], skipMs: 54, note: '0003 pre-impact, 0004 impact, 0005 recovery' },
  cross: { frames: [2, 3, 4], durations: [46, 126, 58], skipMs: 76, note: '0003 pre-impact, 0004 held impact, 0005 recovery' },
  calf_kick: { frames: [2, 3, 4], durations: [54, 104, 62], skipMs: 72, note: '0003 chamber, 0004 impact extension, 0005 recovery' },
  side_kick: { frames: [2, 3, 5], durations: [58, 132, 64], skipMs: 88, note: '0003 chamber, 0004 impact extension, 0006 guard return' },
  knee: { frames: [1, 2, 3], durations: [54, 116, 68], skipMs: 70, note: '0002 entry, 0003 knee impact, 0004 recovery' },
  jab_cross: { frames: [2, 3, 4], durations: [78, 142, 60], skipMs: 92, note: '0003 jab impact, 0004 cross impact, 0005 recovery' },
  feint_rear_hook: { frames: [4, 5, 6], durations: [62, 130, 68], skipMs: 110, note: '0005 pre-hook, 0006 hook impact, 0007 recovery' },
  roundhouse_kick: { frames: [3, 4, 5], durations: [68, 144, 72], skipMs: 112, note: '0004 kick setup, 0005 full extension, 0006 guard return' },
  tornado_kick: { frames: [5, 6, 7], durations: [72, 170, 66], skipMs: 150, note: '0006 pre-impact, 0007 held impact, 0008 recovery' },
};
const PLAYER_ATTACK_QUEUE_TIMEOUT_MS = 360;
const FINAL_SCOPE_ENTITY_IDS = ['ronin', 'supreme-emperor', 'monkey-grunt', 'striker-monkey'] as const;

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

interface PendingVisualState {
  target: Player | Enemy | Boss;
  animationKey: string;
  remainingMs: number;
  lockForMs: number;
  fallback: string;
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
  private selectedCharacterId = 'ronin';
  private player = this.createPlayer();
  private enemies: Enemy[] = [];
  private boss: Boss | null = null;
  private hitboxes: AttackHitbox[] = [];
  private dust: DustPuff[] = [];
  private impacts: ImpactSpark[] = [];
  private visualSuppressions = new Map<string, VisualSuppression>();
  private pendingVisualStates = new Map<string, PendingVisualState>();
  private activeGrapples: ActiveGrappleLock[] = [];
  private queuedPlayerMove: MoveDefinition | null = null;
  private queuedPlayerMoveMs = 0;
  private playerChainGraceMs = 0;
  private grappleDebug?: GrappleDebugRenderInfo;
  private hitPauseMs = 0;
  private screenShakeMs = 0;
  private hitReactionSeed = 0;
  private lastTime = 0;
  private state: GameState = 'home';
  private settingsReturnState: GameState = 'home';
  private settings: GameSettings = loadGameSettings();

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
      onStartCharacter: (characterId) => this.startCharacterRun(characterId),
      onCredits: () => this.openCredits(),
      onFullscreen: () => this.toggleFullscreen(),
      onToggleScreenShake: (enabled) => this.updateScreenShakeSetting(enabled),
      onCameraDistance: (distance) => this.updateCameraDistance(distance),
      onBack: () => this.closeMenuPanel(),
      onResume: () => this.resumeGame(),
      onRestart: () => this.startNewRun(),
      onHome: () => this.returnHome(),
    });
    this.resize();
    window.addEventListener('resize', this.resize);
    this.camera.distance = this.settings.cameraDistance;
    this.camera.snapTo(this.player, this.canvas.width, this.canvas.height);
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
    this.updateQueuedAttack(deltaMs);

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

    this.enemies = this.enemies.filter((enemy) => enemy.alive || enemy.defeatHoldMs > 0);
    if (this.boss && !this.boss.alive && this.boss.defeatHoldMs <= 0) this.boss = null;

    if (!this.player.alive) {
      this.openGameOver();
    } else if (this.enemies.length === 0 && !this.boss) {
      this.openReward();
    }

    this.camera.follow(this.player, this.canvas.width, this.canvas.height, deltaMs);
  }

  private updatePlayer(deltaSeconds: number): void {
    const axis = this.input.getMovementAxis();
    if (this.isGrappleLocked(this.player)) {
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.interruptMeditation('Meditation interrupted');
      return;
    }
    const moving = axis.x !== 0 || axis.y !== 0;
    const speedBoost = this.player.dashMs > 0 ? 2.7 : 1;
    const canMove = this.player.stunMs <= 0;
    const speed = (this.player.speed || PLAYER_BASE_SPEED) * speedBoost * this.player.getSpeedMultiplier();

    this.player.vx = canMove ? axis.x * speed : this.player.vx * 0.92;
    this.player.vy = canMove ? axis.y * speed : this.player.vy * 0.92;
    if (canMove && axis.x !== 0) this.player.facing = axis.x < 0 ? -1 : 1;

    if (this.input.wasPressed(' ') && this.player.dashCooldownMs <= 0) {
      this.player.interruptMeditation('Meditation canceled');
      this.player.dashMs = DASH_DURATION_MS;
      this.player.dashCooldownMs = Math.max(220, DASH_COOLDOWN_MS - this.player.upgrades.dashLevel * 90);
      if (this.nearestEnemyDistance() < 240) this.player.gainActivity(11 + this.player.upgrades.dashActivityLevel * 4, 1150);
      this.animation.play(this.player, 'dash', { lockForMs: DASH_DURATION_MS, fallback: 'walk' });
    }

    if (moving && this.player.meditationMs > 0) {
      this.player.interruptMeditation('Meditation canceled');
    }
    this.handleAbilityInput();
    this.handleAttackInput();
    this.movement.update(this.player, deltaSeconds);
    this.collision.resolveObstacleCollision(this.player, this.obstacles);
    clampEntityToPlayableArena(this.player);
    const nearEnemy = this.nearestEnemyDistance() < 150;
    if (nearEnemy && canMove) this.player.gainActivity(1.8 * deltaSeconds, 700);
    this.player.updateActivity(deltaSeconds * 1000, moving || nearEnemy || this.player.activeMove !== null || this.player.dashMs > 0);
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
      clampEntityToPlayableArena(enemy);
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
      clampEntityToPlayableArena(boss);
    }
  }

  private updateTimers(deltaMs: number): void {
    this.combat.updateFighterTimers(this.player, deltaMs);
    this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + STAMINA_REGEN_PER_SECOND * (deltaMs / 1000));
    this.updatePassiveHealthRegen(deltaMs);
    const abilityRestore = this.player.updateAbilityTimers(deltaMs);
    if (this.player.activity >= 70 && this.player.abilityCooldownMs > 0) {
      this.player.abilityCooldownMs = Math.max(0, this.player.abilityCooldownMs - deltaMs * 0.35);
    }
    if (abilityRestore.healthRestored > 0) {
      this.impacts.push({
        x: this.player.x,
        y: this.player.y - this.player.radius * 1.8,
        lifeMs: 260,
        color: '#63f7a6',
        label: `+${Math.round(abilityRestore.healthRestored)} hp`,
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
    this.updatePendingVisualStates(deltaMs);
  }

  private handleAttackInput(): void {
    const pressed = this.slotMovePressed();
    if (pressed && this.player.attackLockMs > 0 && this.canQueuePlayerMove(pressed.move)) {
      this.queuePlayerMove(pressed.move);
      return;
    }
    if (pressed && !this.player.canUseMove(pressed.move)) {
      if (this.canQueuePlayerMove(pressed.move)) this.queuePlayerMove(pressed.move);
      return;
    }
    const queued = !pressed && this.queuedPlayerMove && this.canReleaseQueuedMove(this.queuedPlayerMove) ? { slot: 'H' as MoveSlotKey, move: this.queuedPlayerMove } : undefined;
    const selected = pressed ?? queued;

    if (!selected) return;
    this.player.interruptMeditation('Meditation canceled');
    if (shouldHideGrappleTargetSprite(this.player.character.id, selected.move.animationKey)) {
      this.tryPlayerGrapple(selected.move);
      return;
    }

    const chained = selected.move === this.queuedPlayerMove || this.playerChainGraceMs > 0 || this.player.dashMs > 0;
    if (selected.move === this.queuedPlayerMove) this.clearQueuedPlayerMove();
    const hitbox = this.combat.startAttack(this.player, selected.move, {
      ignoreAttackLock: selected === queued || chained,
      ignoreCooldown: chained && ['jab', 'cross'].includes(selected.move.id),
    });
    if (hitbox) {
      if (chained) this.shortenChainedStartup(selected.move, hitbox);
      if (selected.move.id === 'tornado_kick' && this.player.character.id === 'supreme-emperor') this.applyTornadoKickSpacing();
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
      const lockForMs = this.player.getAttackLockMs(selected.move);
      this.animation.play(this.player, selected.move.animationKey, {
        lockForMs: this.visualLockMs(selected.move, lockForMs, chained),
        fallback: 'idle',
        force: chained,
        ...this.chainVisualOptions(selected.move, chained),
      });
    }
  }

  private canQueuePlayerMove(move: MoveDefinition): boolean {
    if (this.player.stunMs > 0 || (this.player.abilityActiveMs > 0 && this.player.ability?.id === 'density')) return false;
    return this.player.attackLockMs > 0 && this.player.attackLockMs < Math.max(220, this.player.getAttackLockMs(move) * 0.72);
  }

  private canReleaseQueuedMove(move: MoveDefinition): boolean {
    if (this.player.stunMs > 0) return false;
    const cancelPoint = this.player.lastLandedMoveId ? 0.54 : 0.38;
    return this.player.attackLockMs <= Math.max(95, this.player.getAttackLockMs(move) * cancelPoint);
  }

  private queuePlayerMove(move: MoveDefinition): void {
    this.queuedPlayerMove = move;
    this.queuedPlayerMoveMs = PLAYER_ATTACK_QUEUE_TIMEOUT_MS;
  }

  private clearQueuedPlayerMove(): void {
    this.queuedPlayerMove = null;
    this.queuedPlayerMoveMs = 0;
  }

  private updateQueuedAttack(deltaMs: number): void {
    this.playerChainGraceMs = Math.max(0, this.playerChainGraceMs - deltaMs);
    if (!this.queuedPlayerMove) return;
    this.queuedPlayerMoveMs = Math.max(0, this.queuedPlayerMoveMs - deltaMs);
    if (this.queuedPlayerMoveMs <= 0 || this.player.stunMs > 0) this.clearQueuedPlayerMove();
  }

  private shortenChainedStartup(move: MoveDefinition, hitbox: AttackHitbox): void {
    const visual = chainVisuals[move.id];
    if (!visual && this.player.dashMs <= 0) return;
    const skipMs = visual?.skipMs ?? 48;
    hitbox.elapsedMs = Math.min(hitbox.elapsedMs + skipMs, hitbox.totalMs * 0.28);
    hitbox.remainingMs = Math.max(0, hitbox.totalMs - hitbox.elapsedMs);
    this.player.attackLockMs = Math.max(120, this.player.attackLockMs - skipMs);
  }

  private visualLockMs(move: MoveDefinition, baseLockMs: number, chained = false): number {
    const chain = chainVisuals[move.id];
    if (chained && chain) return Math.max(baseLockMs, chain.durations.reduce((total, duration) => total + duration, 0));
    const minimums: Record<string, number> = {
      jab: 520,
      cross: 600,
      jab_cross: 820,
      tornado_kick: 1040,
    };
    return Math.max(baseLockMs, minimums[move.id] ?? move.windupMs + move.activeMs + move.recoveryMs);
  }

  private chainVisualOptions(move: MoveDefinition, chained: boolean): { frameSequence?: number[]; frameDurations?: number[] } {
    const chain = chained ? chainVisuals[move.id] : undefined;
    if (!chain) return {};
    return { frameSequence: chain.frames, frameDurations: chain.durations };
  }

  private applyTornadoKickSpacing(): void {
    const controlLevel = this.player.upgrades.emperorTornadoControlLevel;
    const range = 96 + controlLevel * 18;
    const sweetspot = 118 + controlLevel * 8;
    const maxPush = 72 + controlLevel * 18;
    for (const target of this.livingEnemies()) {
      if (!target.alive || target.stunMs > 0 || target.y < this.player.y - 84 || target.y > this.player.y + 72) continue;
      const dx = target.x - this.player.x;
      const direction = Math.sign(dx || this.player.facing) || 1;
      const distance = Math.abs(dx);
      if (distance > range) continue;
      const next = clampToPlayableArena(this.player.x + direction * sweetspot, target.y, target.radius);
      const push = Math.min(maxPush, Math.abs(next.x - target.x));
      target.x += direction * push;
      target.vx = Math.max(Math.abs(target.vx), 170 + controlLevel * 26) * direction;
      target.vy *= 0.55;
      this.dust.push({ x: target.x, y: target.y + 8, lifeMs: 220 });
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
    this.player.moveCooldowns.set(move.id, Math.max(this.player.getCooldownMs(move), 680));
    this.player.attackLockMs = durationMs;
    this.player.activeMove = grappleMove;
    this.player.activeMoveMs = Math.min(durationMs, 520);

    if (target) {
      const secondaryTargets = TEST_BALANCE.grappleMultiTargetEnabled
        ? targets.slice(1, 1 + TEST_BALANCE.grappleMaxSecondaryTargets)
        : [];
      this.player.facing = target.x < this.player.x ? -1 : 1;
      const control = clampToPlayableArena(
        this.player.x + this.player.facing * (this.player.radius + target.radius * 0.55),
        this.player.y + Math.sign(target.y - this.player.y) * 8,
        target.radius,
      );
      const targetStartX = target.x;
      const targetStartY = target.y;
      target.x = control.x;
      target.y = control.y;
      target.takeDamage(Math.max(8, Math.round(move.damage * this.player.getDamageMultiplier())));
      if (!target.alive) target.defeatHoldMs = Math.max(target.defeatHoldMs, durationMs);
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
      this.cyberWarningText(),
      (move, slotIndex) => {
        this.progression.replaceMove(this.player, move, slotIndex);
        this.applyWaveClearRecovery();
        this.spawnWave();
      },
      (option) => {
        if (option.kind === 'upgrade') this.progression.applyUpgrade(this.player, option.upgrade);
        this.applyWaveClearRecovery();
        this.spawnWave();
      },
    );
  }

  private applyWaveClearRecovery(): void {
    const restored = this.loot.restoreAfterWave(this.player);
    this.impacts.push({
      x: this.player.x,
      y: this.player.y - this.player.radius * 1.9,
      lifeMs: 900,
      color: '#63f7a6',
      label: `Wave clear +${Math.round(restored.health)} hp`,
    });
  }

  private spawnWave(): void {
    const spawned = this.waves.spawnNextWave();
    this.enemies = spawned.enemies;
    this.boss = spawned.boss;
    this.hitboxes = [];
    this.impacts = [];
    this.visualSuppressions.clear();
    this.pendingVisualStates.clear();
    this.activeGrapples = [];
    this.state = 'playing';
  }

  private cyberWarningText(): string {
    const strength = Math.min(12, Math.max(0, Math.floor((this.waves.wave - 1) / 2)));
    return `CYBER WARNING: enemy strength calibration +${strength}% next wave. Pressure rises slowly and stays survivable.`;
  }

  private livingEnemies(): Array<Enemy | Boss> {
    const actors: Array<Enemy | Boss> = this.enemies.filter((enemy) => enemy.alive);
    if (this.boss?.alive) actors.push(this.boss);
    return actors;
  }

  private nearestEnemyDistance(): number {
    const distances = this.livingEnemies().map((enemy) => Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y));
    return Math.min(Number.POSITIVE_INFINITY, ...distances);
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
    this.ctx.scale(this.camera.zoom, this.camera.zoom);
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
    const groundWidth = PLAYABLE_ARENA_BOUNDS.maxX - PLAYABLE_ARENA_BOUNDS.minX;
    const groundHeight = PLAYABLE_ARENA_BOUNDS.maxY - PLAYABLE_ARENA_BOUNDS.minY;
    for (let i = 0; i < OBSTACLE_COUNT; i += 1) {
      const radius = 22 + (i % 3) * 6;
      const x = PLAYABLE_ARENA_BOUNDS.minX + radius + ((i * 257) % Math.max(1, groundWidth - radius * 2));
      const y = PLAYABLE_ARENA_BOUNDS.minY + radius + ((i * 173) % Math.max(1, groundHeight - radius * 2));
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
    this.pendingVisualStates.clear();
    this.activeGrapples = [];
    this.waves.wave = 0;
    this.rewardScreen.hide();
    this.spriteLab.hide();
    this.menuScreen.hide();
    this.spawnWave();
    this.camera.snapTo(this.player, this.canvas.width, this.canvas.height);
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
    this.menuScreen.showSettings(this.settings.screenShake, this.settings.cameraDistance);
  }

  private updateScreenShakeSetting(enabled: boolean): void {
    this.settings = { ...this.settings, screenShake: enabled };
    saveGameSettings(this.settings);
    if (!enabled) this.screenShakeMs = 0;
  }

  private updateCameraDistance(distance: 'close' | 'normal' | 'far'): void {
    this.settings = { ...this.settings, cameraDistance: distance };
    this.camera.distance = distance;
    saveGameSettings(this.settings);
    this.camera.snapTo(this.player, this.canvas.width, this.canvas.height);
  }

  private openControls(): void {
    if (this.state !== 'home') return;
    this.settingsReturnState = 'home';
    this.menuScreen.showControls();
  }

  private openCredits(): void {
    if (this.state !== 'home') return;
    this.settingsReturnState = 'home';
    this.menuScreen.showCredits();
  }

  private closeMenuPanel(): void {
    if (this.settingsReturnState === 'paused') {
      this.state = 'paused';
      this.menuScreen.showPaused();
      return;
    }

    this.state = 'home';
    this.menuScreen.showHome(this.selectedCharacterId);
  }

  private openGameOver(): void {
    this.state = 'gameOver';
    this.visualSuppressions.clear();
    this.pendingVisualStates.clear();
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
    this.pendingVisualStates.clear();
    this.activeGrapples = [];
    this.rewardScreen.hide();
    this.spriteLab.hide();
    this.menuScreen.showHome(this.selectedCharacterId);
  }

  private startCharacterRun(characterId: string): void {
    this.selectedCharacterId = characterId;
    this.startNewRun();
  }

  private createPlayer(): Player {
    const character = characters.find((entry) => entry.id === this.selectedCharacterId) ?? characters[0];
    return new Player(character, getCharacterLoadout(character.id), getCharacterMoves(character));
  }

  private async preloadBeginningSprites(): Promise<void> {
    await Promise.all([
      ...DESERT_ARENA_ASSET_PATHS.map((path) => this.assets.loadImage(path, { kind: 'background' })),
      ...spriteRegistry.filter((sprite) => FINAL_SCOPE_ENTITY_IDS.includes(sprite.id as (typeof FINAL_SCOPE_ENTITY_IDS)[number])).flatMap((sprite) =>
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
    this.pendingVisualStates.clear();
    this.activeGrapples = [];
    this.camera.snapTo(this.player, this.canvas.width, this.canvas.height);
    this.menuScreen.showHome(this.selectedCharacterId);
  }

  private toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen?.();
    } else {
      void document.exitFullscreen?.();
    }
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
    const playerEnd = clampToPlayableArena(enemy.x + enemy.facing * (enemy.radius + this.player.radius + 12), enemy.y + 18, this.player.radius);
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
      targetEndX: playerEnd.x,
      targetEndY: playerEnd.y,
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
    const attackerEnd = clampToPlayableArena(placement.attackerEndX, placement.attackerEndY, attacker.radius);
    const targetEnd = clampToPlayableArena(placement.targetEndX, placement.targetEndY, target.radius);
    this.activeGrapples.push({
      attacker,
      target,
      remainingMs: durationMs,
      totalMs: durationMs,
      attackerStartX: attacker.x,
      attackerStartY: attacker.y,
      attackerEndX: attackerEnd.x,
      attackerEndY: attackerEnd.y,
      targetStartX: placement.targetStartX,
      targetStartY: placement.targetStartY,
      targetEndX: targetEnd.x,
      targetEndY: targetEnd.y,
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
      clampEntityToPlayableArena(lock.attacker);
      clampEntityToPlayableArena(lock.target);
      lock.attacker.vx = 0;
      lock.attacker.vy = 0;
      lock.target.vx = 0;
      lock.target.vy = 0;
    }
    this.activeGrapples = this.activeGrapples.filter((lock) => lock.remainingMs > 0 && lock.attacker.alive && (lock.target.alive || lock.target.defeatHoldMs > 0));
  }

  private isGrappleLocked(actor: Player | Enemy | Boss): boolean {
    return this.activeGrapples.some((lock) => lock.attacker === actor || lock.target === actor);
  }

  private updateFeedbackTimers(deltaMs: number): void {
    this.screenShakeMs = Math.max(0, this.screenShakeMs - deltaMs);
    for (const spark of this.impacts) spark.lifeMs -= deltaMs;
    this.impacts = this.impacts.filter((spark) => spark.lifeMs > 0);
    for (const actor of [this.player, ...this.enemies, ...(this.boss ? [this.boss] : [])]) {
      actor.damageFlashMs = Math.max(0, actor.damageFlashMs - deltaMs);
      actor.healFlashMs = Math.max(0, actor.healFlashMs - deltaMs);
      actor.defeatHoldMs = Math.max(0, actor.defeatHoldMs - deltaMs);
    }
  }

  private updatePassiveHealthRegen(deltaMs: number): void {
    this.player.recentDamageMs = Math.max(0, this.player.recentDamageMs - deltaMs);
    if (!this.player.alive || this.player.health >= this.player.maxHealth || this.player.stunMs > 0) return;
    if (this.player.recentDamageMs > 0) return;
    const upgradeBonus = this.player.upgrades.healthRegenLevel * 0.7;
    this.player.heal((PASSIVE_HEALTH_REGEN_PER_SECOND + upgradeBonus) * (deltaMs / 1000));
  }

  private handleHitImpact(impact: HitImpact): void {
    this.hitPauseMs = Math.max(this.hitPauseMs, impact.hitstopMs);
    if (this.settings.screenShake && impact.heavy) this.screenShakeMs = Math.max(this.screenShakeMs, Math.max(140, impact.hitstopMs * 3));
    if (impact.attacker === this.player) {
      this.playerChainGraceMs = Math.max(this.playerChainGraceMs, 260);
      if (this.player.criticalOverloadArmedMs > 0) this.player.consumeCriticalOverload();
      this.player.recordMomentumHit();
      const killed = (impact.target instanceof Enemy || impact.target instanceof Boss) && !impact.target.alive;
      const chainBonus = this.player.lastLandedMoveId && this.player.lastLandedMoveId !== impact.move.id ? 5 : 2;
      const heavyBonus = impact.heavy ? 7 + this.player.upgrades.emperorHeavyActivityLevel * 4 : 0;
      const finishBonus = killed ? 26 + this.player.upgrades.emperorKillHealLevel * 6 : 0;
      this.player.gainActivity(14 + chainBonus + heavyBonus + finishBonus, killed ? 2000 : 1350);
      this.player.lastLandedMoveId = impact.move.id;
      if (killed) {
        const heal = this.player.upgrades.emperorKillHealLevel * 3 + this.player.upgrades.killHealLevel * 2;
        if (heal > 0) this.player.heal(heal);
      }
    } else if (impact.target === this.player) {
      this.player.spendActivity(impact.heavy ? 14 : 8, impact.heavy ? 16 : 10);
    }
    this.playDamageAnimation(impact);
  }

  private playDamageAnimation(impact: HitImpact): void {
    if (!(impact.target instanceof Enemy || impact.target instanceof Boss || impact.target instanceof Player)) return;
    const target = impact.target;
    if (!target.alive) {
      this.playDelayedDeathVisual(impact);
      return;
    }
    const oldHealth = target.health + impact.damage;
    const oldQuarter = Math.floor((oldHealth / target.maxHealth) * 4);
    const newQuarter = Math.floor((target.health / target.maxHealth) * 4);
    const majorDamage = impact.heavy || newQuarter < oldQuarter;
    if (!this.shouldPlayHitReaction(impact, majorDamage)) return;
    if (majorDamage) {
      const delayMs = this.visualHandoffDelayMs(impact.attacker, 340);
      this.animation.play(target, 'hit_react', {
        lockForMs: Math.max(impact.hitstunMs, Math.min(360, delayMs || impact.hitstunMs)),
        fallback: 'hit_react',
        force: true,
      });
      if (delayMs > 80) {
        this.queueVisualState(target, 'knockdown', delayMs, 520, 'hit_react');
        return;
      }
    }
    this.animation.play(target, majorDamage ? 'knockdown' : 'hit_react', {
      lockForMs: majorDamage ? Math.max(520, impact.hitstunMs) : Math.max(220, impact.hitstunMs),
      fallback: 'hit_react',
      force: majorDamage,
    });
  }

  private playDelayedDeathVisual(impact: HitImpact): void {
    const target = impact.target;
    if (!(target instanceof Enemy || target instanceof Boss || target instanceof Player)) return;
    const delayMs = this.visualHandoffDelayMs(impact.attacker, 620);
    const deathAnimation = target instanceof Enemy ? 'death' : 'knockdown';
    target.defeatHoldMs = Math.max(target.defeatHoldMs, delayMs + 720);
    target.stunMs = 0;
    target.vx = 0;
    target.vy = 0;
    if (delayMs > 80) {
      this.animation.play(target, 'hit_react', {
        lockForMs: Math.max(180, delayMs),
        fallback: deathAnimation,
        force: true,
      });
      this.queueVisualState(target, deathAnimation, delayMs, 640, 'hit_react');
      return;
    }
    this.animation.play(target, deathAnimation, { lockForMs: 640, fallback: 'hit_react', force: true });
  }

  private visualHandoffDelayMs(attacker: Fighter, maxDelayMs: number): number {
    return Math.max(0, Math.min(maxDelayMs, Math.max(attacker.attackLockMs, this.animation.getLockRemainingMs(attacker))));
  }

  private queueVisualState(target: Player | Enemy | Boss, animationKey: string, delayMs: number, lockForMs: number, fallback: string): void {
    this.pendingVisualStates.set(target.id, {
      target,
      animationKey,
      remainingMs: delayMs,
      lockForMs,
      fallback,
    });
  }

  private shouldPlayHitReaction(impact: HitImpact, majorDamage: boolean): boolean {
    const move = impact.move;
    if (['judo', 'wrestling', 'jiujitsu'].includes(move.style) || move.knockback >= 230) return true;
    if (majorDamage) return true;
    this.hitReactionSeed = (this.hitReactionSeed + 1) % 1000;
    const medium = move.damage >= 16 || move.knockback >= 130;
    const chance = medium ? 0.38 : 0.2;
    const roll = ((this.hitReactionSeed * 37 + Math.floor(impact.target.health) + move.id.length * 11) % 100) / 100;
    return roll < chance;
  }

  private updateVisualSuppressions(deltaMs: number): void {
    for (const [entityId, suppression] of this.visualSuppressions) {
      suppression.remainingMs -= deltaMs;
      const stillPresent = this.isActorVisuallyPresent(entityId);
      if (suppression.remainingMs <= 0 || !stillPresent) this.visualSuppressions.delete(entityId);
    }
  }

  private updatePendingVisualStates(deltaMs: number): void {
    for (const [entityId, pending] of this.pendingVisualStates) {
      pending.remainingMs -= deltaMs;
      if (pending.remainingMs > 0) continue;
      if (this.isActorVisuallyPresent(entityId)) {
        this.animation.play(pending.target, pending.animationKey, {
          lockForMs: pending.lockForMs,
          fallback: pending.fallback,
          force: true,
        });
      }
      this.pendingVisualStates.delete(entityId);
    }
  }

  private isActorVisuallyPresent(entityId: string): boolean {
    if (entityId === this.player.id) return this.player.alive || this.player.defeatHoldMs > 0;
    if (this.enemies.some((actor) => actor.id === entityId && (actor.alive || actor.defeatHoldMs > 0))) return true;
    return Boolean(this.boss && this.boss.id === entityId && (this.boss.alive || this.boss.defeatHoldMs > 0));
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
