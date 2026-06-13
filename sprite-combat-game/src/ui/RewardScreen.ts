import type { MoveDefinition } from '../data/moves';

export class RewardScreen {
  constructor(private readonly root: HTMLDivElement) {}

  show(options: MoveDefinition[], onChoose: (move: MoveDefinition) => void): void {
    this.root.classList.remove('hidden');
    this.root.innerHTML = '';

    const panel = document.createElement('section');
    panel.className = 'reward-panel';
    panel.innerHTML = `
      <h2>Wave Cleared</h2>
      <p>Choose one martial arts move to add to your loadout.</p>
      <div class="reward-options"></div>
    `;

    const optionsRoot = panel.querySelector<HTMLDivElement>('.reward-options');
    if (!optionsRoot) throw new Error('Reward options root missing.');

    for (const move of options) {
      const button = document.createElement('button');
      button.className = 'reward-card';
      button.type = 'button';
      button.innerHTML = `
        <strong>${move.name}</strong>
        <span>${move.style} / ${move.rarity}</span>
        <span>${move.damage} damage, ${move.staminaCost} stamina</span>
        <span>${move.cooldownMs}ms cooldown</span>
      `;
      button.addEventListener('click', () => {
        this.hide();
        onChoose(move);
      });
      optionsRoot.append(button);
    }

    this.root.append(panel);
  }

  hide(): void {
    this.root.classList.add('hidden');
    this.root.innerHTML = '';
  }
}
