import type { Player } from '../entities/Player';

export class LootSystem {
  restoreAfterWave(player: Player): { health: number; stamina: number } {
    const beforeHealth = player.health;
    const beforeStamina = player.stamina;
    const bonusBuffer = player.upgrades.waveHealLevel * 4;
    player.health = Math.min(player.maxHealth, player.health + player.maxHealth + bonusBuffer);
    player.stamina = player.maxStamina;
    player.healFlashMs = 520;
    return {
      health: player.health - beforeHealth,
      stamina: player.stamina - beforeStamina,
    };
  }
}
