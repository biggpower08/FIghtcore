import { moveById, moves, type MoveDefinition } from './moves';

export interface KnockbackVector {
  x: number;
  y: number;
}

export interface CombatMoveProfile {
  id: string;
  displayName: string;
  animationKey: string;
  startupFrames: number;
  activeFrames: number[];
  recoveryFrames: number;
  hitstopFrames: number;
  hitstunFrames: number;
  knockback: KnockbackVector;
  launchAngleDegrees: number;
  hitbox: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  movementLock: 'none' | 'partial' | 'full';
  lockFacing: boolean;
  interruptible: boolean;
}

const FPS = 60;
const FRAME_MS = 1000 / FPS;

const overrides: Record<string, Partial<CombatMoveProfile>> = {
  jab: { hitstopFrames: 3, hitstunFrames: 8, knockback: { x: 92, y: 0 }, launchAngleDegrees: 0 },
  cross: { hitstopFrames: 4, hitstunFrames: 10, knockback: { x: 132, y: -8 }, launchAngleDegrees: -4 },
  jab_cross: { hitstopFrames: 5, hitstunFrames: 14, knockback: { x: 170, y: -12 }, launchAngleDegrees: -5 },
  palm_strike: { hitstopFrames: 4, hitstunFrames: 11, knockback: { x: 124, y: -8 }, launchAngleDegrees: -4 },
  high_kick: { hitstopFrames: 6, hitstunFrames: 16, knockback: { x: 168, y: -42 }, launchAngleDegrees: -14 },
  roundhouse_kick: { hitstopFrames: 7, hitstunFrames: 18, knockback: { x: 188, y: -28 }, launchAngleDegrees: -10 },
  teep_kick: { hitstopFrames: 5, hitstunFrames: 14, knockback: { x: 166, y: -4 }, launchAngleDegrees: -2 },
  calf_kick: { hitstopFrames: 4, hitstunFrames: 12, knockback: { x: 126, y: 12 }, launchAngleDegrees: 6 },
  knee: { hitstopFrames: 6, hitstunFrames: 18, knockback: { x: 126, y: -64 }, launchAngleDegrees: -26 },
  spinning_sweep: { hitstopFrames: 6, hitstunFrames: 18, knockback: { x: 150, y: 36 }, launchAngleDegrees: 12 },
  tornado_kick: { hitstopFrames: 8, hitstunFrames: 24, knockback: { x: 248, y: -68 }, launchAngleDegrees: -18 },
  feint_rear_hook: { hitstopFrames: 7, hitstunFrames: 20, knockback: { x: 210, y: -24 }, launchAngleDegrees: -8 },
  o_goshi: { hitstopFrames: 6, hitstunFrames: 22, knockback: { x: 136, y: 48 }, launchAngleDegrees: 18, movementLock: 'full' },
};

export const combatMoveProfiles: CombatMoveProfile[] = moves.map((move) => createCombatMoveProfile(move));
export const combatMoveProfileById = new Map(combatMoveProfiles.map((profile) => [profile.id, profile]));

export function getCombatMoveProfile(move: MoveDefinition): CombatMoveProfile {
  return combatMoveProfileById.get(move.id) ?? createCombatMoveProfile(move);
}

export function getCombatMoveProfileByAnimation(animationKey: string): CombatMoveProfile | undefined {
  return combatMoveProfiles.find((profile) => profile.animationKey === animationKey || profile.id === animationKey);
}

export function frameToMs(frame: number): number {
  return Math.max(0, frame) * FRAME_MS;
}

function createCombatMoveProfile(move: MoveDefinition): CombatMoveProfile {
  const startupFrames = Math.max(0, Math.round(move.windupMs / FRAME_MS));
  const activeFrameCount = Math.max(1, Math.round(move.activeMs / FRAME_MS));
  const firstActiveFrame = startupFrames + 1;
  const activeFrames = Array.from({ length: activeFrameCount }, (_, index) => firstActiveFrame + index);
  const recoveryFrames = Math.max(0, Math.round(move.recoveryMs / FRAME_MS));
  const isHeavy = move.damage >= 20 || move.knockback >= 170;
  const base: CombatMoveProfile = {
    id: move.id,
    displayName: move.name,
    animationKey: move.animationKey,
    startupFrames,
    activeFrames,
    recoveryFrames,
    hitstopFrames: move.damage <= 12 ? 3 : isHeavy ? 6 : 4,
    hitstunFrames: Math.max(6, Math.round(move.stunMs / 24)),
    knockback: {
      x: move.knockback,
      y: isHeavy ? -move.knockback * 0.18 : -move.knockback * 0.06,
    },
    launchAngleDegrees: isHeavy ? -10 : -3,
    hitbox: {
      x: move.range,
      y: -move.hitboxHeight * 0.45,
      w: move.hitboxWidth,
      h: move.hitboxHeight,
    },
    movementLock: move.damage >= 24 || ['wrestling', 'judo', 'jiujitsu'].includes(move.style) ? 'full' : 'partial',
    lockFacing: true,
    interruptible: false,
  };
  return {
    ...base,
    ...overrides[move.id],
    hitbox: {
      ...base.hitbox,
      ...overrides[move.id]?.hitbox,
    },
    knockback: {
      ...base.knockback,
      ...overrides[move.id]?.knockback,
    },
  };
}

export function getCombatMoveProfileById(moveId: string): CombatMoveProfile | undefined {
  const move = moveById.get(moveId);
  return move ? getCombatMoveProfile(move) : undefined;
}
