export type MoveStyle =
  | 'boxing'
  | 'kickboxing'
  | 'muay-thai'
  | 'wrestling'
  | 'judo'
  | 'jiujitsu'
  | 'kung-fu'
  | 'defensive-counters'
  | 'mobility'
  | 'special';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface MoveDefinition {
  id: string;
  name: string;
  style: MoveStyle;
  rarity: Rarity;
  damage: number;
  staminaCost: number;
  cooldownMs: number;
  range: number;
  hitboxWidth: number;
  hitboxHeight: number;
  windupMs: number;
  activeMs: number;
  recoveryMs: number;
  knockback: number;
  stunMs: number;
  animationKey: string;
  unlockLevel: number;
}

export const moves: MoveDefinition[] = [
  createMove('jab', 'Jab', 'boxing', 'common', 8, 8, 220, 58, 46, 32, 60, 90, 100, 50, 120, 1),
  createMove('cross', 'Cross', 'boxing', 'common', 12, 12, 340, 68, 52, 34, 85, 95, 150, 90, 150, 1),
  createMove('low_kick', 'Low Kick', 'kickboxing', 'common', 10, 10, 310, 62, 58, 32, 80, 100, 140, 70, 120, 1),
  createMove('roundhouse_kick', 'Roundhouse Kick', 'kickboxing', 'uncommon', 20, 20, 720, 86, 74, 44, 150, 110, 220, 170, 240, 2),
  createMove('double_leg_takedown', 'Double-Leg Takedown', 'wrestling', 'rare', 24, 24, 900, 78, 60, 46, 180, 130, 250, 230, 300, 3),
  createMove('hip_throw', 'Hip Throw', 'judo', 'rare', 26, 24, 920, 56, 64, 54, 160, 120, 270, 260, 360, 3),
  createMove('clinch_knee', 'Clinch Knee', 'muay-thai', 'uncommon', 22, 18, 660, 54, 46, 56, 130, 110, 210, 140, 260, 2),
  createMove('short_elbow', 'Short Elbow', 'muay-thai', 'uncommon', 18, 16, 520, 48, 48, 42, 95, 90, 190, 120, 210, 2),
  createMove('palm_strike', 'Palm Strike', 'kung-fu', 'common', 14, 13, 420, 60, 50, 40, 90, 100, 160, 110, 170, 1),
  createMove('spinning_kick', 'Spinning Kick', 'kung-fu', 'epic', 34, 34, 1300, 96, 86, 54, 260, 150, 360, 310, 440, 4),
  createMove('sprawl_counter', 'Sprawl Counter', 'defensive-counters', 'rare', 28, 22, 980, 62, 70, 50, 120, 140, 250, 210, 420, 3),
  createMove('shadow_counter', 'Shadow Counter', 'defensive-counters', 'epic', 38, 30, 1450, 76, 70, 52, 170, 120, 330, 260, 520, 4),
];

export const moveById = new Map(moves.map((move) => [move.id, move]));

function createMove(
  id: string,
  name: string,
  style: MoveStyle,
  rarity: Rarity,
  damage: number,
  staminaCost: number,
  cooldownMs: number,
  range: number,
  hitboxWidth: number,
  hitboxHeight: number,
  windupMs: number,
  activeMs: number,
  recoveryMs: number,
  knockback: number,
  stunMs: number,
  unlockLevel: number,
): MoveDefinition {
  return {
    id,
    name,
    style,
    rarity,
    damage,
    staminaCost,
    cooldownMs,
    range,
    hitboxWidth,
    hitboxHeight,
    windupMs,
    activeMs,
    recoveryMs,
    knockback,
    stunMs,
    animationKey: id,
    unlockLevel,
  };
}
