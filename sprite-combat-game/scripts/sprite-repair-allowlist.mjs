export const SPRITE_REPAIR_ALLOWLIST = new Set([
  'cyber-ninja:slice',
  'shadow-striker:hit_react',
  'shadow-striker:roundhouse_kick',
  'shadow-striker:teep_kick',
  'puppetmaster:o_goshi',
  'puppetmaster:dash',
  'combat-monk:high_kick',
  'combat-monk:palm_strike',
  'combat-monk:spinning_sweep',
  'combat-monk:dash',
  'combat-monk:standing_shoulder_lock',
  'striker-monkey:idle',
  'striker-monkey:jab',
  'striker-monkey:cross',
  'striker-monkey:hook',
  'striker-monkey:round_kick',
  'cyber-monkey-grappler:charge',
  'cyber-monkey-grappler:dash',
  'cyber-monkey-grappler:ground_slam',
  'cyber-monkey-grappler:seoi_nage',
  'cyber-monkey-grappler:armbar',
  'cyber-monkey-grappler:o_goshi',
  'cyber-monkey-grappler:guillotine',
]);

export function spriteRepairKey(entityId, animationKey) {
  return `${entityId}:${animationKey}`;
}

export function shouldRepairSprite(entityId, animationKey) {
  return SPRITE_REPAIR_ALLOWLIST.has(spriteRepairKey(entityId, animationKey));
}
