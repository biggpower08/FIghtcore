import { getKnownAnimationKeys, printSpriteCoverageReport } from '../data/spriteAnimations';
import { moves } from '../data/moves';
import { spriteRegistry } from '../data/spriteRegistry';
import type { AssetLoader, ResolvedSpriteAnimation, ResolvedSpriteFrame } from '../game/AssetLoader';

const labEntityIds = ['cyber-ninja-blue', 'cyber-monkey-grunt', 'cyber-monkey-scrapper', 'cyber-monkey-alpha'];

export class SpriteLab {
  private frameIndex = 0;
  private animation: ResolvedSpriteAnimation | null = null;

  constructor(
    private readonly root: HTMLDivElement,
    private readonly assets: AssetLoader,
  ) {}

  show(onBack: () => void): void {
    this.root.classList.remove('hidden');
    this.root.innerHTML = `
      <section class="menu-panel sprite-lab-panel">
        <div class="sprite-lab-header">
          <div>
            <p class="eyebrow">Development Tool</p>
            <h2>Sprite Lab</h2>
          </div>
          <button data-action="back">Back</button>
        </div>
        <div class="sprite-lab-controls">
          <label><span>Entity</span><select data-field="entity"></select></label>
          <label><span>Animation</span><select data-field="animation"></select></label>
          <label><span>Move</span><select data-field="move"></select></label>
        </div>
        <div class="sprite-lab-stage">
          <canvas width="420" height="280"></canvas>
          <pre data-field="info"></pre>
        </div>
        <div class="menu-actions">
          <button data-action="play">Play / Replay</button>
          <button data-action="next">Next Frame</button>
          <button data-action="report">Coverage Report</button>
        </div>
      </section>
    `;

    const entitySelect = this.root.querySelector<HTMLSelectElement>('[data-field="entity"]');
    const animationSelect = this.root.querySelector<HTMLSelectElement>('[data-field="animation"]');
    const moveSelect = this.root.querySelector<HTMLSelectElement>('[data-field="move"]');
    if (!entitySelect || !animationSelect || !moveSelect) return;

    entitySelect.innerHTML = labEntityIds.map((id) => option(id, spriteRegistry.find((sprite) => sprite.id === id)?.id ?? id)).join('');
    moveSelect.innerHTML = `<option value="">Move shortcuts</option>${moves.map((move) => option(move.animationKey, move.name)).join('')}`;

    const refreshAnimations = (): void => {
      const keys = getKnownAnimationKeys(entitySelect.value);
      animationSelect.innerHTML = keys.map((key) => option(key, key)).join('');
    };

    const refresh = (): void => {
      void this.loadAndDraw(entitySelect.value, moveSelect.value || animationSelect.value);
    };

    refreshAnimations();
    refresh();

    entitySelect.addEventListener('change', () => {
      moveSelect.value = '';
      refreshAnimations();
      refresh();
    });
    animationSelect.addEventListener('change', () => {
      moveSelect.value = '';
      refresh();
    });
    moveSelect.addEventListener('change', refresh);

    this.root.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        if (action === 'back') onBack();
        if (action === 'play') {
          this.frameIndex = 0;
          refresh();
        }
        if (action === 'next') {
          this.frameIndex += 1;
          this.draw();
        }
        if (action === 'report') printSpriteCoverageReport();
      });
    });
  }

  hide(): void {
    this.root.classList.add('hidden');
    this.root.innerHTML = '';
    this.animation = null;
  }

  private async loadAndDraw(entityId: string, animationKey: string): Promise<void> {
    this.animation = await this.assets.resolveAnimation(entityId, animationKey);
    this.frameIndex = 0;
    this.draw();
  }

  private draw(): void {
    const canvas = this.root.querySelector<HTMLCanvasElement>('canvas');
    const info = this.root.querySelector<HTMLPreElement>('[data-field="info"]');
    if (!canvas || !info || !this.animation) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#17120c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const frame = this.animation.frames[this.frameIndex % this.animation.frames.length];
    if (frame) this.drawFrame(ctx, frame, canvas.width / 2, canvas.height / 2 + 70);

    info.textContent = JSON.stringify(
      {
        entityId: this.animation.entityId,
        animationKey: this.animation.animationKey,
        status: this.animation.status,
        frame: `${(this.frameIndex % this.animation.frames.length) + 1}/${this.animation.frames.length}`,
        sheetId: frame?.sheetId,
        framePath: frame?.framePath,
        rect: frame?.x === undefined ? undefined : { x: frame.x, y: frame.y, width: frame.width, height: frame.height },
        notes: frame?.notes ?? this.animation.notes,
      },
      null,
      2,
    );
  }

  private drawFrame(ctx: CanvasRenderingContext2D, frame: ResolvedSpriteFrame, centerX: number, floorY: number): void {
    const sourceWidth = frame.width ?? frame.image?.width ?? 80;
    const sourceHeight = frame.height ?? frame.image?.height ?? 80;
    const scale = Math.min(2.4, 230 / Math.max(sourceWidth, sourceHeight));
    const width = sourceWidth * scale;
    const height = sourceHeight * scale;
    const dx = centerX - width * frame.anchorX;
    const dy = floorY - height * frame.anchorY;

    if (frame.image) {
      ctx.drawImage(frame.image, dx, dy, width, height);
    } else if (frame.sheetImage && frame.x !== undefined && frame.y !== undefined && frame.width && frame.height) {
      ctx.drawImage(frame.sheetImage, frame.x, frame.y, frame.width, frame.height, dx, dy, width, height);
    } else {
      ctx.fillStyle = '#38a3ff';
      ctx.fillRect(dx, dy, width, height);
    }
  }
}

function option(value: string, label: string): string {
  return `<option value="${value}">${label}</option>`;
}
