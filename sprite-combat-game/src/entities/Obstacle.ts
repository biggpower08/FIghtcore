export type ObstacleKind = 'rock';

export class Obstacle {
  constructor(
    public readonly id: string,
    public readonly kind: ObstacleKind,
    public readonly x: number,
    public readonly y: number,
    public readonly radius: number,
  ) {}

  get blocksMovement(): boolean {
    return this.kind === 'rock';
  }
}
