const SAVE_STORAGE_KEY = "adaptive-arena-save-slots-v1";
const ACTIVE_SAVE_KEY = "adaptive-arena-active-save-id";
const SAVE_VERSION = 1;
const MAX_SAVE_SLOTS = 4;

function makeDefaultInventory() {
  return {
    items: [],
    consumables: {
      health_potion: 0,
      stamina_potion: 0,
      mana_potion: 0,
    },
  };
}

function makeDefaultSeeds() {
  return {
    mazeSeed: 0,
    themeSeed: 0,
    bossSeed: 0,
    textureSeed: 0,
    skySeed: 0,
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeSaveId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `save-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function defaultProgress(heroName = "Unnamed Hero") {
  return {
    id: makeSaveId(),
    version: SAVE_VERSION,
    heroName,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    progression: {
      mazeNumber: 1,
      playerLevel: 1,
      enemyLevel: 1,
      bossesDefeated: 0,
      livesRemaining: 1,
    },
    currency: {
      gold: 0,
      bossTokens: 0,
    },
    seeds: makeDefaultSeeds(),
    inventory: makeDefaultInventory(),
    enemyModels: null,
  };
}

function sanitizeSave(save) {
  const base = defaultProgress(
    save && typeof save.heroName === "string" && save.heroName.trim() ? save.heroName.trim() : "Unnamed Hero"
  );
  if (!save || typeof save !== "object") return base;

  base.id = typeof save.id === "string" && save.id ? save.id : base.id;
  base.createdAt = Number(save.createdAt) || base.createdAt;
  base.updatedAt = Number(save.updatedAt) || Date.now();

  if (save.progression && typeof save.progression === "object") {
    base.progression.mazeNumber = Math.max(1, Number(save.progression.mazeNumber) || 1);
    base.progression.playerLevel = Math.max(1, Number(save.progression.playerLevel) || 1);
    base.progression.enemyLevel = Math.max(1, Number(save.progression.enemyLevel) || 1);
    base.progression.bossesDefeated = Math.max(0, Number(save.progression.bossesDefeated) || 0);
    base.progression.livesRemaining = Math.max(1, Number(save.progression.livesRemaining) || 1);
  }

  if (save.currency && typeof save.currency === "object") {
    base.currency.gold = Math.max(0, Number(save.currency.gold) || 0);
    base.currency.bossTokens = Math.max(0, Number(save.currency.bossTokens) || 0);
  }

  if (save.seeds && typeof save.seeds === "object") {
    base.seeds.mazeSeed = Math.max(0, Number(save.seeds.mazeSeed) || 0);
    base.seeds.themeSeed = Math.max(0, Number(save.seeds.themeSeed) || 0);
    base.seeds.bossSeed = Math.max(0, Number(save.seeds.bossSeed) || 0);
    base.seeds.textureSeed = Math.max(0, Number(save.seeds.textureSeed) || 0);
    base.seeds.skySeed = Math.max(0, Number(save.seeds.skySeed) || 0);
  }

  if (save.inventory && typeof save.inventory === "object") {
    if (Array.isArray(save.inventory.items)) {
      base.inventory.items = clone(save.inventory.items);
    }
    if (save.inventory.consumables && typeof save.inventory.consumables === "object") {
      base.inventory.consumables.health_potion = Math.max(0, Number(save.inventory.consumables.health_potion) || 0);
      base.inventory.consumables.stamina_potion = Math.max(0, Number(save.inventory.consumables.stamina_potion) || 0);
      base.inventory.consumables.mana_potion = Math.max(0, Number(save.inventory.consumables.mana_potion) || 0);
    }
  }

  base.enemyModels = save.enemyModels && typeof save.enemyModels === "object" ? clone(save.enemyModels) : null;
  return base;
}

function readStore() {
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== SAVE_VERSION || !Array.isArray(parsed.saves)) return [];
    return parsed.saves.map(sanitizeSave).slice(0, MAX_SAVE_SLOTS);
  } catch (error) {
    console.warn("Failed to read save slots", error);
    return [];
  }
}

function writeStore(saves) {
  const payload = {
    version: SAVE_VERSION,
    updatedAt: Date.now(),
    saves: saves.map(sanitizeSave).slice(0, MAX_SAVE_SLOTS),
  };
  localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
}

export function listSaveSlots() {
  return readStore().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getSaveSlotById(saveId) {
  return listSaveSlots().find((slot) => slot.id === saveId) || null;
}

export function getActiveSaveId() {
  try {
    return sessionStorage.getItem(ACTIVE_SAVE_KEY) || localStorage.getItem(ACTIVE_SAVE_KEY) || "";
  } catch (error) {
    return "";
  }
}

export function setActiveSaveId(saveId) {
  try {
    sessionStorage.setItem(ACTIVE_SAVE_KEY, saveId);
    localStorage.setItem(ACTIVE_SAVE_KEY, saveId);
  } catch (error) {
    console.warn("Failed to set active save id", error);
  }
}

export function getActiveSave() {
  const activeId = getActiveSaveId();
  if (!activeId) return null;
  return getSaveSlotById(activeId);
}

export function createSaveSlot(heroName, overwriteId = "") {
  const trimmedName = heroName.trim() || "Unnamed Hero";
  const saves = readStore();
  if (saves.length >= MAX_SAVE_SLOTS && !overwriteId) {
    throw new Error("No free save slots available");
  }

  const nextSave = defaultProgress(trimmedName);
  let nextSaves = saves;
  if (overwriteId) {
    nextSaves = saves.filter((slot) => slot.id !== overwriteId);
  }
  nextSaves = [nextSave, ...nextSaves].slice(0, MAX_SAVE_SLOTS);
  writeStore(nextSaves);
  setActiveSaveId(nextSave.id);
  return nextSave;
}

export function updateSaveSlot(saveId, updater) {
  const saves = readStore();
  const index = saves.findIndex((slot) => slot.id === saveId);
  if (index === -1) return null;
  const current = sanitizeSave(saves[index]);
  const next = sanitizeSave(typeof updater === "function" ? updater(clone(current)) : updater);
  next.id = current.id;
  next.createdAt = current.createdAt;
  next.updatedAt = Date.now();
  saves[index] = next;
  writeStore(saves);
  return next;
}

export function updateActiveSave(updater) {
  const activeId = getActiveSaveId();
  if (!activeId) return null;
  return updateSaveSlot(activeId, updater);
}

export function resetActiveSaveRun(options = {}) {
  return updateActiveSave((current) => {
    const reset = defaultProgress(options.heroName || current.heroName);
    reset.id = current.id;
    reset.createdAt = current.createdAt;
    return reset;
  });
}

export function deleteSaveSlot(saveId) {
  const saves = readStore().filter((slot) => slot.id !== saveId);
  writeStore(saves);
  if (getActiveSaveId() === saveId) {
    setActiveSaveId("");
  }
}

export function exportDefaultSave(heroName) {
  return defaultProgress(heroName);
}

export { MAX_SAVE_SLOTS };
