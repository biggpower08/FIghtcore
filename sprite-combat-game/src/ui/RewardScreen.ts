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
        button.innerHTML = `
          <span class="reward-icon">${upgradeIcon(move.upgrade)}</span>
          <strong>${move.upgrade.name}</strong>
          <span>${move.upgrade.category} Upgrade - level ${move.upgrade.currentLevel(player) + 1}/${move.upgrade.maxLevel}</span>
          <span>${move.upgrade.valueText(player)}</span>
          <span>${move.upgrade.description}</span>
        `;
      } else {
        button.innerHTML = `
          <span class="reward-icon">${moveIcon(move.move)}</span>
          <strong>${move.move.name}</strong>
          <span>${move.move.style} / ${move.move.rarity}</span>
          <span>${move.move.damage} damage</span>
          <span>${player.getCooldownMs(move.move)}ms cooldown</span>
          <span>Compatible with ${player.character.name}</span>
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

function upgradeIcon(upgrade: UpgradeDefinition): string {
  if (upgrade.characterId === 'supreme-emperor') return 'CR';
  if (upgrade.characterId === 'ronin') return 'RN';
  if (upgrade.category === 'Ability') return 'SP';
  if (upgrade.id.includes('flow') || upgrade.id.includes('activity') || upgrade.name.includes('Flow')) return 'FL';
  if (upgrade.id.includes('heal') || upgrade.id.includes('vital') || upgrade.id.includes('breath')) return 'HP';
  return 'UP';
}

function moveIcon(move: MoveDefinition): string {
  if (move.style.includes('kick') || move.id.includes('kick') || move.id.includes('knee')) return 'FT';
  if (move.style === 'boxing' || move.id.includes('jab') || move.id.includes('cross') || move.id.includes('hook')) return 'FS';
  if (move.style === 'wrestling' || move.style === 'judo' || move.style === 'jiujitsu') return 'GR';
  return 'MV';
}
