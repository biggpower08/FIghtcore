import type { Player } from '../entities/Player';

export class LootSystem {
  restoreAfterWave(player: Player): void {
    player.health = Math.min(player.maxHealth, player.health + 20);
    player.stamina = player.maxStamina;
  }
}
