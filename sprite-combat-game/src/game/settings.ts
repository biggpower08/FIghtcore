export interface GameSettings {
  screenShake: boolean;
}

const storageKey = 'fightcore-settings';
const defaults: GameSettings = {
  screenShake: true,
};

export function loadGameSettings(): GameSettings {
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
  } catch {
    return { ...defaults };
  }
}

export function saveGameSettings(settings: GameSettings): void {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(settings));
  } catch {
    // Settings are a convenience; gameplay should continue if storage is blocked.
  }
}
