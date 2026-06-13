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
          <button data-action="background">Background Preview</button>
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
        if (action === 'background') this.drawBackgroundPreview();
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

  private drawBackgroundPreview(): void {
    const canvas = this.root.querySelector<HTMLCanvasElement>('canvas');
    const info = this.root.querySelector<HTMLPreElement>('[data-field="info"]');
    if (!canvas || !info) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#b87935';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#7b4926';
    for (let x = -20; x < canvas.width; x += 70) {
      ctx.beginPath();
      ctx.moveTo(x, 60);
      ctx.lineTo(x + 38, 28);
      ctx.lineTo(x + 90, 60);
      ctx.closePath();
      ctx.fill();
    }

    ctx.strokeStyle = '#6d3d1d';
    ctx.lineWidth = 12;
    ctx.strokeRect(24, 72, canvas.width - 48, canvas.height - 96);

    for (let i = 0; i < 28; i += 1) {
      const x = 34 + ((i * 61) % (canvas.width - 68));
      const y = 82 + ((i * 43) % (canvas.height - 118));
      ctx.fillStyle = i % 2 === 0 ? '#f0bd70' : '#5f3419';
      ctx.globalAlpha = 0.24;
      ctx.fillRect(x, y, 26, 2);
    }
    ctx.globalAlpha = 1;

    this.previewRock(ctx, 96, 178, 22);
    this.previewRock(ctx, 314, 138, 16);
    this.previewBush(ctx, 196, 220);
    this.previewScrap(ctx, 268, 204);
    this.previewBones(ctx, 134, 116);

    info.textContent = JSON.stringify(
      {
        mode: 'background-preview',
        status: 'procedural-placeholder',
        layers: ['sand base', 'distant ridge', 'arena boundary', 'sand streaks', 'rocks', 'dead bushes', 'bones', 'cyber scrap'],
        reviewFocus: ['arena readability', 'prop spacing', 'movement-safe decoration', 'desert cyberpunk identity'],
        finalArtNeeded: ['sand tile', 'distant ridge layer', 'rock sprites', 'dead bush sprite', 'bone pile sprite', 'cyber scrap sprite'],
      },
      null,
      2,
    );
  }

  private previewRock(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
    ctx.fillStyle = '#554535';
    ctx.beginPath();
    ctx.ellipse(x, y, radius * 1.3, radius * 0.8, -0.24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#74604d';
    ctx.fillRect(x - radius * 0.45, y - radius * 0.45, radius, 5);
  }

  private previewBush(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.strokeStyle = '#5b3219';
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (i - 3) * 8, y - 22 + (i % 2) * 7);
      ctx.stroke();
    }
  }

  private previewScrap(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#3a3e42';
    ctx.fillRect(x - 24, y - 9, 44, 14);
    ctx.fillStyle = '#23d5dd';
    ctx.fillRect(x - 16, y - 4, 22, 3);
  }

  private previewBones(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.strokeStyle = '#e3d3b9';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 20, y + 5);
    ctx.lineTo(x + 18, y - 5);
    ctx.moveTo(x - 10, y - 9);
    ctx.lineTo(x + 22, y + 9);
    ctx.stroke();
  }
}

function option(value: string, label: string): string {
  return `<option value="${value}">${label}</option>`;
}
