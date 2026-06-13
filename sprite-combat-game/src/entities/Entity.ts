export type Facing = -1 | 1;

export class Entity {
  id: string;
  x: number;
  y: number;
  vx = 0;
  vy = 0;
  radius: number;
  facing: Facing = 1;
  health: number;
  maxHealth: number;
  stunMs = 0;
  alive = true;
  knockbackResistance = 1;

  constructor(id: string, x: number, y: number, radius: number, maxHealth: number) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.health = maxHealth;
    this.maxHealth = maxHealth;
  }

  distanceTo(other: Entity): number {
    return Math.hypot(this.x - other.x, this.y - other.y);
  }

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) {
      this.alive = false;
    }
  }
}
