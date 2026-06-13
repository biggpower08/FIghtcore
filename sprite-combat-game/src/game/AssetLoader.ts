export class AssetLoader {
  private readonly images = new Map<string, HTMLImageElement>();
  private readonly missing = new Set<string>();
  private readonly frameCache = new Map<string, HTMLImageElement[]>();

  async loadImage(path: string): Promise<HTMLImageElement> {
    const cached = this.images.get(path);
    if (cached) return cached;
    if (this.missing.has(path)) throw new Error(`Image is unavailable: ${path}`);

    const image = new Image();
    image.src = path;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => {
        this.missing.add(path);
        reject(new Error(`Could not load image: ${path}`));
      };
    });

    this.images.set(path, image);
    return image;
  }

  async loadFrames(character: string, move: string, frameCount = 4): Promise<HTMLImageElement[]> {
    const padded = (frame: number) => String(frame).padStart(4, '0');
    const paths = Array.from(
      { length: frameCount },
      (_, index) => `/sprites/frames/${character}/${move}/${padded(index + 1)}.png`,
    );
    return Promise.all(paths.map((path) => this.loadImage(path)));
  }

  async loadOptionalFrames(assetId: string, animation: string, frameCount = 4): Promise<HTMLImageElement[]> {
    const key = `${assetId}:${animation}`;
    const cached = this.frameCache.get(key);
    if (cached) return cached;

    const frames: HTMLImageElement[] = [];
    for (let frame = 1; frame <= frameCount; frame += 1) {
      const path = `/sprites/frames/${assetId}/${animation}/${String(frame).padStart(4, '0')}.png`;
      try {
        frames.push(await this.loadImage(path));
      } catch {
        if (frame === 1) break;
      }
    }

    this.frameCache.set(key, frames);
    return frames;
  }

  getFrames(assetId: string, animation: string): HTMLImageElement[] {
    return this.frameCache.get(`${assetId}:${animation}`) ?? [];
  }
}
