import type { Player } from '../entities/Player';
import { moves, type MoveDefinition } from '../data/moves';
import { isMoveEligibleForCharacter } from '../data/characterLoadouts';

export class ProgressionSystem {
  getRewardOptions(player: Player, wave: number): MoveDefinition[] {
    const current = new Set(player.equippedMoves.map((move) => move.id));
    const learned = new Set(player.learnedMoves.map((move) => move.id));
    const available = moves.filter(
      (move) =>
        !current.has(move.id) &&
        isUnlocked(move, learned) &&
        move.unlockLevel <= Math.max(1, wave) &&
        isMoveEligibleForCharacter(player.character.id, move),
    );
    const pool =
      available.length > 0
        ? available
        : moves.filter(
            (move) => !current.has(move.id) && isUnlocked(move, learned) && isMoveEligibleForCharacter(player.character.id, move),
          );
    return pool.sort((a, b) => a.unlockLevel - b.unlockLevel).slice(0, 3);
  }

  replaceMove(player: Player, move: MoveDefinition, slotIndex: number): void {
    if (slotIndex < 0 || slotIndex > 3) return;
    if (!isMoveEligibleForCharacter(player.character.id, move)) return;

    if (!player.learnedMoves.some((learned) => learned.id === move.id)) {
      player.learnedMoves.push(move);
    }

    player.equippedMoves[slotIndex] = move;
  }
}

function isUnlocked(move: MoveDefinition, learned: Set<string>): boolean {
  return !move.lockedByDefault || learned.has(move.id);
}
