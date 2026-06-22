export type CharacterArtStyle = 'pixel-art' | 'semi-realistic';
export type AnchorMode = 'feet' | 'center';

export interface BoundsSize {
  w: number;
  h: number;
}

export interface CharacterVisualProfile {
  id: string;
  style: CharacterArtStyle;
  canonicalBodyHeight: number;
  visualScale: number;
  anchorMode: AnchorMode;
  baselineOffset: number;
  bodyBounds: BoundsSize;
  renderBounds: BoundsSize;
  collisionSize: BoundsSize;
  hurtboxSize: BoundsSize;
}

const defaultPixelProfile: Omit<CharacterVisualProfile, 'id'> = {
  style: 'pixel-art',
  canonicalBodyHeight: 92,
  visualScale: 1,
  anchorMode: 'feet',
  baselineOffset: 0,
  bodyBounds: { w: 48, h: 92 },
  renderBounds: { w: 128, h: 128 },
  collisionSize: { w: 42, h: 86 },
  hurtboxSize: { w: 52, h: 92 },
};

export const characterVisualProfiles: CharacterVisualProfile[] = [
  pixelProfile('cyber-ninja', { collisionSize: { w: 42, h: 84 }, hurtboxSize: { w: 52, h: 88 } }),
  pixelProfile('shadow-striker', { collisionSize: { w: 44, h: 90 }, hurtboxSize: { w: 56, h: 96 } }),
  pixelProfile('puppetmaster', { collisionSize: { w: 50, h: 94 }, hurtboxSize: { w: 60, h: 100 } }),
  pixelProfile('combat-monk', { collisionSize: { w: 46, h: 92 }, hurtboxSize: { w: 56, h: 98 } }),
  pixelProfile('monkey-grunt', { collisionSize: { w: 44, h: 70 }, hurtboxSize: { w: 54, h: 76 } }),
  pixelProfile('striker-monkey', { collisionSize: { w: 46, h: 74 }, hurtboxSize: { w: 58, h: 82 } }),
  pixelProfile('cyber-monkey-grappler', { collisionSize: { w: 58, h: 84 }, hurtboxSize: { w: 68, h: 92 } }),
  {
    id: 'ronin',
    style: 'semi-realistic',
    canonicalBodyHeight: 118,
    visualScale: 0.22,
    anchorMode: 'feet',
    baselineOffset: 0,
    bodyBounds: { w: 58, h: 118 },
    renderBounds: { w: 144, h: 148 },
    collisionSize: { w: 44, h: 92 },
    hurtboxSize: { w: 56, h: 112 },
  },
  {
    id: 'supreme-emperor',
    style: 'semi-realistic',
    canonicalBodyHeight: 136,
    visualScale: 0.21,
    anchorMode: 'feet',
    baselineOffset: 0,
    bodyBounds: { w: 68, h: 136 },
    renderBounds: { w: 168, h: 172 },
    collisionSize: { w: 54, h: 108 },
    hurtboxSize: { w: 68, h: 132 },
  },
];

export const characterVisualProfileById = new Map(characterVisualProfiles.map((profile) => [profile.id, profile]));

export function getCharacterVisualProfile(id: string): CharacterVisualProfile {
  return characterVisualProfileById.get(id) ?? {
    id,
    ...defaultPixelProfile,
  };
}

function pixelProfile(id: string, overrides: Partial<CharacterVisualProfile> = {}): CharacterVisualProfile {
  return {
    id,
    ...defaultPixelProfile,
    ...overrides,
  };
}
