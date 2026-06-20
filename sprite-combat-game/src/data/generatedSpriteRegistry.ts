export interface GeneratedSpritePackAnimation {
  id: string;
  frameCount: number;
  fps?: number;
  loop?: boolean;
  frameSize?: { width: number; height: number };
}

export interface GeneratedSpritePackCharacter {
  id: string;
  displayName: string;
  style: 'pixel-art' | 'semi-realistic';
  enabled: boolean;
  visualScale: number;
  anchor?: { x: number; y: number };
  animations: GeneratedSpritePackAnimation[];
}

export const generatedSpriteRegistry: GeneratedSpritePackCharacter[] = [];
