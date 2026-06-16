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
    id: 'cyber-monkey-grunt-sheet',
    displayName: 'Cyber Monkey Grunt Sheet',
    type: 'enemy-sheet',
    status: 'partial',
    sourcePath: 'public/sprites/source-generated/cyber-monkey-grunt-sheet.png',
    runtimePath: '/sprites/frames/cyber-monkey-grunt/',
    notes: 'Generated monkey art is sliced into runtime animation folders. Procedural fallback remains only if files are missing.',
  },
  {
    id: 'desert-arena-main',
    displayName: 'Desert Arena Main Background',
    type: 'environment-layer',
    status: 'real',
    sourcePath: 'public/backgrounds/desert/desert-arena-main.png',
    runtimePath: '/backgrounds/desert/desert-arena-main.png',
    notes: 'Generated desert wasteland arena is preloaded and used as the primary gameplay background.',
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
