export type ArtAssetType =
  | 'hero-sheet'
  | 'enemy-sheet'
  | 'effect-sheet'
  | 'background-prop'
  | 'environment-layer'
  | 'ui-asset';

export type ArtAssetStatus = 'real' | 'partial' | 'placeholder' | 'missing' | 'planned';

export interface ArtAssetManifestEntry {
  id: string;
  displayName: string;
  type: ArtAssetType;
  status: ArtAssetStatus;
  sourcePath?: string;
  runtimePath?: string;
  notes: string;
}

export const artAssetManifest: ArtAssetManifestEntry[] = [
  {
    id: 'cyber-ninja-blue-sheet',
    displayName: 'Cyber Ninja Source Sheet',
    type: 'hero-sheet',
    status: 'partial',
    sourcePath: 'public/sprites/source-generated/cyber-ninja-sheet.png',
    runtimePath: '/sprites/frames/cyber-ninja-blue/',
    notes: 'Generated source sheet exists and sliced frame PNGs are used in normal gameplay. Crops can still be art-polished.',
  },
  {
    id: 'shadow-striker-purple-sheet',
    displayName: 'Shadow Striker Source Sheet',
    type: 'hero-sheet',
    status: 'partial',
    sourcePath: 'public/sprites/source-generated/shadow-striker-sheet.png',
    runtimePath: '/sprites/frames/shadow-striker-purple/',
    notes: 'Generated source sheet exists and sliced frame PNGs are used in normal gameplay. Character remains selectable.',
  },
  {
    id: 'cyber-monk-orange-sheet',
    displayName: 'Cyber Monk Source Sheet',
    type: 'hero-sheet',
    status: 'partial',
    sourcePath: 'public/sprites/source-generated/cyber-monk-sheet.png',
    runtimePath: '/sprites/frames/cyber-monk-orange/',
    notes: 'Generated source sheet exists and sliced frame PNGs are used in normal gameplay. Character remains selectable.',
  },
  {
    id: 'neo-operative-green-sheet',
    displayName: 'Neo Operative Source Sheet',
    type: 'hero-sheet',
    status: 'partial',
    sourcePath: 'public/sprites/source-generated/neo-operative-sheet.png',
    runtimePath: '/sprites/frames/neo-operative-green/',
    notes: 'Generated source sheet exists and sliced frame PNGs are used in normal gameplay. Character remains selectable.',
  },
  {
    id: 'critical-overload-strip',
    displayName: 'Critical Overload Ability Strip',
    type: 'hero-sheet',
    status: 'partial',
    sourcePath: 'public/assets/fightcore/sprites/cyber-ninja/critical-overload-strip.png',
    runtimePath: '/sprites/frames/cyber-ninja/critical_overload/',
    notes: 'Imported U-key ability strip. Cleaned transparent frame PNGs are used in gameplay.',
  },
  {
    id: 'momentum-flow-strip',
    displayName: 'Momentum Flow Ability Strip',
    type: 'hero-sheet',
    status: 'partial',
    sourcePath: 'public/assets/fightcore/sprites/shadow-striker/momentum-flow-strip.png',
    runtimePath: '/sprites/frames/shadow-striker/momentum_flow/',
    notes: 'Imported U-key ability strip. Gameplay and Sprite Lab use the player-facing Momentum Flow animation only.',
  },
  {
    id: 'thug-it-out-strip',
    displayName: 'Thug It Out Ability Strip',
    type: 'hero-sheet',
    status: 'partial',
    sourcePath: 'public/assets/fightcore/sprites/puppetmaster/thug-it-out-strip.png',
    runtimePath: '/sprites/frames/puppetmaster/thug_it_out/',
    notes: 'Imported U-key ability strip. Cleaned transparent frame PNGs are used in gameplay.',
  },
  {
    id: 'desert-arena-main',
    displayName: 'Desert Arena Main Background',
    type: 'environment-layer',
    status: 'real',
    sourcePath: 'public/backgrounds/desert/desert-arena-main.png',
    runtimePath: '/backgrounds/desert/desert-arena-main.png',
    notes: 'Generated desert wasteland arena is preloaded, then blended with morning, daytime, evening, and night tint variants in gameplay.',
  },
  {
    id: 'desert-procedural-ground',
    displayName: 'Desert Procedural Ground',
    type: 'environment-layer',
    status: 'placeholder',
    sourcePath: 'src/systems/RenderSystem.ts',
    notes: 'Fallback background path if the generated desert arena image cannot be loaded.',
  },
  {
    id: 'desert-props',
    displayName: 'Desert Props',
    type: 'background-prop',
    status: 'placeholder',
    sourcePath: 'public/backgrounds/desert/props/',
    runtimePath: '/backgrounds/desert/props/',
    notes: 'Folders exist for rocks, bushes, bones, cyber scrap, and arena markers. Runtime currently draws procedural versions.',
  },
  {
    id: 'combat-effects',
    displayName: 'Combat Effects',
    type: 'effect-sheet',
    status: 'placeholder',
    sourcePath: 'public/sprites/effects/',
    runtimePath: '/sprites/effects/',
    notes: 'Dust puffs and hit flashes are procedural for now. Final effect sprites are planned.',
  },
  {
    id: 'ui-icons',
    displayName: 'UI Icon Art',
    type: 'ui-asset',
    status: 'planned',
    sourcePath: 'public/ui/',
    runtimePath: '/ui/',
    notes: 'UI icons for moves, rarity, character select, and settings are planned but not drawn yet.',
  },
];

export const artAssetManifestById = new Map(artAssetManifest.map((asset) => [asset.id, asset]));
