# BTC Runner Game

A 2D platformer game built with TypeScript and Pixi.js. Run and jump across platforms as a bunny in this browser-based game.

## Tech Stack

- **Pixi.js** - 2D WebGL rendering
- **pixi-viewport** - Camera/viewport system
- **pixi-filters** - Visual effects
- **Tween.js** - Animation/tweening
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Vitest** - Unit testing
- **Biome** - Linting and formatting

## Getting Started

### Prerequisites

- Node.js
- pnpm (v10.17.1+)

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Starts the development server with hot reload.

### Build

```bash
pnpm build
```

Compiles TypeScript and builds for production. Output is in the `/dist` directory.

### Testing

```bash
pnpm test
```

### Linting

```bash
pnpm lint        # Check for issues
pnpm lint:fix    # Auto-fix issues
```

### Deploy

```bash
pnpm deploy
```

Deploys to GitHub Pages.

## Controls

| Action | Keys |
|--------|------|
| Move Left | `A` or `Left Arrow` |
| Move Right | `D` or `Right Arrow` |
| Jump | `Spacebar` |

- Double-jump is enabled (jump twice in the air)

## Project Structure

```
src/
├── main.ts                 # Browser entry point
├── index.ts                # Engine factory and initialization
├── ecs/                    # Entity Component System core
│   ├── entity.ts           # Base Entity class
│   ├── entity.store.ts     # Entity management
│   └── system.agg.ts       # System aggregator
├── entity/                 # Game entities
│   ├── entity.player.ts    # Player (bunny sprite)
│   ├── entity.platform.ts  # Platforms
│   └── entity.physics-state.ts
├── systems/                # Game logic systems
│   ├── system.player-movement.ts
│   ├── system.gravity.ts
│   ├── system.platform-collision.ts
│   ├── system.jump.ts
│   └── system.cam-follow-player.ts
├── scenes/                 # Game scenes
│   └── simple/_main.ts     # Main game scene
└── util/                   # Utilities
    ├── di-container.ts     # Dependency injection
    ├── camera.ts           # Camera wrapper
    └── game.constants.ts   # Configuration
```

## Architecture

The game uses an **Entity-Component-System (ECS)** architecture:

- **Entities** - Game objects (player, platforms) extending PIXI.Container
- **Systems** - Game logic (movement, gravity, collision) with `update(delta)` methods
- **EntityStore** - Manages entity registration and retrieval
- **SystemAgg** - Manages system lifecycle and update loop

## Game Configuration

| Setting | Value |
|---------|-------|
| Virtual Resolution | 640x360 |
| Aspect Ratio | 16:9 |
| Gravity | 500 units/sec² |
| Player Speed | 10 units/tick |

## License

ISC
