import type { Fighter } from '../entities/Fighter';

export class AnimationSystem {
  getPose(fighter: Fighter): 'idle' | 'move' | 'attack' | 'stunned' {
    if (fighter.stunMs > 0) return 'stunned';
    if (fighter.activeMove) return 'attack';
    if (Math.hypot(fighter.vx, fighter.vy) > 8) return 'move';
    return 'idle';
  }
}
