(() => {
  "use strict";

  // =============================
  // Constants and Configuration
  // =============================
  const MODEL_VERSION = 1;
  const STORAGE_KEY = "adaptive-arena-rl-v1";

  const ACTIONS = [
    "advance",
    "retreat",
    "strafe_left",
    "strafe_right",
    "light_attack",
    "heavy_attack",
    "block",
    "wait",
    "punish_dodge",
    "delay_attack",
    "feint",
    "bait_parry",
  ];
  const HIT_SLASH_STYLES = ["diag_tl_br", "diag_tr_bl", "vertical_center"];

  const MAZE_CONFIG = {
    baseSize: 15,
    growthStep: 2,
    maxSize: 41,
    baseEnemyCount: 4,
    maxEnemyCount: 30,
  };

  const SHOP_STORAGE_KEY = "adaptive-arena-shop-v1";
  const SHOP_STORAGE_VERSION = 1;

  const BOSS_PART_MODELS = {
    heads: [
      { id: "war_skull", headSize: 0.31, jawWidth: 0.42, browDepth: 0.13 },
      { id: "crown_horn", headSize: 0.34, jawWidth: 0.37, browDepth: 0.15 },
      { id: "plated_howl", headSize: 0.3, jawWidth: 0.4, browDepth: 0.12 },
      { id: "fang_mantle", headSize: 0.33, jawWidth: 0.44, browDepth: 0.11 },
      { id: "grim_mask", headSize: 0.29, jawWidth: 0.35, browDepth: 0.16 },
    ],
    torsos: [
      { id: "fortress_core", bodyWidth: 0.62, shoulderWidth: 0.86, armorRig: "heavy_slab", bladeScale: 1.48, bobAmp: 0.48 },
      { id: "spine_plating", bodyWidth: 0.58, shoulderWidth: 0.8, armorRig: "lamellar_guard", bladeScale: 1.44, bobAmp: 0.52 },
      { id: "crusher_harness", bodyWidth: 0.64, shoulderWidth: 0.88, armorRig: "heavy_slab", bladeScale: 1.56, bobAmp: 0.44 },
      { id: "warden_cuirass", bodyWidth: 0.57, shoulderWidth: 0.79, armorRig: "high_guard_plate", bladeScale: 1.42, bobAmp: 0.49 },
      { id: "chain_bulwark", bodyWidth: 0.61, shoulderWidth: 0.84, armorRig: "strap_and_spike", bladeScale: 1.5, bobAmp: 0.46 },
    ],
    legs: [
      { id: "pillar_legs", legLift: 0.25, stance: 0.56 },
      { id: "anvil_stride", legLift: 0.22, stance: 0.58 },
      { id: "raider_stride", legLift: 0.29, stance: 0.54 },
      { id: "wall_knees", legLift: 0.24, stance: 0.6 },
      { id: "siege_tread", legLift: 0.21, stance: 0.62 },
    ],
  };

  const BOSS_NAME_TABLE = [
    ["Bolgrod", "Bone", "Crusher"],
    ["Mordrath", "Skull", "Breaker"],
    ["Kargul", "Iron", "Render"],
    ["Throzak", "Grave", "Shatterer"],
    ["Vorgath", "Ruin", "Severer"],
    ["Drakmor", "Wound", "Grinder"],
    ["Gorvul", "Flesh", "Ravager"],
    ["Ulkrad", "Ash", "Burner"],
    ["Zargoth", "Chain", "Ripper"],
    ["Grumvek", "Stone", "Sunderer"],
  ];

  const SHOP_ITEMS = [
    {
      id: "helm_ironwatch",
      name: "Ironwatch Helm",
      kind: "head_armor",
      rarity: "uncommon",
      goldCost: 85,
      tokenCost: 0,
      desc: "Helmet plate with a narrow visor slot.",
      statText: "Damage taken x0.97",
      sellGold: 45,
      stackable: false,
    },
    {
      id: "chest_reinforced",
      name: "Reinforced Chestplate",
      kind: "torso_armor",
      rarity: "rare",
      goldCost: 140,
      tokenCost: 0,
      desc: "Arms and chest armor with shock-rib lining.",
      statText: "Damage taken x0.94",
      sellGold: 72,
      stackable: false,
    },
    {
      id: "greaves_bastion",
      name: "Bastion Greaves",
      kind: "leg_armor",
      rarity: "rare",
      goldCost: 135,
      tokenCost: 0,
      desc: "Weighted lower armor for grounded dodges.",
      statText: "Dash stamina cost x0.9",
      sellGold: 68,
      stackable: false,
    },
    {
      id: "sword_skin_torque",
      name: "Torque Blade Skin",
      kind: "weapon_skin",
      rarity: "very-rare",
      goldCost: 210,
      tokenCost: 0,
      desc: "Industrial steel skin with bright edge highlights.",
      statText: "Cosmetic",
      sellGold: 105,
      stackable: false,
    },
    {
      id: "weapon_rift_cutter",
      name: "Rift Cutter",
      kind: "weapon",
      rarity: "exotic",
      goldCost: 310,
      tokenCost: 1,
      desc: "High-mass blade tuned for heavy strikes.",
      statText: "Heavy damage x1.1",
      sellGold: 155,
      stackable: false,
    },
    {
      id: "trail_ember_arc",
      name: "Ember Arc Trail",
      kind: "trail_cosmetic",
      rarity: "uncommon",
      goldCost: 95,
      tokenCost: 0,
      desc: "Adds a warmer slash trail accent.",
      statText: "Cosmetic",
      sellGold: 46,
      stackable: false,
    },
    {
      id: "health_potion",
      name: "Health Potion",
      kind: "potion_health",
      rarity: "common",
      goldCost: 38,
      tokenCost: 0,
      desc: "Restores 45 health when used (Key 1).",
      statText: "Stackable",
      sellGold: 19,
      stackable: true,
    },
    {
      id: "stamina_potion",
      name: "Stamina Potion",
      kind: "potion_stamina",
      rarity: "common",
      goldCost: 34,
      tokenCost: 0,
      desc: "Restores 55 stamina when used (Key 2).",
      statText: "Stackable",
      sellGold: 17,
      stackable: true,
    },
    {
      id: "mana_potion",
      name: "Mana Potion",
      kind: "potion_mana",
      rarity: "common",
      goldCost: 32,
      tokenCost: 0,
      desc: "Restores 40 mana when used (Key 3).",
      statText: "Stackable",
      sellGold: 16,
      stackable: true,
    },
    {
      id: "relic_bosscore",
      name: "Bosscore Reliquary",
      kind: "token_relic",
      rarity: "legendary",
      goldCost: 280,
      tokenCost: 5,
      desc: "Ancient relic traded for multiple boss tokens.",
      statText: "Damage x1.15, stamina cost x0.9",
      sellGold: 180,
      stackable: false,
    },
  ];

  const SHOP_BANTER_LINES = [
    "\"Buy quick. The arena's hungry.\"",
    "\"You look breakable. Armor helps.\"",
    "\"Specials cost tokens. Bring heads, not excuses.\"",
    "\"Need potions? Keep your blood inside you.\"",
    "\"Sell me your scraps. I'll call them antiques.\"",
  ];

  const ENEMY_SHAPE_LIBRARY = {
    balanced_duelist: {
      shapeId: "duelist_frame",
      armorRig: "lamellar_guard",
      bodyWidth: 0.36,
      shoulderWidth: 0.5,
      headSize: 0.22,
      bladeScale: 1,
      bobAmp: 0.9,
      jawWidth: 0.33,
      browDepth: 0.08,
    },
    aggressive_rusher: {
      shapeId: "rusher_frame",
      armorRig: "strap_and_spike",
      bodyWidth: 0.31,
      shoulderWidth: 0.46,
      headSize: 0.21,
      bladeScale: 1.08,
      bobAmp: 1.1,
      jawWidth: 0.35,
      browDepth: 0.09,
    },
    defensive_counterfighter: {
      shapeId: "counter_frame",
      armorRig: "high_guard_plate",
      bodyWidth: 0.35,
      shoulderWidth: 0.53,
      headSize: 0.21,
      bladeScale: 0.98,
      bobAmp: 0.84,
      jawWidth: 0.3,
      browDepth: 0.075,
    },
    heavy_brute: {
      shapeId: "brute_frame",
      armorRig: "heavy_slab",
      bodyWidth: 0.45,
      shoulderWidth: 0.6,
      headSize: 0.2,
      bladeScale: 1.24,
      bobAmp: 0.62,
      jawWidth: 0.4,
      browDepth: 0.1,
    },
  };

  let MAP = [];
  let MAP_WIDTH = 0;
  let MAP_HEIGHT = 0;
  let START_POS = { x: 1.5, y: 1.5 };
  let OPEN_TILES = [];
  let MAZE_THEME = null;

  const DROP_DEFS = {
    heart: {
      label: "Heart",
      color: "rgba(214,64,85,0.95)",
      healAmount: 20,
      duration: 0,
      apply(player) {
        const before = player.health;
        player.health = clamp(player.health + this.healAmount, 0, player.maxHealth);
        return Math.max(0, Math.round(player.health - before));
      },
    },
    rusher_boost: {
      label: "Rush Charge",
      color: "rgba(239,183,66,0.95)",
      duration: 30,
      apply(player) {
        player.effects.rusher = Math.max(player.effects.rusher, 30);
        return 0;
      },
    },
    duelist_boost: {
      label: "Duel Focus",
      color: "rgba(212,226,248,0.95)",
      duration: 30,
      apply(player) {
        player.effects.duelist = Math.max(player.effects.duelist, 30);
        return 0;
      },
    },
    brute_boost: {
      label: "Brute Force",
      color: "rgba(210,168,93,0.95)",
      duration: 30,
      apply(player) {
        player.effects.brute = Math.max(player.effects.brute, 30);
        return 0;
      },
    },
    counter_boost: {
      label: "Guard Matrix",
      color: "rgba(115,184,226,0.95)",
      duration: 30,
      apply(player) {
        player.effects.counter = Math.max(player.effects.counter, 30);
        return 0;
      },
    },
  };

  const ARCHETYPES = {
    balanced_duelist: {
      label: "Balanced Duelist",
      hp: 70,
      speed: 2.05,
      reactionDelay: 0.28,
      alpha: 0.11,
      gamma: 0.9,
      epsilon: 0.5,
      minEpsilon: 0.11,
      epsilonDecay: 0.992,
      aggressionClamp: [0.28, 0.78],
      actionBias: {
        advance: 0.14,
        retreat: 0.08,
        strafe_left: 0.14,
        strafe_right: 0.14,
        light_attack: 0.25,
        heavy_attack: 0.12,
        block: 0.2,
        wait: 0.08,
        punish_dodge: 0.16,
        delay_attack: 0.16,
        feint: 0.15,
        bait_parry: 0.12,
      },
      color: "#70d7ff",
    },
    aggressive_rusher: {
      label: "Aggressive Rusher",
      hp: 64,
      speed: 2.35,
      reactionDelay: 0.24,
      alpha: 0.1,
      gamma: 0.9,
      epsilon: 0.56,
      minEpsilon: 0.12,
      epsilonDecay: 0.993,
      aggressionClamp: [0.4, 0.92],
      actionBias: {
        advance: 0.4,
        retreat: -0.1,
        strafe_left: 0.15,
        strafe_right: 0.15,
        light_attack: 0.34,
        heavy_attack: 0.2,
        block: 0.02,
        wait: -0.2,
        punish_dodge: 0.24,
        delay_attack: 0.09,
        feint: 0.06,
        bait_parry: 0,
      },
      color: "#ff6a6a",
    },
    defensive_counterfighter: {
      label: "Defensive Counterfighter",
      hp: 74,
      speed: 1.95,
      reactionDelay: 0.31,
      alpha: 0.1,
      gamma: 0.91,
      epsilon: 0.49,
      minEpsilon: 0.09,
      epsilonDecay: 0.992,
      aggressionClamp: [0.22, 0.69],
      actionBias: {
        advance: 0.05,
        retreat: 0.24,
        strafe_left: 0.2,
        strafe_right: 0.2,
        light_attack: 0.15,
        heavy_attack: 0.09,
        block: 0.35,
        wait: 0.14,
        punish_dodge: 0.34,
        delay_attack: 0.18,
        feint: 0.2,
        bait_parry: 0.26,
      },
      color: "#9dc8ff",
    },
    heavy_brute: {
      label: "Heavy Brute",
      hp: 110,
      speed: 1.55,
      reactionDelay: 0.36,
      alpha: 0.085,
      gamma: 0.88,
      epsilon: 0.47,
      minEpsilon: 0.1,
      epsilonDecay: 0.993,
      aggressionClamp: [0.33, 0.82],
      actionBias: {
        advance: 0.28,
        retreat: -0.06,
        strafe_left: 0.03,
        strafe_right: 0.03,
        light_attack: 0.12,
        heavy_attack: 0.38,
        block: 0.1,
        wait: 0.11,
        punish_dodge: 0.23,
        delay_attack: 0.21,
        feint: 0.05,
        bait_parry: 0.01,
      },
      color: "#e8c27f",
    },
  };

  const ATTACK_DEFS = {
    light: {
      staminaCost: 12,
      cooldown: 0.36,
      windup: 0.06,
      active: 0.11,
      recovery: 0.2,
      damage: 14,
      range: 1.15,
      arc: 0.85,
    },
    heavy: {
      staminaCost: 24,
      cooldown: 0.78,
      windup: 0.15,
      active: 0.14,
      recovery: 0.35,
      damage: 28,
      range: 1.32,
      arc: 0.96,
    },
  };

  const ENEMY_ATTACK_DEFS = {
    light: {
      windup: 0.17,
      damage: 12,
      range: 1.08,
      arc: 0.95,
      cooldown: 0.68,
    },
    heavy: {
      windup: 0.31,
      damage: 22,
      range: 1.22,
      arc: 1.04,
      cooldown: 1.08,
    },
  };

  const PLAYER = {
    x: START_POS.x,
    y: START_POS.y,
    angle: 0,
    vx: 0,
    vy: 0,
    radius: 0.22,
    state: "idle",
    maxHealth: 100,
    health: 100,
    maxStamina: 100,
    stamina: 100,
    maxMana: 100,
    mana: 100,
    speed: 2.8,
    turnSpeed: 2.8,
    attackCooldown: 0,
    attack: null,
    blockHeld: false,
    blockTimer: 0,
    parryTimer: 0,
    dashCooldown: 0,
    dashTimer: 0,
    invulnerableTimer: 0,
    recentAction: "idle",
    recentDodgeDirection: "none",
    recentDodgeTimer: 0,
    lastAttackTime: -100,
    slashPatternIndex: 0,
    score: 0,
    survivalTime: 0,
    kills: 0,
    isDead: false,
    effects: {
      rusher: 0,
      duelist: 0,
      brute: 0,
      counter: 0,
    },
  };

  const GAME = {
    wave: 1,
    mazeSeed: 0,
    mazeWidth: 0,
    mazeHeight: 0,
    levelType: "arena",
    mazeMeta: null,
    currentBossProfile: null,
    bossDefeatedThisWave: false,
    paused: false,
    uiModal: null,
    enemies: [],
    corpses: [],
    drops: [],
    nextDropId: 1,
    nextEnemyId: 1,
    nextInventoryItemId: 1,
    waveTransition: 0,
    waveReportTimer: 0,
    roundReportLines: [],
    statusText: "",
    statusTimer: 0,
    lastFrame: performance.now(),
    saveTimer: 0,
    tendencyTimer: 0,
    hitStopTimer: 0,
    shakeTimer: 0,
    shakePower: 0,
    weaponTrails: [],
    sparks: [],
    flashes: [],
    lastSwordTip: null,
    lastSwordBase: null,
    adaptationPulse: 0,
    lastAdaptiveSnapshot: null,
    adaptiveToneCooldown: 0,
    currencyGold: 0,
    bossTokens: 0,
    inventory: {
      items: [],
      consumables: {
        health_potion: 0,
        stamina_potion: 0,
        mana_potion: 0,
      },
    },
    pendingBossReward: null,
    shopBanterLine: SHOP_BANTER_LINES[0],
  };

  const CAMERA = {
    fov: Math.PI / 3.4,
    maxDepth: 24,
    rayStep: 3,
  };

  const PLAYER_BEHAVIOR = {
    dodgesLeft: 0,
    dodgesRight: 0,
    dodgesBack: 0,
    closeAggressiveAttacks: 0,
    totalAttacks: 0,
    blockAfterAttack: 0,
    totalBlocks: 0,
    retreatMoments: 0,
    samples: 0,
  };

  let WAVE_BEHAVIOR = createEmptyWaveBehavior();

  function createEmptyWaveBehavior() {
    const actionCounts = {};
    Object.keys(ARCHETYPES).forEach((name) => {
      actionCounts[name] = initActionCountMap();
    });

    return {
      actionCounts,
      dodgesLeft: 0,
      dodgesRight: 0,
      dodgesBack: 0,
      closeAggressiveAttacks: 0,
      totalAttacks: 0,
      blockAfterAttack: 0,
      totalBlocks: 0,
      retreatMoments: 0,
      samples: 0,
    };
  }

  function createDefaultInventory() {
    return {
      items: [],
      consumables: {
        health_potion: 0,
        stamina_potion: 0,
        mana_potion: 0,
      },
    };
  }

  function totalInventoryCount() {
    const consumables =
      GAME.inventory.consumables.health_potion +
      GAME.inventory.consumables.stamina_potion +
      GAME.inventory.consumables.mana_potion;
    return GAME.inventory.items.length + consumables;
  }

  function loadShopProgression() {
    try {
      const raw = localStorage.getItem(SHOP_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== SHOP_STORAGE_VERSION) return;
      GAME.currencyGold = Math.max(0, Number(parsed.gold) || 0);
      GAME.bossTokens = Math.max(0, Number(parsed.tokens) || 0);
      GAME.nextInventoryItemId = Math.max(1, Number(parsed.nextInventoryItemId) || 1);

      GAME.inventory = createDefaultInventory();
      if (parsed.inventory && typeof parsed.inventory === "object") {
        const items = Array.isArray(parsed.inventory.items) ? parsed.inventory.items : [];
        for (const item of items) {
          const stock = SHOP_ITEMS.find((entry) => entry.id === item.id);
          if (!stock || stock.stackable) continue;
          GAME.inventory.items.push({
            instanceId: GAME.nextInventoryItemId++,
            id: stock.id,
            name: stock.name,
            rarity: stock.rarity,
            kind: stock.kind,
            sellGold: stock.sellGold,
            tokenCost: stock.tokenCost,
          });
        }

        const c = parsed.inventory.consumables || {};
        GAME.inventory.consumables.health_potion = Math.max(0, Number(c.health_potion) || 0);
        GAME.inventory.consumables.stamina_potion = Math.max(0, Number(c.stamina_potion) || 0);
        GAME.inventory.consumables.mana_potion = Math.max(0, Number(c.mana_potion) || 0);
      }
    } catch (error) {
      console.warn("Failed to load shop progression", error);
    }
  }

  function saveShopProgression() {
    try {
      const payload = {
        version: SHOP_STORAGE_VERSION,
        savedAt: Date.now(),
        gold: GAME.currencyGold,
        tokens: GAME.bossTokens,
        nextInventoryItemId: GAME.nextInventoryItemId,
        inventory: {
          items: GAME.inventory.items.map((item) => ({ id: item.id })),
          consumables: { ...GAME.inventory.consumables },
        },
      };
      localStorage.setItem(SHOP_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn("Failed to save shop progression", error);
    }
  }

  function isBossWave(waveNumber) {
    return waveNumber > 0 && waveNumber % 5 === 0;
  }

  // =============================
  // DOM / Canvas Setup
  // =============================
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const healthBarEl = document.getElementById("healthBar");
  const staminaBarEl = document.getElementById("staminaBar");
  const healthTextEl = document.getElementById("healthText");
  const staminaTextEl = document.getElementById("staminaText");
  const waveValueEl = document.getElementById("waveValue");
  const scoreValueEl = document.getElementById("scoreValue");
  const timeValueEl = document.getElementById("timeValue");
  const goldValueEl = document.getElementById("goldValue");
  const bossTokenValueEl = document.getElementById("bossTokenValue");
  const inventoryCountValueEl = document.getElementById("inventoryCountValue");
  const hudEl = document.getElementById("hud");
  const perkStackValueEl = document.getElementById("perkStackValue");
  const perkDetailValueEl = document.getElementById("perkDetailValue");
  const healthGainLayerEl = document.getElementById("healthGainLayer");
  const tendencyListEl = document.getElementById("tendencyList");
  const tendencyPanelEl = document.getElementById("tendencyPanel");
  const controlsPanelEl = document.getElementById("controlsPanel");
  const pauseOverlayEl = document.getElementById("pauseOverlay");
  const aggressionMeterEl = document.getElementById("aggressionMeter");
  const spacingMeterEl = document.getElementById("spacingMeter");
  const parryMeterEl = document.getElementById("parryMeter");
  const punishMeterEl = document.getElementById("punishMeter");
  const confidenceMeterEl = document.getElementById("confidenceMeter");
  const aggressionValueEl = document.getElementById("aggressionValue");
  const spacingValueEl = document.getElementById("spacingValue");
  const parryValueEl = document.getElementById("parryValue");
  const punishValueEl = document.getElementById("punishValue");
  const confidenceValueEl = document.getElementById("confidenceValue");
  const observedHabitEl = document.getElementById("observedHabit");
  const resetLearningBtn = document.getElementById("resetLearningBtn");
  const restartBtn = document.getElementById("restartBtn");
  const reportPanelEl = document.getElementById("roundReport");
  const reportListEl = document.getElementById("roundReportList");
  const gameOverEl = document.getElementById("gameOver");
  const gameOverMetaEl = document.getElementById("gameOverMeta");
  const bossRewardModalEl = document.getElementById("bossRewardModal");
  const bossRewardTextEl = document.getElementById("bossRewardText");
  const bossRewardOkBtn = document.getElementById("bossRewardOkBtn");
  const shopPromptModalEl = document.getElementById("shopPromptModal");
  const shopPromptYesBtn = document.getElementById("shopPromptYesBtn");
  const shopPromptNoBtn = document.getElementById("shopPromptNoBtn");
  const shopModalEl = document.getElementById("shopModal");
  const shopStockListEl = document.getElementById("shopStockList");
  const inventoryListEl = document.getElementById("inventoryList");
  const shopCurrencyLineEl = document.getElementById("shopCurrencyLine");
  const shopBanterLineEl = document.getElementById("shopBanterLine");
  const shopCloseBtn = document.getElementById("shopCloseBtn");
  const pauseOnlyButtons = [resetLearningBtn, restartBtn];

  const KEYS = Object.create(null);
  let pointerLocked = false;
  let depthBuffer = [];

  function resizeCanvas() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    depthBuffer = new Array(window.innerWidth).fill(CAMERA.maxDepth);
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  loadShopProgression();

  function syncPausePanelInteractivity(paused) {
    for (const button of pauseOnlyButtons) {
      if (!button) continue;
      button.disabled = !paused;
      button.tabIndex = paused ? 0 : -1;
    }
  }

  function spawnHealthGainText(amount) {
    if (!healthGainLayerEl || !hudEl || !healthBarEl || amount <= 0) return;
    const hudRect = hudEl.getBoundingClientRect();
    const barRect = healthBarEl.getBoundingClientRect();
    const floatEl = document.createElement("span");
    floatEl.className = "healthGainFloat";
    floatEl.textContent = `+${amount}`;
    const anchorX = clamp(barRect.right - hudRect.left + 8, 30, hudRect.width - 30);
    const anchorY = barRect.top - hudRect.top - 2;
    floatEl.style.left = `${anchorX}px`;
    floatEl.style.top = `${anchorY}px`;
    healthGainLayerEl.appendChild(floatEl);
    window.setTimeout(() => {
      floatEl.remove();
    }, 620);
  }

  function setUIModal(modalName) {
    GAME.uiModal = modalName;
    document.body.classList.toggle("modal-open", !!modalName);
    bossRewardModalEl.classList.toggle("hidden", modalName !== "boss_reward");
    shopPromptModalEl.classList.toggle("hidden", modalName !== "shop_prompt");
    shopModalEl.classList.toggle("hidden", modalName !== "shop");
    if (modalName) {
      if (document.pointerLockElement === canvas && document.exitPointerLock) {
        document.exitPointerLock();
      }
      GAME.paused = false;
      document.body.classList.remove("paused");
      pauseOverlayEl.classList.add("hidden");
      syncPausePanelInteractivity(false);
    }
  }

  function isUiModalOpen() {
    return !!GAME.uiModal;
  }

  function rarityClassName(rarity) {
    return `rarity-${String(rarity).toLowerCase().replace(/\s+/g, "-")}`;
  }

  function findShopItem(itemId) {
    return SHOP_ITEMS.find((entry) => entry.id === itemId) || null;
  }

  function ownsItem(itemId) {
    return GAME.inventory.items.some((item) => item.id === itemId);
  }

  function canAffordShopItem(item) {
    return GAME.currencyGold >= item.goldCost && GAME.bossTokens >= item.tokenCost;
  }

  function spendCurrencies(gold, tokens) {
    GAME.currencyGold = Math.max(0, GAME.currencyGold - gold);
    GAME.bossTokens = Math.max(0, GAME.bossTokens - tokens);
  }

  function gainCurrencies(gold, tokens) {
    GAME.currencyGold = Math.max(0, GAME.currencyGold + gold);
    GAME.bossTokens = Math.max(0, GAME.bossTokens + tokens);
  }

  function addInventoryItemFromStock(item) {
    if (item.stackable) {
      if (item.id === "health_potion") GAME.inventory.consumables.health_potion += 1;
      if (item.id === "stamina_potion") GAME.inventory.consumables.stamina_potion += 1;
      if (item.id === "mana_potion") GAME.inventory.consumables.mana_potion += 1;
      return true;
    }

    if (ownsItem(item.id)) return false;
    GAME.inventory.items.push({
      instanceId: GAME.nextInventoryItemId++,
      id: item.id,
      name: item.name,
      kind: item.kind,
      rarity: item.rarity,
      sellGold: item.sellGold,
      tokenCost: item.tokenCost,
    });
    return true;
  }

  function buyShopItem(itemId) {
    const item = findShopItem(itemId);
    if (!item) return;
    if (!canAffordShopItem(item)) return;
    if (!item.stackable && ownsItem(item.id)) return;
    spendCurrencies(item.goldCost, item.tokenCost);
    addInventoryItemFromStock(item);
    GAME.shopBanterLine = `"${item.name}. Keep it clean... or don't."`;
    saveShopProgression();
    refreshShopUI();
    updateHUD();
  }

  function removeInventoryItem(instanceId) {
    const idx = GAME.inventory.items.findIndex((item) => item.instanceId === instanceId);
    if (idx === -1) return null;
    const [removed] = GAME.inventory.items.splice(idx, 1);
    return removed;
  }

  function sellInventoryItem(instanceId) {
    const item = removeInventoryItem(instanceId);
    if (!item) return;
    gainCurrencies(item.sellGold || 0, 0);
    GAME.shopBanterLine = "\"I'll pretend I didn't overpay for that.\"";
    saveShopProgression();
    refreshShopUI();
    updateHUD();
  }

  function sellConsumable(itemId) {
    if (itemId === "health_potion" && GAME.inventory.consumables.health_potion > 0) {
      GAME.inventory.consumables.health_potion -= 1;
    } else if (itemId === "stamina_potion" && GAME.inventory.consumables.stamina_potion > 0) {
      GAME.inventory.consumables.stamina_potion -= 1;
    } else if (itemId === "mana_potion" && GAME.inventory.consumables.mana_potion > 0) {
      GAME.inventory.consumables.mana_potion -= 1;
    } else {
      return;
    }
    const stock = findShopItem(itemId);
    gainCurrencies(stock ? stock.sellGold : 10, 0);
    GAME.shopBanterLine = "\"Potions go stale. Gold does not.\"";
    saveShopProgression();
    refreshShopUI();
    updateHUD();
  }

  function refreshShopUI() {
    if (!shopCurrencyLineEl || !shopStockListEl || !inventoryListEl) return;
    shopCurrencyLineEl.textContent = `Gold ${GAME.currencyGold} | Boss Tokens ${GAME.bossTokens}`;
    if (shopBanterLineEl) {
      shopBanterLineEl.textContent = GAME.shopBanterLine;
    }

    shopStockListEl.textContent = "";
    for (const item of SHOP_ITEMS) {
      const row = document.createElement("div");
      row.className = "shopItemRow";

      const topLine = document.createElement("div");
      topLine.className = "topLine";
      const nameEl = document.createElement("strong");
      nameEl.textContent = item.name;
      nameEl.className = rarityClassName(item.rarity);
      const costEl = document.createElement("span");
      costEl.textContent = `${item.goldCost}g${item.tokenCost > 0 ? ` + ${item.tokenCost}t` : ""}`;
      topLine.append(nameEl, costEl);
      row.appendChild(topLine);

      const desc = document.createElement("div");
      desc.className = "desc";
      desc.textContent = `${item.rarity.toUpperCase()} | ${item.desc} | ${item.statText}`;
      row.appendChild(desc);

      const buyBtn = document.createElement("button");
      const alreadyOwned = !item.stackable && ownsItem(item.id);
      buyBtn.disabled = alreadyOwned || !canAffordShopItem(item);
      buyBtn.textContent = alreadyOwned ? "Owned" : "Buy";
      buyBtn.addEventListener("click", () => buyShopItem(item.id));
      row.appendChild(buyBtn);

      shopStockListEl.appendChild(row);
    }

    inventoryListEl.textContent = "";

    const potionDefs = [
      { id: "health_potion", label: "Health Potion", count: GAME.inventory.consumables.health_potion },
      { id: "stamina_potion", label: "Stamina Potion", count: GAME.inventory.consumables.stamina_potion },
      { id: "mana_potion", label: "Mana Potion", count: GAME.inventory.consumables.mana_potion },
    ];

    for (const potion of potionDefs) {
      if (potion.count <= 0) continue;
      const row = document.createElement("div");
      row.className = "shopItemRow";
      const top = document.createElement("div");
      top.className = "topLine";
      top.innerHTML = `<strong>${potion.label}</strong><span>x${potion.count}</span>`;
      row.appendChild(top);
      const desc = document.createElement("div");
      desc.className = "desc";
      desc.textContent = "Stackable consumable";
      row.appendChild(desc);
      const btn = document.createElement("button");
      btn.textContent = "Sell One";
      btn.addEventListener("click", () => sellConsumable(potion.id));
      row.appendChild(btn);
      inventoryListEl.appendChild(row);
    }

    for (const item of GAME.inventory.items) {
      const row = document.createElement("div");
      row.className = "shopItemRow";
      const top = document.createElement("div");
      top.className = "topLine";
      const nameEl = document.createElement("strong");
      nameEl.textContent = item.name;
      nameEl.className = rarityClassName(item.rarity);
      const price = document.createElement("span");
      price.textContent = `${item.sellGold || 0}g`;
      top.append(nameEl, price);
      row.appendChild(top);
      const desc = document.createElement("div");
      desc.className = "desc";
      desc.textContent = `${item.rarity.toUpperCase()} | ${item.kind.replace(/_/g, " ")}`;
      row.appendChild(desc);
      const btn = document.createElement("button");
      btn.textContent = "Sell";
      btn.addEventListener("click", () => sellInventoryItem(item.instanceId));
      row.appendChild(btn);
      inventoryListEl.appendChild(row);
    }

    if (inventoryListEl.childElementCount === 0) {
      const empty = document.createElement("div");
      empty.className = "shopItemRow";
      empty.textContent = "No inventory items yet.";
      inventoryListEl.appendChild(empty);
    }
  }

  function usePotion(type) {
    if (PLAYER.isDead || GAME.paused || isUiModalOpen()) return;
    if (type === "health_potion") {
      if (GAME.inventory.consumables.health_potion <= 0 || PLAYER.health >= PLAYER.maxHealth) return;
      GAME.inventory.consumables.health_potion -= 1;
      const before = PLAYER.health;
      PLAYER.health = clamp(PLAYER.health + 45, 0, PLAYER.maxHealth);
      spawnHealthGainText(Math.round(PLAYER.health - before));
      GAME.statusText = "Health potion used";
      GAME.statusTimer = 1.5;
    } else if (type === "stamina_potion") {
      if (GAME.inventory.consumables.stamina_potion <= 0 || PLAYER.stamina >= PLAYER.maxStamina) return;
      GAME.inventory.consumables.stamina_potion -= 1;
      PLAYER.stamina = clamp(PLAYER.stamina + 55, 0, PLAYER.maxStamina);
      GAME.statusText = "Stamina potion used";
      GAME.statusTimer = 1.5;
    } else if (type === "mana_potion") {
      if (GAME.inventory.consumables.mana_potion <= 0 || PLAYER.mana >= PLAYER.maxMana) return;
      GAME.inventory.consumables.mana_potion -= 1;
      PLAYER.mana = clamp(PLAYER.mana + 40, 0, PLAYER.maxMana);
      GAME.statusText = "Mana potion used";
      GAME.statusTimer = 1.5;
    } else {
      return;
    }

    saveShopProgression();
    refreshShopUI();
    updateHUD();
    playSfx("adaptive_shift");
  }

  // =============================
  // Utility Math Helpers
  // =============================
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function randRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function normalizeAngle(angle) {
    let a = angle;
    while (a <= -Math.PI) a += Math.PI * 2;
    while (a > Math.PI) a -= Math.PI * 2;
    return a;
  }

  function angleDiff(a, b) {
    return normalizeAngle(a - b);
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function bucket(value, thresholds, labels) {
    for (let i = 0; i < thresholds.length; i += 1) {
      if (value < thresholds[i]) {
        return labels[i];
      }
    }
    return labels[labels.length - 1];
  }

  function formatPercent(value) {
    return `${Math.round(value * 100)}%`;
  }

  function initActionCountMap() {
    const map = {};
    for (const action of ACTIONS) {
      map[action] = 0;
    }
    return map;
  }

  function createSeededRng(seed) {
    let s = seed >>> 0;
    return () => {
      s += 0x6d2b79f5;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seededInt(rng, min, max) {
    return Math.floor(rng() * (max - min + 1)) + min;
  }

  function hslToRgb(h, s, l) {
    const hue = ((h % 360) + 360) % 360;
    const sat = clamp(s, 0, 100) / 100;
    const light = clamp(l, 0, 100) / 100;
    const c = (1 - Math.abs(2 * light - 1)) * sat;
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = light - c / 2;
    let r = 0;
    let g = 0;
    let b = 0;
    if (hue < 60) [r, g, b] = [c, x, 0];
    else if (hue < 120) [r, g, b] = [x, c, 0];
    else if (hue < 180) [r, g, b] = [0, c, x];
    else if (hue < 240) [r, g, b] = [0, x, c];
    else if (hue < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    };
  }

  function rgbToCss(rgb, alpha = 1) {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }

  function getMazeSizeForLevel(level) {
    let size = MAZE_CONFIG.baseSize + (level - 1) * MAZE_CONFIG.growthStep;
    size = Math.min(MAZE_CONFIG.maxSize, size);
    if (size % 2 === 0) size += 1;
    return size;
  }

  function makeOdd(value) {
    const n = Math.max(5, Math.floor(value));
    return n % 2 === 0 ? n - 1 : n;
  }

  function generateDepthFirstMaze(width, height, seed) {
    const rng = createSeededRng(seed ^ 0x9e3779b9);
    const grid = Array.from({ length: height }, () => Array(width).fill(1));
    const cellCols = Math.floor((width - 1) / 2);
    const cellRows = Math.floor((height - 1) / 2);
    const visited = Array.from({ length: cellRows }, () => Array(cellCols).fill(false));

    const stack = [{ cx: 0, cy: 0 }];
    visited[0][0] = true;
    grid[1][1] = 0;

    const dirs = [
      { dx: 0, dy: -1 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
    ];

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = [];
      for (const dir of dirs) {
        const nx = current.cx + dir.dx;
        const ny = current.cy + dir.dy;
        if (nx < 0 || ny < 0 || nx >= cellCols || ny >= cellRows) continue;
        if (visited[ny][nx]) continue;
        neighbors.push({ nx, ny, dir });
      }

      if (neighbors.length === 0) {
        stack.pop();
        continue;
      }

      const pick = neighbors[Math.floor(rng() * neighbors.length)];
      const gx = current.cx * 2 + 1;
      const gy = current.cy * 2 + 1;
      const ngx = pick.nx * 2 + 1;
      const ngy = pick.ny * 2 + 1;
      const wallX = (gx + ngx) / 2;
      const wallY = (gy + ngy) / 2;

      grid[wallY][wallX] = 0;
      grid[ngy][ngx] = 0;
      visited[pick.ny][pick.nx] = true;
      stack.push({ cx: pick.nx, cy: pick.ny });
    }

    // Add a few extra loops for melee circulation.
    const loopCuts = Math.floor((width * height) * 0.012);
    for (let i = 0; i < loopCuts; i += 1) {
      const x = seededInt(rng, 1, width - 2);
      const y = seededInt(rng, 1, height - 2);
      if (grid[y][x] !== 1) continue;
      const horizontalOpen = grid[y][x - 1] === 0 && grid[y][x + 1] === 0;
      const verticalOpen = grid[y - 1][x] === 0 && grid[y + 1][x] === 0;
      if (horizontalOpen || verticalOpen) {
        grid[y][x] = 0;
      }
    }

    grid[1][1] = 0;
    grid[1][2] = 0;
    grid[2][1] = 0;
    return grid;
  }

  function generateBossWaveMaze(level, seed) {
    const baseSize = getMazeSizeForLevel(level);
    const height = makeOdd(clamp(baseSize + 6, 19, 47));
    const width = makeOdd(clamp(height * 2 + 9, 39, 95));
    const roomWidth = makeOdd(clamp(Math.floor(width * 0.29), 13, 29));
    const roomHeight = makeOdd(clamp(Math.floor(height * 0.72), 11, height - 4));
    const roomLeft = width - roomWidth - 2;
    const roomTop = Math.floor((height - roomHeight) * 0.5);
    const roomRight = roomLeft + roomWidth - 1;
    const roomBottom = roomTop + roomHeight - 1;
    const doorY = roomTop + Math.floor(roomHeight * 0.5);
    const corridorWidth = makeOdd(roomLeft + 1);
    const corridorMaze = generateDepthFirstMaze(corridorWidth, height, seed ^ 0x4f1bbcdc);
    const grid = Array.from({ length: height }, () => Array(width).fill(1));

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < corridorWidth; x += 1) {
        grid[y][x] = corridorMaze[y][x];
      }
    }

    for (let y = roomTop; y <= roomBottom; y += 1) {
      for (let x = roomLeft; x <= roomRight; x += 1) {
        grid[y][x] = 0;
      }
    }

    for (let x = roomLeft - 2; x <= roomLeft + 1; x += 1) {
      if (x > 0 && x < width - 1) {
        grid[doorY][x] = 0;
        if (doorY + 1 < height - 1) grid[doorY + 1][x] = 0;
      }
    }

    const corridorPool = [];
    const frontRoomPool = [];
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        if (grid[y][x] !== 0) continue;
        const tile = { x: x + 0.5, y: y + 0.5 };
        if (x <= roomLeft - 3) {
          corridorPool.push(tile);
        } else if (x >= roomLeft && x <= roomLeft + Math.floor(roomWidth * 0.46) && y > roomTop && y < roomBottom) {
          frontRoomPool.push(tile);
        }
      }
    }

    const bossSpawn = {
      x: roomRight - 1 + 0.5,
      y: doorY + 0.5,
    };

    return {
      map: grid,
      width,
      height,
      start: { x: 1.5, y: 1.5 },
      corridorPool,
      frontRoomPool,
      bossSpawn,
      roomRect: {
        left: roomLeft,
        top: roomTop,
        right: roomRight,
        bottom: roomBottom,
      },
    };
  }

  function createBossProfile(seed, theme) {
    const rng = createSeededRng(seed ^ 0x8b7f13a1);
    const headModel = BOSS_PART_MODELS.heads[seededInt(rng, 0, BOSS_PART_MODELS.heads.length - 1)];
    const torsoModel = BOSS_PART_MODELS.torsos[seededInt(rng, 0, BOSS_PART_MODELS.torsos.length - 1)];
    const legModel = BOSS_PART_MODELS.legs[seededInt(rng, 0, BOSS_PART_MODELS.legs.length - 1)];
    const nameRow = BOSS_NAME_TABLE[seededInt(rng, 0, BOSS_NAME_TABLE.length - 1)];
    const headColor = rgbToCss(hslToRgb(seededInt(rng, 0, 359), seededInt(rng, 22, 44), seededInt(rng, 34, 58)));
    const heavyTheme = (theme && theme.enemyArmor && theme.enemyArmor.heavy_brute) || {
      base: "rgba(114,124,140,0.95)",
      secondary: "rgba(78,86,99,0.92)",
      accent: "rgba(156,171,189,0.92)",
    };

    return {
      name: nameRow[0],
      noun: nameRow[1],
      agentive: nameRow[2],
      displayName: `${nameRow[0]} the ${nameRow[1]} ${nameRow[2]}`,
      models: {
        head: headModel,
        torso: torsoModel,
        legs: legModel,
      },
      palette: {
        torsoBase: heavyTheme.base,
        torsoSecondary: heavyTheme.secondary,
        legBase: heavyTheme.secondary,
        headBase: headColor,
        accent: heavyTheme.accent,
      },
    };
  }

  function buildSymmetricFloorTexture(seed, palette) {
    const rng = createSeededRng(seed ^ 0x45d9f3b);
    const canvasTex = document.createElement("canvas");
    canvasTex.width = 64;
    canvasTex.height = 64;
    const tctx = canvasTex.getContext("2d");

    const groutRatio = 0.01 + rng() * 0.03;
    const groutWidth = clamp(Math.round(canvasTex.width * groutRatio), 1, Math.floor(canvasTex.width * 0.04));
    tctx.fillStyle = palette.floorGrout;
    tctx.fillRect(0, 0, canvasTex.width, canvasTex.height);

    const innerSize = canvasTex.width - groutWidth * 2;
    tctx.fillStyle = palette.floorBase;
    tctx.fillRect(groutWidth, groutWidth, innerSize, innerSize);

    const grid = 8;
    const quarterCells = [];
    for (let y = 0; y < grid / 2; y += 1) {
      for (let x = 0; x < grid / 2; x += 1) {
        quarterCells.push({ x, y });
      }
    }

    // Fixed volume; randomized arrangement.
    const targetQuarterCount = 6;
    for (let i = quarterCells.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [quarterCells[i], quarterCells[j]] = [quarterCells[j], quarterCells[i]];
    }
    const selected = new Set();
    for (let i = 0; i < targetQuarterCount; i += 1) {
      const cell = quarterCells[i];
      selected.add(`${cell.x},${cell.y}`);
    }

    const cellSize = innerSize / grid;
    tctx.fillStyle = palette.floorAccent;
    for (let y = 0; y < grid; y += 1) {
      for (let x = 0; x < grid; x += 1) {
        const qx = x < grid / 2 ? x : grid - 1 - x;
        const qy = y < grid / 2 ? y : grid - 1 - y;
        if (!selected.has(`${qx},${qy}`)) continue;
        tctx.fillRect(groutWidth + x * cellSize, groutWidth + y * cellSize, cellSize, cellSize);
      }
    }

    tctx.strokeStyle = palette.floorLine;
    tctx.lineWidth = 1;
    for (let i = 1; i < grid; i += 1) {
      const p = groutWidth + i * cellSize;
      tctx.beginPath();
      tctx.moveTo(groutWidth, p);
      tctx.lineTo(groutWidth + innerSize, p);
      tctx.stroke();
      tctx.beginPath();
      tctx.moveTo(p, groutWidth);
      tctx.lineTo(p, groutWidth + innerSize);
      tctx.stroke();
    }

    return { texture: canvasTex, groutRatio };
  }

  function buildBrickWallTexture(seed, palette) {
    const rng = createSeededRng(seed ^ 0xa3619f0d);
    const tex = document.createElement("canvas");
    tex.width = 64;
    tex.height = 64;
    const tctx = tex.getContext("2d");

    const brickH = seededInt(rng, 8, 16);
    const maxW = Math.min(32, brickH * 2);
    const brickW = seededInt(rng, brickH, maxW);
    const mortar = seededInt(rng, 1, 2);

    tctx.fillStyle = palette.wallMortar;
    tctx.fillRect(0, 0, tex.width, tex.height);

    let rowIndex = 0;
    for (let y = 0; y < tex.height; y += brickH) {
      const offset = rowIndex % 2 === 0 ? 0 : Math.floor(brickW * 0.5);
      for (let x = -offset; x < tex.width; x += brickW) {
        const variation = (rng() - 0.5) * 18;
        const color = hslToRgb(palette.wallHue + variation * 0.1, palette.wallSat + variation * 0.06, palette.wallLight + variation * 0.08);
        tctx.fillStyle = rgbToCss(color);
        tctx.fillRect(x + mortar, y + mortar, brickW - mortar * 2, brickH - mortar * 2);
      }
      rowIndex += 1;
    }

    return { texture: tex, brickW, brickH };
  }

  function buildBlemishWallTexture(seed, palette) {
    const rng = createSeededRng(seed ^ 0x1f123bb5);
    const tex = document.createElement("canvas");
    tex.width = 64;
    tex.height = 64;
    const tctx = tex.getContext("2d");
    tctx.fillStyle = palette.wallBase;
    tctx.fillRect(0, 0, tex.width, tex.height);

    const blemishStep = seededInt(rng, 6, 14);
    for (let y = 0; y < tex.height; y += blemishStep) {
      for (let x = 0; x < tex.width; x += blemishStep) {
        const strength = 0.08 + rng() * 0.22;
        const lightOffset = rng() < 0.5 ? -10 : 10;
        const c = hslToRgb(palette.wallHue + (rng() - 0.5) * 8, palette.wallSat * 0.85, palette.wallLight + lightOffset * strength);
        tctx.fillStyle = rgbToCss(c, 0.44 + rng() * 0.26);
        tctx.fillRect(x, y, blemishStep, blemishStep);
      }
    }

    tctx.strokeStyle = palette.wallLine;
    tctx.lineWidth = 1;
    for (let y = 0; y < tex.height; y += blemishStep) {
      tctx.beginPath();
      tctx.moveTo(0, y + 0.5);
      tctx.lineTo(tex.width, y + 0.5);
      tctx.stroke();
    }

    return { texture: tex, blemishStep };
  }

  function createMazeTheme(seed, mazeWidth, mazeHeight) {
    const rng = createSeededRng(seed ^ 0xcafebabe);
    const tileHue = seededInt(rng, 170, 245);
    const tileSat = seededInt(rng, 12, 24);
    const tileLight = seededInt(rng, 24, 34);
    const tileAccentLight = tileLight + seededInt(rng, 5, 10);
    const groutLight = tileLight - seededInt(rng, 8, 13);

    const wallHue = (tileHue + seededInt(rng, 150, 200)) % 360;
    const wallSat = seededInt(rng, 8, 18);
    const wallLight = seededInt(rng, 13, 24);

    const palette = {
      floorBase: rgbToCss(hslToRgb(tileHue, tileSat, tileLight)),
      floorAccent: rgbToCss(hslToRgb(tileHue + seededInt(rng, -12, 12), tileSat + seededInt(rng, 2, 6), tileAccentLight)),
      floorGrout: rgbToCss(hslToRgb(tileHue + seededInt(rng, -8, 8), tileSat * 0.65, groutLight)),
      floorLine: rgbToCss(hslToRgb(tileHue + 14, tileSat * 0.55, tileLight - 8), 0.42),
      wallBase: rgbToCss(hslToRgb(wallHue, wallSat, wallLight)),
      wallMortar: rgbToCss(hslToRgb(wallHue + 8, wallSat * 0.5, wallLight - 8)),
      wallLine: rgbToCss(hslToRgb(wallHue - 8, wallSat * 0.65, wallLight - 10), 0.45),
      wallHue,
      wallSat,
      wallLight,
      fog: rgbToCss(hslToRgb((wallHue + 18) % 360, 24, 8)),
      skyBlack: "rgba(0,0,0,1)",
    };

    const floorTextureData = buildSymmetricFloorTexture(seed, palette);
    const wallMode = seed % 2 === 0 ? "brick" : "blemish";
    const wallTextureData = wallMode === "brick" ? buildBrickWallTexture(seed, palette) : buildBlemishWallTexture(seed, palette);
    const floorImage = floorTextureData.texture
      .getContext("2d")
      .getImageData(0, 0, floorTextureData.texture.width, floorTextureData.texture.height).data;

    const starry = seed % 3 !== 0;
    const skyHueBase = rng() < 0.5 ? seededInt(rng, 206, 232) : seededInt(rng, 18, 30);
    const skyBase = starry
      ? rgbToCss(hslToRgb(skyHueBase, seededInt(rng, 12, 28), seededInt(rng, 4, 10)))
      : "rgba(0,0,0,1)";
    const stars = [];
    if (starry) {
      const count = seededInt(rng, 80, 170);
      for (let i = 0; i < count; i += 1) {
        const warm = rng() < 0.45;
        const c = warm
          ? hslToRgb(seededInt(rng, 24, 46), seededInt(rng, 20, 40), seededInt(rng, 76, 90))
          : hslToRgb(seededInt(rng, 190, 225), seededInt(rng, 12, 30), seededInt(rng, 72, 90));
        stars.push({
          x: rng(),
          y: rng() * 0.95,
          size: 0.7 + rng() * 1.8,
          alpha: 0.28 + rng() * 0.52,
          color: rgbToCss(c),
        });
      }
    }

    const enemyArmor = {};
    for (const [archetypeName, shape] of Object.entries(ENEMY_SHAPE_LIBRARY)) {
      const offset =
        archetypeName === "aggressive_rusher"
          ? -26
          : archetypeName === "defensive_counterfighter"
            ? 18
            : archetypeName === "heavy_brute"
              ? 34
              : 0;
      const hue = (wallHue + offset + seededInt(rng, -10, 10) + 360) % 360;
      const sat = seededInt(rng, 14, 30);
      const light = seededInt(rng, 24, 42);
      const accentLight = light + seededInt(rng, 8, 16);
      enemyArmor[archetypeName] = {
        rig: shape.armorRig,
        base: rgbToCss(hslToRgb(hue, sat, light)),
        secondary: rgbToCss(hslToRgb(hue + seededInt(rng, -12, 12), sat * 0.78, light - 6)),
        accent: rgbToCss(hslToRgb(hue + seededInt(rng, -8, 8), sat + 6, accentLight)),
      };
    }

    return {
      seed,
      wallMode,
      palette,
      floorTexture: floorTextureData.texture,
      floorPixels: floorImage,
      floorGroutRatio: floorTextureData.groutRatio,
      wallTexture: wallTextureData.texture,
      wallTextureMeta: wallTextureData,
      skyMode: starry ? "starry" : "black",
      skyBase,
      stars,
      enemyArmor,
      enemySkin: {
        base: "rgba(130, 136, 145, 0.94)",
        dark: "rgba(90, 95, 103, 0.92)",
        eyes: "rgba(244, 232, 185, 0.92)",
      },
      fogRgb: hslToRgb((wallHue + 18) % 360, 24, 8),
    };
  }

  function rebuildOpenTiles() {
    OPEN_TILES = [];
    for (let y = 1; y < MAP_HEIGHT - 1; y += 1) {
      for (let x = 1; x < MAP_WIDTH - 1; x += 1) {
        if (MAP[y][x] === 0) {
          OPEN_TILES.push({ x: x + 0.5, y: y + 0.5 });
        }
      }
    }
  }

  function setupMazeForLevel(level) {
    const seed = ((Date.now() ^ Math.floor(Math.random() * 0xffffffff) ^ (level * 0x9e3779b1)) >>> 0);
    if (isBossWave(level)) {
      const bossLayout = generateBossWaveMaze(level, seed);
      MAP = bossLayout.map;
      MAP_WIDTH = bossLayout.width;
      MAP_HEIGHT = bossLayout.height;
      START_POS = { x: bossLayout.start.x, y: bossLayout.start.y };
      GAME.levelType = "boss";
      GAME.mazeMeta = bossLayout;
    } else {
      const size = getMazeSizeForLevel(level);
      MAP = generateDepthFirstMaze(size, size, seed);
      MAP_WIDTH = size;
      MAP_HEIGHT = size;
      START_POS = { x: 1.5, y: 1.5 };
      GAME.levelType = "arena";
      GAME.mazeMeta = null;
    }
    rebuildOpenTiles();

    MAZE_THEME = createMazeTheme(seed, MAP_WIDTH, MAP_HEIGHT);
    GAME.currentBossProfile = isBossWave(level) ? createBossProfile(seed, MAZE_THEME) : null;
    GAME.bossDefeatedThisWave = false;
    GAME.mazeSeed = seed;
    GAME.mazeWidth = MAP_WIDTH;
    GAME.mazeHeight = MAP_HEIGHT;
  }

  function sampleFloorPixel(theme, tx, ty) {
    const w = theme.floorTexture.width;
    const h = theme.floorTexture.height;
    const ix = ((tx % w) + w) % w;
    const iy = ((ty % h) + h) % h;
    const idx = (iy * w + ix) * 4;
    return {
      r: theme.floorPixels[idx],
      g: theme.floorPixels[idx + 1],
      b: theme.floorPixels[idx + 2],
    };
  }

  function getPlayerModifiers() {
    const rusherActive = PLAYER.effects.rusher > 0;
    const duelistActive = PLAYER.effects.duelist > 0;
    const bruteActive = PLAYER.effects.brute > 0;
    const counterActive = PLAYER.effects.counter > 0;

    let slashStaminaMult = 1;
    if (rusherActive) slashStaminaMult *= 0.8;
    if (duelistActive) slashStaminaMult *= 0.7;
    if (bruteActive) slashStaminaMult *= 0.7;
    let damageMult = bruteActive ? 1.3 : 1;
    let incomingDamageMult = counterActive ? 0.8 : 1;
    let dashStaminaMult = 1;
    let heavyDamageMult = 1;

    const owned = new Set(GAME.inventory.items.map((item) => item.id));
    if (owned.has("helm_ironwatch")) incomingDamageMult *= 0.97;
    if (owned.has("chest_reinforced")) incomingDamageMult *= 0.94;
    if (owned.has("greaves_bastion")) dashStaminaMult *= 0.9;
    if (owned.has("weapon_rift_cutter")) heavyDamageMult *= 1.1;
    if (owned.has("relic_bosscore")) {
      damageMult *= 1.15;
      slashStaminaMult *= 0.9;
    }

    return {
      speedMult: rusherActive ? 1.3 : 1,
      slashStaminaMult,
      slashSpeedMult: duelistActive ? 1.3 : 1,
      damageMult,
      incomingDamageMult,
      parryWindowMult: counterActive ? 1.3 : 1,
      dashStaminaMult,
      heavyDamageMult,
    };
  }

  function updatePlayerEffectTimers(dt) {
    for (const key of Object.keys(PLAYER.effects)) {
      PLAYER.effects[key] = Math.max(0, PLAYER.effects[key] - dt);
    }
  }

  function buildDropIcon(type) {
    const canvasIcon = document.createElement("canvas");
    canvasIcon.width = 40;
    canvasIcon.height = 40;
    const dctx = canvasIcon.getContext("2d");
    dctx.clearRect(0, 0, 40, 40);

    dctx.fillStyle = "rgba(0,0,0,0.28)";
    dctx.beginPath();
    dctx.ellipse(20, 33, 12, 3.5, 0, 0, Math.PI * 2);
    dctx.fill();

    const drawExtrudedShape = (drawPath, topFill, sideFill, outline = "rgba(0,0,0,0.32)") => {
      dctx.save();
      dctx.translate(0, 3);
      dctx.fillStyle = sideFill;
      dctx.beginPath();
      drawPath(dctx);
      dctx.fill();
      dctx.restore();

      dctx.fillStyle = topFill;
      dctx.beginPath();
      drawPath(dctx);
      dctx.fill();

      dctx.strokeStyle = outline;
      dctx.lineWidth = 1.5;
      dctx.beginPath();
      drawPath(dctx);
      dctx.stroke();
    };

    if (type === "heart") {
      const drawHeartPath = (c) => {
        c.moveTo(20, 31);
        c.bezierCurveTo(35, 21, 31, 8, 21, 12);
        c.bezierCurveTo(11, 8, 5, 21, 20, 31);
      };
      const grad = dctx.createRadialGradient(18, 15, 3, 20, 20, 18);
      grad.addColorStop(0, "#ffd8de");
      grad.addColorStop(0.52, "#e56f86");
      grad.addColorStop(1, "#8f3247");
      drawExtrudedShape(drawHeartPath, grad, "#642836");
    } else if (type === "rusher_boost") {
      const drawBoltPath = (c) => {
        c.moveTo(23, 5);
        c.lineTo(10, 21);
        c.lineTo(18, 21);
        c.lineTo(12, 35);
        c.lineTo(30, 17);
        c.lineTo(22, 17);
        c.closePath();
      };
      drawExtrudedShape(drawBoltPath, "#f3c458", "#9f7d2a");
    } else if (type === "duelist_boost") {
      // Crossed swords with dark under-stroke for depth.
      dctx.strokeStyle = "rgba(37, 42, 50, 0.85)";
      dctx.lineWidth = 7;
      dctx.lineCap = "round";
      dctx.beginPath();
      dctx.moveTo(9, 30);
      dctx.lineTo(31, 8);
      dctx.moveTo(31, 30);
      dctx.lineTo(9, 8);
      dctx.stroke();

      dctx.strokeStyle = "#e6f2ff";
      dctx.lineWidth = 4.5;
      dctx.beginPath();
      dctx.moveTo(9, 28);
      dctx.lineTo(29, 8);
      dctx.moveTo(31, 28);
      dctx.lineTo(11, 8);
      dctx.stroke();

      dctx.strokeStyle = "#0d0f13";
      dctx.lineWidth = 2.8;
      dctx.beginPath();
      dctx.moveTo(11, 30);
      dctx.lineTo(16, 25);
      dctx.moveTo(29, 30);
      dctx.lineTo(24, 25);
      dctx.stroke();
    } else if (type === "brute_boost") {
      // Dumbbell and fist with a simple two-plane fill for pseudo 3D.
      dctx.fillStyle = "#8a5d32";
      dctx.fillRect(8, 21, 24, 6);
      dctx.fillRect(6, 18, 6, 12);
      dctx.fillRect(28, 18, 6, 12);
      dctx.fillStyle = "#d3a674";
      dctx.fillRect(8, 18, 24, 6);
      dctx.fillRect(6, 15, 6, 12);
      dctx.fillRect(28, 15, 6, 12);
      dctx.fillStyle = "#b4834f";
      dctx.fillRect(14, 8, 12, 10);
      dctx.fillStyle = "#93663a";
      dctx.fillRect(16, 6, 8, 4);
      dctx.strokeStyle = "rgba(0,0,0,0.35)";
      dctx.lineWidth = 1.5;
      dctx.strokeRect(14, 8, 12, 10);
    } else if (type === "counter_boost") {
      const drawShieldPath = (c) => {
        c.moveTo(20, 5);
        c.lineTo(32, 11);
        c.lineTo(31, 23);
        c.lineTo(20, 34);
        c.lineTo(9, 23);
        c.lineTo(8, 11);
        c.closePath();
      };
      const grad = dctx.createLinearGradient(9, 6, 31, 33);
      grad.addColorStop(0, "#89d0f6");
      grad.addColorStop(1, "#32678f");
      drawExtrudedShape(drawShieldPath, grad, "#244a66");
      dctx.strokeStyle = "rgba(210, 238, 255, 0.78)";
      dctx.lineWidth = 2;
      dctx.beginPath();
      dctx.moveTo(20, 10);
      dctx.lineTo(20, 28);
      dctx.stroke();
    }

    return canvasIcon;
  }

  const DROP_SPRITES = {
    heart: buildDropIcon("heart"),
    rusher_boost: buildDropIcon("rusher_boost"),
    duelist_boost: buildDropIcon("duelist_boost"),
    brute_boost: buildDropIcon("brute_boost"),
    counter_boost: buildDropIcon("counter_boost"),
  };

  function findDropPosition(baseX, baseY, reserved = []) {
    const offsets = [
      [0, 0],
      [0.56, 0],
      [-0.56, 0],
      [0, 0.56],
      [0, -0.56],
      [0.4, 0.4],
      [-0.4, 0.4],
      [0.4, -0.4],
      [-0.4, -0.4],
    ];
    for (const [ox, oy] of offsets) {
      const x = baseX + ox;
      const y = baseY + oy;
      if (collidesCircle(x, y, 0.14)) continue;
      let overlap = false;
      for (const drop of GAME.drops) {
        if (Math.hypot(drop.x - x, drop.y - y) < 0.46) {
          overlap = true;
          break;
        }
      }
      if (overlap) continue;
      for (const used of reserved) {
        if (Math.hypot(used.x - x, used.y - y) < 0.46) {
          overlap = true;
          break;
        }
      }
      if (!overlap) return { x, y };
    }
    return { x: baseX, y: baseY };
  }

  function spawnDrop(type, x, y) {
    GAME.drops.push({
      id: GAME.nextDropId++,
      type,
      x,
      y,
      radius: 0.16,
      bob: Math.random() * Math.PI * 2,
    });
  }

  function spawnDropsForEnemy(enemy) {
    const planned = [];
    if (Math.random() < 0.4) {
      planned.push("heart");
    }
    if (enemy.archetype === "aggressive_rusher" && Math.random() < 0.2) planned.push("rusher_boost");
    if (enemy.archetype === "balanced_duelist" && Math.random() < 0.2) planned.push("duelist_boost");
    if (enemy.archetype === "heavy_brute" && Math.random() < 0.2) planned.push("brute_boost");
    if (enemy.archetype === "defensive_counterfighter" && Math.random() < 0.2) planned.push("counter_boost");

    const reserved = [];
    for (const type of planned) {
      const pos = findDropPosition(enemy.x, enemy.y, reserved);
      reserved.push(pos);
      spawnDrop(type, pos.x, pos.y);
    }
  }

  function updateDrops(dt) {
    for (const drop of GAME.drops) {
      drop.bob += dt * 3;
    }

    for (let i = GAME.drops.length - 1; i >= 0; i -= 1) {
      const drop = GAME.drops[i];
      if (Math.hypot(drop.x - PLAYER.x, drop.y - PLAYER.y) > 0.75) continue;
      const def = DROP_DEFS[drop.type];
      if (!def) continue;
      const result = def.apply(PLAYER);
      if (drop.type === "heart") {
        const gained = Number.isFinite(result) ? result : def.healAmount || 0;
        spawnHealthGainText(gained);
      }
      GAME.statusText = `${def.label} acquired`;
      GAME.statusTimer = 1.5;
      playSfx("adaptive_shift");
      GAME.drops.splice(i, 1);
    }
  }

  function setPaused(paused, relock = false) {
    if (isUiModalOpen()) return;
    GAME.paused = paused;
    document.body.classList.toggle("paused", paused);
    pauseOverlayEl.classList.toggle("hidden", !paused);
    syncPausePanelInteractivity(paused);
    if (paused) {
      if (document.pointerLockElement === canvas && document.exitPointerLock) {
        document.exitPointerLock();
      }
      return;
    }
    if (relock && canvas.requestPointerLock) {
      canvas.requestPointerLock();
    }
  }

  // =============================
  // Lightweight Audio + VFX
  // =============================
  const AUDIO = {
    ctx: null,
    unlocked: false,
  };

  function unlockAudio() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!AUDIO.ctx) {
      AUDIO.ctx = new AC();
      AUDIO.unlocked = true;
    }
    if (AUDIO.ctx.state === "suspended") {
      AUDIO.ctx.resume().catch(() => {});
    }
  }

  function playTone({ freq = 220, duration = 0.08, type = "sine", gain = 0.08, sweep = 0, pan = 0 }) {
    if (!AUDIO.ctx) return;
    const t0 = AUDIO.ctx.currentTime;
    const osc = AUDIO.ctx.createOscillator();
    const g = AUDIO.ctx.createGain();
    const panner = AUDIO.ctx.createStereoPanner();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (sweep !== 0) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(24, freq + sweep), t0 + duration);
    }

    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    panner.pan.value = clamp(pan, -1, 1);

    osc.connect(g).connect(panner).connect(AUDIO.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration);
  }

  function playNoiseBurst({ duration = 0.05, gain = 0.06, pan = 0 }) {
    if (!AUDIO.ctx) return;
    const bufferSize = Math.max(1, Math.floor(AUDIO.ctx.sampleRate * duration));
    const buffer = AUDIO.ctx.createBuffer(1, bufferSize, AUDIO.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const src = AUDIO.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = AUDIO.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 950;
    const g = AUDIO.ctx.createGain();
    const panner = AUDIO.ctx.createStereoPanner();
    panner.pan.value = clamp(pan, -1, 1);
    g.gain.value = gain;
    g.gain.exponentialRampToValueAtTime(0.0001, AUDIO.ctx.currentTime + duration);
    src.connect(filter).connect(g).connect(panner).connect(AUDIO.ctx.destination);
    src.start();
  }

  function playSfx(name, pan = 0) {
    if (!AUDIO.ctx) return;
    switch (name) {
      case "swing_light":
        playTone({ freq: 300, sweep: -150, duration: 0.07, type: "triangle", gain: 0.06, pan });
        playNoiseBurst({ duration: 0.035, gain: 0.03, pan });
        break;
      case "swing_heavy":
        playTone({ freq: 220, sweep: -110, duration: 0.12, type: "sawtooth", gain: 0.08, pan });
        playNoiseBurst({ duration: 0.05, gain: 0.04, pan });
        break;
      case "hit":
        playTone({ freq: 180, sweep: -80, duration: 0.09, type: "square", gain: 0.1, pan });
        playNoiseBurst({ duration: 0.045, gain: 0.06, pan });
        break;
      case "block":
        playTone({ freq: 420, sweep: -140, duration: 0.05, type: "triangle", gain: 0.06, pan });
        playNoiseBurst({ duration: 0.03, gain: 0.03, pan });
        break;
      case "parry":
        playTone({ freq: 760, sweep: -280, duration: 0.08, type: "triangle", gain: 0.09, pan });
        playTone({ freq: 1120, sweep: -200, duration: 0.05, type: "sine", gain: 0.06, pan });
        playNoiseBurst({ duration: 0.04, gain: 0.045, pan });
        break;
      case "enemy_death":
        playTone({ freq: 130, sweep: -70, duration: 0.18, type: "sawtooth", gain: 0.06, pan });
        break;
      case "adaptive_shift":
        playTone({ freq: 520, sweep: 120, duration: 0.08, type: "sine", gain: 0.05, pan: 0 });
        playTone({ freq: 660, sweep: 130, duration: 0.12, type: "triangle", gain: 0.045, pan: 0 });
        break;
      default:
        break;
    }
  }

  function projectWorldToScreen(x, y, width, height) {
    const dx = x - PLAYER.x;
    const dy = y - PLAYER.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= 0.05 || dist > CAMERA.maxDepth) return null;
    const theta = normalizeAngle(Math.atan2(dy, dx) - PLAYER.angle);
    if (Math.abs(theta) > CAMERA.fov * 0.8) return null;
    return {
      x: (theta / CAMERA.fov + 0.5) * width,
      y: height / 2 + (height / dist) * 0.08,
      dist,
    };
  }

  function panFromWorld(x, y) {
    const theta = normalizeAngle(Math.atan2(y - PLAYER.y, x - PLAYER.x) - PLAYER.angle);
    return clamp(theta / (CAMERA.fov * 0.6), -1, 1);
  }

  function pushSparkAtScreen(x, y, color = "255,186,71", count = 10, power = 1) {
    for (let i = 0; i < count; i += 1) {
      const angle = randRange(-Math.PI, Math.PI);
      const speed = randRange(50, 220) * power;
      const life = randRange(0.08, 0.22);
      GAME.sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - randRange(20, 90),
        life,
        maxLife: life,
        color,
        size: randRange(1.2, 2.8),
      });
    }
  }

  function pushSparkAtWorld(x, y, color = "255,186,71", count = 10, power = 1) {
    const projected = projectWorldToScreen(x, y, window.innerWidth, window.innerHeight);
    if (!projected) return;
    pushSparkAtScreen(projected.x, projected.y, color, count, power);
  }

  function pushFlash(color = "255,255,255", intensity = 0.15, life = 0.09) {
    GAME.flashes.push({ color, intensity, life, maxLife: life });
  }

  function triggerShake(power = 4, duration = 0.12) {
    GAME.shakeTimer = Math.max(GAME.shakeTimer, duration);
    GAME.shakePower = Math.max(GAME.shakePower, power);
  }

  function triggerHitStop(duration = 0.045) {
    GAME.hitStopTimer = Math.max(GAME.hitStopTimer, duration);
  }

  function updateVisualEffects(dt) {
    GAME.shakeTimer = Math.max(0, GAME.shakeTimer - dt);
    GAME.adaptationPulse = Math.max(0, GAME.adaptationPulse - dt);
    GAME.adaptiveToneCooldown = Math.max(0, GAME.adaptiveToneCooldown - dt);
    if (GAME.shakeTimer <= 0) {
      GAME.shakePower = 0;
    }

    for (let i = GAME.sparks.length - 1; i >= 0; i -= 1) {
      const spark = GAME.sparks[i];
      spark.life -= dt;
      spark.x += spark.vx * dt;
      spark.y += spark.vy * dt;
      spark.vx *= Math.pow(0.65, dt * 10);
      spark.vy += 240 * dt;
      if (spark.life <= 0) {
        GAME.sparks.splice(i, 1);
      }
    }

    for (let i = GAME.flashes.length - 1; i >= 0; i -= 1) {
      GAME.flashes[i].life -= dt;
      if (GAME.flashes[i].life <= 0) {
        GAME.flashes.splice(i, 1);
      }
    }

    for (let i = GAME.weaponTrails.length - 1; i >= 0; i -= 1) {
      GAME.weaponTrails[i].life -= dt;
      if (GAME.weaponTrails[i].life <= 0) {
        GAME.weaponTrails.splice(i, 1);
      }
    }
  }

  // =============================
  // 2D World Simulation Utilities
  // =============================
  function isWall(x, y) {
    const cellX = Math.floor(x);
    const cellY = Math.floor(y);
    if (cellX < 0 || cellY < 0 || cellX >= MAP_WIDTH || cellY >= MAP_HEIGHT) {
      return true;
    }
    return MAP[cellY][cellX] !== 0;
  }

  function collidesCircle(x, y, radius) {
    const sampleOffsets = [
      [-radius, -radius],
      [radius, -radius],
      [-radius, radius],
      [radius, radius],
      [0, -radius],
      [0, radius],
      [-radius, 0],
      [radius, 0],
    ];

    for (const [ox, oy] of sampleOffsets) {
      if (isWall(x + ox, y + oy)) {
        return true;
      }
    }
    return false;
  }

  function moveEntity(entity, moveX, moveY) {
    const xStep = moveX;
    const yStep = moveY;

    if (!collidesCircle(entity.x + xStep, entity.y, entity.radius)) {
      entity.x += xStep;
    }

    if (!collidesCircle(entity.x, entity.y + yStep, entity.radius)) {
      entity.y += yStep;
    }
  }

  function moveEntityWithPathing(entity, dirX, dirY, speed, dt) {
    const length = Math.hypot(dirX, dirY) || 1;
    let nx = dirX / length;
    let ny = dirY / length;

    const step = speed * dt;
    const tryVectors = [
      [nx, ny],
      [Math.cos(Math.atan2(ny, nx) + Math.PI / 4), Math.sin(Math.atan2(ny, nx) + Math.PI / 4)],
      [Math.cos(Math.atan2(ny, nx) - Math.PI / 4), Math.sin(Math.atan2(ny, nx) - Math.PI / 4)],
      [Math.cos(Math.atan2(ny, nx) + Math.PI / 2), Math.sin(Math.atan2(ny, nx) + Math.PI / 2)],
      [Math.cos(Math.atan2(ny, nx) - Math.PI / 2), Math.sin(Math.atan2(ny, nx) - Math.PI / 2)],
    ];

    for (const [vx, vy] of tryVectors) {
      const testX = entity.x + vx * step;
      const testY = entity.y + vy * step;
      if (!collidesCircle(testX, testY, entity.radius)) {
        entity.vx = vx * speed;
        entity.vy = vy * speed;
        moveEntity(entity, vx * step, vy * step);
        return;
      }
    }

    entity.vx = 0;
    entity.vy = 0;
  }

  function hasLineOfSight(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const steps = Math.ceil(Math.hypot(dx, dy) / 0.06);
    for (let i = 1; i <= steps; i += 1) {
      const t = i / steps;
      const sx = x1 + dx * t;
      const sy = y1 + dy * t;
      if (isWall(sx, sy)) {
        return false;
      }
    }
    return true;
  }

  // =============================
  // Reinforcement Learning Module
  // =============================
  // This game uses tabular Q-learning and stores Q-values by state-action pair.
  // State representation: compact 2D combat snapshot (distance/angle buckets,
  // health/stamina buckets, recent player actions, dodge direction, LOS).
  // Action space: advance/retreat/strafe/attack/block/wait/punish/feint options.
  // Reward: combat outcomes (hits landed, damage taken, missed attacks, survival).
  // Update rule: Q(s,a) <- Q(s,a) + alpha * [r + gamma*max_a' Q(s',a') - Q(s,a)].
  // Persistence: versioned model payload in localStorage for cross-session learning.

  class RLManager {
    constructor() {
      this.models = this.createDefaultModels();
      this.load();
    }

    createDefaultModels() {
      const models = {};
      for (const [name, config] of Object.entries(ARCHETYPES)) {
        models[name] = {
          epsilon: config.epsilon,
          minEpsilon: config.minEpsilon,
          epsilonDecay: config.epsilonDecay,
          alpha: clamp(config.alpha, 0.02, 0.15),
          gamma: clamp(config.gamma, 0.5, 0.99),
          q: {},
          lifetimeActions: initActionCountMap(),
          lifetimeStats: {
            hitsLanded: 0,
            damageTaken: 0,
            damageDealt: 0,
            deaths: 0,
            rounds: 0,
          },
        };
      }
      return models;
    }

    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (!parsed || parsed.version !== MODEL_VERSION || typeof parsed.models !== "object") {
          return;
        }

        for (const [name, model] of Object.entries(parsed.models)) {
          if (!this.models[name]) continue;
          const local = this.models[name];
          local.epsilon = clamp(Number(model.epsilon) || local.epsilon, local.minEpsilon, 0.95);
          local.alpha = clamp(Number(model.alpha) || local.alpha, 0.02, 0.15);
          local.gamma = clamp(Number(model.gamma) || local.gamma, 0.5, 0.99);
          local.q = this.sanitizeQTable(model.q);

          if (model.lifetimeActions && typeof model.lifetimeActions === "object") {
            for (const action of ACTIONS) {
              local.lifetimeActions[action] = Number(model.lifetimeActions[action]) || 0;
            }
          }

          if (model.lifetimeStats && typeof model.lifetimeStats === "object") {
            local.lifetimeStats.hitsLanded = Number(model.lifetimeStats.hitsLanded) || 0;
            local.lifetimeStats.damageTaken = Number(model.lifetimeStats.damageTaken) || 0;
            local.lifetimeStats.damageDealt = Number(model.lifetimeStats.damageDealt) || 0;
            local.lifetimeStats.deaths = Number(model.lifetimeStats.deaths) || 0;
            local.lifetimeStats.rounds = Number(model.lifetimeStats.rounds) || 0;
          }
        }
      } catch (error) {
        console.warn("Failed to load RL data", error);
      }
    }

    sanitizeQTable(table) {
      const sanitized = {};
      if (!table || typeof table !== "object") {
        return sanitized;
      }

      for (const [stateKey, row] of Object.entries(table)) {
        if (!row || typeof row !== "object") continue;
        const cleanRow = {};
        for (const action of ACTIONS) {
          cleanRow[action] = clamp(Number(row[action]) || 0, -6, 6);
        }
        sanitized[stateKey] = cleanRow;
      }

      return sanitized;
    }

    save() {
      try {
        const payload = {
          version: MODEL_VERSION,
          savedAt: Date.now(),
          models: this.models,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (error) {
        console.warn("Failed to save RL data", error);
      }
    }

    reset() {
      this.models = this.createDefaultModels();
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.warn("Failed to reset RL storage", error);
      }
      this.save();
    }

    getModel(archetype) {
      return this.models[archetype];
    }

    ensureStateRow(model, stateKey) {
      if (!model.q[stateKey]) {
        const row = {};
        for (const action of ACTIONS) row[action] = 0;
        model.q[stateKey] = row;
      }
      return model.q[stateKey];
    }

    updateQ(model, stateKey, action, reward, nextStateKey) {
      const row = this.ensureStateRow(model, stateKey);
      const nextRow = this.ensureStateRow(model, nextStateKey);

      let nextMax = -Infinity;
      for (const a of ACTIONS) {
        if (nextRow[a] > nextMax) nextMax = nextRow[a];
      }

      const oldValue = row[action];
      const target = reward + model.gamma * nextMax;
      const updated = oldValue + model.alpha * (target - oldValue);
      row[action] = clamp(updated, -6, 6);
    }

    decayExploration() {
      for (const [name, model] of Object.entries(this.models)) {
        const config = ARCHETYPES[name];
        model.epsilon = clamp(model.epsilon * model.epsilonDecay, config.minEpsilon, 0.95);
      }
    }
  }

  const rlManager = new RLManager();

  function buildEnemyStateKey(enemy) {
    const dx = PLAYER.x - enemy.x;
    const dy = PLAYER.y - enemy.y;
    const dist = Math.hypot(dx, dy);
    const toPlayerAngle = Math.atan2(dy, dx);
    const relAngle = angleDiff(toPlayerAngle, enemy.angle);

    const distBucket = bucket(dist, [0.9, 1.6, 2.8], ["close", "mid", "far", "very_far"]);
    const angleBucket = bucket(relAngle, [-0.8, -0.2, 0.2, 0.8], ["left", "front_left", "front", "front_right", "right"]);
    const enemyHpBucket = bucket(enemy.health / enemy.maxHealth, [0.3, 0.65], ["low", "mid", "high"]);
    const playerHpBucket = bucket(PLAYER.health / PLAYER.maxHealth, [0.3, 0.65], ["low", "mid", "high"]);
    const playerStaminaBucket = bucket(PLAYER.stamina / PLAYER.maxStamina, [0.3, 0.65], ["low", "mid", "high"]);

    const toEnemyNormX = dx / (dist || 1);
    const toEnemyNormY = dy / (dist || 1);
    const playerForwardX = Math.cos(PLAYER.angle);
    const playerForwardY = Math.sin(PLAYER.angle);
    const approachDot = playerForwardX * toEnemyNormX + playerForwardY * toEnemyNormY;
    const playerMotionBucket = approachDot > 0.25 ? "pressing" : approachDot < -0.25 ? "retreating" : "neutral";

    const los = hasLineOfSight(enemy.x, enemy.y, PLAYER.x, PLAYER.y) ? "1" : "0";
    const playerCombat = PLAYER.attack ? "attacking" : PLAYER.blockHeld ? "blocking" : PLAYER.dashTimer > 0 ? "dashing" : "idle";

    // Discrete state key feeds tabular Q-learning, independent of rendered pixels.
    return [
      `d:${distBucket}`,
      `a:${angleBucket}`,
      `eh:${enemyHpBucket}`,
      `ph:${playerHpBucket}`,
      `ps:${playerStaminaBucket}`,
      `pm:${playerMotionBucket}`,
      `pc:${playerCombat}`,
      `ra:${PLAYER.recentAction}`,
      `rd:${PLAYER.recentDodgeDirection}`,
      `los:${los}`,
    ].join("|");
  }

  function getDynamicAggression(enemy) {
    const model = enemy.rl;
    const attackWeight = model.lifetimeActions.light_attack + model.lifetimeActions.heavy_attack + model.lifetimeActions.punish_dodge;
    const defensiveWeight = model.lifetimeActions.retreat + model.lifetimeActions.block + model.lifetimeActions.wait;
    const total = attackWeight + defensiveWeight + 1;
    const raw = attackWeight / total;
    const clampRange = ARCHETYPES[enemy.archetype].aggressionClamp;
    return clamp(raw, clampRange[0], clampRange[1]);
  }

  function getActionScore(enemy, stateKey, action) {
    const model = enemy.rl;
    const row = rlManager.ensureStateRow(model, stateKey);
    const archetype = ARCHETYPES[enemy.archetype];
    const dist = distance(enemy, PLAYER);

    let score = row[action] + (archetype.actionBias[action] || 0);

    const aggression = getDynamicAggression(enemy);
    if (["light_attack", "heavy_attack", "punish_dodge", "advance"].includes(action)) {
      score += aggression * 0.4;
    }
    if (["retreat", "block", "wait"].includes(action)) {
      score += (1 - aggression) * 0.35;
    }

    if (dist < 1 && action === "retreat") score += 0.2;
    if (dist > 2.1 && action === "advance") score += 0.22;
    if (dist > 2.3 && ["light_attack", "heavy_attack"].includes(action)) score -= 0.35;
    if (PLAYER.dashTimer > 0 && action === "punish_dodge") score += 0.28;
    if (PLAYER.blockHeld && action === "bait_parry") score += 0.22;

    // Enforce archetype limits to avoid runaway behavior.
    if (enemy.archetype === "heavy_brute" && ["strafe_left", "strafe_right", "feint"].includes(action)) {
      score -= 0.22;
    }
    if (enemy.archetype === "aggressive_rusher" && action === "wait") {
      score -= 0.35;
    }
    if (enemy.archetype === "defensive_counterfighter" && ["light_attack", "heavy_attack"].includes(action)) {
      score -= 0.08;
    }

    return score;
  }

  function chooseEnemyAction(enemy, stateKey) {
    const model = enemy.rl;
    const explore = Math.random() < model.epsilon;

    if (explore) {
      // Epsilon-greedy exploration with mild archetype-weighted sampling.
      const weighted = [];
      for (const action of ACTIONS) {
        const bias = (ARCHETYPES[enemy.archetype].actionBias[action] || 0) + 0.35;
        weighted.push([action, Math.max(0.02, bias)]);
      }
      const sum = weighted.reduce((acc, [, w]) => acc + w, 0);
      let pick = Math.random() * sum;
      for (const [action, w] of weighted) {
        pick -= w;
        if (pick <= 0) return action;
      }
      return ACTIONS[ACTIONS.length - 1];
    }

    let best = -Infinity;
    let choices = [];
    for (const action of ACTIONS) {
      const score = getActionScore(enemy, stateKey, action);
      if (score > best + 1e-6) {
        best = score;
        choices = [action];
      } else if (Math.abs(score - best) <= 1e-6) {
        choices.push(action);
      }
    }

    return choices[Math.floor(Math.random() * choices.length)] || "wait";
  }

  function rewardEnemy(enemy, amount) {
    // Reward is accumulated between decisions, then applied in one Q update.
    enemy.accumulatedReward += amount;
  }

  function commitEnemyTransition(enemy, nextStateKey) {
    if (!enemy.lastStateKey || !enemy.lastAction) return;
    // Core Q-learning step.
    rlManager.updateQ(enemy.rl, enemy.lastStateKey, enemy.lastAction, enemy.accumulatedReward, nextStateKey);
    enemy.accumulatedReward = 0;
  }

  // =============================
  // Enemy / World Entities
  // =============================
  function createEnemy(x, y, archetype, waveMultiplier) {
    const config = ARCHETYPES[archetype];
    const hpBoost = 1 + Math.min(0.7, waveMultiplier * 0.06);
    const speedBoost = 1 + Math.min(0.35, waveMultiplier * 0.03);

    return {
      id: GAME.nextEnemyId++,
      x,
      y,
      angle: randRange(-Math.PI, Math.PI),
      vx: 0,
      vy: 0,
      radius: 0.23,
      state: "idle",
      archetype,
      rl: rlManager.getModel(archetype),
      maxHealth: Math.round(config.hp * hpBoost),
      health: Math.round(config.hp * hpBoost),
      speed: config.speed * speedBoost,
      reactionDelay: config.reactionDelay,
      decisionTimer: randRange(0.05, 0.22),
      actionTimer: 0,
      action: "wait",
      attackIntent: null,
      attackCooldown: 0,
      blockTimer: 0,
      stunTimer: 0,
      feinting: false,
      delayedAttackTimer: 0,
      attackFlash: 0,
      hitFlash: 0,
      parryFlash: 0,
      staggerTimer: 0,
      alertTimer: 0,
      deathTimer: 0,
      bornAt: PLAYER.survivalTime,
      accumulatedReward: 0,
      lastStateKey: null,
      lastAction: null,
      lastAttackConnected: false,
      lastDamageTime: -100,
    };
  }

  function createBossEnemy(x, y, waveMultiplier) {
    const boss = createEnemy(x, y, "heavy_brute", waveMultiplier);
    boss.isBoss = true;
    boss.radius = 0.36;
    boss.maxHealth = Math.round(520 + waveMultiplier * 48);
    boss.health = boss.maxHealth;
    boss.speed = clamp(1.35 + waveMultiplier * 0.03, 1.35, 2.05);
    boss.reactionDelay = 0.22;
    boss.decisionTimer = randRange(0.04, 0.12);
    boss.name = GAME.currentBossProfile ? GAME.currentBossProfile.displayName : "Arena Boss";
    boss.bossProfile = GAME.currentBossProfile;
    return boss;
  }

  function findSpawnPosition() {
    for (let i = 0; i < 200; i += 1) {
      const tile = OPEN_TILES[Math.floor(Math.random() * OPEN_TILES.length)];
      if (!tile) break;

      if (Math.hypot(tile.x - PLAYER.x, tile.y - PLAYER.y) < 3.2) continue;
      let overlap = false;
      for (const enemy of GAME.enemies) {
        if (Math.hypot(tile.x - enemy.x, tile.y - enemy.y) < 1.1) {
          overlap = true;
          break;
        }
      }
      if (!overlap) return tile;
    }

    return { x: START_POS.x + 2, y: START_POS.y + 2 };
  }

  function findSpawnFromPool(pool, fallback = null) {
    const sourcePool = Array.isArray(pool) && pool.length > 0 ? pool : OPEN_TILES;
    for (let i = 0; i < 220; i += 1) {
      const tile = sourcePool[Math.floor(Math.random() * sourcePool.length)];
      if (!tile) break;
      if (Math.hypot(tile.x - PLAYER.x, tile.y - PLAYER.y) < 3.2) continue;
      let overlap = false;
      for (const enemy of GAME.enemies) {
        if (Math.hypot(tile.x - enemy.x, tile.y - enemy.y) < 1.25) {
          overlap = true;
          break;
        }
      }
      if (!overlap) return tile;
    }
    return fallback || findSpawnPosition();
  }

  function chooseArchetypeForWave(wave) {
    const pool = ["balanced_duelist", "aggressive_rusher"];
    if (wave >= 2) pool.push("defensive_counterfighter");
    if (wave >= 3) pool.push("heavy_brute");

    // Increase archetype coordination later by weighted picks.
    const roll = Math.random();
    if (wave >= 5 && roll < 0.33) return "defensive_counterfighter";
    if (wave >= 4 && roll > 0.82) return "heavy_brute";
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function getEnemyCountForCurrentMap() {
    const baseArea = MAZE_CONFIG.baseSize * MAZE_CONFIG.baseSize;
    const mapArea = MAP_WIDTH * MAP_HEIGHT;
    const areaRatio = mapArea / baseArea;
    const proportionalCount = Math.round(MAZE_CONFIG.baseEnemyCount * areaRatio);
    const capByOpenTiles = Math.max(MAZE_CONFIG.baseEnemyCount, Math.floor(OPEN_TILES.length * 0.24));
    return clamp(proportionalCount, MAZE_CONFIG.baseEnemyCount, Math.min(MAZE_CONFIG.maxEnemyCount, capByOpenTiles));
  }

  function spawnWave(waveNumber) {
    if (GAME.levelType === "boss" && GAME.mazeMeta) {
      const regularCount = getEnemyCountForCurrentMap();
      const mazeCount = Math.floor(regularCount * 0.6);
      const roomFrontCount = regularCount - mazeCount;

      for (let i = 0; i < mazeCount; i += 1) {
        const spawn = findSpawnFromPool(GAME.mazeMeta.corridorPool);
        const archetype = chooseArchetypeForWave(waveNumber - 1);
        GAME.enemies.push(createEnemy(spawn.x, spawn.y, archetype, waveNumber - 1));
      }

      for (let i = 0; i < roomFrontCount; i += 1) {
        const spawn = findSpawnFromPool(GAME.mazeMeta.frontRoomPool, findSpawnFromPool(GAME.mazeMeta.corridorPool));
        const archetype = chooseArchetypeForWave(waveNumber);
        GAME.enemies.push(createEnemy(spawn.x, spawn.y, archetype, waveNumber - 1));
      }

      const bossSpawn = GAME.mazeMeta.bossSpawn || { x: MAP_WIDTH - 2.5, y: MAP_HEIGHT * 0.5 };
      GAME.enemies.push(createBossEnemy(bossSpawn.x, bossSpawn.y, waveNumber - 1));
      GAME.statusText = `Boss Wave ${waveNumber}: ${GAME.currentBossProfile ? GAME.currentBossProfile.displayName : "Arena Tyrant"}`;
      GAME.statusTimer = 3.2;
    } else {
      const enemyCount = getEnemyCountForCurrentMap();
      for (let i = 0; i < enemyCount; i += 1) {
        const spawn = findSpawnPosition();
        const archetype = chooseArchetypeForWave(waveNumber);
        GAME.enemies.push(createEnemy(spawn.x, spawn.y, archetype, waveNumber - 1));
      }

      GAME.statusText = `Maze ${waveNumber} | ${MAP_WIDTH}x${MAP_HEIGHT} | seed ${GAME.mazeSeed}`;
      GAME.statusTimer = 2;
    }

    WAVE_BEHAVIOR = createEmptyWaveBehavior();
  }

  function clearEnemies() {
    GAME.enemies.length = 0;
  }

  function resetPlayerForRun() {
    PLAYER.x = START_POS.x;
    PLAYER.y = START_POS.y;
    PLAYER.angle = 0;
    PLAYER.vx = 0;
    PLAYER.vy = 0;
    PLAYER.health = PLAYER.maxHealth;
    PLAYER.stamina = PLAYER.maxStamina;
    PLAYER.mana = PLAYER.maxMana;
    PLAYER.attackCooldown = 0;
    PLAYER.attack = null;
    PLAYER.blockHeld = false;
    PLAYER.blockTimer = 0;
    PLAYER.parryTimer = 0;
    PLAYER.dashCooldown = 0;
    PLAYER.dashTimer = 0;
    PLAYER.invulnerableTimer = 0;
    PLAYER.recentAction = "idle";
    PLAYER.recentDodgeDirection = "none";
    PLAYER.recentDodgeTimer = 0;
    PLAYER.lastAttackTime = -100;
    PLAYER.slashPatternIndex = 0;
    PLAYER.state = "idle";
    PLAYER.isDead = false;
    PLAYER.score = 0;
    PLAYER.kills = 0;
    PLAYER.survivalTime = 0;
    for (const effectKey of Object.keys(PLAYER.effects)) {
      PLAYER.effects[effectKey] = 0;
    }

    for (const key of Object.keys(PLAYER_BEHAVIOR)) {
      PLAYER_BEHAVIOR[key] = 0;
    }
    PLAYER_BEHAVIOR.samples = 0;
  }

  function restartRun() {
    setUIModal(null);
    setPaused(false);
    GAME.wave = 1;
    GAME.waveTransition = 0;
    GAME.waveReportTimer = 0;
    GAME.roundReportLines = [];
    GAME.statusText = "";
    GAME.statusTimer = 0;
    GAME.saveTimer = 0;
    GAME.tendencyTimer = 0;
    GAME.hitStopTimer = 0;
    GAME.shakeTimer = 0;
    GAME.shakePower = 0;
    GAME.weaponTrails = [];
    GAME.sparks = [];
    GAME.flashes = [];
    GAME.lastSwordTip = null;
    GAME.lastSwordBase = null;
    GAME.adaptationPulse = 0;
    GAME.adaptiveToneCooldown = 0;
    GAME.corpses = [];
    GAME.drops = [];
    GAME.nextDropId = 1;
    GAME.pendingBossReward = null;
    if (healthGainLayerEl) {
      healthGainLayerEl.textContent = "";
    }

    clearEnemies();
    setupMazeForLevel(1);
    resetPlayerForRun();
    WAVE_BEHAVIOR = createEmptyWaveBehavior();

    hideRoundReport();
    hideGameOver();
    spawnWave(1);
  }

  // =============================
  // Input Handling
  // =============================
  function bindInput() {
    window.addEventListener("keydown", (event) => {
      unlockAudio();
      if (isUiModalOpen()) {
        if (event.code === "Escape") {
          event.preventDefault();
        }
        return;
      }
      if (event.code === "Escape") {
        event.preventDefault();
        setPaused(!GAME.paused);
        return;
      }
      KEYS[event.code] = true;
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
        event.preventDefault();
      }

      if (event.code === "KeyR" && PLAYER.isDead) {
        restartRun();
      }

      if (GAME.paused) return;

      if (event.code === "Digit1") {
        usePotion("health_potion");
      }
      if (event.code === "Digit2") {
        usePotion("stamina_potion");
      }
      if (event.code === "Digit3") {
        usePotion("mana_potion");
      }

      if (event.code === "KeyJ") {
        attemptPlayerAttack("light");
      }
      if (event.code === "KeyK") {
        attemptPlayerAttack("heavy");
      }
    });

    window.addEventListener("keyup", (event) => {
      KEYS[event.code] = false;
    });

    canvas.addEventListener("click", () => {
      unlockAudio();
      if (isUiModalOpen()) return;
      if (GAME.paused) {
        setPaused(false, true);
        return;
      }
      if (document.pointerLockElement !== canvas && canvas.requestPointerLock) {
        canvas.requestPointerLock();
      }
      if (!PLAYER.isDead) {
        attemptPlayerAttack("light");
      }
    });

    canvas.addEventListener("contextmenu", (event) => {
      unlockAudio();
      event.preventDefault();
      if (isUiModalOpen()) return;
      if (GAME.paused) {
        setPaused(false, true);
        return;
      }
      if (!PLAYER.isDead) {
        attemptPlayerAttack("heavy");
      }
    });

    document.addEventListener("pointerlockchange", () => {
      pointerLocked = document.pointerLockElement === canvas;
    });

    document.addEventListener("mousemove", (event) => {
      if (!pointerLocked || PLAYER.isDead) return;
      PLAYER.angle += event.movementX * 0.0025;
      PLAYER.angle = normalizeAngle(PLAYER.angle);
    });

    resetLearningBtn.addEventListener("click", () => {
      unlockAudio();
      rlManager.reset();
      GAME.lastAdaptiveSnapshot = null;
      GAME.statusText = "Enemy learning data reset";
      GAME.statusTimer = 2.5;
      refreshTendencyPanel();
      playSfx("adaptive_shift");
    });

    restartBtn.addEventListener("click", () => {
      unlockAudio();
      restartRun();
    });

    if (bossRewardOkBtn) {
      bossRewardOkBtn.addEventListener("click", () => {
        unlockAudio();
        openShopPromptModal();
      });
    }

    if (shopPromptYesBtn) {
      shopPromptYesBtn.addEventListener("click", () => {
        unlockAudio();
        openShopModal();
      });
    }

    if (shopPromptNoBtn) {
      shopPromptNoBtn.addEventListener("click", () => {
        unlockAudio();
        finishBossFlowAndAdvance();
      });
    }

    if (shopCloseBtn) {
      shopCloseBtn.addEventListener("click", () => {
        unlockAudio();
        finishBossFlowAndAdvance();
      });
    }

    window.addEventListener("mousedown", (event) => {
      if (isUiModalOpen()) return;
      if (!GAME.paused) return;
      if (tendencyPanelEl.contains(event.target) || controlsPanelEl.contains(event.target)) {
        return;
      }
      setPaused(false, true);
    });
  }

  bindInput();
  syncPausePanelInteractivity(false);

  // =============================
  // Player Combat and Movement
  // =============================
  function attemptPlayerAttack(type) {
    if (PLAYER.isDead) return;
    if (GAME.paused) return;
    if (GAME.waveTransition > 0) return;
    if (PLAYER.attackCooldown > 0) return;
    if (PLAYER.attack) return;

    const def = ATTACK_DEFS[type];
    if (!def) return;
    const mods = getPlayerModifiers();
    const staminaCost = def.staminaCost * mods.slashStaminaMult;
    const slashSpeed = mods.slashSpeedMult;
    const baseDamage = def.damage * mods.damageMult * (type === "heavy" ? mods.heavyDamageMult : 1);
    if (PLAYER.stamina < staminaCost) return;

    PLAYER.stamina -= staminaCost;
    PLAYER.attackCooldown = def.cooldown / Math.max(0.6, slashSpeed);
    PLAYER.attack = {
      type,
      timer: 0,
      windup: def.windup / slashSpeed,
      active: def.active / slashSpeed,
      recovery: def.recovery / slashSpeed,
      damage: baseDamage,
      range: def.range,
      arc: def.arc,
      slashStyle: "lazy",
      stylePromoted: false,
      hitEnemies: new Set(),
    };
    PLAYER.state = `attack_${type}`;
    PLAYER.recentAction = `attack_${type}`;
    PLAYER.lastAttackTime = PLAYER.survivalTime;

    PLAYER_BEHAVIOR.totalAttacks += 1;
    WAVE_BEHAVIOR.totalAttacks += 1;

    const nearest = getNearestEnemyDistance();
    if (nearest < 1.6) {
      PLAYER_BEHAVIOR.closeAggressiveAttacks += 1;
      WAVE_BEHAVIOR.closeAggressiveAttacks += 1;
    }

    playSfx(type === "heavy" ? "swing_heavy" : "swing_light");
  }

  function getNearestEnemyDistance() {
    let nearest = Infinity;
    for (const enemy of GAME.enemies) {
      const d = distance(PLAYER, enemy);
      if (d < nearest) nearest = d;
    }
    return nearest;
  }

  function attemptDash() {
    if (PLAYER.isDead) return;
    if (PLAYER.dashCooldown > 0 || PLAYER.dashTimer > 0) return;
    const mods = getPlayerModifiers();
    const dashCost = 20 * mods.dashStaminaMult;
    if (PLAYER.stamina < dashCost) return;

    PLAYER.stamina -= dashCost;
    PLAYER.dashCooldown = 0.9;
    PLAYER.dashTimer = 0.16;
    PLAYER.invulnerableTimer = 0.18;
    PLAYER.state = "dashing";
    PLAYER.recentAction = "dodge";

    let moveX = 0;
    let moveY = 0;

    if (KEYS.KeyW) {
      moveX += Math.cos(PLAYER.angle);
      moveY += Math.sin(PLAYER.angle);
    }
    if (KEYS.KeyS) {
      moveX -= Math.cos(PLAYER.angle);
      moveY -= Math.sin(PLAYER.angle);
    }
    if (KEYS.KeyA) {
      moveX += Math.cos(PLAYER.angle - Math.PI / 2);
      moveY += Math.sin(PLAYER.angle - Math.PI / 2);
    }
    if (KEYS.KeyD) {
      moveX += Math.cos(PLAYER.angle + Math.PI / 2);
      moveY += Math.sin(PLAYER.angle + Math.PI / 2);
    }

    if (Math.hypot(moveX, moveY) < 0.01) {
      moveX = Math.cos(PLAYER.angle);
      moveY = Math.sin(PLAYER.angle);
      PLAYER.recentDodgeDirection = "forward";
    } else {
      const rightDot = moveX * Math.cos(PLAYER.angle + Math.PI / 2) + moveY * Math.sin(PLAYER.angle + Math.PI / 2);
      const forwardDot = moveX * Math.cos(PLAYER.angle) + moveY * Math.sin(PLAYER.angle);
      if (rightDot > 0.2) {
        PLAYER.recentDodgeDirection = "right";
        PLAYER_BEHAVIOR.dodgesRight += 1;
        WAVE_BEHAVIOR.dodgesRight += 1;
      } else if (rightDot < -0.2) {
        PLAYER.recentDodgeDirection = "left";
        PLAYER_BEHAVIOR.dodgesLeft += 1;
        WAVE_BEHAVIOR.dodgesLeft += 1;
      } else if (forwardDot < -0.2) {
        PLAYER.recentDodgeDirection = "back";
        PLAYER_BEHAVIOR.dodgesBack += 1;
        WAVE_BEHAVIOR.dodgesBack += 1;
      } else {
        PLAYER.recentDodgeDirection = "forward";
      }
    }

    PLAYER.recentDodgeTimer = 1.2;
  }

  function updatePlayer(dt) {
    if (PLAYER.isDead) return;

    updatePlayerEffectTimers(dt);
    const mods = getPlayerModifiers();
    PLAYER.survivalTime += dt;
    PLAYER.attackCooldown = Math.max(0, PLAYER.attackCooldown - dt);
    PLAYER.dashCooldown = Math.max(0, PLAYER.dashCooldown - dt);
    PLAYER.invulnerableTimer = Math.max(0, PLAYER.invulnerableTimer - dt);
    PLAYER.recentDodgeTimer = Math.max(0, PLAYER.recentDodgeTimer - dt);

    if (PLAYER.recentDodgeTimer <= 0) {
      PLAYER.recentDodgeDirection = "none";
    }

    const blockPressed = !!(KEYS.ShiftLeft || KEYS.ShiftRight);
    if (blockPressed && PLAYER.stamina > 2 && !PLAYER.attack && PLAYER.dashTimer <= 0) {
      if (!PLAYER.blockHeld) {
        PLAYER.parryTimer = 0.15 * mods.parryWindowMult;
        PLAYER_BEHAVIOR.totalBlocks += 1;
        WAVE_BEHAVIOR.totalBlocks += 1;
        if (PLAYER.survivalTime - PLAYER.lastAttackTime < 0.7) {
          PLAYER_BEHAVIOR.blockAfterAttack += 1;
          WAVE_BEHAVIOR.blockAfterAttack += 1;
        }
      }
      PLAYER.blockHeld = true;
      PLAYER.blockTimer += dt;
      PLAYER.stamina = Math.max(0, PLAYER.stamina - 14 * dt);
      PLAYER.state = "blocking";
      PLAYER.recentAction = "blocking";
    } else {
      PLAYER.blockHeld = false;
      PLAYER.blockTimer = 0;
    }

    PLAYER.parryTimer = Math.max(0, PLAYER.parryTimer - dt);

    if (KEYS.Space) {
      attemptDash();
    }

    let forwardInput = 0;
    let strafeInput = 0;

    if (KEYS.KeyW) forwardInput += 1;
    if (KEYS.KeyS) forwardInput -= 1;
    if (KEYS.KeyD) strafeInput += 1;
    if (KEYS.KeyA) strafeInput -= 1;

    if (KEYS.ArrowLeft) PLAYER.angle -= PLAYER.turnSpeed * dt;
    if (KEYS.ArrowRight) PLAYER.angle += PLAYER.turnSpeed * dt;
    PLAYER.angle = normalizeAngle(PLAYER.angle);

    if (PLAYER.dashTimer > 0) {
      PLAYER.dashTimer -= dt;
      const dashSpeed = 7.3 * mods.speedMult;
      let dashX = Math.cos(PLAYER.angle);
      let dashY = Math.sin(PLAYER.angle);
      if (Math.abs(forwardInput) + Math.abs(strafeInput) > 0.01) {
        const moveAngle = PLAYER.angle + Math.atan2(strafeInput, forwardInput || 1);
        dashX = Math.cos(moveAngle);
        dashY = Math.sin(moveAngle);
      }
      PLAYER.vx = dashX * dashSpeed;
      PLAYER.vy = dashY * dashSpeed;
      moveEntity(PLAYER, PLAYER.vx * dt, PLAYER.vy * dt);
    } else {
      let moveX = 0;
      let moveY = 0;
      moveX += Math.cos(PLAYER.angle) * forwardInput;
      moveY += Math.sin(PLAYER.angle) * forwardInput;
      moveX += Math.cos(PLAYER.angle + Math.PI / 2) * strafeInput;
      moveY += Math.sin(PLAYER.angle + Math.PI / 2) * strafeInput;

      const len = Math.hypot(moveX, moveY);
      if (len > 0.01) {
        moveX /= len;
        moveY /= len;
        const speedScale = PLAYER.blockHeld ? 0.6 : PLAYER.attack ? 0.72 : 1;
        PLAYER.vx = moveX * PLAYER.speed * mods.speedMult * speedScale;
        PLAYER.vy = moveY * PLAYER.speed * mods.speedMult * speedScale;
        moveEntity(PLAYER, PLAYER.vx * dt, PLAYER.vy * dt);
      } else {
        PLAYER.vx = 0;
        PLAYER.vy = 0;
      }

      if (!PLAYER.attack && !PLAYER.blockHeld) {
        PLAYER.state = len > 0.01 ? "moving" : "idle";
        PLAYER.recentAction = len > 0.01 && forwardInput < -0.2 ? "retreating" : len > 0.01 ? "moving" : "idle";
      }
    }

    if (PLAYER.recentAction === "retreating") {
      PLAYER_BEHAVIOR.retreatMoments += dt;
      WAVE_BEHAVIOR.retreatMoments += dt;
    }

    updatePlayerAttack(dt);

    const regenRate = PLAYER.blockHeld ? 8 : PLAYER.attack || PLAYER.dashTimer > 0 ? 12 : 24;
    PLAYER.stamina = clamp(PLAYER.stamina + regenRate * dt, 0, PLAYER.maxStamina);
    PLAYER.mana = clamp(PLAYER.mana + 8 * dt, 0, PLAYER.maxMana);

    PLAYER_BEHAVIOR.samples += dt;
    WAVE_BEHAVIOR.samples += dt;
  }

  function updatePlayerAttack(dt) {
    const atk = PLAYER.attack;
    if (!atk) return;

    atk.timer += dt;

    const activeStart = atk.windup;
    const activeEnd = atk.windup + atk.active;

    if (atk.timer >= activeStart && atk.timer <= activeEnd) {
      resolvePlayerAttackHits(atk);
    }

    if (atk.timer >= atk.windup + atk.active + atk.recovery) {
      PLAYER.attack = null;
      if (!PLAYER.blockHeld && PLAYER.state.startsWith("attack")) {
        PLAYER.state = "idle";
      }
    }
  }

  function resolvePlayerAttackHits(attack) {
    for (const enemy of [...GAME.enemies]) {
      if (attack.hitEnemies.has(enemy.id)) continue;

      const dx = enemy.x - PLAYER.x;
      const dy = enemy.y - PLAYER.y;
      const dist = Math.hypot(dx, dy);
      if (dist > attack.range + enemy.radius) continue;

      const angleToEnemy = Math.atan2(dy, dx);
      const diff = Math.abs(angleDiff(angleToEnemy, PLAYER.angle));
      if (diff > attack.arc / 2) continue;

      if (!hasLineOfSight(PLAYER.x, PLAYER.y, enemy.x, enemy.y)) continue;

      let damage = attack.damage;
      const pan = panFromWorld(enemy.x, enemy.y);
      if (enemy.blockTimer > 0) {
        damage *= 0.34;
        rewardEnemy(enemy, 0.18);
        enemy.parryFlash = Math.max(enemy.parryFlash, 0.1);
        pushSparkAtWorld(enemy.x, enemy.y, "255,186,71", 7, 0.75);
        playSfx("block", pan);
      }

      enemy.health -= damage;
      enemy.lastDamageTime = PLAYER.survivalTime;
      attack.hitEnemies.add(enemy.id);
      if (!attack.stylePromoted) {
        attack.stylePromoted = true;
        attack.slashStyle = HIT_SLASH_STYLES[PLAYER.slashPatternIndex];
        PLAYER.slashPatternIndex = (PLAYER.slashPatternIndex + 1) % HIT_SLASH_STYLES.length;
      }
      enemy.hitFlash = 0.16;
      enemy.staggerTimer = Math.max(enemy.staggerTimer, attack.type === "heavy" ? 0.32 : 0.14);
      if (attack.type === "heavy") {
        enemy.stunTimer = Math.max(enemy.stunTimer, 0.18);
      }

      enemy.rl.lifetimeStats.damageTaken += damage;
      rewardEnemy(enemy, -1.25 * (damage / 14));

      PLAYER.score += Math.round(damage * 3);
      pushSparkAtWorld(enemy.x, enemy.y, attack.type === "heavy" ? "255,204,112" : "255,186,71", attack.type === "heavy" ? 14 : 9, attack.type === "heavy" ? 1.3 : 1);
      pushFlash("255,255,255", attack.type === "heavy" ? 0.12 : 0.07, attack.type === "heavy" ? 0.06 : 0.04);
      triggerShake(attack.type === "heavy" ? 6 : 3.2, attack.type === "heavy" ? 0.14 : 0.08);
      triggerHitStop(attack.type === "heavy" ? 0.065 : 0.038);
      playSfx("hit", pan);

      if (enemy.health <= 0) {
        killEnemy(enemy, true);
      }
    }
  }

  function dealDamageToPlayer(amount, sourceEnemy) {
    const pan = panFromWorld(sourceEnemy.x, sourceEnemy.y);
    const mods = getPlayerModifiers();
    const adjustedAmount = amount * mods.incomingDamageMult;
    if (PLAYER.invulnerableTimer > 0) {
      rewardEnemy(sourceEnemy, -0.25);
      return false;
    }

    if (PLAYER.blockHeld) {
      if (PLAYER.parryTimer > 0) {
        sourceEnemy.stunTimer = 0.75;
        sourceEnemy.state = "stunned";
        sourceEnemy.attackIntent = null;
        sourceEnemy.parryFlash = 0.18;
        rewardEnemy(sourceEnemy, -1.8);
        PLAYER.stamina = clamp(PLAYER.stamina + 12, 0, PLAYER.maxStamina);
        PLAYER.recentAction = "parry";
        pushSparkAtWorld(sourceEnemy.x, sourceEnemy.y, "255,224,150", 16, 1.35);
        pushFlash("255,245,220", 0.2, 0.08);
        triggerShake(6.5, 0.13);
        triggerHitStop(0.07);
        playSfx("parry", pan);
        return false;
      }

      const staminaDamage = adjustedAmount * 1.2;
      PLAYER.stamina = Math.max(0, PLAYER.stamina - staminaDamage);
      const chip = adjustedAmount * 0.25;
      PLAYER.health -= chip;
      PLAYER.recentAction = "blocking";
      rewardEnemy(sourceEnemy, 0.18);
      pushSparkAtWorld(sourceEnemy.x, sourceEnemy.y, "255,186,71", 8, 0.9);
      playSfx("block", pan);
      return true;
    }

    PLAYER.health -= adjustedAmount;
    PLAYER.recentAction = "hit";
    pushFlash("143,31,31", clamp(adjustedAmount / 42, 0.08, 0.22), 0.08);
    triggerShake(clamp(adjustedAmount / 3.4, 2.8, 8), 0.14);
    playSfx("hit", pan);
    return true;
  }

  // =============================
  // Enemy State Machine + Combat
  // =============================
  function updateEnemy(enemy, dt) {
    if (PLAYER.isDead) return;

    enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
    enemy.blockTimer = Math.max(0, enemy.blockTimer - dt);
    enemy.stunTimer = Math.max(0, enemy.stunTimer - dt);
    enemy.attackFlash = Math.max(0, enemy.attackFlash - dt);
    enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
    enemy.parryFlash = Math.max(0, enemy.parryFlash - dt);
    enemy.staggerTimer = Math.max(0, enemy.staggerTimer - dt);
    enemy.alertTimer = Math.max(0, enemy.alertTimer - dt);

    rewardEnemy(enemy, 0.025 * dt); // survival incentive

    const toPlayer = Math.atan2(PLAYER.y - enemy.y, PLAYER.x - enemy.x);
    enemy.angle = normalizeAngle(enemy.angle + clamp(angleDiff(toPlayer, enemy.angle), -dt * 4.8, dt * 4.8));

    if (enemy.stunTimer > 0) {
      enemy.state = "stunned";
      rewardEnemy(enemy, -0.02 * dt);
      return;
    }

    enemy.decisionTimer -= dt;
    if (enemy.decisionTimer <= 0) {
      makeEnemyDecision(enemy);
    }

    updateEnemyAction(enemy, dt);
  }

  function makeEnemyDecision(enemy) {
    const stateKey = buildEnemyStateKey(enemy);

    commitEnemyTransition(enemy, stateKey);

    const action = chooseEnemyAction(enemy, stateKey);
    enemy.action = action;
    enemy.state = action;
    enemy.lastStateKey = stateKey;
    enemy.lastAction = action;
    enemy.actionTimer = randRange(0.16, 0.46);
    enemy.decisionTimer = clamp(enemy.reactionDelay + randRange(0.06, 0.18), 0.14, 0.65);
    if (action !== "wait") {
      enemy.alertTimer = 0.16;
    }

    enemy.rl.lifetimeActions[action] += 1;
    WAVE_BEHAVIOR.actionCounts[enemy.archetype][action] += 1;

    if (action === "block") {
      enemy.blockTimer = randRange(0.26, 0.48);
    }

    if (action === "light_attack") {
      queueEnemyAttack(enemy, "light", 0);
    } else if (action === "heavy_attack") {
      queueEnemyAttack(enemy, "heavy", randRange(0.02, 0.08));
    } else if (action === "delay_attack") {
      queueEnemyAttack(enemy, Math.random() < 0.7 ? "light" : "heavy", randRange(0.22, 0.45));
    } else if (action === "feint") {
      enemy.feinting = true;
      queueEnemyAttack(enemy, "light", randRange(0.08, 0.14));
    } else if (action === "bait_parry") {
      enemy.feinting = true;
      queueEnemyAttack(enemy, "heavy", randRange(0.2, 0.32));
    } else if (action === "punish_dodge") {
      if (PLAYER.recentDodgeTimer > 0.05) {
        queueEnemyAttack(enemy, "light", 0.04);
      }
    }
  }

  function queueEnemyAttack(enemy, type, extraDelay) {
    if (enemy.attackCooldown > 0) return;
    const totalTimer = ENEMY_ATTACK_DEFS[type].windup + extraDelay;
    enemy.attackIntent = {
      type,
      timer: totalTimer,
      totalTimer,
      axis: Math.random() < 0.5 ? "diag_low" : "diag_high",
      didHit: false,
      startedAt: PLAYER.survivalTime,
    };
    enemy.state = `attack_${type}`;
  }

  function updateEnemyAction(enemy, dt) {
    if (!enemy.attackIntent && enemy.actionTimer > 0) {
      enemy.actionTimer -= dt;
    }

    if (enemy.staggerTimer > 0) {
      enemy.vx = 0;
      enemy.vy = 0;
      return;
    }

    const dx = PLAYER.x - enemy.x;
    const dy = PLAYER.y - enemy.y;
    const dist = Math.hypot(dx, dy);
    const los = hasLineOfSight(enemy.x, enemy.y, PLAYER.x, PLAYER.y);

    let moveDirX = 0;
    let moveDirY = 0;
    let moveSpeed = enemy.speed;

    switch (enemy.action) {
      case "advance":
        moveDirX = dx;
        moveDirY = dy;
        break;
      case "retreat":
        moveDirX = -dx;
        moveDirY = -dy;
        break;
      case "strafe_left":
        moveDirX = -dy;
        moveDirY = dx;
        moveSpeed *= 0.95;
        break;
      case "strafe_right":
        moveDirX = dy;
        moveDirY = -dx;
        moveSpeed *= 0.95;
        break;
      case "punish_dodge":
        moveDirX = dx;
        moveDirY = dy;
        moveSpeed *= PLAYER.recentDodgeTimer > 0 ? 1.35 : 1.05;
        break;
      case "delay_attack":
        moveDirX = dx;
        moveDirY = dy;
        moveSpeed *= 0.72;
        break;
      case "feint":
      case "bait_parry":
        moveDirX = dx;
        moveDirY = dy;
        moveSpeed *= 0.85;
        if (dist < 1.15) {
          moveDirX = -dx;
          moveDirY = -dy;
          moveSpeed *= 1.08;
        }
        break;
      case "block":
      case "wait":
      default:
        break;
    }

    if (!los) {
      // Simple pathing correction: strafe around obstacles while maintaining 2D logic.
      moveDirX = -dy;
      moveDirY = dx;
      moveSpeed *= 0.7;
    }

    if (dist < 0.8 && enemy.action === "advance") {
      moveDirX = -dx;
      moveDirY = -dy;
      moveSpeed *= 0.75;
    }

    if (enemy.attackIntent) {
      enemy.attackIntent.timer -= dt;
      moveSpeed *= 0.45;
      if (enemy.attackIntent.timer <= 0) {
        resolveEnemyAttack(enemy);
        enemy.attackIntent = null;
      }
    }

    if (Math.hypot(moveDirX, moveDirY) > 0.001) {
      moveEntityWithPathing(enemy, moveDirX, moveDirY, moveSpeed, dt);
    } else {
      enemy.vx = 0;
      enemy.vy = 0;
    }

    if (enemy.actionTimer <= 0 && !enemy.attackIntent) {
      enemy.action = "wait";
      enemy.state = "idle";
    }
  }

  function resolveEnemyAttack(enemy) {
    const intent = enemy.attackIntent;
    if (!intent) return;

    const def = ENEMY_ATTACK_DEFS[intent.type];
    enemy.attackCooldown = def.cooldown;
    enemy.attackFlash = intent.type === "heavy" ? 0.2 : 0.14;
    playSfx(intent.type === "heavy" ? "swing_heavy" : "swing_light", panFromWorld(enemy.x, enemy.y));

    const dx = PLAYER.x - enemy.x;
    const dy = PLAYER.y - enemy.y;
    const dist = Math.hypot(dx, dy);

    const toPlayerAngle = Math.atan2(dy, dx);
    const facingDiff = Math.abs(angleDiff(toPlayerAngle, enemy.angle));

    const inRange = dist <= def.range + PLAYER.radius;
    const inArc = facingDiff <= def.arc / 2;
    const visible = hasLineOfSight(enemy.x, enemy.y, PLAYER.x, PLAYER.y);

    if (inRange && inArc && visible) {
      const bossMultiplier = enemy.isBoss ? 1.45 : 1;
      const baseDamage = def.damage * (1 + Math.min(0.5, (GAME.wave - 1) * 0.04)) * bossMultiplier;
      const didDamage = dealDamageToPlayer(baseDamage, enemy);
      if (didDamage) {
        intent.didHit = true;
        rewardEnemy(enemy, 2.2 * (baseDamage / 15));
        enemy.rl.lifetimeStats.hitsLanded += 1;
        enemy.rl.lifetimeStats.damageDealt += baseDamage;
        PLAYER.score = Math.max(0, PLAYER.score - Math.round(baseDamage * 2));
      }
    }

    if (!intent.didHit) {
      rewardEnemy(enemy, -0.42);
      if (enemy.feinting && PLAYER.parryTimer > 0) {
        rewardEnemy(enemy, 0.46);
      }
    }

    if (PLAYER.recentDodgeTimer > 0 && intent.didHit) {
      rewardEnemy(enemy, 0.52);
    }

    enemy.feinting = false;
  }

  function killEnemy(enemy, killedByPlayer) {
    const idx = GAME.enemies.findIndex((e) => e.id === enemy.id);
    if (idx === -1) return;

    const terminalState = "terminal";
    rewardEnemy(enemy, -2.2);
    commitEnemyTransition(enemy, terminalState);

    enemy.rl.lifetimeStats.deaths += 1;

    if (killedByPlayer) {
      PLAYER.kills += 1;
      PLAYER.score += 100;
      if (!enemy.isBoss) {
        spawnDropsForEnemy(enemy);
      } else {
        GAME.bossDefeatedThisWave = true;
        GAME.statusText = `${enemy.name || "Boss"} eliminated`;
        GAME.statusTimer = 2.4;
      }
    }

    GAME.corpses.push({
      x: enemy.x,
      y: enemy.y,
      archetype: enemy.archetype,
      timer: 0.35,
      maxTimer: 0.35,
      spin: randRange(-0.28, 0.28),
    });
    pushSparkAtWorld(enemy.x, enemy.y, "255,132,92", 14, 1.2);
    playSfx("enemy_death", panFromWorld(enemy.x, enemy.y));
    GAME.enemies.splice(idx, 1);
  }

  // =============================
  // Wave Reports and Tendencies
  // =============================
  function totalActions(actionMap) {
    let total = 0;
    for (const action of ACTIONS) total += actionMap[action] || 0;
    return total;
  }

  function topAction(actionMap, fallback = "wait") {
    let bestAction = fallback;
    let bestValue = -Infinity;
    for (const action of ACTIONS) {
      const value = actionMap[action] || 0;
      if (value > bestValue) {
        bestValue = value;
        bestAction = action;
      }
    }
    return bestAction;
  }

  function describePunishPreference(actionMap) {
    const punish = actionMap.punish_dodge || 0;
    const bait = actionMap.bait_parry || 0;
    const heavy = actionMap.heavy_attack || 0;

    if (punish >= bait && punish >= heavy) return "dodge punish";
    if (bait >= punish && bait >= heavy) return "parry bait";
    return "heavy punish";
  }

  function computeArchetypeTendency(archetypeName) {
    const model = rlManager.getModel(archetypeName);
    const actions = model.lifetimeActions;
    const total = totalActions(actions) + 1;

    const attackDrive =
      (actions.advance + actions.light_attack + actions.heavy_attack + actions.punish_dodge) / total;
    const spacingDrive =
      (actions.retreat + actions.strafe_left + actions.strafe_right + actions.wait) / total;

    const aggression = clamp(attackDrive * 1.35, 0, 1);
    const spacing = spacingDrive > attackDrive ? "outside spacing" : "close pressure";
    const reactionDelay = clamp(ARCHETYPES[archetypeName].reactionDelay * (1 - (1 - model.epsilon) * 0.34), 0.14, 0.5);
    const punish = describePunishPreference(actions);

    return {
      aggression,
      spacing,
      reactionDelay,
      punish,
      epsilon: model.epsilon,
      topAction: topAction(actions),
    };
  }

  function getObservedHabitText() {
    const totalDodges = PLAYER_BEHAVIOR.dodgesLeft + PLAYER_BEHAVIOR.dodgesRight + PLAYER_BEHAVIOR.dodgesBack;
    const closeRatio = PLAYER_BEHAVIOR.closeAggressiveAttacks / Math.max(1, PLAYER_BEHAVIOR.totalAttacks);
    const blockAfterRatio = PLAYER_BEHAVIOR.blockAfterAttack / Math.max(1, PLAYER_BEHAVIOR.totalBlocks);

    if (totalDodges > 6) {
      if (PLAYER_BEHAVIOR.dodgesLeft > PLAYER_BEHAVIOR.dodgesRight + 1) return "Most observed habit: early left dodge bias";
      if (PLAYER_BEHAVIOR.dodgesRight > PLAYER_BEHAVIOR.dodgesLeft + 1) return "Most observed habit: right-side evasive dodges";
      if (PLAYER_BEHAVIOR.dodgesBack > Math.max(PLAYER_BEHAVIOR.dodgesLeft, PLAYER_BEHAVIOR.dodgesRight)) {
        return "Most observed habit: backward disengage on pressure";
      }
    }

    if (closeRatio > 0.58 && PLAYER_BEHAVIOR.totalAttacks > 7) {
      return "Most observed habit: aggressive close-range attack commitments";
    }

    if (blockAfterRatio > 0.4 && PLAYER_BEHAVIOR.totalBlocks > 4) {
      return "Most observed habit: guard raised immediately after swings";
    }

    if (PLAYER_BEHAVIOR.retreatMoments > 14) {
      return "Most observed habit: repeated retreat spacing resets";
    }

    return "Most observed habit: mixed pattern, model still exploring";
  }

  function computeGlobalTendencyMetrics() {
    let attackWeight = 0;
    let spacingWeight = 0;
    let parryWeight = 0;
    let punishWeight = 0;
    let total = 0;
    let epsilonSum = 0;
    const modelNames = Object.keys(ARCHETYPES);

    for (const archetypeName of modelNames) {
      const actions = rlManager.getModel(archetypeName).lifetimeActions;
      const actionTotal = totalActions(actions) + 1;
      total += actionTotal;

      attackWeight += actions.advance + actions.light_attack + actions.heavy_attack + actions.punish_dodge;
      spacingWeight += actions.retreat + actions.strafe_left + actions.strafe_right + actions.wait;
      parryWeight += actions.block + actions.bait_parry + actions.feint * 0.35;
      punishWeight += actions.punish_dodge + actions.delay_attack + actions.bait_parry;
      epsilonSum += rlManager.getModel(archetypeName).epsilon;
    }

    const aggression = clamp(attackWeight / Math.max(1, total), 0, 1);
    const spacing = clamp(spacingWeight / Math.max(1, total), 0, 1);
    const parry = clamp(parryWeight / Math.max(1, total), 0, 1);
    const punish = clamp(punishWeight / Math.max(1, total), 0, 1);
    const confidence = clamp(1 - epsilonSum / Math.max(1, modelNames.length), 0, 1);

    return { aggression, spacing, parry, punish, confidence };
  }

  function setMeter(meterEl, valueEl, ratio) {
    const pct = Math.round(clamp(ratio, 0, 1) * 100);
    meterEl.style.width = `${pct}%`;
    valueEl.textContent = `${pct}%`;
  }

  function generateWaveReport() {
    const lines = [];

    const totalDodges = WAVE_BEHAVIOR.dodgesLeft + WAVE_BEHAVIOR.dodgesRight + WAVE_BEHAVIOR.dodgesBack;
    if (totalDodges >= 3) {
      if (WAVE_BEHAVIOR.dodgesLeft > WAVE_BEHAVIOR.dodgesRight + 1) {
        lines.push("Player tends to dodge left; enemies shifted to dodge punish timings.");
      } else if (WAVE_BEHAVIOR.dodgesRight > WAVE_BEHAVIOR.dodgesLeft + 1) {
        lines.push("Player favors right-side dodges; enemies increased right-tracking attacks.");
      } else {
        lines.push("Player dodge directions are mixed; enemies kept broader spacing checks.");
      }
    }

    if (WAVE_BEHAVIOR.totalAttacks >= 5) {
      const closeRatio = WAVE_BEHAVIOR.closeAggressiveAttacks / Math.max(1, WAVE_BEHAVIOR.totalAttacks);
      if (closeRatio > 0.58) {
        lines.push("Player attacks aggressively in close range; enemy block and feint rates rose.");
      } else {
        lines.push("Player attacks selectively at range; enemies pushed more advance actions.");
      }
    }

    if (WAVE_BEHAVIOR.totalBlocks >= 3) {
      const blockAfterAttackRatio = WAVE_BEHAVIOR.blockAfterAttack / Math.max(1, WAVE_BEHAVIOR.totalBlocks);
      if (blockAfterAttackRatio > 0.42) {
        lines.push("Player blocks often after attacking; enemies increased bait-parry choices.");
      }
    }

    for (const [archetypeName, actionCounts] of Object.entries(WAVE_BEHAVIOR.actionCounts)) {
      const total = totalActions(actionCounts);
      if (total < 6) continue;

      const archetypeLabel = ARCHETYPES[archetypeName].label;
      const favorite = topAction(actionCounts);
      const readable = favorite.replace(/_/g, " ");
      lines.push(`${archetypeLabel} leaned toward ${readable} this wave.`);
    }

    if (lines.length === 0) {
      lines.push("Enemies gathered limited data this wave and retained broad exploration.");
    }

    return lines.slice(0, 6);
  }

  function showRoundReport(lines) {
    reportListEl.textContent = "";
    for (const line of lines) {
      const li = document.createElement("li");
      li.textContent = line;
      reportListEl.appendChild(li);
    }
    reportPanelEl.classList.remove("hidden");
  }

  function hideRoundReport() {
    reportPanelEl.classList.add("hidden");
  }

  function showGameOver() {
    gameOverMetaEl.textContent = `Wave ${GAME.wave} | Score ${PLAYER.score} | Survival ${PLAYER.survivalTime.toFixed(1)}s`;
    gameOverEl.classList.remove("hidden");
  }

  function hideGameOver() {
    gameOverEl.classList.add("hidden");
  }

  function calculateBossRewards(waveNumber) {
    const gold = Math.round(180 + waveNumber * 46 + Math.random() * 40);
    const tokens = waveNumber % 10 === 0 ? 2 : 1;
    return { gold, tokens };
  }

  function openBossRewardModal() {
    if (!GAME.pendingBossReward) return;
    const reward = GAME.pendingBossReward;
    if (bossRewardTextEl) {
      bossRewardTextEl.textContent =
        `${reward.bossName} fell. You received ${reward.gold} gold and ${reward.tokens} boss token${reward.tokens > 1 ? "s" : ""}.`;
    }
    setUIModal("boss_reward");
  }

  function openShopPromptModal() {
    setUIModal("shop_prompt");
  }

  function openShopModal() {
    GAME.shopBanterLine = SHOP_BANTER_LINES[Math.floor(Math.random() * SHOP_BANTER_LINES.length)];
    refreshShopUI();
    setUIModal("shop");
  }

  function startWaveTransitionToNext() {
    GAME.waveReportTimer = 4;
    GAME.waveTransition = 4;
    GAME.wave += 1;
    setupMazeForLevel(GAME.wave);
    PLAYER.x = START_POS.x;
    PLAYER.y = START_POS.y;
    PLAYER.angle = 0;
    PLAYER.attack = null;
    PLAYER.dashTimer = 0;
    PLAYER.blockHeld = false;
    PLAYER.stamina = clamp(PLAYER.stamina + 24, 0, PLAYER.maxStamina);
    PLAYER.mana = clamp(PLAYER.mana + 24, 0, PLAYER.maxMana);
    PLAYER.health = PLAYER.maxHealth;
    GAME.corpses = [];
    GAME.drops = [];
    GAME.adaptationPulse = 1.1;
    playSfx("adaptive_shift");
  }

  function finishBossFlowAndAdvance() {
    setUIModal(null);
    GAME.pendingBossReward = null;
    startWaveTransitionToNext();
  }

  function refreshTendencyPanel() {
    tendencyListEl.textContent = "";
    const metrics = computeGlobalTendencyMetrics();
    setMeter(aggressionMeterEl, aggressionValueEl, metrics.aggression);
    setMeter(spacingMeterEl, spacingValueEl, metrics.spacing);
    setMeter(parryMeterEl, parryValueEl, metrics.parry);
    setMeter(punishMeterEl, punishValueEl, metrics.punish);
    setMeter(confidenceMeterEl, confidenceValueEl, metrics.confidence);
    observedHabitEl.textContent = getObservedHabitText();

    if (GAME.lastAdaptiveSnapshot) {
      const prev = GAME.lastAdaptiveSnapshot;
      const shift =
        Math.abs(prev.aggression - metrics.aggression) +
        Math.abs(prev.spacing - metrics.spacing) +
        Math.abs(prev.parry - metrics.parry) +
        Math.abs(prev.punish - metrics.punish);
      if (shift > 0.22) {
        GAME.adaptationPulse = 0.8;
        if (GAME.adaptiveToneCooldown <= 0) {
          playSfx("adaptive_shift");
          GAME.adaptiveToneCooldown = 4;
        }
      }
    }
    GAME.lastAdaptiveSnapshot = metrics;

    for (const archetypeName of Object.keys(ARCHETYPES)) {
      const tendency = computeArchetypeTendency(archetypeName);
      const li = document.createElement("li");
      const label = ARCHETYPES[archetypeName].label;
      li.textContent = `${label}: ${tendency.topAction.replace(/_/g, " ")} focus, ${tendency.spacing}, react ${tendency.reactionDelay.toFixed(2)}s, ${tendency.punish}.`;
      tendencyListEl.appendChild(li);
    }
  }

  function finishWave() {
    rlManager.decayExploration();
    rlManager.save();

    for (const model of Object.values(rlManager.models)) {
      model.lifetimeStats.rounds += 1;
    }

    const lines = generateWaveReport();
    GAME.roundReportLines = lines;
    showRoundReport(lines);

    if (GAME.levelType === "boss") {
      const reward = calculateBossRewards(GAME.wave);
      GAME.pendingBossReward = {
        ...reward,
        bossName: GAME.currentBossProfile ? GAME.currentBossProfile.displayName : "Arena Tyrant",
      };
      gainCurrencies(reward.gold, reward.tokens);
      saveShopProgression();
      openBossRewardModal();
    } else {
      startWaveTransitionToNext();
    }

    refreshTendencyPanel();
  }

  // =============================
  // HUD
  // =============================
  function updateHUD() {
    const healthRatio = clamp(PLAYER.health / PLAYER.maxHealth, 0, 1);
    const staminaRatio = clamp(PLAYER.stamina / PLAYER.maxStamina, 0, 1);

    healthBarEl.style.width = `${healthRatio * 100}%`;
    staminaBarEl.style.width = `${staminaRatio * 100}%`;

    healthTextEl.textContent = `${Math.max(0, Math.round(PLAYER.health))} / ${PLAYER.maxHealth}`;
    staminaTextEl.textContent = `${Math.max(0, Math.round(PLAYER.stamina))} / ${PLAYER.maxStamina}`;

    waveValueEl.textContent = String(GAME.wave);
    scoreValueEl.textContent = String(Math.round(PLAYER.score));
    timeValueEl.textContent = `${PLAYER.survivalTime.toFixed(1)}s | Mana ${Math.round(PLAYER.mana)}`;

    if (goldValueEl) goldValueEl.textContent = String(Math.round(GAME.currencyGold));
    if (bossTokenValueEl) bossTokenValueEl.textContent = String(Math.round(GAME.bossTokens));
    if (inventoryCountValueEl) inventoryCountValueEl.textContent = String(totalInventoryCount());

    if (perkStackValueEl && perkDetailValueEl) {
      const active = [];
      if (PLAYER.effects.rusher > 0) {
        active.push(`Rusher: move x1.30, slash stamina x0.80`);
      }
      if (PLAYER.effects.duelist > 0) {
        active.push(`Duelist: slash speed x1.30, slash stamina x0.70`);
      }
      if (PLAYER.effects.brute > 0) {
        active.push(`Brute: damage x1.30, slash stamina x0.70`);
      }
      if (PLAYER.effects.counter > 0) {
        active.push(`Counter: damage taken x0.80, parry speed x1.30`);
      }
      perkStackValueEl.textContent = `Multiplier Stack x${active.length}`;
      perkDetailValueEl.textContent = active.length > 0 ? active.join(" | ") : "No active multipliers";
    }
  }

  // =============================
  // Raycasting Renderer
  // =============================
  function castRay(rayAngle) {
    const cos = Math.cos(rayAngle);
    const sin = Math.sin(rayAngle);

    let mapX = Math.floor(PLAYER.x);
    let mapY = Math.floor(PLAYER.y);

    const deltaDistX = Math.abs(1 / (cos || 1e-6));
    const deltaDistY = Math.abs(1 / (sin || 1e-6));

    let stepX;
    let stepY;
    let sideDistX;
    let sideDistY;

    if (cos < 0) {
      stepX = -1;
      sideDistX = (PLAYER.x - mapX) * deltaDistX;
    } else {
      stepX = 1;
      sideDistX = (mapX + 1 - PLAYER.x) * deltaDistX;
    }

    if (sin < 0) {
      stepY = -1;
      sideDistY = (PLAYER.y - mapY) * deltaDistY;
    } else {
      stepY = 1;
      sideDistY = (mapY + 1 - PLAYER.y) * deltaDistY;
    }

    let side = 0;
    let hit = false;

    while (!hit) {
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        mapX += stepX;
        side = 0;
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = 1;
      }

      if (mapX < 0 || mapY < 0 || mapX >= MAP_WIDTH || mapY >= MAP_HEIGHT) {
        break;
      }

      if (MAP[mapY][mapX] > 0) {
        hit = true;
      }

      if (!hit) {
        const est = Math.min(sideDistX, sideDistY);
        if (est > CAMERA.maxDepth) break;
      }
    }

    let perpDist = CAMERA.maxDepth;
    if (hit) {
      if (side === 0) {
        perpDist = (mapX - PLAYER.x + (1 - stepX) / 2) / (cos || 1e-6);
      } else {
        perpDist = (mapY - PLAYER.y + (1 - stepY) / 2) / (sin || 1e-6);
      }
    }

    perpDist = clamp(perpDist, 0.001, CAMERA.maxDepth);

    const hitX = PLAYER.x + cos * perpDist;
    const hitY = PLAYER.y + sin * perpDist;

    return {
      distance: perpDist,
      side,
      hit,
      hitX,
      hitY,
    };
  }

  function renderSkyAndFloor(width, height) {
    const t = performance.now() * 0.001;
    const horizon = height * 0.46;
    if (!MAZE_THEME) {
      ctx.fillStyle = "#0b1017";
      ctx.fillRect(0, 0, width, height);
      return;
    }

    if (MAZE_THEME.skyMode === "black") {
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(0, 0, width, horizon + 2);
    } else {
      ctx.fillStyle = MAZE_THEME.skyBase;
      ctx.fillRect(0, 0, width, horizon + 2);
      for (let i = 0; i < MAZE_THEME.stars.length; i += 1) {
        const star = MAZE_THEME.stars[i];
        const pulse = 0.7 + 0.3 * Math.sin(t * (1.8 + (i % 5) * 0.32) + i * 0.84);
        ctx.fillStyle = star.color.replace(", 1)", `, ${star.alpha * pulse})`);
        ctx.fillRect(star.x * width, star.y * horizon, star.size, star.size);
      }
    }

    const skyFade = ctx.createLinearGradient(0, 0, 0, horizon);
    skyFade.addColorStop(0, "rgba(0,0,0,0)");
    skyFade.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = skyFade;
    ctx.fillRect(0, 0, width, horizon);

    // World-space floor texture projection.
    const dirX = Math.cos(PLAYER.angle);
    const dirY = Math.sin(PLAYER.angle);
    const planeScale = Math.tan(CAMERA.fov * 0.5);
    const planeX = -dirY * planeScale;
    const planeY = dirX * planeScale;
    const rayDirX0 = dirX - planeX;
    const rayDirY0 = dirY - planeY;
    const rayDirX1 = dirX + planeX;
    const rayDirY1 = dirY + planeY;
    const posZ = height * 0.5;
    const stepX = 3;
    const stepY = 2;
    const fogRgb = MAZE_THEME.fogRgb;

    for (let y = Math.floor(horizon + 1); y < height; y += stepY) {
      const p = y - height / 2;
      if (Math.abs(p) < 0.001) continue;
      const rowDist = posZ / p;
      const floorStepX = (rowDist * (rayDirX1 - rayDirX0)) / width;
      const floorStepY = (rowDist * (rayDirY1 - rayDirY0)) / width;
      let floorX = PLAYER.x + rowDist * rayDirX0;
      let floorY = PLAYER.y + rowDist * rayDirY0;

      for (let x = 0; x < width; x += stepX) {
        const tx = Math.floor((floorX - Math.floor(floorX)) * MAZE_THEME.floorTexture.width);
        const ty = Math.floor((floorY - Math.floor(floorY)) * MAZE_THEME.floorTexture.height);
        const sample = sampleFloorPixel(MAZE_THEME, tx, ty);
        const depthShade = clamp(1 - rowDist / CAMERA.maxDepth, 0.14, 1);
        const fog = clamp(Math.pow(rowDist / CAMERA.maxDepth, 1.1), 0, 0.88);

        const rr = Math.floor(sample.r * depthShade * (1 - fog) + fogRgb.r * fog);
        const gg = Math.floor(sample.g * depthShade * (1 - fog) + fogRgb.g * fog);
        const bb = Math.floor(sample.b * depthShade * (1 - fog) + fogRgb.b * fog);
        ctx.fillStyle = `rgb(${rr}, ${gg}, ${bb})`;
        ctx.fillRect(x, y, stepX, stepY);

        floorX += floorStepX * stepX;
        floorY += floorStepY * stepX;
      }
    }
  }

  function renderWalls(width, height) {
    const rayCount = Math.ceil(width / CAMERA.rayStep);
    const halfHeight = height / 2;
    const wallTexture = MAZE_THEME ? MAZE_THEME.wallTexture : null;

    for (let i = 0; i < rayCount; i += 1) {
      const screenX = i * CAMERA.rayStep;
      const cameraX = screenX / width;
      const rayAngle = PLAYER.angle - CAMERA.fov / 2 + cameraX * CAMERA.fov;
      const ray = castRay(rayAngle);

      const dist = ray.distance;
      const wallHeight = Math.min(height, Math.floor(height / dist));
      const top = Math.floor(halfHeight - wallHeight / 2);
      const texCoord = ray.side === 0 ? ray.hitY - Math.floor(ray.hitY) : ray.hitX - Math.floor(ray.hitX);

      if (wallTexture) {
        const texWidth = wallTexture.width;
        const texX = ((Math.floor(texCoord * texWidth) % texWidth) + texWidth) % texWidth;
        ctx.drawImage(
          wallTexture,
          texX,
          0,
          1,
          wallTexture.height,
          screenX,
          top,
          CAMERA.rayStep + 1,
          wallHeight
        );
      } else {
        ctx.fillStyle = "rgba(48, 60, 78, 1)";
        ctx.fillRect(screenX, top, CAMERA.rayStep + 1, wallHeight);
      }

      const sideShade = ray.side === 1 ? 0.18 : 0.07;
      const depthShade = clamp(dist / CAMERA.maxDepth, 0, 1);
      const darken = clamp(sideShade + depthShade * 0.7, 0, 0.92);
      ctx.fillStyle = `rgba(0, 0, 0, ${darken})`;
      ctx.fillRect(screenX, top, CAMERA.rayStep + 1, wallHeight);

      const fogAlpha = clamp(Math.pow(depthShade, 1.15), 0, 0.86);
      ctx.fillStyle = `rgba(8, 10, 14, ${fogAlpha})`;
      ctx.fillRect(screenX, top, CAMERA.rayStep + 1, wallHeight);

      const colStart = Math.floor(screenX);
      const colEnd = Math.min(width - 1, Math.floor(screenX + CAMERA.rayStep));
      for (let x = colStart; x <= colEnd; x += 1) {
        depthBuffer[x] = dist;
      }
    }
  }

  function getArchetypeRenderProfile(archetypeName) {
    return ENEMY_SHAPE_LIBRARY[archetypeName] || ENEMY_SHAPE_LIBRARY.balanced_duelist;
  }

  function getEnemyVisualPose(enemy) {
    let profile = getArchetypeRenderProfile(enemy.archetype);
    if (enemy.isBoss && enemy.bossProfile) {
      const head = enemy.bossProfile.models.head;
      const torso = enemy.bossProfile.models.torso;
      profile = {
        shapeId: "boss_frame",
        armorRig: torso.armorRig,
        bodyWidth: torso.bodyWidth,
        shoulderWidth: torso.shoulderWidth,
        headSize: head.headSize,
        bladeScale: torso.bladeScale,
        bobAmp: torso.bobAmp,
        jawWidth: head.jawWidth,
        browDepth: head.browDepth,
      };
    }
    const now = performance.now() * 0.001;
    const speed = Math.hypot(enemy.vx, enemy.vy);
    const aggression = getDynamicAggression(enemy);
    const defensive = clamp(
      (enemy.rl.lifetimeActions.block + enemy.rl.lifetimeActions.retreat + enemy.rl.lifetimeActions.wait) /
        Math.max(1, totalActions(enemy.rl.lifetimeActions)),
      0,
      1
    );

    const idleSpeed = 2 + aggression * 4 + (enemy.archetype === "heavy_brute" ? -1 : 0);
    const bob = Math.sin(now * idleSpeed + enemy.id * 0.81) * (2.4 + speed * 0.55) * profile.bobAmp;
    const strafeLean = enemy.action === "strafe_left" ? -1 : enemy.action === "strafe_right" ? 1 : 0;
    const moveLean = enemy.action === "advance" || enemy.action === "punish_dodge" ? 0.14 : enemy.action === "retreat" ? -0.12 : 0;
    let lean = strafeLean * 0.12 + moveLean + aggression * 0.1 - defensive * 0.05;
    let guard = enemy.blockTimer > 0 ? 1 : defensive * 0.65;
    let attackBlend = 0;
    let bladeStart = { x: 0.15, y: 0.62 };
    let bladeEnd = { x: 0.62, y: 0.34 };

    if (enemy.attackIntent) {
      const windupProgress = clamp(1 - enemy.attackIntent.timer / Math.max(0.001, enemy.attackIntent.totalTimer || 0.001), 0, 1);
      attackBlend = windupProgress;
      if (windupProgress < 0.56) {
        bladeStart = { x: -0.15 - windupProgress * 0.18, y: 0.63 };
        bladeEnd = { x: 0.35 - windupProgress * 0.1, y: 0.18 + windupProgress * 0.15 };
      } else {
        const p = (windupProgress - 0.56) / 0.44;
        bladeStart = { x: 0.02 + p * 0.45, y: 0.62 };
        bladeEnd = { x: 0.52 + p * 0.48, y: 0.24 + p * 0.28 };
      }
      lean += 0.15;
      guard *= 0.35;
    } else if (enemy.attackFlash > 0) {
      const p = 1 - enemy.attackFlash / 0.2;
      bladeStart = { x: 0.35 + p * 0.28, y: 0.62 - p * 0.04 };
      bladeEnd = { x: 0.85 + p * 0.16, y: 0.58 };
      lean += 0.2;
    } else if (enemy.blockTimer > 0) {
      bladeStart = { x: -0.08, y: 0.58 };
      bladeEnd = { x: 0.42, y: 0.32 };
    } else if (enemy.action === "feint" || enemy.action === "bait_parry") {
      bladeStart = { x: 0.05 + Math.sin(now * 10 + enemy.id) * 0.1, y: 0.6 };
      bladeEnd = { x: 0.48, y: 0.28 };
      guard = 0.86;
    }

    if (enemy.stunTimer > 0 || enemy.staggerTimer > 0) {
      lean -= 0.2;
      bladeStart = { x: -0.2, y: 0.72 };
      bladeEnd = { x: 0.08, y: 0.7 };
      guard = 0;
    }

    if (enemy.alertTimer > 0) {
      guard = Math.max(guard, 0.85);
      lean += 0.08;
    }

    return {
      profile,
      aggression,
      defensive,
      bob,
      lean,
      guard,
      attackBlend,
      bladeStart,
      bladeEnd,
    };
  }

  function renderEnemySprites(width, height) {
    const sprites = [];

    for (const enemy of GAME.enemies) {
      const dx = enemy.x - PLAYER.x;
      const dy = enemy.y - PLAYER.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 0.08 || dist > CAMERA.maxDepth) continue;

      const theta = normalizeAngle(Math.atan2(dy, dx) - PLAYER.angle);
      if (Math.abs(theta) > CAMERA.fov * 0.72) continue;
      if (!hasLineOfSight(PLAYER.x, PLAYER.y, enemy.x, enemy.y)) continue;

      const screenX = (theta / CAMERA.fov + 0.5) * width;
      const baseSize = clamp((height / dist) * 0.8, 9, height * 1.28);
      const size = enemy.isBoss ? clamp(baseSize * 2.2, 20, height * 2.4) : baseSize;
      const footY = height / 2 + size * (enemy.isBoss ? 0.7 : 0.56);
      sprites.push({ kind: "enemy", enemy, dist, screenX, size, footY });
    }

    for (const corpse of GAME.corpses) {
      const projected = projectWorldToScreen(corpse.x, corpse.y, width, height);
      if (!projected) continue;
      const size = clamp((height / projected.dist) * 0.82, 6, height * 0.9);
      const footY = height / 2 + size * 0.5;
      sprites.push({ kind: "corpse", corpse, dist: projected.dist, screenX: projected.x, size, footY });
    }

    sprites.sort((a, b) => b.dist - a.dist);

    for (const sprite of sprites) {
      if (sprite.kind === "corpse") {
        const fade = clamp(sprite.corpse.timer / sprite.corpse.maxTimer, 0, 1);
        const w = sprite.size * 0.58;
        const h = sprite.size * 0.18;
        const left = Math.floor(sprite.screenX - w * 0.5);
        const right = Math.floor(sprite.screenX + w * 0.5);
        const y = Math.floor(sprite.footY - h * 0.25);
        for (let x = left; x <= right; x += 1) {
          if (x < 0 || x >= width) continue;
          if (sprite.dist > depthBuffer[x] - 0.03) continue;
          ctx.fillStyle = `rgba(26, 32, 41, ${0.45 * fade})`;
          ctx.fillRect(x, y, 1, h);
        }
        continue;
      }

      const enemy = sprite.enemy;
      const pose = getEnemyVisualPose(enemy);
      const distShade = clamp(1 - sprite.dist / CAMERA.maxDepth, 0.26, 1);
      const centerX = sprite.screenX + pose.lean * sprite.size * 0.12;
      const shoulderWidth = sprite.size * pose.profile.shoulderWidth;
      const torsoWidth = sprite.size * pose.profile.bodyWidth;
      const top = sprite.footY - sprite.size * 0.74 + pose.bob;
      const headSize = sprite.size * pose.profile.headSize;
      const torsoTop = top + headSize * 0.86;
      const torsoHeight = sprite.size * 0.49;
      const left = Math.floor(centerX - shoulderWidth * 0.5);
      const right = Math.floor(centerX + shoulderWidth * 0.5);
      const hpRatio = clamp(enemy.health / enemy.maxHealth, 0, 1);
      const armorTheme =
        (MAZE_THEME && MAZE_THEME.enemyArmor[enemy.archetype]) || {
          rig: pose.profile.armorRig,
          base: "rgba(108, 116, 128, 0.95)",
          secondary: "rgba(84, 91, 101, 0.9)",
          accent: "rgba(154, 164, 176, 0.9)",
        };
      const skinTheme = (MAZE_THEME && MAZE_THEME.enemySkin) || {
        base: "rgba(126, 132, 140, 0.95)",
        dark: "rgba(88, 93, 99, 0.92)",
        eyes: "rgba(238, 228, 180, 0.92)",
      };
      const activeArmorTheme =
        enemy.isBoss && enemy.bossProfile
          ? {
              rig: enemy.bossProfile.models.torso.armorRig,
              base: enemy.bossProfile.palette.torsoBase,
              secondary: enemy.bossProfile.palette.torsoSecondary,
              accent: enemy.bossProfile.palette.accent,
            }
          : armorTheme;
      const activeSkinTheme =
        enemy.isBoss && enemy.bossProfile
          ? {
              base: enemy.bossProfile.palette.headBase,
              dark: "rgba(44, 47, 56, 0.94)",
              eyes: "rgba(242, 230, 184, 0.96)",
            }
          : skinTheme;
      const armorAlpha = enemy.blockTimer > 0 ? 0.98 : 0.9;
      const hitBlend = enemy.hitFlash > 0 ? clamp(enemy.hitFlash / 0.16, 0, 1) : 0;
      const accentPulse = 0.34 + 0.28 * Math.sin(performance.now() * 0.01 + enemy.id);

      for (let x = left; x <= right; x += 1) {
        if (x < 0 || x >= width) continue;
        if (sprite.dist > depthBuffer[x] - 0.03) continue;

        const local = (x - centerX) / (shoulderWidth * 0.5 || 1);
        const absLocal = Math.abs(local);
        if (absLocal > 1.02) continue;

        const torsoProfile = clamp(1 - absLocal * 0.82, 0, 1);
        const torsoWobble = 1 - pose.guard * 0.08;
        const bodyTop = torsoTop + (1 - torsoProfile) * headSize * 0.35;
        const bodyH = torsoHeight * torsoProfile * torsoWobble;
        const headProfile = clamp(1 - absLocal * 1.35, 0, 1);
        const rig = activeArmorTheme.rig;
        const legLift = enemy.isBoss && enemy.bossProfile ? enemy.bossProfile.models.legs.legLift : 0.2;
        const legStance = enemy.isBoss && enemy.bossProfile ? enemy.bossProfile.models.legs.stance : 0.52;

        ctx.globalAlpha = armorAlpha * distShade;
        ctx.fillStyle = activeArmorTheme.base;
        ctx.fillRect(x, bodyTop, 1, bodyH);
        ctx.globalAlpha = 1;

        if (absLocal > 0.12 && absLocal < legStance) {
          const legTop = bodyTop + bodyH * 0.88;
          const legHeight = sprite.size * legLift * torsoProfile;
          ctx.globalAlpha = 0.78 * distShade;
          ctx.fillStyle = enemy.isBoss && enemy.bossProfile ? enemy.bossProfile.palette.legBase : activeArmorTheme.secondary;
          ctx.fillRect(x, legTop, 1, legHeight);
          ctx.globalAlpha = 1;
        }

        if (rig === "lamellar_guard") {
          if (Math.floor((bodyTop + bodyH) / 6) % 2 === 0 && absLocal < 0.64) {
            ctx.globalAlpha = 0.65 * distShade;
            ctx.fillStyle = activeArmorTheme.secondary;
            ctx.fillRect(x, bodyTop + bodyH * 0.2, 1, bodyH * 0.45);
            ctx.globalAlpha = 1;
          }
        } else if (rig === "strap_and_spike") {
          const diag = (bodyTop + local * 28) % 14;
          if (diag > 9 && absLocal < 0.7) {
            ctx.globalAlpha = 0.74 * distShade;
            ctx.fillStyle = activeArmorTheme.secondary;
            ctx.fillRect(x, bodyTop + bodyH * 0.18, 1, bodyH * 0.56);
            ctx.globalAlpha = 1;
          }
        } else if (rig === "high_guard_plate") {
          if (absLocal < 0.28) {
            ctx.globalAlpha = 0.78 * distShade;
            ctx.fillStyle = activeArmorTheme.secondary;
            ctx.fillRect(x, bodyTop + bodyH * 0.04, 1, bodyH * 0.66);
            ctx.globalAlpha = 1;
          }
          if (Math.abs(local) < 0.75 && Math.abs(local) > 0.56) {
            ctx.globalAlpha = 0.52 * distShade;
            ctx.fillStyle = activeArmorTheme.accent;
            ctx.fillRect(x, bodyTop + bodyH * 0.08, 1, bodyH * 0.26);
            ctx.globalAlpha = 1;
          }
        } else if (rig === "heavy_slab") {
          if (Math.floor((bodyTop + bodyH * 0.5) / 8) % 2 === 0 && absLocal < 0.78) {
            ctx.globalAlpha = 0.72 * distShade;
            ctx.fillStyle = activeArmorTheme.secondary;
            ctx.fillRect(x, bodyTop + bodyH * 0.22, 1, bodyH * 0.52);
            ctx.globalAlpha = 1;
          }
        }

        if (headProfile > 0) {
          ctx.globalAlpha = 0.9 * distShade;
          ctx.fillStyle = activeSkinTheme.base;
          ctx.fillRect(x, top + (1 - headProfile) * 2, 1, headSize * headProfile * 0.94);
          ctx.globalAlpha = 1;

          if (absLocal < pose.profile.jawWidth) {
            ctx.globalAlpha = 0.72 * distShade;
            ctx.fillStyle = activeSkinTheme.dark;
            ctx.fillRect(x, top + headSize * 0.56, 1, headSize * 0.35);
            ctx.globalAlpha = 1;
          }

          if (absLocal < 0.34) {
            ctx.globalAlpha = 0.68 * distShade;
            ctx.fillStyle = activeSkinTheme.dark;
            ctx.fillRect(x, top + headSize * pose.profile.browDepth, 1, headSize * 0.14);
            ctx.globalAlpha = 1;
          }

          if (absLocal > 0.85 && absLocal < 0.98) {
            ctx.globalAlpha = 0.78 * distShade;
            ctx.fillStyle = activeSkinTheme.dark;
            ctx.fillRect(x, top + headSize * 0.36, 1, headSize * 0.2);
            ctx.globalAlpha = 1;
          }

          if (Math.abs(local) < 0.08) {
            ctx.globalAlpha = 0.82 * distShade;
            ctx.fillStyle = activeSkinTheme.eyes;
            ctx.fillRect(x, top + headSize * 0.3, 1, 1.2);
            ctx.globalAlpha = 1;
          }
        }

        if (Math.abs(local) < 0.16) {
          ctx.globalAlpha = (0.32 + accentPulse) * distShade;
          ctx.fillStyle = activeArmorTheme.accent;
          ctx.fillRect(x, torsoTop + torsoHeight * 0.2, 1, torsoHeight * 0.42);
          ctx.globalAlpha = 1;
        }

        if (enemy.stunTimer > 0 || enemy.staggerTimer > 0) {
          ctx.fillStyle = `rgba(255, 240, 166, ${0.45 * distShade})`;
          ctx.fillRect(x, top - 3, 1, 3);
        }

        if (hitBlend > 0) {
          ctx.fillStyle = `rgba(180, 36, 36, ${0.35 * hitBlend})`;
          ctx.fillRect(x, top, 1, sprite.size * 0.72);
        }
      }

      // Enemy blade projection for readable combat timing.
      const bladeStartX = centerX + pose.bladeStart.x * torsoWidth;
      const bladeStartY = top + pose.bladeStart.y * sprite.size;
      const bladeEndX = centerX + pose.bladeEnd.x * torsoWidth * pose.profile.bladeScale;
      const bladeEndY = top + pose.bladeEnd.y * sprite.size;
      const swordMinX = Math.floor(Math.min(bladeStartX, bladeEndX) - 3);
      const swordMaxX = Math.ceil(Math.max(bladeStartX, bladeEndX) + 3);
      const guardThickness = 2.2 + pose.guard * 2.7 + pose.attackBlend * 1.5 + pose.profile.bladeScale * 0.9;

      for (let x = swordMinX; x <= swordMaxX; x += 1) {
        if (x < 0 || x >= width) continue;
        if (sprite.dist > depthBuffer[x] - 0.03) continue;
        const denom = bladeEndX - bladeStartX;
        if (Math.abs(denom) < 0.0001) continue;
        const bladeT = (x - bladeStartX) / denom;
        if (bladeT < 0 || bladeT > 1) continue;
        const y = lerp(bladeStartY, bladeEndY, bladeT);
        const thickness = guardThickness * (1 - bladeT * 0.28);
        ctx.fillStyle = `rgba(228, 236, 248, ${0.86 * distShade})`;
        ctx.fillRect(x, y - thickness * 0.55, 1, thickness);

        if (pose.attackBlend > 0.5 || enemy.attackFlash > 0) {
          const trailAlpha = (pose.attackBlend > 0 ? pose.attackBlend : enemy.attackFlash * 4) * 0.22 * distShade;
          ctx.fillStyle = `rgba(255, 255, 255, ${trailAlpha})`;
          ctx.fillRect(x, y - thickness * 1.25, 1, thickness * 0.8);
        }
      }

      const swordDX = bladeEndX - bladeStartX;
      const swordDY = bladeEndY - bladeStartY;
      const swordLen = Math.hypot(swordDX, swordDY) || 1;
      const swordDirX = swordDX / swordLen;
      const swordDirY = swordDY / swordLen;
      const swordPerpX = -swordDirY;
      const swordPerpY = swordDirX;
      const hiltCenterX = bladeStartX - swordDirX * 5;
      const hiltCenterY = bladeStartY - swordDirY * 5;
      const hiltIndex = clamp(Math.floor(hiltCenterX), 0, width - 1);
      if (sprite.dist < depthBuffer[hiltIndex] - 0.03) {
        const hiltHalf = 8 + pose.profile.bladeScale * 3.2;
        ctx.strokeStyle = `rgba(8, 8, 10, ${0.95 * distShade})`;
        ctx.lineWidth = 4.2 + pose.profile.bladeScale * 1.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(hiltCenterX - swordPerpX * hiltHalf, hiltCenterY - swordPerpY * hiltHalf);
        ctx.lineTo(hiltCenterX + swordPerpX * hiltHalf, hiltCenterY + swordPerpY * hiltHalf);
        ctx.stroke();

        ctx.strokeStyle = `rgba(0, 0, 0, ${0.74 * distShade})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(hiltCenterX - swordDirX * 8, hiltCenterY - swordDirY * 8);
        ctx.lineTo(hiltCenterX + swordDirX * 5, hiltCenterY + swordDirY * 5);
        ctx.stroke();
      }

      if (enemy.blockTimer > 0 || enemy.parryFlash > 0) {
        const guardY = top + sprite.size * 0.49;
        const guardLeft = Math.floor(centerX - torsoWidth * 0.42);
        const guardRight = Math.floor(centerX + torsoWidth * 0.42);
        const guardAlpha = enemy.parryFlash > 0 ? 0.9 : 0.62;
        for (let x = guardLeft; x <= guardRight; x += 1) {
          if (x < 0 || x >= width) continue;
          if (sprite.dist > depthBuffer[x] - 0.03) continue;
          ctx.fillStyle = `rgba(130, 196, 232, ${guardAlpha * distShade})`;
          ctx.fillRect(x, guardY, 1, 3);
        }
      }

      const barWidth = Math.floor(sprite.size * 0.55);
      const barLeft = Math.floor(centerX - barWidth / 2);
      const barY = top - 10;
      for (let x = 0; x < barWidth; x += 1) {
        const px = barLeft + x;
        if (px < 0 || px >= width) continue;
        if (sprite.dist > depthBuffer[px] - 0.03) continue;
        ctx.fillStyle = "rgba(18, 24, 31, 0.9)";
        ctx.fillRect(px, barY, 1, 3);
        if (x / barWidth <= hpRatio) {
          ctx.fillStyle = enemy.isBoss ? "rgba(240, 176, 68, 0.98)" : "rgba(226, 74, 74, 0.96)";
          ctx.fillRect(px, barY, 1, 3);
        }
      }

      if (enemy.isBoss && enemy.name) {
        ctx.fillStyle = "rgba(242, 182, 50, 0.96)";
        ctx.font = "bold 12px Bahnschrift, Roboto Condensed, Segoe UI, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(enemy.name, centerX, barY - 6);
        ctx.textAlign = "left";
      }
    }
  }

  function renderDrops(width, height) {
    const dropSprites = [];
    for (const drop of GAME.drops) {
      const dx = drop.x - PLAYER.x;
      const dy = drop.y - PLAYER.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 0.1 || dist > CAMERA.maxDepth) continue;
      const theta = normalizeAngle(Math.atan2(dy, dx) - PLAYER.angle);
      if (Math.abs(theta) > CAMERA.fov * 0.75) continue;

      const screenX = (theta / CAMERA.fov + 0.5) * width;
      const size = clamp((height / dist) * 0.26, 14, 90);
      const footY = height / 2 + size * 0.96 + Math.sin(drop.bob) * 1.6;
      dropSprites.push({ drop, dist, screenX, size, footY });
    }

    dropSprites.sort((a, b) => b.dist - a.dist);

    for (const item of dropSprites) {
      const sprite = DROP_SPRITES[item.drop.type];
      if (!sprite) continue;
      const drawW = item.size;
      const drawH = item.size;
      const left = Math.floor(item.screenX - drawW * 0.5);
      const top = Math.floor(item.footY - drawH);
      const right = left + drawW;

      const centerX = Math.floor(item.screenX);
      if (centerX >= 0 && centerX < width && item.dist < depthBuffer[centerX] - 0.02) {
        ctx.fillStyle = "rgba(0,0,0,0.28)";
        ctx.beginPath();
        ctx.ellipse(item.screenX, item.footY + 2, drawW * 0.28, drawH * 0.09, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let x = left; x < right; x += 1) {
        if (x < 0 || x >= width) continue;
        if (item.dist > depthBuffer[x] - 0.02) continue;
        const sx = Math.floor(((x - left) / drawW) * sprite.width);
        ctx.drawImage(sprite, sx, 0, 1, sprite.height, x, top, 1, drawH);
      }
    }
  }

  function shadeColor(hexColor, shade, alpha) {
    const clean = hexColor.replace("#", "");
    const bigint = Number.parseInt(clean, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${Math.floor(r * shade)}, ${Math.floor(g * shade)}, ${Math.floor(b * shade)}, ${alpha})`;
  }

  function renderWeapon(width, height) {
    let hiltX = width * 0.79;
    let hiltY = height * 0.94;
    const bladeLen = height * (PLAYER.attack && PLAYER.attack.type === "heavy" ? 0.72 : 0.66);
    const restTip = { x: hiltX, y: hiltY - bladeLen };
    let bladeTip = { ...restTip };

    if (PLAYER.attack && !PLAYER.blockHeld) {
      const total = PLAYER.attack.windup + PLAYER.attack.active + PLAYER.attack.recovery;
      const t = clamp(PLAYER.attack.timer / total, 0, 1);
      const windupFrac = PLAYER.attack.windup / total;
      const activeFrac = PLAYER.attack.active / total;
      const heavy = PLAYER.attack.type === "heavy";
      const style = PLAYER.attack.slashStyle || "lazy";
      let windupTip = {
        x: restTip.x + (heavy ? 72 : 48),
        y: restTip.y - (heavy ? 54 : 30),
      };
      let slashTip = {
        x: width * (heavy ? 0.4 : 0.44),
        y: height * (heavy ? 0.8 : 0.74),
      };
      let recoverTip = {
        x: width * 0.68,
        y: height * 0.26,
      };
      let hiltWindupX = width * 0.74;
      let hiltWindupY = height * 0.93;
      let hiltSlashX = width * 0.67;
      let hiltSlashY = height * 0.9;
      const hiltRecoverX = width * 0.79;
      const hiltRecoverY = height * 0.94;

      if (style === "diag_tl_br") {
        windupTip = {
          x: width * (heavy ? 0.26 : 0.28),
          y: height * (heavy ? 0.17 : 0.21),
        };
        slashTip = {
          x: width * (heavy ? 0.74 : 0.71),
          y: height * (heavy ? 0.86 : 0.8),
        };
        recoverTip = {
          x: width * 0.71,
          y: height * 0.34,
        };
        hiltWindupX = width * 0.73;
        hiltWindupY = height * 0.91;
        hiltSlashX = width * 0.78;
        hiltSlashY = height * 0.91;
      } else if (style === "diag_tr_bl") {
        windupTip = {
          x: width * (heavy ? 0.87 : 0.84),
          y: height * (heavy ? 0.18 : 0.22),
        };
        slashTip = {
          x: width * (heavy ? 0.42 : 0.46),
          y: height * (heavy ? 0.86 : 0.8),
        };
        recoverTip = {
          x: width * 0.69,
          y: height * 0.3,
        };
        hiltWindupX = width * 0.82;
        hiltWindupY = height * 0.9;
        hiltSlashX = width * 0.68;
        hiltSlashY = height * 0.91;
      } else if (style === "vertical_center") {
        windupTip = {
          x: width * 0.58,
          y: height * (heavy ? 0.13 : 0.18),
        };
        slashTip = {
          x: width * 0.58,
          y: height * (heavy ? 0.87 : 0.81),
        };
        recoverTip = {
          x: width * 0.7,
          y: height * 0.31,
        };
        hiltWindupX = width * 0.75;
        hiltWindupY = height * 0.9;
        hiltSlashX = width * 0.73;
        hiltSlashY = height * 0.91;
      }

      if (t < windupFrac) {
        const p = t / Math.max(0.0001, windupFrac);
        bladeTip = {
          x: lerp(restTip.x, windupTip.x, p),
          y: lerp(restTip.y, windupTip.y, p),
        };
        hiltX = lerp(width * 0.79, hiltWindupX, p);
        hiltY = lerp(height * 0.94, hiltWindupY, p);
      } else if (t < windupFrac + activeFrac) {
        const p = (t - windupFrac) / Math.max(0.0001, activeFrac);
        bladeTip = {
          x: lerp(windupTip.x, slashTip.x, p),
          y: lerp(windupTip.y, slashTip.y, p),
        };
        hiltX = lerp(hiltWindupX, hiltSlashX, p);
        hiltY = lerp(hiltWindupY, hiltSlashY, p);
      } else {
        const p = (t - windupFrac - activeFrac) / Math.max(0.0001, 1 - windupFrac - activeFrac);
        bladeTip = {
          x: lerp(slashTip.x, recoverTip.x, p),
          y: lerp(slashTip.y, recoverTip.y, p),
        };
        hiltX = lerp(hiltSlashX, hiltRecoverX, p);
        hiltY = lerp(hiltSlashY, hiltRecoverY, p);
      }
    }

    // Sword is centered only while parrying.
    if (PLAYER.blockHeld) {
      hiltX = width * 0.52;
      hiltY = height * 0.92;
      bladeTip = { x: width * 0.5, y: height * 0.27 };
    }

    const bladeBase = { x: hiltX, y: hiltY - 34 };
    const vx = bladeTip.x - bladeBase.x;
    const vy = bladeTip.y - bladeBase.y;
    const vLen = Math.hypot(vx, vy) || 1;
    const dx = vx / vLen;
    const dy = vy / vLen;
    const px = -dy;
    const py = dx;
    const isSlashWindow =
      !!PLAYER.attack &&
      PLAYER.attack.timer >= PLAYER.attack.windup * 0.65 &&
      PLAYER.attack.timer <= PLAYER.attack.windup + PLAYER.attack.active + 0.06;

    if (isSlashWindow && GAME.lastSwordTip && GAME.lastSwordBase) {
      const trailLife = PLAYER.attack.type === "heavy" ? 0.17 : 0.12;
      GAME.weaponTrails.push({
        life: trailLife,
        maxLife: trailLife,
        type: PLAYER.attack.type,
        aBase: { ...GAME.lastSwordBase },
        aTip: { ...GAME.lastSwordTip },
        bBase: { ...bladeBase },
        bTip: { ...bladeTip },
      });
    }

    if (PLAYER.attack || PLAYER.blockHeld) {
      GAME.lastSwordTip = { ...bladeTip };
      GAME.lastSwordBase = { ...bladeBase };
    } else {
      GAME.lastSwordTip = null;
      GAME.lastSwordBase = null;
    }

    for (const trail of GAME.weaponTrails) {
      const alpha = clamp(trail.life / trail.maxLife, 0, 1);
      ctx.fillStyle =
        trail.type === "heavy"
          ? `rgba(234, 244, 255, ${alpha * 0.34})`
          : `rgba(234, 244, 255, ${alpha * 0.24})`;
      ctx.beginPath();
      ctx.moveTo(trail.aBase.x, trail.aBase.y);
      ctx.lineTo(trail.aTip.x, trail.aTip.y);
      ctx.lineTo(trail.bTip.x, trail.bTip.y);
      ctx.lineTo(trail.bBase.x, trail.bBase.y);
      ctx.closePath();
      ctx.fill();
    }

    // Grip / hilt / pommel.
    const gripLength = 62;
    const gripWidth = 13;
    const gripStart = { x: hiltX - dx * 10, y: hiltY - dy * 10 };
    const gripEnd = { x: gripStart.x - dx * gripLength, y: gripStart.y - dy * gripLength };
    ctx.strokeStyle = "rgba(82, 53, 32, 0.98)";
    ctx.lineWidth = gripWidth;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(gripStart.x, gripStart.y);
    ctx.lineTo(gripEnd.x, gripEnd.y);
    ctx.stroke();

    ctx.strokeStyle = "rgba(33, 20, 14, 0.82)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i += 1) {
      const s = i / 4;
      const cx = lerp(gripStart.x, gripEnd.x, s);
      const cy = lerp(gripStart.y, gripEnd.y, s);
      ctx.beginPath();
      ctx.moveTo(cx - px * 6, cy - py * 6);
      ctx.lineTo(cx + px * 6, cy + py * 6);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(116, 126, 143, 0.98)";
    ctx.beginPath();
    ctx.arc(gripEnd.x - dx * 7, gripEnd.y - dy * 7, 8, 0, Math.PI * 2);
    ctx.fill();

    // Crossguard.
    const guardCenter = { x: bladeBase.x - dx * 8, y: bladeBase.y - dy * 8 };
    ctx.strokeStyle = "rgba(196, 160, 92, 0.96)";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(guardCenter.x - px * 34, guardCenter.y - py * 34);
    ctx.lineTo(guardCenter.x + px * 34, guardCenter.y + py * 34);
    ctx.stroke();

    // Blade.
    const bladeWidth = PLAYER.blockHeld ? 13 : 11;
    const bladeGrad = ctx.createLinearGradient(bladeBase.x, bladeBase.y, bladeTip.x, bladeTip.y);
    bladeGrad.addColorStop(0, "rgba(216, 226, 238, 0.99)");
    bladeGrad.addColorStop(0.5, "rgba(183, 196, 214, 0.99)");
    bladeGrad.addColorStop(1, "rgba(129, 141, 160, 0.99)");
    ctx.strokeStyle = bladeGrad;
    ctx.lineWidth = bladeWidth;
    ctx.beginPath();
    ctx.moveTo(bladeBase.x, bladeBase.y);
    ctx.lineTo(bladeTip.x, bladeTip.y);
    ctx.stroke();

    // Edge highlight + fuller.
    ctx.strokeStyle = "rgba(248, 252, 255, 0.68)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bladeBase.x + px * 3, bladeBase.y + py * 3);
    ctx.lineTo(bladeTip.x + px * 1.2, bladeTip.y + py * 1.2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(82, 96, 116, 0.78)";
    ctx.beginPath();
    ctx.moveTo(bladeBase.x - px * 0.4, bladeBase.y - py * 0.4);
    ctx.lineTo(lerp(bladeBase.x, bladeTip.x, 0.84), lerp(bladeBase.y, bladeTip.y, 0.84));
    ctx.stroke();

    if (PLAYER.blockHeld) {
      // Distinct centerline parry pose highlight.
      ctx.strokeStyle = "rgba(132, 209, 242, 0.42)";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(bladeBase.x - dx * 14, bladeBase.y - dy * 14);
      ctx.lineTo(bladeTip.x + dx * 8, bladeTip.y + dy * 8);
      ctx.stroke();
    }
  }

  function renderCombatEffects(width, height) {
    for (const spark of GAME.sparks) {
      const lifeRatio = clamp(spark.life / spark.maxLife, 0, 1);
      ctx.fillStyle = `rgba(${spark.color}, ${lifeRatio})`;
      ctx.fillRect(spark.x, spark.y, spark.size, spark.size * 0.8);
    }

    for (const flash of GAME.flashes) {
      const lifeRatio = clamp(flash.life / flash.maxLife, 0, 1);
      ctx.fillStyle = `rgba(${flash.color}, ${flash.intensity * lifeRatio})`;
      ctx.fillRect(0, 0, width, height);
    }

    if (GAME.adaptationPulse > 0) {
      const p = GAME.adaptationPulse;
      const r = 18 + (1 - p) * 40;
      ctx.strokeStyle = `rgba(76, 201, 240, ${0.28 * p})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.5, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function renderOverlays(width, height) {
    if (GAME.statusTimer > 0 && GAME.statusText) {
      ctx.fillStyle = "rgba(242, 182, 50, 0.94)";
      ctx.font = "bold 19px Bahnschrift, Roboto Condensed, Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(GAME.statusText, width / 2, 34);
      ctx.textAlign = "left";
    }

    if (PLAYER.health <= 28 && !PLAYER.isDead) {
      ctx.fillStyle = `rgba(143, 31, 31, ${0.11 + Math.sin(performance.now() / 120) * 0.05})`;
      ctx.fillRect(0, 0, width, height);
    }
  }

  function renderMiniMap(width, height) {
    const mapScale = 5;
    const mapW = MAP_WIDTH * mapScale;
    const mapH = MAP_HEIGHT * mapScale;
    const originX = width - mapW - 18;
    const originY = height - mapH - 18;

    ctx.fillStyle = "rgba(7, 10, 14, 0.78)";
    ctx.fillRect(originX - 5, originY - 5, mapW + 10, mapH + 10);

    for (let y = 0; y < MAP_HEIGHT; y += 1) {
      for (let x = 0; x < MAP_WIDTH; x += 1) {
        ctx.fillStyle = MAP[y][x] === 1 ? "rgba(68, 82, 98, 0.72)" : "rgba(22, 30, 40, 0.38)";
        ctx.fillRect(originX + x * mapScale, originY + y * mapScale, mapScale, mapScale);
      }
    }

    for (const enemy of GAME.enemies) {
      ctx.fillStyle =
        enemy.archetype === "aggressive_rusher"
          ? "rgba(240, 138, 36, 0.95)"
          : enemy.archetype === "defensive_counterfighter"
            ? "rgba(76, 201, 240, 0.95)"
            : enemy.archetype === "heavy_brute"
              ? "rgba(242, 182, 50, 0.95)"
              : "rgba(228, 241, 255, 0.92)";
      ctx.fillRect(originX + enemy.x * mapScale - 1, originY + enemy.y * mapScale - 1, 3, 3);
    }

    for (const corpse of GAME.corpses) {
      ctx.fillStyle = "rgba(104, 56, 56, 0.8)";
      ctx.fillRect(originX + corpse.x * mapScale - 1, originY + corpse.y * mapScale - 1, 2, 2);
    }

    ctx.fillStyle = "rgba(117, 245, 255, 0.95)";
    ctx.fillRect(originX + PLAYER.x * mapScale - 1.5, originY + PLAYER.y * mapScale - 1.5, 4, 4);

    ctx.strokeStyle = "rgba(117, 245, 255, 0.9)";
    ctx.beginPath();
    ctx.moveTo(originX + PLAYER.x * mapScale, originY + PLAYER.y * mapScale);
    ctx.lineTo(
      originX + (PLAYER.x + Math.cos(PLAYER.angle) * 1.4) * mapScale,
      originY + (PLAYER.y + Math.sin(PLAYER.angle) * 1.4) * mapScale
    );
    ctx.stroke();
  }

  function renderFrame() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    let shakeX = 0;
    let shakeY = 0;
    if (GAME.shakeTimer > 0) {
      const intensity = GAME.shakePower * clamp(GAME.shakeTimer / 0.16, 0, 1);
      shakeX = randRange(-intensity, intensity);
      shakeY = randRange(-intensity, intensity);
    }

    ctx.save();
    ctx.translate(shakeX, shakeY);
    renderSkyAndFloor(width, height);
    renderWalls(width, height);
    renderDrops(width, height);
    renderEnemySprites(width, height);
    renderWeapon(width, height);
    renderMiniMap(width, height);
    renderCombatEffects(width, height);
    renderOverlays(width, height);
    ctx.restore();
  }

  // =============================
  // Main Update Loop
  // =============================
  function updateGame(dt) {
    if (isUiModalOpen()) {
      updateHUD();
      return;
    }
    if (GAME.paused) {
      updateHUD();
      return;
    }

    updateVisualEffects(dt);
    for (let i = GAME.corpses.length - 1; i >= 0; i -= 1) {
      GAME.corpses[i].timer -= dt;
      if (GAME.corpses[i].timer <= 0) {
        GAME.corpses.splice(i, 1);
      }
    }

    if (PLAYER.isDead) {
      GAME.statusTimer = Math.max(0, GAME.statusTimer - dt);
      updateHUD();
      return;
    }

    updatePlayer(dt);
    updateDrops(dt);

    for (const enemy of [...GAME.enemies]) {
      updateEnemy(enemy, dt);
    }

    if (PLAYER.health <= 0 && !PLAYER.isDead) {
      PLAYER.isDead = true;
      PLAYER.health = 0;
      GAME.statusText = "Run ended";
      GAME.statusTimer = 2.4;
      rlManager.save();
      showGameOver();
    }

    if (!PLAYER.isDead && GAME.enemies.length === 0 && GAME.waveTransition <= 0) {
      finishWave();
    }

    if (GAME.waveTransition > 0) {
      GAME.waveTransition -= dt;
      GAME.waveReportTimer -= dt;
      if (GAME.waveReportTimer <= 0) {
        hideRoundReport();
      }
      if (GAME.waveTransition <= 0 && !PLAYER.isDead) {
        spawnWave(GAME.wave);
      }
    }

    GAME.statusTimer = Math.max(0, GAME.statusTimer - dt);

    GAME.saveTimer += dt;
    if (GAME.saveTimer > 8) {
      GAME.saveTimer = 0;
      rlManager.save();
    }

    GAME.tendencyTimer += dt;
    if (GAME.tendencyTimer > 0.7) {
      GAME.tendencyTimer = 0;
      refreshTendencyPanel();
    }

    updateHUD();
  }

  function gameLoop(now) {
    const rawDt = Math.min(0.05, (now - GAME.lastFrame) / 1000);
    GAME.lastFrame = now;
    let dt = rawDt;
    if (GAME.hitStopTimer > 0) {
      const frozen = Math.min(rawDt, GAME.hitStopTimer);
      GAME.hitStopTimer -= frozen;
      dt = rawDt - frozen;
    }

    updateGame(dt);
    renderFrame();

    requestAnimationFrame(gameLoop);
  }

  // =============================
  // Startup
  // =============================
  restartRun();
  refreshShopUI();
  refreshTendencyPanel();
  updateHUD();

  window.addEventListener("beforeunload", () => {
    rlManager.save();
    saveShopProgression();
  });

  requestAnimationFrame(gameLoop);
})();
