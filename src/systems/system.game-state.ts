import type { ISystem } from '~/ecs/system.agg';
import { CameraEntity } from '~/entity/entity.camera';
import { GameStateEntity } from '~/entity/entity.game-state';
import { PhysicsStateEntity } from '~/entity/entity.physics-state';
import { PlayerEntity } from '~/entity/entity.player';
import { StartScreenEntity } from '~/entity/entity.start-screen';
import type { IDiContainer } from '~/util/di-container';

export const createGameStateSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();
  const sceneEngine = di.sceneEngine();

  let spacePressed = false;
  let initialized = false;

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === ' ' || e.code === 'Space') {
      spacePressed = true;
    }
  };

  window.addEventListener('keydown', onKeyDown);

  return {
    name: () => 'game-state-system',
    update: (delta: number) => {
      const gameState = entityStore.first(GameStateEntity);
      const startScreen = entityStore.first(StartScreenEntity);
      const camera = entityStore.first(CameraEntity);
      const player = entityStore.first(PlayerEntity);
      const physics = entityStore.first(PhysicsStateEntity);

      if (!gameState || !startScreen) return;

      // Initialize on first frame
      if (!initialized) {
        startScreen.show();
        initialized = true;
      }

      // Check if game was won (from physics state)
      if (gameState.isPlaying() && physics?.gameWon) {
        gameState.winGame();
        // Clear space pressed so player must press again to restart
        spacePressed = false;
      }

      // Update start screen animation and position (only when waiting to start, not when won)
      if (gameState.isWaiting()) {
        // Position start screen at camera's visible area
        if (camera) {
          const camPos = camera.zeroPos();
          startScreen.ctr.position.set(camPos.x, camPos.y);
        }

        startScreen.update(delta);

        // Start game when space is pressed
        if (spacePressed) {
          gameState.startGame();
          startScreen.hide();
          // Resume player animation
          if (player) {
            player.resumeAnimation();
          }
          spacePressed = false;
        }
      }

      // Handle restart when player is celebrating and space is pressed
      if (player?.getIsCelebrating() && spacePressed) {
        spacePressed = false;
        sceneEngine.reload();
      }
    },
  };
};
