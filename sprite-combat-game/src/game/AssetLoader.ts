export class AssetLoader {
  private readonly images = new Map<string, HTMLImageElement>();

  async loadImage(path: string): Promise<HTMLImageElement> {
    const cached = this.images.get(path);
    if (cached) return cached;

    const image = new Image();
    image.src = path;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error(`Could not load image: ${path}`));
    });

    this.images.set(path, image);
    return image;
  }

  async loadFrames(character: string, move: string, frameCount: number): Promise<HTMLImageElement[]> {
    const padded = (frame: number) => String(frame).padStart(4, '0');
    const paths = Array.from(
      { length: frameCount },
      (_, index) => `/sprites/frames/${character}/${move}/${padded(index + 1)}.png`,
    );
    return Promise.all(paths.map((path) => this.loadImage(path)));
  }
}
