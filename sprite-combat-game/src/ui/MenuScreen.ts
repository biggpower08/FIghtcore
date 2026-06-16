import { characters } from '../data/characters';
import { publicAssetUrl } from '../game/publicAssetUrl';

type MenuHandlers = {
  onStart: () => void;
  onSettings: () => void;
  onControls: () => void;
  onSpriteLab: () => void;
  onCharacterSelect: (characterId: string) => void;
  onBack: () => void;
  onResume: () => void;
  onHome: () => void;
};

export class MenuScreen {
  private handlers: MenuHandlers | null = null;

  constructor(private readonly root: HTMLDivElement) {}

  bind(handlers: MenuHandlers): void {
    this.handlers = handlers;
  }

  showHome(selectedCharacterId = 'cyber-ninja'): void {
    const selectedCharacter = characters.find((character) => character.id === selectedCharacterId) ?? characters[0];
    const selectedPreview = characterIconPath(selectedCharacter);
    this.show(`
      <section class="menu-panel home-panel">
        <div>
          <p class="eyebrow">Browser-only pixel arena fighter</p>
          <h1>FIghtcore</h1>
          <p class="menu-copy">Pick a fighter, survive readable enemy waves, and use the H/J/K/L equipped moves to control the arena.</p>
        </div>
        <div class="character-preview" aria-label="${selectedCharacter.name} preview">
          <div class="preview-shadow"></div>
          <img src="${publicAssetUrl(selectedPreview)}" alt="${selectedCharacter.name}" />
          <span>${selectedCharacter.name}</span>
        </div>
        <div class="sheet-preview-list">
          ${characters
            .map((character) => {
              const selectedClass = character.id === selectedCharacterId ? ' selected' : '';
              const previewPath = characterIconPath(character);
              return `
                <button class="character-card${selectedClass}" data-action="select-character" data-character-id="${character.id}" type="button">
                  <div class="character-card-preview"><img src="${publicAssetUrl(previewPath)}" alt="${character.name}" /></div>
                  <strong>${character.name}</strong>
                  <span>${character.identity}</span>
                </button>
              `;
            })
            .join('')}
        </div>
        <div class="menu-actions">
          <button data-action="start">Start Game</button>
          <button data-action="sprite-lab">Sprite Lab</button>
          <button data-action="settings">Settings</button>
          <button data-action="controls">Controls</button>
        </div>
        <div class="controls-preview">Objective: clear the current wave. WASD move. Space dash. H/J/K/L use equipped moves. Esc pauses.</div>
      </section>
    `);
    this.installPreviewFallbacks();
  }

  showSettings(): void {
    this.show(`
      <section class="menu-panel settings-panel">
        <h2>Settings</h2>
        <label><span>Volume</span><input type="range" min="0" max="100" value="70" /></label>
        <label><span>Music volume</span><input type="range" min="0" max="100" value="55" /></label>
        <label><span>SFX volume</span><input type="range" min="0" max="100" value="80" /></label>
        <label class="toggle-row"><span>Screen shake</span><input type="checkbox" checked /></label>
        <p class="menu-copy">Current controls: WASD move, Space dash, H/J/K/L equipped moves, Esc pause/resume.</p>
        <label><span>Controls remap</span><button type="button" disabled>Coming later</button></label>
        <label><span>Difficulty</span><select><option>Normal</option><option>Hard later</option></select></label>
        <button data-action="back">Back</button>
      </section>
    `);
  }

  showControls(): void {
    this.show(`
      <section class="menu-panel settings-panel">
        <h2>Controls</h2>
        <p class="menu-copy">WASD moves. Space dashes. H, J, K, and L fire the four moves shown at the bottom of the HUD for your selected fighter. Esc pauses or resumes.</p>
        <p class="menu-copy">Combat Monk uses Palm Strike, High Kick, Spinning Sweep, and Standing Shoulder Lock. Puppetmaster uses Double Leg Shot, O Goshi, Armbar, and Duck Under Mat Return Slam.</p>
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
          <button data-action="settings">Settings</button>
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
        <button data-action="home">Return Home</button>
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
    if (action === 'sprite-lab') this.handlers.onSpriteLab();
    if (action === 'select-character') {
      const characterId = button.dataset.characterId;
      if (characterId) this.handlers.onCharacterSelect(characterId);
    }
    if (action === 'back') this.handlers.onBack();
    if (action === 'resume') this.handlers.onResume();
    if (action === 'home') this.handlers.onHome();
  }
}

function characterIconPath(character: { id: string; iconPath?: string }): string {
  return character.iconPath ?? `/sprites/frames/${character.id}/idle/0001.png`;
}
