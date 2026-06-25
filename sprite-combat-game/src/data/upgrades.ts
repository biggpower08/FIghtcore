import type { Player } from '../entities/Player';
import type { SpecialAbilityId } from './specialAbilities';

export type RewardKind = 'move' | 'upgrade';
export type UpgradeCategory = 'Activity/Flow' | 'Survival' | 'Move Mastery' | 'Wave Momentum' | 'Ronin Path' | 'Supreme Path' | 'Ability';
export type UpgradeCharacterScope = 'shared' | 'ronin' | 'supreme-emperor';
export type UpgradeRarity = 'common' | 'uncommon' | 'rare';
export type UpgradeStackingMode = 'stackable' | 'limited' | 'unique' | 'transform';
export type UpgradeId =
  | 'clean_entry'
  | 'cross_discipline'
  | 'measured_hands'
  | 'low_line_tax'
  | 'close_range_answer'
  | 'density_breath'
  | 'quiet_pressure'
  | 'second_wind_stance'
  | 'imperial_tempo'
  | 'royal_pressure'
  | 'crowned_one_two'
  | 'golden_threat'
  | 'crown_breaker'
  | 'eye_of_the_crown'
  | 'execution_window'
  | 'throne_momentum'
  | 'flow_state'
  | 'pressure_engine'
  | 'relentless_hands'
  | 'no_back_step'
  | 'heat_check'
  | 'breath_between_rounds'
  | 'clean_round'
  | 'first_exchange';

export interface UpgradeDefinition {
  id: UpgradeId;
  name: string;
  icon: string;
  characterScope: UpgradeCharacterScope;
  category: UpgradeCategory;
  rarity: UpgradeRarity;
  stackingMode: UpgradeStackingMode;
  maxStacks: number;
  waveMin: number;
  effect: string;
  description: string;
  flavor: string;
  affectedMove?: string;
  tags: string[];
  maxLevel: number;
  characterId?: string;
  moveId?: string;
  abilityId?: SpecialAbilityId;
  apply(player: Player): void;
  currentLevel(player: Player): number;
  valueText(player: Player): string;
  isAvailable?(player: Player): boolean;
}

type UpgradeInput = Omit<UpgradeDefinition, 'maxLevel' | 'description' | 'characterId' | 'apply' | 'currentLevel' | 'valueText'> & {
  field: keyof Player['upgrades'];
  valueLabel: string;
  characterId?: string;
  applyExtra?: (player: Player) => void;
};

const ICON_ROOT = '/ui/upgrade-icons/';

