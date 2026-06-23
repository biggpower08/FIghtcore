import { ARENA_HEIGHT, ARENA_WIDTH, BOSS_WAVE_INTERVAL } from '../game/constants';
import { clampToPlayableArena } from '../game/arenaBounds';
import { Boss } from '../entities/Boss';
import { Enemy } from '../entities/Enemy';
import { enemyDefinitions } from '../data/enemies';
import { moveById } from '../data/moves';
import { waveDefinitions } from '../data/waves';
import { TEST_BALANCE } from '../game/testBalance';

export class WaveSystem {
  wave = 0;

  spawnNextWave(): { enemies: Enemy[]; boss: Boss | null } {
    this.wave += 1;
    const template = waveDefinitions[(this.wave - 1) % waveDefinitions.length];
    const isBoss = template.isBoss && BOSS_WAVE_INTERVAL > 0 && this.wave % BOSS_WAVE_INTERVAL === 0;

    if (isBoss) {
      const definition = enemyDefinitions.find((enemy) => enemy.id === template.bossId) ?? enemyDefinitions[0];
      if (!definition) throw new Error('No active enemy definitions are available for boss spawning.');
      const move = moveById.get(definition.moveId);
      if (!move) throw new Error(`Missing boss move ${definition.moveId}`);
      const position = clampToPlayableArena(ARENA_WIDTH - 500, ARENA_HEIGHT / 2, 42);
      const boss = new Boss(`boss_${this.wave}`, definition, position.x, position.y, move);
      this.applyEnemyStrength(boss);
      return { enemies: [], boss };
    }

    const enemies: Enemy[] = [];
    const tunedGroups = template.enemies.map((group) => ({
      ...group,
      count: Math.max(1, Math.ceil(group.count * TEST_BALANCE.waveEnemyCountMultiplier)),
    }));
    const totalCount = tunedGroups.reduce((total, group) => total + group.count, 0);
    let spawnedCount = 0;

    for (const group of tunedGroups) {
      const definition = enemyDefinitions.find((enemy) => enemy.id === group.enemyId);
      if (!definition) throw new Error(`Missing enemy definition ${group.enemyId}`);
      const move = moveById.get(definition.moveId);
      if (!move) throw new Error(`Missing enemy move ${definition.moveId}`);

      for (let index = 0; index < group.count; index += 1) {
        const angle = (Math.PI * 2 * spawnedCount) / totalCount;
        const position = clampToPlayableArena(ARENA_WIDTH / 2 + Math.cos(angle) * 520, ARENA_HEIGHT / 2 + Math.sin(angle) * 330, 22);
        const enemy = new Enemy(`enemy_${this.wave}_${spawnedCount}`, definition, position.x, position.y, move);
        this.applyEnemyStrength(enemy);
        enemies.push(enemy);
        spawnedCount += 1;
      }
    }

    if (this.wave > waveDefinitions.length) {
      const definition = enemyDefinitions[spawnedCount % enemyDefinitions.length];
      if (!definition) throw new Error('No active enemy definitions are available for bonus spawning.');
      const move = moveById.get(definition.moveId);
      if (!move) throw new Error(`Missing enemy move ${definition.moveId}`);
      const bonusCount = Math.floor((this.wave / 2) * TEST_BALANCE.bonusEnemyCountMultiplier);
      for (let index = 0; index < bonusCount; index += 1) {
        const angle = (Math.PI * 2 * index) / bonusCount;
        const position = clampToPlayableArena(ARENA_WIDTH / 2 + Math.cos(angle) * 590, ARENA_HEIGHT / 2 + Math.sin(angle) * 370, 22);
        const enemy = new Enemy(`enemy_${this.wave}_bonus_${index}`, definition, position.x, position.y, move);
        this.applyEnemyStrength(enemy);
        enemies.push(enemy);
      }
    }

    return { enemies, boss: null };
  }

  private applyEnemyStrength(enemy: Enemy | Boss): void {
    const scalar = 1 + Math.min(0.12, Math.max(0, this.wave - 1) * 0.01);
    enemy.maxHealth = Math.round(enemy.maxHealth * scalar);
    enemy.health = enemy.maxHealth;
    enemy.speed *= 1 + Math.min(0.06, Math.max(0, this.wave - 1) * 0.005);
  }
}
