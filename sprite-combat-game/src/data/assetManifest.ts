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
    sourcePath: 'public/sprites/sheets/cyber-ninja-blue-sheet.png',
    runtimePath: '/sprites/sheets/cyber-ninja-blue-sheet.png',
    notes: 'Real source sheet exists. Runtime frame PNGs have been sliced into public/sprites/frames/cyber-ninja-blue, but crops still need cleanup.',
  },
  {
    id: 'shadow-striker-purple-sheet',
    displayName: 'Shadow Striker Source Sheet',
    type: 'hero-sheet',
    status: 'partial',
    sourcePath: 'public/sprites/sheets/shadow-striker-purple-sheet.png',
    runtimePath: '/sprites/sheets/shadow-striker-purple-sheet.png',
    notes: 'Real source sheet exists. Runtime frame PNGs have been sliced and the character is selectable.',
  },
  {
    id: 'cyber-monk-orange-sheet',
    displayName: 'Cyber Monk Source Sheet',
    type: 'hero-sheet',
    status: 'partial',
    sourcePath: 'public/sprites/sheets/cyber-monk-orange-sheet.png',
    runtimePath: '/sprites/sheets/cyber-monk-orange-sheet.png',
    notes: 'Real source sheet exists. Runtime frame PNGs have been sliced and the character is selectable.',
  },
  {
    id: 'neo-operative-green-sheet',
    displayName: 'Neo Operative Source Sheet',
    type: 'hero-sheet',
    status: 'partial',
    sourcePath: 'public/sprites/sheets/neo-operative-green-sheet.png',
    runtimePath: '/sprites/sheets/neo-operative-green-sheet.png',
    notes: 'Real source sheet exists. Runtime frame PNGs have been sliced and the character is selectable.',
  },
  {
    id: 'cyber-monkey-grunt-sheet',
    displayName: 'Cyber Monkey Grunt Sheet',
    type: 'enemy-sheet',
    status: 'missing',
    sourcePath: 'public/sprites/enemies/cyber-monkey-grunt/',
    runtimePath: '/sprites/enemies/cyber-monkey-grunt/',
    notes: 'No real monkey art yet. Runtime uses improved procedural cyber-monkey fallback.',
  },
  {
    id: 'cyber-monkey-scrapper-sheet',
    displayName: 'Cyber Monkey Scrapper Sheet',
    type: 'enemy-sheet',
    status: 'missing',
    sourcePath: 'public/sprites/enemies/cyber-monkey-scrapper/',
    runtimePath: '/sprites/enemies/cyber-monkey-scrapper/',
    notes: 'Needs a bulkier cyber monkey sheet with heavier limbs and melee poses.',
  },
  {
    id: 'cyber-monkey-alpha-sheet',
    displayName: 'Cyber Monkey Alpha Sheet',
    type: 'enemy-sheet',
    status: 'missing',
    sourcePath: 'public/sprites/enemies/cyber-monkey-alpha/',
    runtimePath: '/sprites/enemies/cyber-monkey-alpha/',
    notes: 'Needs a boss-scale cyber monkey sheet with slam, taunt, and enrage poses.',
  },
  {
    id: 'desert-procedural-ground',
    displayName: 'Desert Procedural Ground',
    type: 'environment-layer',
    status: 'placeholder',
    sourcePath: 'src/systems/RenderSystem.ts',
    notes: 'Improved procedural sand, path markings, edge markers, debris, and backdrop until bitmap stage art exists.',
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
