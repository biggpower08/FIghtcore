import type { Boss } from '../entities/Boss';
import type { Player } from '../entities/Player';

export class Hud {
  draw(ctx: CanvasRenderingContext2D, player: Player, wave: number, boss: Boss | null): void {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.textBaseline = 'top';

    const ability = player.ability;
    const abilityReady = ability ? player.abilityCooldownMs <= 0 && player.abilityActiveMs <= 0 && player.criticalOverloadArmedMs <= 0 : false;
    const abilityStatus = ability
      ? abilityReady
        ? `${ability.name} ready`
        : player.abilityStatus || `${ability.name} on cooldown ${Math.ceil(player.abilityCooldownMs / 1000)}s`
      : 'Ability unavailable';

    const slotKeys = ['H', 'J', 'K', 'L'];
    const moveText = player.equippedMoves.map((move, index) => `${slotKeys[index]} ${move.name}`).join('  ');

    const rightWidth = 272;
    const leftWidth = Math.max(300, Math.min(ctx.canvas.width - rightWidth - 42, 760));
    const leftHeight = 58;
    const leftX = 14;
    const leftY = ctx.canvas.height - leftHeight - 14;
    this.panel(ctx, leftX, leftY, leftWidth, leftHeight);
    ctx.font = '13px monospace';
    ctx.fillStyle = '#fff0c2';
    ctx.fillText(`Wave ${wave}  ${player.character.name}`, leftX + 10, leftY + 9);
    ctx.fillStyle = '#9fdde2';
    ctx.fillText(`${abilityStatus}  |  ${moveText}`, leftX + 10, leftY + 30);

    const rightHeight = 86;
    const rightX = ctx.canvas.width - rightWidth - 14;
    const rightY = ctx.canvas.height - rightHeight - 14;
    this.panel(ctx, rightX, rightY, rightWidth, rightHeight);
    this.bar(ctx, rightX + 12, rightY + 12, 190, 14, player.health / player.maxHealth, '#e94444', 'Health');
    this.bar(ctx, rightX + 12, rightY + 42, 190, 12, player.stamina / player.maxStamina, '#53d47c', 'Stamina');
    ctx.font = '10px monospace';
    ctx.fillStyle = '#b9cbd0';
    ctx.fillText(`D${player.upgrades.damageLevel} S${player.upgrades.staminaLevel} C${player.upgrades.cooldownLevel}`, rightX + 214, rightY + 14);
    ctx.fillText(`U${player.upgrades.abilityLevel} R${player.upgrades.healthRegenLevel}`, rightX + 214, rightY + 24);
    ctx.fillText('Esc pause', rightX + 214, rightY + 34);

    if (boss?.alive) {
      ctx.font = '16px monospace';
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
    ctx.font = '11px monospace';
    ctx.fillText(label, x + 8, y + height + 4);
  }
}
