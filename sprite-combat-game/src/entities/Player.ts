import { Fighter } from './Fighter';
import { PLAYER_RADIUS } from '../game/constants';
import type { CharacterDefinition } from '../data/characters';
import type { CharacterLoadout } from '../data/characterLoadouts';
import type { MoveDefinition } from '../data/moves';

export class Player extends Fighter {
  character: CharacterDefinition;
  loadout: CharacterLoadout;
  dashMs = 0;
  dashCooldownMs = 0;

  constructor(character: CharacterDefinition, loadout: CharacterLoadout, moves: MoveDefinition[]) {
    super(character.id, 520, 720, PLAYER_RADIUS, loadout.stats.maxHealth, loadout.stats.stamina, loadout.stats.speed, moves);
    this.character = character;
    this.loadout = loadout;
  }
}
