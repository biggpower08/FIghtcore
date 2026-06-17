import type { Boss } from '../entities/Boss';
import type { Player } from '../entities/Player';

export class Hud {
  draw(ctx: CanvasRenderingContext2D, player: Player, wave: number, boss: Boss | null): void {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.font = '16px monospace';
    ctx.textBaseline = 'top';

    this.panel(ctx, 14, 12, 340, 158);
    this.bar(ctx, 22, 20, 230, 18, player.health / player.maxHealth, '#e94444', 'Health');
    this.bar(ctx, 22, 48, 230, 14, player.stamina / player.maxStamina, '#53d47c', 'Stamina');

    ctx.fillStyle = '#fff0c2';
    ctx.fillText(`Wave ${wave}`, 22, 78);
    ctx.fillText(`Fighter: ${player.character.name}`, 22, 102);
    const ability = player.ability;
    const abilityReady = ability ? player.abilityCooldownMs <= 0 && player.abilityActiveMs <= 0 && player.criticalOverloadArmedMs <= 0 : false;
    const abilityStatus = ability
      ? abilityReady
        ? `${ability.name} ready`
        : player.abilityStatus || `${ability.name} on cooldown ${Math.ceil(player.abilityCooldownMs / 1000)}s`
      : 'Ability unavailable';
    ctx.fillText(`U: ${ability?.name ?? 'No Ability'} (${abilityStatus})`, 22, 126);

    const slotKeys = ['H', 'J', 'K', 'L'];
    const moveText = player.equippedMoves.map((move, index) => `${slotKeys[index]}:${move.name}`).join('  ');
    this.panel(ctx, 14, ctx.canvas.height - 76, Math.min(ctx.canvas.width - 28, 920), 58);
    ctx.fillText(`Equipped ${moveText}`, 22, ctx.canvas.height - 36);
    ctx.fillText('WASD move  Space dash  H/J/K/L moves  Esc pause', 22, ctx.canvas.height - 62);

    if (boss?.alive) {
      this.bar(ctx, ctx.canvas.width / 2 - 180, 22, 360, 18, boss.health / boss.maxHealth, '#a84dff', boss.definition.name);
    }

    ctx.restore();
  }

  private panel(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
    ctx.fillStyle = 'rgba(10, 14, 18, 0.78)';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = 'rgba(35, 213, 221, 0.78)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
    ctx.fillStyle = 'rgba(240, 195, 106, 0.16)';
    ctx.fillRect(x, y, width, 4);
  }

  private bar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    percent: number,
    fill: string,
    label: string,
  ): void {
    ctx.fillStyle = '#1b130d';
    ctx.fillRect(x - 2, y - 2, width + 4, height + 4);
    ctx.fillStyle = '#3a2817';
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, Math.max(0, Math.min(1, percent)) * width, height);
    ctx.fillStyle = '#ffe8ab';
    ctx.fillText(label, x + 8, y + height + 4);
  }
}
