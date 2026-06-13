import { Fighter } from './Fighter';
import { PLAYER_RADIUS } from '../game/constants';
import type { CharacterDefinition } from '../data/characters';
import type { MoveDefinition } from '../data/moves';

export class Player extends Fighter {
  character: CharacterDefinition;
  dashMs = 0;
  dashCooldownMs = 0;

  constructor(character: CharacterDefinition, moves: MoveDefinition[]) {
    super(character.id, 520, 720, PLAYER_RADIUS, character.maxHealth, 100, character.speed, moves);
    this.character = character;
    if (character.id === 'cyber-ninja-blue') {
      this.equippedMoves = moves.filter((move) => ['low_kick', 'roundhouse_kick'].includes(move.id));
    }
  }
}
