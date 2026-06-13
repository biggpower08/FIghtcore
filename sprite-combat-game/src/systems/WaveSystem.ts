import { ARENA_HEIGHT, ARENA_WIDTH, BOSS_WAVE_INTERVAL } from '../game/constants';
import { Boss } from '../entities/Boss';
import { Enemy } from '../entities/Enemy';
import { enemyDefinitions } from '../data/enemies';
import { moveById } from '../data/moves';
import { waveDefinitions } from '../data/waves';

export class WaveSystem {
  wave = 0;

  spawnNextWave(): { enemies: Enemy[]; boss: Boss | null } {
    this.wave += 1;
    const template = waveDefinitions[(this.wave - 1) % waveDefinitions.length];
    const isBoss = template.isBoss || this.wave % BOSS_WAVE_INTERVAL === 0;

    if (isBoss) {
      const definition = enemyDefinitions.find((enemy) => enemy.id === 'arena_warlord') ?? enemyDefinitions[1];
      const move = moveById.get(definition.moveId);
      if (!move) throw new Error(`Missing boss move ${definition.moveId}`);
      return { enemies: [], boss: new Boss(`boss_${this.wave}`, definition, ARENA_WIDTH - 500, ARENA_HEIGHT / 2, move) };
    }

    const definition = enemyDefinitions[0];
    const move = moveById.get(definition.moveId);
    if (!move) throw new Error(`Missing enemy move ${definition.moveId}`);

    const count = template.enemyCount + Math.floor(this.wave / 3);
    const enemies = Array.from({ length: count }, (_, index) => {
      const angle = (Math.PI * 2 * index) / count;
      const x = ARENA_WIDTH / 2 + Math.cos(angle) * 520;
      const y = ARENA_HEIGHT / 2 + Math.sin(angle) * 330;
      return new Enemy(`enemy_${this.wave}_${index}`, definition, x, y, move);
    });

    return { enemies, boss: null };
  }
}
