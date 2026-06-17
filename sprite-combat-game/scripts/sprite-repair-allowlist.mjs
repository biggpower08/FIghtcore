export const SPRITE_REPAIR_ALLOWLIST = new Set([
  'cyber-ninja:slice',
  'shadow-striker:hit_react',
  'shadow-striker:roundhouse_kick',
  'shadow-striker:teep_kick',
  'puppetmaster:o_goshi',
  'combat-monk:high_kick',
  'combat-monk:palm_strike',
  'combat-monk:spinning_sweep',
  'striker-monkey:idle',
  'striker-monkey:jab',
  'striker-monkey:cross',
  'striker-monkey:hook',
  'striker-monkey:round_kick',
]);

export function spriteRepairKey(entityId, animationKey) {
  return `${entityId}:${animationKey}`;
}

export function shouldRepairSprite(entityId, animationKey) {
  return SPRITE_REPAIR_ALLOWLIST.has(spriteRepairKey(entityId, animationKey));
}
