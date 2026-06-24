import type { MoveDefinition } from '../data/moves';
import type { UpgradeDefinition } from '../data/upgrades';
import type { Player } from '../entities/Player';
import type { RewardOption } from '../systems/ProgressionSystem';

export class RewardScreen {
  constructor(private readonly root: HTMLDivElement) {}

  show(
    options: RewardOption[],
    player: Player,
    cyberWarning: string,
    onChooseMove: (move: MoveDefinition, slotIndex: number) => void,
    onChooseUpgrade: (option: RewardOption) => void,
  ): void {
    this.root.classList.remove('hidden');
    this.root.innerHTML = '';

    const panel = document.createElement('section');
    panel.className = 'reward-panel';
    panel.innerHTML = `
      <h2>Wave Cleared</h2>
      <p>Choose a compatible move, then pick which H/J/K/L slot it replaces.</p>
      <p class="menu-copy">${cyberWarning}</p>
      <div class="reward-options"></div>
    `;

    const optionsRoot = panel.querySelector<HTMLDivElement>('.reward-options');
    if (!optionsRoot) throw new Error('Reward options root missing.');

    for (const move of options) {
      const button = document.createElement('button');
      button.className = 'reward-card';
      button.type = 'button';
      if (move.kind === 'upgrade') {
        button.classList.add(`reward-card-${move.upgrade.rarity}`);
        button.innerHTML = upgradeCardHtml(move.upgrade, player);
        const icon = button.querySelector<HTMLImageElement>('.reward-icon img');
        icon?.addEventListener('error', () => {
          const root = icon.parentElement;
          if (icon.dataset.fallbackTried !== '1') {
            icon.dataset.fallbackTried = '1';
            icon.src = resolvePublicAssetPath('/ui/upgrade-icons/impact-star.png');
            return;
          }
          icon.remove();
          if (root) {
            root.classList.remove('reward-image-icon');
            root.textContent = upgradeIconFallback(move.upgrade);
          }
        });
      } else {
        button.innerHTML = `
          <span class="reward-icon">${moveIcon(move.move)}</span>
          <strong>${escapeHtml(move.move.name)}</strong>
          <span>${escapeHtml(move.move.style)} / ${escapeHtml(move.move.rarity)}</span>
          <span>${move.move.damage} damage</span>
          <span>${player.getCooldownMs(move.move)}ms cooldown</span>
          <span>Compatible with ${escapeHtml(player.character.name)}</span>
        `;
      }
      button.addEventListener('click', () => {
        if (move.kind === 'upgrade') {
          this.hide();
          onChooseUpgrade(move);
        } else {
          this.showReplacementChoices(move.move, player, onChooseMove);
        }
      });
      optionsRoot.append(button);
    }

    this.root.append(panel);
  }

  private showReplacementChoices(move: MoveDefinition, player: Player, onChoose: (move: MoveDefinition, slotIndex: number) => void): void {
    const slotKeys = ['H', 'J', 'K', 'L'];
    this.root.innerHTML = '';

    const panel = document.createElement('section');
    panel.className = 'reward-panel';
    panel.innerHTML = `
      <h2>Replace Which Move?</h2>
      <p>${move.name} (${move.rarity}) - ${move.damage} damage, ${player.getCooldownMs(move)}ms cooldown.</p>
      <div class="reward-options"></div>
    `;

    const optionsRoot = panel.querySelector<HTMLDivElement>('.reward-options');
    if (!optionsRoot) throw new Error('Reward replacement root missing.');

    player.equippedMoves.forEach((currentMove, index) => {
      const button = document.createElement('button');
      button.className = 'reward-card';
      button.type = 'button';
      button.innerHTML = `
        <strong>${slotKeys[index]}: ${currentMove.name}</strong>
        <span>Replace with ${move.name}</span>
        <span>${currentMove.damage} -> ${move.damage} damage</span>
        <span>${player.getCooldownMs(currentMove)} -> ${player.getCooldownMs(move)}ms cooldown</span>
      `;
      button.addEventListener('click', () => {
        this.hide();
        onChoose(move, index);
      });
      optionsRoot.append(button);
    });

    this.root.append(panel);
  }

  hide(): void {
    this.root.classList.add('hidden');
    this.root.innerHTML = '';
  }
}

function upgradeCardHtml(upgrade: UpgradeDefinition, player: Player): string {
  const nextLevel = upgrade.currentLevel(player) + 1;
  const pathLabel = upgrade.characterScope === 'shared' ? 'Shared' : upgrade.characterScope === 'ronin' ? 'Ronin' : 'Supreme';
  const stackText = upgrade.stackingMode === 'unique' || upgrade.stackingMode === 'transform' ? upgrade.stackingMode : `${nextLevel}/${upgrade.maxStacks}`;
  const affectedMove = upgrade.affectedMove ? `<span class="reward-affected">Affects ${escapeHtml(upgrade.affectedMove)}</span>` : '';
  const flavor = upgrade.flavor ? `<span class="reward-flavor">${escapeHtml(upgrade.flavor)}</span>` : '';
  const iconPath = resolvePublicAssetPath(upgrade.icon);

  return `
    <span class="reward-card-header">
      <span class="reward-icon reward-image-icon"><img src="${escapeHtml(iconPath)}" alt="" loading="eager" decoding="async" /></span>
      <span class="reward-badges">
        <span class="reward-badge">${escapeHtml(pathLabel)}</span>
        <span class="reward-badge reward-rarity-${upgrade.rarity}">${escapeHtml(upgrade.rarity)}</span>
      </span>
    </span>
    <strong>${escapeHtml(upgrade.name)}</strong>
    <span class="reward-level">${escapeHtml(upgrade.category)} - ${escapeHtml(stackText)}</span>
    <span>${escapeHtml(upgrade.valueText(player))}</span>
    <span>${escapeHtml(upgrade.effect)}</span>
    ${affectedMove}
    ${flavor}
  `;
}

function resolvePublicAssetPath(assetPath: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const normalizedAsset = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  return `${normalizedBase}${normalizedAsset}`;
}

function upgradeIconFallback(upgrade: UpgradeDefinition): string {
  if (upgrade.characterScope === 'supreme-emperor') return 'CR';
  if (upgrade.characterScope === 'ronin') return 'RN';
  if (upgrade.tags.includes('heal')) return 'HP';
  if (upgrade.tags.includes('kick')) return 'FT';
  if (upgrade.tags.includes('flow') || upgrade.tags.includes('activity')) return 'FL';
  return 'UP';
}

function moveIcon(move: MoveDefinition): string {
  if (move.style.includes('kick') || move.id.includes('kick') || move.id.includes('knee')) return 'FT';
  if (move.style === 'boxing' || move.id.includes('jab') || move.id.includes('cross') || move.id.includes('hook')) return 'FS';
  if (move.style === 'wrestling' || move.style === 'judo' || move.style === 'jiujitsu') return 'GR';
  return 'MV';
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return char;
    }
  });
}
