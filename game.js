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

  const MAP_LAYOUT = [
    "111111111111111111111111",
    "100000000001000000000001",
    "101111111001011111011101",
    "101000001000010001000101",
    "101011101111010111010101",
    "100010100001010100010001",
    "111010101101010101111101",
    "100010001001000100000001",
    "101111101001111101111101",
    "100000001000000001000001",
    "101111001111111001011101",
    "101001000000001001000101",
    "101001011111101111010101",
    "100001000100100001010001",
    "111101110101101101011101",
    "100001000001000001000001",
    "101111011101111101111101",
    "100000010001000100000001",
    "101111110101010111111101",
    "100000000101010000000001",
    "111111111101011111111111",
    "100000000001000000000001",
    "100000000000000000000001",
    "111111111111111111111111",
  ];

  const MAP = MAP_LAYOUT.map((row) => row.split("").map(Number));
  const MAP_WIDTH = MAP[0].length;
  const MAP_HEIGHT = MAP.length;

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
    x: 2.5,
    y: 2.5,
    angle: 0,
    vx: 0,
    vy: 0,
    radius: 0.22,
    state: "idle",
    maxHealth: 100,
    health: 100,
    maxStamina: 100,
    stamina: 100,
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
    score: 0,
    survivalTime: 0,
    kills: 0,
    isDead: false,
  };

  const GAME = {
    wave: 1,
    enemies: [],
    nextEnemyId: 1,
    waveTransition: 0,
    waveReportTimer: 0,
    roundReportLines: [],
    statusText: "",
    statusTimer: 0,
    lastFrame: performance.now(),
    saveTimer: 0,
    tendencyTimer: 0,
  };

  const CAMERA = {
    fov: Math.PI / 3,
    maxDepth: 24,
    rayStep: 2,
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
  const tendencyListEl = document.getElementById("tendencyList");
  const resetLearningBtn = document.getElementById("resetLearningBtn");
  const restartBtn = document.getElementById("restartBtn");
  const reportPanelEl = document.getElementById("roundReport");
  const reportListEl = document.getElementById("roundReportList");
  const gameOverEl = document.getElementById("gameOver");
  const gameOverMetaEl = document.getElementById("gameOverMeta");

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

  // =============================
  // Utility Math Helpers
  // =============================
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
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
      accumulatedReward: 0,
      lastStateKey: null,
      lastAction: null,
      lastAttackConnected: false,
      lastDamageTime: -100,
    };
  }

  function getOpenSpawnTiles() {
    const tiles = [];
    for (let y = 1; y < MAP_HEIGHT - 1; y += 1) {
      for (let x = 1; x < MAP_WIDTH - 1; x += 1) {
        if (MAP[y][x] === 0) {
          tiles.push({ x: x + 0.5, y: y + 0.5 });
        }
      }
    }
    return tiles;
  }

  const OPEN_TILES = getOpenSpawnTiles();

  function findSpawnPosition() {
    for (let i = 0; i < 200; i += 1) {
      const tile = OPEN_TILES[Math.floor(Math.random() * OPEN_TILES.length)];
      if (!tile) break;

      if (Math.hypot(tile.x - PLAYER.x, tile.y - PLAYER.y) < 4.2) continue;
      let overlap = false;
      for (const enemy of GAME.enemies) {
        if (Math.hypot(tile.x - enemy.x, tile.y - enemy.y) < 1.1) {
          overlap = true;
          break;
        }
      }
      if (!overlap) return tile;
    }

    return { x: 3.5, y: 3.5 };
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

  function spawnWave(waveNumber) {
    const enemyCount = Math.min(3 + waveNumber, 14);

    for (let i = 0; i < enemyCount; i += 1) {
      const spawn = findSpawnPosition();
      const archetype = chooseArchetypeForWave(waveNumber);
      GAME.enemies.push(createEnemy(spawn.x, spawn.y, archetype, waveNumber - 1));
    }

    WAVE_BEHAVIOR = createEmptyWaveBehavior();
    GAME.statusText = `Wave ${waveNumber} started`;
    GAME.statusTimer = 2;
  }

  function clearEnemies() {
    GAME.enemies.length = 0;
  }

  function resetPlayerForRun() {
    PLAYER.x = 2.5;
    PLAYER.y = 2.5;
    PLAYER.angle = 0;
    PLAYER.vx = 0;
    PLAYER.vy = 0;
    PLAYER.health = PLAYER.maxHealth;
    PLAYER.stamina = PLAYER.maxStamina;
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
    PLAYER.state = "idle";
    PLAYER.isDead = false;
    PLAYER.score = 0;
    PLAYER.kills = 0;
    PLAYER.survivalTime = 0;

    for (const key of Object.keys(PLAYER_BEHAVIOR)) {
      PLAYER_BEHAVIOR[key] = 0;
    }
    PLAYER_BEHAVIOR.samples = 0;
  }

  function restartRun() {
    GAME.wave = 1;
    GAME.waveTransition = 0;
    GAME.waveReportTimer = 0;
    GAME.roundReportLines = [];
    GAME.statusText = "";
    GAME.statusTimer = 0;
    GAME.saveTimer = 0;
    GAME.tendencyTimer = 0;

    clearEnemies();
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
      KEYS[event.code] = true;
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
        event.preventDefault();
      }

      if (event.code === "KeyR" && PLAYER.isDead) {
        restartRun();
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
      if (document.pointerLockElement !== canvas && canvas.requestPointerLock) {
        canvas.requestPointerLock();
      }
      if (!PLAYER.isDead) {
        attemptPlayerAttack("light");
      }
    });

    canvas.addEventListener("contextmenu", (event) => {
      event.preventDefault();
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
      rlManager.reset();
      GAME.statusText = "Enemy learning data reset";
      GAME.statusTimer = 2.5;
      refreshTendencyPanel();
    });

    restartBtn.addEventListener("click", () => {
      restartRun();
    });
  }

  bindInput();

  // =============================
  // Player Combat and Movement
  // =============================
  function attemptPlayerAttack(type) {
    if (PLAYER.isDead) return;
    if (GAME.waveTransition > 0) return;
    if (PLAYER.attackCooldown > 0) return;
    if (PLAYER.attack) return;

    const def = ATTACK_DEFS[type];
    if (!def) return;
    if (PLAYER.stamina < def.staminaCost) return;

    PLAYER.stamina -= def.staminaCost;
    PLAYER.attackCooldown = def.cooldown;
    PLAYER.attack = {
      type,
      timer: 0,
      windup: def.windup,
      active: def.active,
      recovery: def.recovery,
      damage: def.damage,
      range: def.range,
      arc: def.arc,
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
    if (PLAYER.stamina < 20) return;

    PLAYER.stamina -= 20;
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
        PLAYER.parryTimer = 0.15;
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
      const dashSpeed = 7.3;
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
        PLAYER.vx = moveX * PLAYER.speed * speedScale;
        PLAYER.vy = moveY * PLAYER.speed * speedScale;
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
      if (enemy.blockTimer > 0) {
        damage *= 0.34;
        rewardEnemy(enemy, 0.18);
      }

      enemy.health -= damage;
      enemy.lastDamageTime = PLAYER.survivalTime;
      attack.hitEnemies.add(enemy.id);

      enemy.rl.lifetimeStats.damageTaken += damage;
      rewardEnemy(enemy, -1.25 * (damage / 14));

      PLAYER.score += Math.round(damage * 3);

      if (enemy.health <= 0) {
        killEnemy(enemy, true);
      }
    }
  }

  function dealDamageToPlayer(amount, sourceEnemy) {
    if (PLAYER.invulnerableTimer > 0) {
      rewardEnemy(sourceEnemy, -0.25);
      return false;
    }

    if (PLAYER.blockHeld) {
      if (PLAYER.parryTimer > 0) {
        sourceEnemy.stunTimer = 0.75;
        sourceEnemy.state = "stunned";
        sourceEnemy.attackIntent = null;
        rewardEnemy(sourceEnemy, -1.8);
        PLAYER.stamina = clamp(PLAYER.stamina + 12, 0, PLAYER.maxStamina);
        PLAYER.recentAction = "parry";
        return false;
      }

      const staminaDamage = amount * 1.2;
      PLAYER.stamina = Math.max(0, PLAYER.stamina - staminaDamage);
      const chip = amount * 0.25;
      PLAYER.health -= chip;
      PLAYER.recentAction = "blocking";
      rewardEnemy(sourceEnemy, 0.18);
      return true;
    }

    PLAYER.health -= amount;
    PLAYER.recentAction = "hit";
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
    enemy.attackIntent = {
      type,
      timer: ENEMY_ATTACK_DEFS[type].windup + extraDelay,
      didHit: false,
      startedAt: PLAYER.survivalTime,
    };
    enemy.state = `attack_${type}`;
  }

  function updateEnemyAction(enemy, dt) {
    if (!enemy.attackIntent && enemy.actionTimer > 0) {
      enemy.actionTimer -= dt;
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

    const dx = PLAYER.x - enemy.x;
    const dy = PLAYER.y - enemy.y;
    const dist = Math.hypot(dx, dy);

    const toPlayerAngle = Math.atan2(dy, dx);
    const facingDiff = Math.abs(angleDiff(toPlayerAngle, enemy.angle));

    const inRange = dist <= def.range + PLAYER.radius;
    const inArc = facingDiff <= def.arc / 2;
    const visible = hasLineOfSight(enemy.x, enemy.y, PLAYER.x, PLAYER.y);

    if (inRange && inArc && visible) {
      const baseDamage = def.damage * (1 + Math.min(0.5, (GAME.wave - 1) * 0.04));
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
    }

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

  function refreshTendencyPanel() {
    tendencyListEl.textContent = "";

    for (const archetypeName of Object.keys(ARCHETYPES)) {
      const tendency = computeArchetypeTendency(archetypeName);
      const li = document.createElement("li");
      const label = ARCHETYPES[archetypeName].label;
      li.textContent = `${label}: aggression ${formatPercent(tendency.aggression)}, spacing ${tendency.spacing}, reaction ${tendency.reactionDelay.toFixed(2)}s, punish ${tendency.punish}, epsilon ${tendency.epsilon.toFixed(2)}.`;
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

    GAME.waveReportTimer = 4;
    GAME.waveTransition = 4;
    GAME.wave += 1;

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
    timeValueEl.textContent = `${PLAYER.survivalTime.toFixed(1)}s`;
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
    const sky = ctx.createLinearGradient(0, 0, 0, height * 0.55);
    sky.addColorStop(0, "#304864");
    sky.addColorStop(1, "#0e1522");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height * 0.55);

    const floor = ctx.createLinearGradient(0, height * 0.45, 0, height);
    floor.addColorStop(0, "#1e2027");
    floor.addColorStop(1, "#0b0d11");
    ctx.fillStyle = floor;
    ctx.fillRect(0, height * 0.45, width, height * 0.55);
  }

  function renderWalls(width, height) {
    const rayCount = Math.ceil(width / CAMERA.rayStep);
    const halfHeight = height / 2;

    for (let i = 0; i < rayCount; i += 1) {
      const screenX = i * CAMERA.rayStep;
      const cameraX = screenX / width;
      const rayAngle = PLAYER.angle - CAMERA.fov / 2 + cameraX * CAMERA.fov;
      const ray = castRay(rayAngle);

      const dist = ray.distance;
      const wallHeight = Math.min(height, Math.floor(height / dist));
      const top = Math.floor(halfHeight - wallHeight / 2);

      const distanceShade = clamp(1 - dist / CAMERA.maxDepth, 0.2, 1);
      const sideShade = ray.side === 1 ? 0.72 : 1;
      const shade = distanceShade * sideShade;

      const r = Math.floor(95 * shade + 15);
      const g = Math.floor(115 * shade + 15);
      const b = Math.floor(135 * shade + 15);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(screenX, top, CAMERA.rayStep + 1, wallHeight);

      const fogAlpha = clamp(dist / CAMERA.maxDepth, 0, 0.82);
      ctx.fillStyle = `rgba(5, 8, 14, ${fogAlpha})`;
      ctx.fillRect(screenX, top, CAMERA.rayStep + 1, wallHeight);

      const colStart = Math.floor(screenX);
      const colEnd = Math.min(width - 1, Math.floor(screenX + CAMERA.rayStep));
      for (let x = colStart; x <= colEnd; x += 1) {
        depthBuffer[x] = dist;
      }
    }
  }

  function renderEnemySprites(width, height) {
    const sprites = [];

    for (const enemy of GAME.enemies) {
      const dx = enemy.x - PLAYER.x;
      const dy = enemy.y - PLAYER.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 0.08 || dist > CAMERA.maxDepth) continue;

      const theta = normalizeAngle(Math.atan2(dy, dx) - PLAYER.angle);
      if (Math.abs(theta) > CAMERA.fov * 0.7) continue;
      if (!hasLineOfSight(PLAYER.x, PLAYER.y, enemy.x, enemy.y)) continue;

      const screenX = (theta / CAMERA.fov + 0.5) * width;
      const size = clamp((height / dist) * 0.9, 8, height * 1.4);
      const footY = height / 2 + size * 0.45;

      sprites.push({ enemy, dist, screenX, size, footY });
    }

    sprites.sort((a, b) => b.dist - a.dist);

    for (const sprite of sprites) {
      const half = sprite.size / 2;
      const left = Math.floor(sprite.screenX - half);
      const right = Math.floor(sprite.screenX + half);
      const top = Math.floor(sprite.footY - sprite.size);
      const bodyHeight = Math.floor(sprite.size * 0.62);
      const headSize = Math.floor(sprite.size * 0.28);

      const distShade = clamp(1 - sprite.dist / CAMERA.maxDepth, 0.22, 1);
      const baseColor = ARCHETYPES[sprite.enemy.archetype].color;

      for (let x = left; x <= right; x += 1) {
        if (x < 0 || x >= width) continue;
        if (sprite.dist > depthBuffer[x] - 0.04) continue;

        const alpha = sprite.enemy.blockTimer > 0 ? 0.95 : 0.9;
        ctx.fillStyle = shadeColor(baseColor, distShade, alpha);
        ctx.fillRect(x, top + headSize, 1, bodyHeight);

        ctx.fillStyle = shadeColor("#f2d7b8", distShade, 0.95);
        ctx.fillRect(x, top, 1, headSize);

        if (sprite.enemy.stunTimer > 0) {
          ctx.fillStyle = `rgba(255, 255, 180, ${0.6 * distShade})`;
          ctx.fillRect(x, top - 2, 1, 2);
        }
      }

      const hpRatio = clamp(sprite.enemy.health / sprite.enemy.maxHealth, 0, 1);
      const barWidth = Math.floor(sprite.size * 0.52);
      const barLeft = Math.floor(sprite.screenX - barWidth / 2);
      const barY = top - 10;

      for (let x = 0; x < barWidth; x += 1) {
        const px = barLeft + x;
        if (px < 0 || px >= width) continue;
        if (sprite.dist > depthBuffer[px] - 0.05) continue;

        ctx.fillStyle = "rgba(28, 34, 42, 0.9)";
        ctx.fillRect(px, barY, 1, 4);
        if (x / barWidth <= hpRatio) {
          ctx.fillStyle = "rgba(255, 88, 88, 0.95)";
          ctx.fillRect(px, barY, 1, 4);
        }
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
    const baseX = width * 0.72;
    const baseY = height * 0.83;
    let swing = 0;
    let lift = 0;

    if (PLAYER.attack) {
      const total = PLAYER.attack.windup + PLAYER.attack.active + PLAYER.attack.recovery;
      const t = clamp(PLAYER.attack.timer / total, 0, 1);
      swing = Math.sin(t * Math.PI) * (PLAYER.attack.type === "heavy" ? 120 : 80);
      lift = Math.sin(t * Math.PI) * -35;
    }

    if (PLAYER.blockHeld) {
      swing -= 40;
      lift -= 16;
    }

    ctx.save();
    ctx.translate(baseX, baseY + lift);
    ctx.rotate((Math.PI / 180) * swing * 0.05);

    ctx.fillStyle = "rgba(28, 31, 42, 0.95)";
    ctx.fillRect(-40, -20, 130, 44);

    ctx.fillStyle = "rgba(208, 216, 228, 0.96)";
    ctx.fillRect(44, -8, 130, 12);

    ctx.fillStyle = "rgba(255, 191, 92, 0.9)";
    ctx.fillRect(32, -14, 14, 24);

    ctx.restore();
  }

  function renderOverlays(width, height) {
    if (GAME.statusTimer > 0 && GAME.statusText) {
      ctx.fillStyle = "rgba(255, 204, 128, 0.95)";
      ctx.font = "bold 20px Trebuchet MS";
      ctx.textAlign = "center";
      ctx.fillText(GAME.statusText, width / 2, 34);
      ctx.textAlign = "left";
    }

    if (PLAYER.health <= 28 && !PLAYER.isDead) {
      ctx.fillStyle = `rgba(160, 16, 16, ${0.12 + Math.sin(performance.now() / 120) * 0.05})`;
      ctx.fillRect(0, 0, width, height);
    }
  }

  function renderMiniMap(width, height) {
    const mapScale = 5;
    const mapW = MAP_WIDTH * mapScale;
    const mapH = MAP_HEIGHT * mapScale;
    const originX = width - mapW - 18;
    const originY = height - mapH - 18;

    ctx.fillStyle = "rgba(8, 12, 18, 0.72)";
    ctx.fillRect(originX - 5, originY - 5, mapW + 10, mapH + 10);

    for (let y = 0; y < MAP_HEIGHT; y += 1) {
      for (let x = 0; x < MAP_WIDTH; x += 1) {
        ctx.fillStyle = MAP[y][x] === 1 ? "rgba(90, 104, 120, 0.6)" : "rgba(25, 34, 46, 0.4)";
        ctx.fillRect(originX + x * mapScale, originY + y * mapScale, mapScale, mapScale);
      }
    }

    for (const enemy of GAME.enemies) {
      ctx.fillStyle = "rgba(255, 102, 102, 0.9)";
      ctx.fillRect(originX + enemy.x * mapScale - 1, originY + enemy.y * mapScale - 1, 3, 3);
    }

    ctx.fillStyle = "rgba(110, 255, 180, 0.95)";
    ctx.fillRect(originX + PLAYER.x * mapScale - 1.5, originY + PLAYER.y * mapScale - 1.5, 4, 4);

    ctx.strokeStyle = "rgba(110, 255, 180, 0.9)";
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

    renderSkyAndFloor(width, height);
    renderWalls(width, height);
    renderEnemySprites(width, height);
    renderWeapon(width, height);
    renderMiniMap(width, height);
    renderOverlays(width, height);
  }

  // =============================
  // Main Update Loop
  // =============================
  function updateGame(dt) {
    if (PLAYER.isDead) {
      GAME.statusTimer = Math.max(0, GAME.statusTimer - dt);
      return;
    }

    updatePlayer(dt);

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
    const dt = Math.min(0.05, (now - GAME.lastFrame) / 1000);
    GAME.lastFrame = now;

    updateGame(dt);
    renderFrame();

    requestAnimationFrame(gameLoop);
  }

  // =============================
  // Startup
  // =============================
  restartRun();
  refreshTendencyPanel();
  updateHUD();

  window.addEventListener("beforeunload", () => {
    rlManager.save();
  });

  requestAnimationFrame(gameLoop);
})();
