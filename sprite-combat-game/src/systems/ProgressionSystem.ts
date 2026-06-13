import type { Player } from '../entities/Player';
import { moves, type MoveDefinition } from '../data/moves';

export class ProgressionSystem {
  getRewardOptions(player: Player, wave: number): MoveDefinition[] {
    const known = new Set(player.learnedMoves.map((move) => move.id));
    const available = moves.filter((move) => !known.has(move.id) && move.unlockLevel <= Math.max(1, wave));
    const pool = available.length > 0 ? available : moves.filter((move) => !known.has(move.id));
    return pool.sort((a, b) => a.unlockLevel - b.unlockLevel).slice(0, 3);
  }

  learnMove(player: Player, move: MoveDefinition): void {
    if (!player.learnedMoves.some((learned) => learned.id === move.id)) {
      player.learnedMoves.push(move);
    }

    const emptySlot = player.equippedMoves.length < 4;
    if (emptySlot) {
      player.equippedMoves.push(move);
      return;
    }

    player.equippedMoves.shift();
    player.equippedMoves.push(move);
  }
}
