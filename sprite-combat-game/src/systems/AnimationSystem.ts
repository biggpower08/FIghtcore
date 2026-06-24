import { enemyAttackAnimationByMove } from '../data/spriteAnimations';
import { Boss } from '../entities/Boss';
import { Enemy } from '../entities/Enemy';
import type { Entity } from '../entities/Entity';
import { Fighter } from '../entities/Fighter';
import { Player } from '../entities/Player';

export interface PlayAnimationOptions {
  lockForMs?: number;
  fallback?: string;
  loop?: boolean;
  force?: boolean;
  frameSequence?: number[];
  frameDurations?: number[];
}

export interface AnimationState {
  entityId: string;
  currentAnimationKey: string;
  frameIndex: number;
  elapsedMs: number;
  loop: boolean;
  animationLockedUntilMs: number;
  animationLockTotalMs: number;
  fallback?: string;
  frameSequence?: number[];
  frameDurations?: number[];
}

export class AnimationSystem {
  private readonly states = new Map<string, AnimationState>();

  update(deltaMs: number): void {
    for (const state of this.states.values()) {
      state.elapsedMs += deltaMs;
      state.animationLockedUntilMs = Math.max(0, state.animationLockedUntilMs - deltaMs);
      if (state.animationLockedUntilMs <= 0) state.animationLockTotalMs = 0;
    }
  }

  play(entity: Entity, animationKey: string, options: PlayAnimationOptions = {}): void {
    const state = this.getState(entity);
    if (!options.force && state.animationLockedUntilMs > 0 && state.currentAnimationKey !== animationKey) return;

    state.currentAnimationKey = animationKey;
    state.frameIndex = 0;
    state.elapsedMs = 0;
    state.loop = options.loop ?? false;
    state.animationLockedUntilMs = options.lockForMs ?? 0;
    state.animationLockTotalMs = options.lockForMs ?? 0;
    state.fallback = options.fallback;
    state.frameSequence = options.frameSequence;
    state.frameDurations = options.frameDurations;
  }

  getLockRemainingMs(entity: Entity): number {
    return this.getState(entity).animationLockedUntilMs;
  }

  getPose(fighter: Fighter): 'idle' | 'move' | 'attack' | 'stunned' {
    if (fighter.stunMs > 0) return 'stunned';
    if (fighter.activeMove) return 'attack';
    if (Math.hypot(fighter.vx, fighter.vy) > 8) return 'move';
    return 'idle';
  }

  getCurrentAnimationKey(entity: Entity): string {
    const state = this.getState(entity);
    if (state.animationLockedUntilMs > 0) return state.currentAnimationKey;

    const next = this.deriveAnimationKey(entity);
    if (next !== state.currentAnimationKey) {
      state.currentAnimationKey = next;
      state.frameIndex = 0;
      state.elapsedMs = 0;
      state.loop = ['idle', 'ready', 'walk', 'run', 'dash'].includes(next);
      state.frameSequence = undefined;
      state.frameDurations = undefined;
    }

    return state.currentAnimationKey;
  }

  getFrameIndex(entity: Entity, frameDurations: number[]): number {
    const state = this.getState(entity);
    if (frameDurations.length <= 1) return 0;

    const sequence = state.frameSequence;
    const durations = sequence && state.frameDurations?.length === sequence.length ? state.frameDurations : frameDurations;
    let remaining = state.elapsedMs;
    let index = 0;
    const totalDuration = durations.reduce((total, duration) => total + duration, 0);

    if (state.loop && totalDuration > 0) {
      remaining %= totalDuration;
    } else if (state.animationLockTotalMs > totalDuration && totalDuration > 0) {
      const progress = Math.min(0.999, state.elapsedMs / Math.max(1, state.animationLockTotalMs));
      remaining = progress * totalDuration;
    }

    for (let i = 0; i < durations.length; i += 1) {
      if (remaining < durations[i]) {
        index = i;
        break;
      }
      remaining -= durations[i];
      index = i;
    }

    const resolvedIndex = sequence?.[index] ?? index;
    state.frameIndex = resolvedIndex;
    return resolvedIndex;
  }

  private getState(entity: Entity): AnimationState {
    const existing = this.states.get(entity.id);
    if (existing) return existing;

    const created: AnimationState = {
      entityId: entity.id,
      currentAnimationKey: 'idle',
      frameIndex: 0,
      elapsedMs: 0,
      loop: true,
      animationLockedUntilMs: 0,
      animationLockTotalMs: 0,
    };
    this.states.set(entity.id, created);
    return created;
  }

  private deriveAnimationKey(entity: Entity): string {
    if (entity instanceof Player) {
      if (!entity.alive) return 'knockdown';
      if (entity.stunMs > 0) return 'hit_react';
      if (entity.dashMs > 0) return 'dash';
      if (entity.activeMove) return entity.activeMove.animationKey;
      if (Math.hypot(entity.vx, entity.vy) > 8) return 'walk';
      return 'idle';
    }

    if (entity instanceof Enemy || entity instanceof Boss) {
      if (!entity.alive) return entity instanceof Boss ? 'knockdown' : 'death';
      if (entity.stunMs > 0) return 'hit_react';
      if (entity.activeMove) return enemyAttackAnimationByMove[entity.activeMove.id] ?? entity.definition.attackAnimation ?? entity.activeMove.id;
      if (Math.hypot(entity.vx, entity.vy) > 8) return 'run';
      return 'idle';
    }

    if (entity instanceof Fighter) return this.getPose(entity);
    return 'idle';
  }
}
