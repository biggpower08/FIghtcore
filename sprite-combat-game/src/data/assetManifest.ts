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
    sourcePath: 'public/assets/fightcore/backgrounds/desert-arena/day.png',
    runtimePath: '/assets/fightcore/backgrounds/desert-arena/day.png',
    notes: 'Fallback generated desert wasteland arena used if a time-of-day variant is unavailable.',
  },
  {
    id: 'desert-arena-variants',
    displayName: 'Desert Arena Time Variants',
    type: 'environment-layer',
    status: 'real',
    sourcePath: 'public/assets/fightcore/backgrounds/desert-arena/',
    runtimePath: '/assets/fightcore/backgrounds/desert-arena/{morning,daytime,evening,night}.png',
    notes: 'Generated morning, daytime, evening, and night arenas are preloaded and crossfaded during gameplay.',
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
    status: 'real',
    sourcePath: 'public/assets/fightcore/backgrounds/desert-arena/rock-props/',
    runtimePath: '/assets/fightcore/backgrounds/desert-arena/rock-props/',
    notes: 'Rock sheet was split into individual transparent bottom-anchored props. Stick bush props are not used.',
  },
  {
    id: 'desert-wind-effects',
    displayName: 'Desert Wind Effects',
    type: 'effect-sheet',
    status: 'real',
    sourcePath: 'public/assets/fightcore/backgrounds/desert-arena/wind.png',
    runtimePath: '/assets/fightcore/backgrounds/desert-arena/wind.png',
    notes: 'Cleaned transparent wind sheet is drawn subtly as background ambience only.',
  },
  {
    id: 'combat-effects',
    displayName: 'Combat Effects',
    type: 'effect-sheet',
    status: 'placeholder',
    sourcePath: 'public/sprites/effects/',
    runtimePath: '/sprites/effects/',
    notes: 'Cheap hit sparks/rings/slashes are intentionally disabled in normal gameplay.',
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
