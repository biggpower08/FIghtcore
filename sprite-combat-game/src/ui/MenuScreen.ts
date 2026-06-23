import { characters } from '../data/characters';
import { publicAssetUrl } from '../game/publicAssetUrl';

type MenuHandlers = {
  onStart: () => void;
  onSettings: () => void;
  onControls: () => void;
  onSpriteLab: () => void;
  onCharacterSelect: (characterId: string) => void;
  onStartCharacter: (characterId: string) => void;
  onCredits: () => void;
  onFullscreen: () => void;
  onBack: () => void;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
};

export class MenuScreen {
  private handlers: MenuHandlers | null = null;

  constructor(private readonly root: HTMLDivElement) {}

  bind(handlers: MenuHandlers): void {
    this.handlers = handlers;
  }

  showHome(selectedCharacterId = 'ronin'): void {
    this.show(`
      <section class="menu-panel home-panel">
        <div class="home-copy">
          <p class="eyebrow">Short combat roguelite</p>
          <h1>FIghtcore</h1>
          <p class="menu-copy">A compact two-path combat roguelite about staying active, chaining clean hits, and surviving one more wave.</p>
        </div>
        <div class="path-card-list">
          ${characters
            .map((character) => {
              const selectedClass = character.id === selectedCharacterId ? ' selected' : '';
              const previewPath = characterIconPath(character);
              const details = pathDetails(character.id);
              return `
                <article class="path-card${selectedClass}">
                  <div class="character-card-preview"><img src="${publicAssetUrl(previewPath)}" alt="${character.name}" /></div>
                  <div>
                    <strong>${character.name}</strong>
                    <span class="path-role">${details.role}</span>
                    <p>${details.style}</p>
                    <p><b>Ability:</b> ${details.ability}</p>
                  </div>
                  <button data-action="start-character" data-character-id="${character.id}" type="button">Start ${character.name} Run</button>
                </article>
              `;
            })
            .join('')}
        </div>
        <div class="menu-actions">
          <button data-action="start">Start Run</button>
          <button data-action="settings">Options</button>
          <button data-action="controls">Controls</button>
          <button data-action="credits">Credits</button>
          <details class="dev-tools">
            <summary>Dev</summary>
            <button data-action="sprite-lab" type="button">Sprite Lab</button>
          </details>
        </div>
      </section>
    `);
    this.installPreviewFallbacks();
  }

  showSettings(): void {
    this.show(`
      <section class="menu-panel settings-panel">
        <h2>Options</h2>
        <label><span>Master volume</span><input type="range" min="0" max="100" value="70" /></label>
        <label><span>Music volume</span><input type="range" min="0" max="100" value="55" /></label>
        <label><span>SFX volume</span><input type="range" min="0" max="100" value="80" /></label>
        <label class="toggle-row"><span>Screen shake</span><input type="checkbox" checked /></label>
        <button data-action="fullscreen" type="button">Toggle Fullscreen</button>
        <p class="menu-copy">Audio sliders are presentation placeholders until the final audio pass is wired.</p>
        <button data-action="back">Back</button>
      </section>
    `);
  }

  showControls(): void {
    this.show(`
      <section class="menu-panel settings-panel">
        <h2>Controls</h2>
        <p class="menu-copy">WASD moves. Space dashes. H/J/K/L attack with the four equipped moves. U uses the path ability. Esc pauses.</p>
        <p class="menu-copy">Survive a wave, choose an upgrade, heal up, and keep climbing.</p>
        <button data-action="back">Back</button>
      </section>
    `);
  }

  showCredits(): void {
    this.show(`
      <section class="menu-panel settings-panel">
        <h2>Credits</h2>
        <p class="menu-copy">FIghtcore is a small browser combat roguelite built around two fighter paths: Ronin and Supreme Emperor.</p>
        <p class="menu-copy">Design, implementation, sprite cleanup, and QA tooling by the FIghtcore project team.</p>
        <button data-action="back">Back</button>
      </section>
    `);
  }

  showPaused(): void {
    this.show(`
      <section class="menu-panel settings-panel">
        <h2>Paused</h2>
        <p class="menu-copy">Take a breath. The arena waits until you resume.</p>
        <div class="menu-actions stacked">
          <button data-action="resume">Resume</button>
          <button data-action="restart">Restart Run</button>
          <button data-action="settings">Options</button>
          <button data-action="home">Return Home</button>
        </div>
      </section>
    `);
  }

  showGameOver(): void {
    this.show(`
      <section class="menu-panel settings-panel">
        <h2>Game Over</h2>
        <p class="menu-copy">The desert got you this run. Head home and start a fresh wave climb.</p>
        <div class="menu-actions stacked">
          <button data-action="restart">Restart Run</button>
          <button data-action="home">Return Home</button>
        </div>
      </section>
    `);
  }

  hide(): void {
    this.root.classList.add('hidden');
    this.root.innerHTML = '';
  }

  private show(markup: string): void {
    this.root.classList.remove('hidden');
    this.root.innerHTML = markup;
    this.root.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((button) => {
      button.addEventListener('click', () => this.handleAction(button));
    });
  }

  private installPreviewFallbacks(): void {
    this.root.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
      image.addEventListener('error', () => {
        image.classList.add('failed-preview');
        image.removeAttribute('src');
        image.alt = 'Preview unavailable';
      });
    });
  }

  private handleAction(button: HTMLButtonElement): void {
    if (!this.handlers) return;
    const action = button.dataset.action ?? '';
    if (action === 'start') this.handlers.onStart();
    if (action === 'settings') this.handlers.onSettings();
    if (action === 'controls') this.handlers.onControls();
    if (action === 'credits') this.handlers.onCredits();
    if (action === 'fullscreen') this.handlers.onFullscreen();
    if (action === 'sprite-lab') this.handlers.onSpriteLab();
    if (action === 'start-character') {
      const characterId = button.dataset.characterId;
      if (characterId) this.handlers.onStartCharacter(characterId);
    }
    if (action === 'select-character') {
      const characterId = button.dataset.characterId;
      if (characterId) this.handlers.onCharacterSelect(characterId);
    }
    if (action === 'back') this.handlers.onBack();
    if (action === 'resume') this.handlers.onResume();
    if (action === 'restart') this.handlers.onRestart();
    if (action === 'home') this.handlers.onHome();
  }
}

function characterIconPath(character: { id: string; iconPath?: string }): string {
  return character.iconPath ?? `/sprites/frames/${character.id}/idle/0001.png`;
}

function pathDetails(characterId: string): { role: string; style: string; ability: string } {
  if (characterId === 'supreme-emperor') {
    return {
      role: 'Power striker / high-impact path',
      style: 'Explosive pressure, huge damage, and heavier recovery windows.',
      ability: 'Instant Death - a short proc window that can erase normal enemies.',
    };
  }
  return {
    role: 'Balanced path / technical survivor',
    style: 'Grounded, technical, reliable. Best path for learning a full run.',
    ability: 'Density - brief damage immunity while you reset the fight.',
  };
}
