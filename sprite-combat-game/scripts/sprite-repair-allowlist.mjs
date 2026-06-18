export const SPRITE_REPAIR_ALLOWLIST = new Set([
  'cyber-ninja:slice',
  'shadow-striker:hit_react',
  'shadow-striker:momentum_flow',
  'shadow-striker:roundhouse_kick',
  'shadow-striker:teep_kick',
  'puppetmaster:o_goshi',
  'combat-monk:high_kick',
  'combat-monk:palm_strike',
  'combat-monk:spinning_sweep',
]);

const requestedOnly = new Set(
  (process.env.SPRITE_REPAIR_ONLY ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean),
);

export function spriteRepairKey(entityId, animationKey) {
  return `${entityId}:${animationKey}`;
}

export function shouldRepairSprite(entityId, animationKey) {
  const key = spriteRepairKey(entityId, animationKey);
  if (requestedOnly.size > 0) return requestedOnly.has(key);
  return SPRITE_REPAIR_ALLOWLIST.has(key);
}
