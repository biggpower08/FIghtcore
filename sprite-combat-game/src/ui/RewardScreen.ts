import type { MoveDefinition } from '../data/moves';
import type { Player } from '../entities/Player';
import type { RewardOption } from '../systems/ProgressionSystem';

export class RewardScreen {
  constructor(private readonly root: HTMLDivElement) {}

  show(
    options: RewardOption[],
    player: Player,
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
          <strong>${move.upgrade.name}</strong>
          <span>${move.upgrade.category} Upgrade - level ${move.upgrade.currentLevel(player) + 1}/${move.upgrade.maxLevel}</span>
          <span>${move.upgrade.valueText(player)}</span>
          <span>${move.upgrade.description}</span>
        `;
      } else {
        button.innerHTML = `
          <strong>${move.move.name}</strong>
          <span>${move.move.style} / ${move.move.rarity}</span>
          <span>${move.move.damage} damage, ${player.getStaminaCost(move.move)} stamina</span>
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
      <p>${move.name} (${move.rarity}) - ${move.damage} damage, ${player.getStaminaCost(move)} stamina, ${player.getCooldownMs(move)}ms cooldown.</p>
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
        <span>${player.getStaminaCost(currentMove)} -> ${player.getStaminaCost(move)} stamina</span>
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
