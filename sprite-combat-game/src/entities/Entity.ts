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
  damageFlashMs = 0;
  healFlashMs = 0;

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
    this.damageFlashMs = 150;
    if (this.health <= 0) {
      this.alive = false;
    }
  }

  heal(amount: number): number {
    if (amount <= 0 || !this.alive) return 0;
    const before = this.health;
    this.health = Math.min(this.maxHealth, this.health + amount);
    const restored = this.health - before;
    if (restored > 0) this.healFlashMs = 260;
    return restored;
  }
}
