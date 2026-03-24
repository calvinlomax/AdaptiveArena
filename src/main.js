import {
  MAX_SAVE_SLOTS,
  createSaveSlot,
  listSaveSlots,
  setActiveSaveId,
} from "./storage/save-manager.js";

const body = document.body;
const loadGameBtn = document.getElementById("loadGameBtn");
const newGameBtn = document.getElementById("newGameBtn");
const saveModalEl = document.getElementById("saveModal");
const saveModalTitleEl = document.getElementById("saveModalTitle");
const saveModalCopyEl = document.getElementById("saveModalCopy");
const saveSlotListEl = document.getElementById("saveSlotList");
const saveModalCloseBtn = document.getElementById("saveModalCloseBtn");
const newGameModalEl = document.getElementById("newGameModal");
const heroNameInputEl = document.getElementById("heroNameInput");
const overwritePromptEl = document.getElementById("overwritePrompt");
const overwriteSlotListEl = document.getElementById("overwriteSlotList");
const newGameConfirmBtn = document.getElementById("newGameConfirmBtn");
const newGameCancelBtn = document.getElementById("newGameCancelBtn");

let selectedOverwriteId = "";
let runtimeBooted = false;

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function openModal(modalEl) {
  modalEl.classList.remove("hidden");
}

function closeModal(modalEl) {
  modalEl.classList.add("hidden");
}

function buildSaveCard(save, { selectable = true, selectedId = "" } = {}) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "saveSlotCard";
  if (!selectable) {
    button.disabled = true;
    button.classList.add("empty");
  }
  if (selectedId && save.id === selectedId) {
    button.classList.add("selected");
  }

  const title = document.createElement("div");
  title.className = "saveSlotName";
  title.innerHTML = `<span>${save.heroName}</span><span>Maze ${save.progression.mazeNumber}</span>`;
  button.appendChild(title);

  const meta = document.createElement("div");
  meta.className = "saveSlotMeta";
  meta.textContent =
    `Player Lv ${save.progression.playerLevel} | Enemy Lv ${save.progression.enemyLevel} | Bosses ${save.progression.bossesDefeated} | Lives ${save.progression.livesRemaining} | Updated ${formatDate(save.updatedAt)}`;
  button.appendChild(meta);

  return button;
}

function renderLoadSlots() {
  const saves = listSaveSlots();
  saveSlotListEl.textContent = "";
  saveModalTitleEl.textContent = "Load Game";
  if (saves.length === 0) {
    saveModalCopyEl.textContent = "No saved games found. Start a new run.";
    const empty = document.createElement("div");
    empty.className = "saveSlotCard empty";
    empty.textContent = "Empty save list";
    saveSlotListEl.appendChild(empty);
    return;
  }

  saveModalCopyEl.textContent = "Choose a save slot.";
  for (const save of saves) {
    const card = buildSaveCard(save);
    card.addEventListener("click", () => {
      setActiveSaveId(save.id);
      startGame();
    });
    saveSlotListEl.appendChild(card);
  }
}

function renderOverwriteSlots() {
  const saves = listSaveSlots();
  overwriteSlotListEl.textContent = "";
  for (const save of saves) {
    const card = buildSaveCard(save, { selectedId: selectedOverwriteId });
    card.addEventListener("click", () => {
      selectedOverwriteId = save.id;
      renderOverwriteSlots();
    });
    overwriteSlotListEl.appendChild(card);
  }
}

function openNewGameModal() {
  selectedOverwriteId = "";
  heroNameInputEl.value = "";
  const saves = listSaveSlots();
  if (saves.length >= MAX_SAVE_SLOTS) {
    overwritePromptEl.classList.remove("hidden");
    selectedOverwriteId = saves[0].id;
    renderOverwriteSlots();
  } else {
    overwritePromptEl.classList.add("hidden");
    overwriteSlotListEl.textContent = "";
  }
  openModal(newGameModalEl);
  heroNameInputEl.focus();
}

async function startGame() {
  body.classList.add("game-started");
  closeModal(saveModalEl);
  closeModal(newGameModalEl);
  if (runtimeBooted) return;
  runtimeBooted = true;
  await import("./game/runtime.js");
}

loadGameBtn.addEventListener("click", () => {
  renderLoadSlots();
  openModal(saveModalEl);
});

newGameBtn.addEventListener("click", () => {
  openNewGameModal();
});

saveModalCloseBtn.addEventListener("click", () => {
  closeModal(saveModalEl);
});

newGameCancelBtn.addEventListener("click", () => {
  closeModal(newGameModalEl);
});

newGameConfirmBtn.addEventListener("click", () => {
  const heroName = heroNameInputEl.value.trim() || "Unnamed Hero";
  const saves = listSaveSlots();
  if (saves.length >= MAX_SAVE_SLOTS && !selectedOverwriteId) {
    return;
  }
  createSaveSlot(heroName, saves.length >= MAX_SAVE_SLOTS ? selectedOverwriteId : "");
  startGame();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal(saveModalEl);
    closeModal(newGameModalEl);
  }
});
