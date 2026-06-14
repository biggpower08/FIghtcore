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
  lockedByDefault: boolean;
  scope: 'character' | 'universal';
}

export const moves: MoveDefinition[] = [
  createMove('jab', 'Jab', 'boxing', 'common', 8, 8, 220, 58, 46, 32, 60, 90, 100, 50, 120, 1),
  createMove('cross', 'Cross', 'boxing', 'common', 12, 12, 340, 68, 52, 34, 85, 95, 150, 90, 150, 1),
  createMove('hook', 'Hook', 'boxing', 'common', 14, 13, 390, 56, 50, 38, 90, 95, 160, 110, 170, 2),
  createMove('uppercut', 'Uppercut', 'boxing', 'uncommon', 18, 16, 520, 48, 46, 54, 105, 90, 190, 130, 220, 2),
  createMove('low_kick', 'Low Kick', 'kickboxing', 'common', 10, 10, 310, 62, 58, 32, 80, 100, 140, 70, 120, 1),
  createMove('side_kick', 'Side Kick', 'kickboxing', 'common', 16, 15, 460, 78, 66, 38, 120, 100, 180, 130, 190, 2),
  createMove('high_kick', 'High Kick', 'kickboxing', 'uncommon', 19, 18, 620, 78, 62, 64, 145, 105, 210, 150, 230, 2),
  createMove('roundhouse_kick', 'Roundhouse Kick', 'kickboxing', 'uncommon', 20, 20, 720, 86, 74, 44, 150, 110, 220, 170, 240, 2),
  createMove('teep_kick', 'Teep Kick', 'muay-thai', 'common', 15, 14, 440, 76, 56, 42, 110, 95, 175, 150, 190, 2),
  createMove('spinning_back_kick', 'Spinning Back Kick', 'kickboxing', 'rare', 30, 28, 1040, 92, 78, 46, 230, 125, 310, 260, 360, 3),
  createMove('slice', 'Slice', 'special', 'common', 16, 14, 420, 64, 58, 42, 90, 100, 170, 120, 180, 1),
  createMove('double_leg_shot', 'Double Leg Shot', 'wrestling', 'rare', 24, 24, 900, 78, 60, 46, 180, 130, 250, 230, 300, 3),
  createMove('double_leg_takedown', 'Double-Leg Takedown', 'wrestling', 'rare', 24, 24, 900, 78, 60, 46, 180, 130, 250, 230, 300, 3),
  createMove('single_leg_takedown', 'Single-Leg Takedown', 'wrestling', 'uncommon', 20, 20, 780, 72, 56, 44, 160, 125, 235, 190, 280, 3),
  createMove('duck_under', 'Duck Under', 'wrestling', 'uncommon', 12, 16, 620, 44, 54, 42, 90, 130, 180, 80, 220, 3),
  createMove('mat_return', 'Mat Return', 'wrestling', 'rare', 28, 26, 1040, 58, 66, 58, 190, 125, 300, 280, 380, 4),
  createMove('o_goshi', 'O Goshi', 'judo', 'rare', 26, 24, 920, 56, 64, 54, 160, 120, 270, 260, 360, 3),
  createMove('hip_throw', 'Hip Throw', 'judo', 'rare', 26, 24, 920, 56, 64, 54, 160, 120, 270, 260, 360, 3),
  createMove('seoi_nage', 'Seoi Nage', 'judo', 'rare', 28, 25, 980, 58, 62, 58, 175, 120, 285, 270, 380, 4),
  createMove('standing_shoulder_lock', 'Standing Shoulder Lock', 'jiujitsu', 'rare', 18, 22, 920, 46, 54, 58, 140, 150, 280, 120, 460, 4),
  createMove('armbar', 'Armbar', 'jiujitsu', 'epic', 32, 30, 1250, 50, 70, 52, 220, 150, 360, 260, 560, 5),
  createMove('guillotine', 'Guillotine', 'jiujitsu', 'epic', 30, 30, 1220, 44, 58, 64, 210, 155, 350, 220, 540, 5),
  createMove('clinch_knee', 'Clinch Knee', 'muay-thai', 'uncommon', 22, 18, 660, 54, 46, 56, 130, 110, 210, 140, 260, 2),
  createMove('short_elbow', 'Short Elbow', 'muay-thai', 'uncommon', 18, 16, 520, 48, 48, 42, 95, 90, 190, 120, 210, 2),
  createMove('palm_strike', 'Palm Strike', 'kung-fu', 'common', 14, 13, 420, 60, 50, 40, 90, 100, 160, 110, 170, 1),
  createMove('grab', 'Grab', 'wrestling', 'common', 12, 14, 520, 42, 52, 46, 110, 130, 210, 90, 250, 1),
  createMove('dash_strike', 'Dash Strike', 'mobility', 'rare', 24, 24, 860, 88, 60, 40, 150, 100, 250, 230, 280, 3),
  createMove('critical_slash', 'Critical Slash', 'special', 'epic', 42, 34, 1500, 84, 68, 48, 240, 120, 380, 330, 500, 5),
  createMove('spinning_kick', 'Spinning Kick', 'kung-fu', 'epic', 34, 34, 1300, 96, 86, 54, 260, 150, 360, 310, 440, 4),
  createMove('neon_palm', 'Neon Palm', 'special', 'epic', 36, 30, 1320, 66, 60, 46, 170, 120, 320, 260, 440, 4),
  createMove('cyber_sweep', 'Cyber Sweep', 'special', 'rare', 24, 24, 940, 82, 76, 34, 160, 130, 270, 210, 360, 3),
  createMove('ground_slam', 'Ground Slam', 'special', 'epic', 40, 36, 1500, 74, 86, 58, 260, 150, 390, 340, 560, 5),
  createMove('meditation', 'Meditation', 'special', 'legendary', 0, 28, 3000, 0, 0, 0, 250, 900, 300, 0, 0, 5),
  createMove('thug_it_out', 'Thug It Out', 'special', 'mythic', 0, 40, 5000, 0, 0, 0, 300, 1200, 400, 0, 0, 6),
  createMove('sprawl_counter', 'Sprawl Counter', 'defensive-counters', 'rare', 28, 22, 980, 62, 70, 50, 120, 140, 250, 210, 420, 3),
  createMove('shadow_counter', 'Shadow Counter', 'defensive-counters', 'epic', 38, 30, 1450, 76, 70, 52, 170, 120, 330, 260, 520, 4),
  createMove('universal_guard_break', 'Universal Guard Break', 'special', 'rare', 22, 24, 980, 62, 60, 46, 130, 110, 280, 180, 320, 1, true, 'universal'),
  createMove('universal_escape_step', 'Universal Escape Step', 'mobility', 'rare', 0, 18, 1150, 0, 0, 0, 80, 180, 220, 0, 0, 1, true, 'universal'),
  createMove('universal_clinch_turn', 'Universal Clinch Turn', 'wrestling', 'epic', 18, 26, 1300, 44, 58, 52, 150, 140, 340, 210, 420, 1, true, 'universal'),
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
  lockedByDefault = false,
  scope: MoveDefinition['scope'] = 'character',
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
    lockedByDefault,
    scope,
  };
}