export const upgrades: UpgradeDefinition[] = [
  upgrade({
    id: 'clean_entry',
    name: 'Clean Entry',
    icon: 'ronin-mask.png',
    characterScope: 'ronin',
    category: 'Ronin Path',
    rarity: 'common',
    stackingMode: 'stackable',
    maxStacks: 4,
    waveMin: 1,
    effect: 'Ronin builds Activity faster from clean pressure.',
    flavor: 'No wasted motion before the first cut.',
    affectedMove: 'Jab',
    tags: ['ronin', 'activity', 'jab'],
    field: 'activityGainLevel',
    valueLabel: 'Activity gain',
  }),
  upgrade({
    id: 'cross_discipline',
    name: 'Cross Discipline',
    icon: 'fist-mark.png',
    characterScope: 'ronin',
    category: 'Ronin Path',
    rarity: 'common',
    stackingMode: 'limited',
    maxStacks: 3,
    waveMin: 1,
    effect: 'Cross deals more damage after Jab lands.',
    flavor: 'The second hand arrives on time.',
    affectedMove: 'Cross',
    tags: ['ronin', 'cross', 'combo'],
    field: 'roninCrossLevel',
    valueLabel: 'Jab to cross',
  }),
  upgrade({
    id: 'measured_hands',
    name: 'Measured Hands',
    icon: 'fist-mark.png',
    characterScope: 'ronin',
    category: 'Ronin Path',
    rarity: 'uncommon',
    stackingMode: 'stackable',
    maxStacks: 4,
    waveMin: 4,
    effect: 'Ronin chains recover faster when pressure stays clean.',
    flavor: 'A calm hand is still a fast hand.',
    affectedMove: 'Chain attacks',
    tags: ['ronin', 'recovery', 'chain'],
    field: 'roninChainLevel',
    valueLabel: 'Chain rhythm',
  }),
  upgrade({
    id: 'low_line_tax',
    name: 'Turning Tax',
    icon: 'foot-arc.png',
    characterScope: 'ronin',
    category: 'Ronin Path',
    rarity: 'common',
    stackingMode: 'stackable',
    maxStacks: 4,
    waveMin: 1,
    effect: 'Roundhouse Kick gains damage, control, and hitstun.',
    flavor: 'Every step forward gets billed.',
    affectedMove: 'Roundhouse Kick',
    tags: ['ronin', 'kick', 'control'],
    field: 'roninCalfLevel',
    valueLabel: 'Roundhouse',
  }),
  upgrade({
    id: 'close_range_answer',
    name: 'Close Range Answer',
    icon: 'impact-star.png',
    characterScope: 'ronin',
    category: 'Ronin Path',
    rarity: 'common',
    stackingMode: 'stackable',
    maxStacks: 3,
    waveMin: 1,
    effect: 'Side Kick gains extra control and hitstun.',
    flavor: 'Too close is still a range.',
    affectedMove: 'Side Kick',
    tags: ['ronin', 'side-kick', 'control'],
    field: 'roninKneeLevel',
    valueLabel: 'Side kick',
  }),
  upgrade({
    id: 'density_breath',
    name: 'Density Breath',
    icon: 'heart-guard.png',
    characterScope: 'ronin',
    category: 'Ability',
    rarity: 'uncommon',
    stackingMode: 'limited',
    maxStacks: 3,
    waveMin: 4,
    effect: 'Density lasts longer.',
    flavor: 'Breathe once, become difficult to move.',
    affectedMove: 'Density',
    tags: ['ronin', 'ability', 'survival'],
    field: 'abilityLevel',
    valueLabel: 'Density',
    abilityId: 'density',
    isAvailable: (player) => player.ability?.id === 'density',
  }),
  upgrade({
    id: 'quiet_pressure',
    name: 'Quiet Pressure',
    icon: 'flow-bolt.png',
    characterScope: 'ronin',
    category: 'Ronin Path',
    rarity: 'common',
    stackingMode: 'stackable',
    maxStacks: 4,
    waveMin: 1,
    effect: 'Pressure improves recovery as Activity rises.',
    flavor: 'The loudest thing in the room is the opening.',
    affectedMove: 'All attacks',
    tags: ['ronin', 'recovery', 'activity'],
    field: 'flowRecoveryLevel',
    valueLabel: 'Pressure recovery',
  }),
  upgrade({
    id: 'second_wind_stance',
    name: 'Second Wind Stance',
    icon: 'heart-guard.png',
    characterScope: 'ronin',
    category: 'Survival',
    rarity: 'uncommon',
    stackingMode: 'stackable',
    maxStacks: 3,
    waveMin: 4,
    effect: 'High Activity reduces incoming damage.',
    flavor: 'Stay standing long enough for the answer.',
    affectedMove: 'High Activity',
    tags: ['ronin', 'defense', 'activity'],
    field: 'highActivityDefenseLevel',
    valueLabel: 'Flow guard',
  }),

  upgrade({
    id: 'imperial_tempo',
    name: 'Imperial Tempo',
    icon: 'crown-flame.png',
    characterScope: 'supreme-emperor',
    category: 'Supreme Path',
    rarity: 'common',
    stackingMode: 'stackable',
    maxStacks: 4,
    waveMin: 1,
    effect: 'High Activity improves attack recovery.',
    flavor: 'The throne sets the pace.',
    affectedMove: 'Jab-Cross',
    tags: ['supreme', 'tempo', 'recovery'],
    field: 'flowRecoveryLevel',
    valueLabel: 'Imperial tempo',
  }),
  upgrade({
    id: 'royal_pressure',
    name: 'Royal Pressure',
    icon: 'crown-flame.png',
    characterScope: 'supreme-emperor',
    category: 'Supreme Path',
    rarity: 'common',
    stackingMode: 'stackable',
    maxStacks: 4,
    waveMin: 1,
    effect: 'Heavy hits generate extra Activity.',
    flavor: 'Make them feel the room tilt.',
    affectedMove: 'Heavy strikes',
    tags: ['supreme', 'heavy', 'activity'],
    field: 'emperorHeavyActivityLevel',
    valueLabel: 'Royal pressure',
  }),
  upgrade({
    id: 'crowned_one_two',
    name: 'Crowned One-Two',
    icon: 'fist-mark.png',
    characterScope: 'supreme-emperor',
    category: 'Supreme Path',
    rarity: 'uncommon',
    stackingMode: 'stackable',
    maxStacks: 3,
    waveMin: 4,
    effect: 'High Activity makes strikes hit harder.',
    flavor: 'A ruler does not ask twice.',
    affectedMove: 'Jab-Cross',
    tags: ['supreme', 'damage', 'combo'],
    field: 'emperorHighActivityDamageLevel',
    valueLabel: 'Crowned damage',
  }),
  upgrade({
    id: 'golden_threat',
    name: 'Golden Threat',
    icon: 'impact-star.png',
    characterScope: 'supreme-emperor',
    category: 'Supreme Path',
    rarity: 'uncommon',
    stackingMode: 'stackable',
    maxStacks: 3,
    waveMin: 4,
    effect: 'Strikes gain more control and knockback.',
    flavor: 'Gold can still be heavy.',
    affectedMove: 'Power strikes',
    tags: ['supreme', 'control', 'knockback'],
    field: 'knockbackLevel',
    valueLabel: 'Threat control',
  }),
  upgrade({
    id: 'crown_breaker',
    name: 'Crown Breaker',
    icon: 'impact-star.png',
    characterScope: 'supreme-emperor',
    category: 'Supreme Path',
    rarity: 'common',
    stackingMode: 'stackable',
    maxStacks: 4,
    waveMin: 1,
    effect: 'High Activity increases damage.',
    flavor: 'Break the line, keep the crown.',
    affectedMove: 'High Activity',
    tags: ['supreme', 'damage', 'activity'],
    field: 'emperorHighActivityDamageLevel',
    valueLabel: 'Crown breaker',
  }),
  upgrade({
    id: 'eye_of_the_crown',
    name: 'Eye of the Crown',
    icon: 'crown-flame.png',
    characterScope: 'supreme-emperor',
    category: 'Supreme Path',
    rarity: 'uncommon',
    stackingMode: 'transform',
    maxStacks: 1,
    waveMin: 4,
    effect: 'Tornado Kick creates stronger spacing control.',
    flavor: 'One turn, and the crowd makes room.',
    affectedMove: 'Tornado Kick',
    tags: ['supreme', 'tornado', 'spacing'],
    field: 'emperorTornadoControlLevel',
    valueLabel: 'Tornado control',
  }),
  upgrade({
    id: 'execution_window',
    name: 'Execution Window',
    icon: 'crown-flame.png',
    characterScope: 'supreme-emperor',
    category: 'Ability',
    rarity: 'rare',
    stackingMode: 'unique',
    maxStacks: 1,
    waveMin: 8,
    effect: 'Instant Death chance rises near max Activity.',
    flavor: 'There is a moment when the fight agrees with you.',
    affectedMove: 'Instant Death',
    tags: ['supreme', 'ability', 'execute'],
    field: 'emperorExecutionLevel',
    valueLabel: 'Execution',
    abilityId: 'instant_death',
    isAvailable: (player) => player.ability?.id === 'instant_death',
  }),
  upgrade({
    id: 'throne_momentum',
    name: 'Throne Momentum',
    icon: 'crown-flame.png',
    characterScope: 'supreme-emperor',
    category: 'Supreme Path',
    rarity: 'uncommon',
    stackingMode: 'stackable',
    maxStacks: 4,
    waveMin: 4,
    effect: 'Defeating enemies grants extra Activity and healing.',
    flavor: 'The finish becomes fuel.',
    affectedMove: 'Enemy defeats',
    tags: ['supreme', 'finish', 'heal'],
    field: 'emperorKillHealLevel',
    valueLabel: 'Finish sustain',
  }),

  upgrade({
    id: 'flow_state',
    name: 'Flow State',
    icon: 'flow-bolt.png',
    characterScope: 'shared',
    category: 'Activity/Flow',
    rarity: 'uncommon',
    stackingMode: 'stackable',
    maxStacks: 4,
    waveMin: 4,
    effect: 'High Activity improves recovery and Flow uptime.',
    flavor: 'The fight starts answering back.',
    affectedMove: 'All attacks',
    tags: ['shared', 'flow', 'recovery'],
    field: 'flowRecoveryLevel',
    valueLabel: 'Flow recovery',
  }),
  upgrade({
    id: 'pressure_engine',
    name: 'Pressure Engine',
    icon: 'flow-bolt.png',
    characterScope: 'shared',
    category: 'Activity/Flow',
    rarity: 'common',
    stackingMode: 'stackable',
    maxStacks: 5,
    waveMin: 1,
    effect: 'Activity decays more slowly.',
    flavor: 'Keep the motor warm.',
    affectedMove: 'Activity',
    tags: ['shared', 'activity', 'decay'],
    field: 'activityDecayLevel',
    valueLabel: 'Activity decay',
  }),
  upgrade({
    id: 'relentless_hands',
    name: 'Relentless Hands',
    icon: 'fist-mark.png',
    characterScope: 'shared',
    category: 'Move Mastery',
    rarity: 'common',
    stackingMode: 'stackable',
    maxStacks: 4,
    waveMin: 1,
    effect: 'Moves recover faster.',
    flavor: 'Hands back, hands out.',
    affectedMove: 'All attacks',
    tags: ['shared', 'recovery', 'hands'],
    field: 'cooldownLevel',
    valueLabel: 'Move recovery',
  }),
  upgrade({
    id: 'no_back_step',
    name: 'No Back Step',
    icon: 'step-arrow.png',
    characterScope: 'shared',
    category: 'Activity/Flow',
    rarity: 'common',
    stackingMode: 'stackable',
    maxStacks: 3,
    waveMin: 1,
    effect: 'Dashing near enemies grants more Activity.',
    flavor: 'Forward is a resource.',
    affectedMove: 'Dash',
    tags: ['shared', 'dash', 'activity'],
    field: 'dashActivityLevel',
    valueLabel: 'Dash Activity',
  }),
  upgrade({
    id: 'heat_check',
    name: 'Heat Check',
    icon: 'impact-star.png',
    characterScope: 'shared',
    category: 'Move Mastery',
    rarity: 'uncommon',
    stackingMode: 'stackable',
    maxStacks: 4,
    waveMin: 4,
    effect: 'Flow pressure increases damage.',
    flavor: 'Ask once. Make them answer.',
    affectedMove: 'Flow hits',
    tags: ['shared', 'damage', 'flow'],
    field: 'flowDamageLevel',
    valueLabel: 'Flow pressure',
  }),
  upgrade({
    id: 'breath_between_rounds',
    name: 'Breath Between Rounds',
    icon: 'heart-guard.png',
    characterScope: 'shared',
    category: 'Survival',
    rarity: 'common',
    stackingMode: 'stackable',
    maxStacks: 4,
    waveMin: 1,
    effect: 'Wave-clear recovery restores more health.',
    flavor: 'One breath before the next alarm.',
    affectedMove: 'Wave clear',
    tags: ['shared', 'heal', 'wave'],
    field: 'waveHealLevel',
    valueLabel: 'Wave recovery',
  }),
  upgrade({
    id: 'clean_round',
    name: 'Clean Round',
    icon: 'heart-guard.png',
    characterScope: 'shared',
    category: 'Wave Momentum',
    rarity: 'common',
    stackingMode: 'stackable',
    maxStacks: 3,
    waveMin: 1,
    effect: 'Flow entry and enemy defeats restore health.',
    flavor: 'Win neatly, leave with something.',
    affectedMove: 'Flow and defeats',
    tags: ['shared', 'heal', 'momentum'],
    field: 'killHealLevel',
    valueLabel: 'Clean recovery',
  }),
  upgrade({
    id: 'first_exchange',
    name: 'First Exchange',
    icon: 'fist-mark.png',
    characterScope: 'shared',
    category: 'Activity/Flow',
    rarity: 'common',
    stackingMode: 'stackable',
    maxStacks: 4,
    waveMin: 1,
    effect: 'Clean exchanges build Activity faster.',
    flavor: 'The first answer shapes the round.',
    affectedMove: 'Opening pressure',
    tags: ['shared', 'activity', 'pressure'],
    field: 'activityGainLevel',
    valueLabel: 'Exchange Activity',
  }),
];

function upgrade(input: UpgradeInput): UpgradeDefinition {
  return {
    ...input,
    icon: `${ICON_ROOT}${input.icon}`,
    maxLevel: input.maxStacks,
    description: input.effect,
    characterId: input.characterScope === 'shared' ? undefined : input.characterScope,
    apply: (player) => {
      player.upgrades[input.field] += 1;
      input.applyExtra?.(player);
    },
    currentLevel: (player) => player.upgrades[input.field],
    valueText: (player) => `${input.valueLabel} ${player.upgrades[input.field] + 1}/${input.maxStacks}`,
  };
}
