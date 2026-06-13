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
      const definition = enemyDefinitions.find((enemy) => enemy.id === (template.bossId ?? 'cyber-monkey-alpha')) ?? enemyDefinitions[2];
      const move = moveById.get(definition.moveId);
      if (!move) throw new Error(`Missing boss move ${definition.moveId}`);
      return { enemies: [], boss: new Boss(`boss_${this.wave}`, definition, ARENA_WIDTH - 500, ARENA_HEIGHT / 2, move) };
    }

    const enemies: Enemy[] = [];
    const totalCount = template.enemies.reduce((total, group) => total + group.count, 0);
    let spawnedCount = 0;

    for (const group of template.enemies) {
      const definition = enemyDefinitions.find((enemy) => enemy.id === group.enemyId);
      if (!definition) throw new Error(`Missing enemy definition ${group.enemyId}`);
      const move = moveById.get(definition.moveId);
      if (!move) throw new Error(`Missing enemy move ${definition.moveId}`);

      for (let index = 0; index < group.count; index += 1) {
        const angle = (Math.PI * 2 * spawnedCount) / totalCount;
        const x = ARENA_WIDTH / 2 + Math.cos(angle) * 520;
        const y = ARENA_HEIGHT / 2 + Math.sin(angle) * 330;
        enemies.push(new Enemy(`enemy_${this.wave}_${spawnedCount}`, definition, x, y, move));
        spawnedCount += 1;
      }
    }

    if (this.wave > waveDefinitions.length) {
      const definition = enemyDefinitions[spawnedCount % 2];
      const move = moveById.get(definition.moveId);
      if (!move) throw new Error(`Missing enemy move ${definition.moveId}`);
      const bonusCount = Math.floor(this.wave / 2);
      for (let index = 0; index < bonusCount; index += 1) {
        const angle = (Math.PI * 2 * index) / bonusCount;
        const x = ARENA_WIDTH / 2 + Math.cos(angle) * 590;
        const y = ARENA_HEIGHT / 2 + Math.sin(angle) * 370;
        enemies.push(new Enemy(`enemy_${this.wave}_bonus_${index}`, definition, x, y, move));
      }
    }

    return { enemies, boss: null };
  }
}
