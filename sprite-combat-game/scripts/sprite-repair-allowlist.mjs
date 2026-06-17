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
