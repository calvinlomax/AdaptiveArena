# Adaptive Arena

Adaptive Arena is a browser-based first-person arena slasher built with plain HTML, CSS, and JavaScript. The world simulation stays on a 2D plane, while the player sees a pseudo-3D raycast view inspired by early FPS games.

## Repo Layout

- `index.html`: page shell, homepage, in-game HUD, menus, and modals
- `style.css`: shared visual styling for the homepage, HUD, overlays, and shop
- `package.json`: lightweight local scripts, no runtime dependencies
- `package.js`: small metadata mirror for the repo entrypoint
- `src/main.js`: homepage boot flow and save-slot selection
- `src/storage/save-manager.js`: save-slot persistence, active save tracking, overwrite flow
- `src/game/data.js`: static combat, boss, archetype, shop, and maze configuration data
- `src/game/runtime.js`: gameplay runtime, renderer, combat, AI, RL model updates, shop, bosses

## Save System

The game now uses up to four local save slots. Each save stores:

- Hero name
- Maze number
- Player level
- Enemy level
- Bosses defeated
- Remaining lives
- Inventory and currencies
- Procedural generation seeds for the active maze/theme
- Enemy RL model weights

Loading a save restores progression, model weights, and the saved procedural seed bundle so the current maze regenerates with the same layout and textures. The game autosaves the active slot when a maze ends, on major progression changes, and periodically during play.

## Progression Rules

- Boss mazes appear every third maze
- A new run starts with exactly one life
- Beating a boss grants one additional life
- Restarting after death resets the active save back to a clean run, including enemy model weights

## Learning Curve

Enemy models still train live during combat, but a round-end normalization pass now keeps aggregate learning growth on a flatter linear curve between mazes while preserving archetype variance. This avoids runaway spikes without making all models converge into the same behavior.

## Run Locally

No build tooling is required.

```bash
npm run serve
```

Then open `http://localhost:8000`.

You can also open the repo directly in a static host such as GitHub Pages.

## Syntax Check

```bash
npm run check
```
