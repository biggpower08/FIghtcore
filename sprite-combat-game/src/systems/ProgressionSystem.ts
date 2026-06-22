import type { Player } from '../entities/Player';
import { moves, type MoveDefinition } from '../data/moves';
import { isMoveEligibleForCharacter } from '../data/characterLoadouts';
import { upgrades, type UpgradeDefinition } from '../data/upgrades';

export type RewardOption =
  | { kind: 'move'; move: MoveDefinition }
  | { kind: 'upgrade'; upgrade: UpgradeDefinition };

export class ProgressionSystem {
  shouldOfferReward(wave: number): boolean {
    return wave >= 1;
  }

  getRewardOptions(player: Player, wave: number): RewardOption[] {
    if (!this.shouldOfferReward(wave)) return [];

    const upgradeOptions = upgrades
      .filter((upgrade) => upgrade.currentLevel(player) < upgrade.maxLevel && (upgrade.isAvailable?.(player) ?? true))
      .map<RewardOption>((upgrade) => ({ kind: 'upgrade', upgrade }));

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
    const moveOptions = pool
      .filter((move) => move.scope !== 'universal')
      .sort((a, b) => a.unlockLevel - b.unlockLevel)
      .slice(0, 2)
      .map<RewardOption>((move) => ({ kind: 'move', move }));
    const rotatedUpgrades = rotate(upgradeOptions, wave + player.learnedMoves.length);
    return [...rotatedUpgrades.slice(0, 3), ...moveOptions].slice(0, 3);
  }

  replaceMove(player: Player, move: MoveDefinition, slotIndex: number): void {
    if (slotIndex < 0 || slotIndex > 3) return;
    if (!isMoveEligibleForCharacter(player.character.id, move)) return;

    if (!player.learnedMoves.some((learned) => learned.id === move.id)) {
      player.learnedMoves.push(move);
    }

    player.equippedMoves[slotIndex] = move;
  }

  applyUpgrade(player: Player, upgrade: UpgradeDefinition): void {
    if (upgrade.currentLevel(player) >= upgrade.maxLevel) return;
    upgrade.apply(player);
  }
}

function isUnlocked(move: MoveDefinition, learned: Set<string>): boolean {
  return !move.lockedByDefault || learned.has(move.id);
}

function rotate<T>(items: T[], amount: number): T[] {
  if (items.length === 0) return items;
  const offset = amount % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}
