import type { ISystem } from '~/ecs/system.agg';
import { GameStateEntity } from '~/entity/entity.game-state';
import { GraphEntity } from '~/entity/entity.graph';
import { PhysicsStateEntity } from '~/entity/entity.physics-state';
import { PlayerEntity } from '~/entity/entity.player';
import type { IDiContainer } from '~/util/di-container';

export const createGraphCollisionSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();
  const gameConstants = di.gameConstants();

  // Threshold: how far below the screen the player can fall before dying
  const deathThreshold = gameConstants.virtualGameHeight + 100;

  return {
    name: () => 'graph-collision-system',
    update: (_delta: number) => {
      const player = entityStore.first(PlayerEntity);
      const physics = entityStore.first(PhysicsStateEntity);
      const graph = entityStore.first(GraphEntity);
      const gameState = entityStore.first(GameStateEntity);

      if (!player || !physics || !graph) return;

      // Player sprite is anchored at bottom-center (0.5, 1), so ctr.y IS the bottom
      const playerBottom = player.ctr.y;

      // ctr.x IS already the center due to anchor (0.5)
      const playerCenter = player.ctr.x;
      const curveY = graph.getYAtX(playerCenter);

      // Update the dot position on the graph (pass both X and Y so text can follow character)
      graph.updateDotPosition(playerCenter, playerBottom);

      // Check if player has fallen below the death threshold
      if (playerBottom > deathThreshold && gameState && !gameState.isLost()) {
        gameState.loseGame();
        player.stopAnimation();
        return;
      }

      if (curveY !== null) {
        // Check if the graph has fallen away at the player's position
        // If the falling offset is significant, the graph is gone
        const fallingOffset = graph.getFallingOffsetAtX(playerCenter);
        const graphFallenThreshold = 50; // If graph has fallen by this many pixels, it's gone

        if (fallingOffset < graphFallenThreshold) {
          // Graph is still solid - check for collision
          // Only check collision when player is falling or stationary (not jumping upward)
          if (physics.velocityY >= 0 && playerBottom >= curveY) {
            player.move({ x: player.ctr.x, y: curveY });
            physics.velocityY = 0;
            physics.isGrounded = true;
          }
        } else {
          // Graph has fallen away - if player was grounded here, they fall and die
          if (physics.isGrounded && gameState && !gameState.isLost()) {
            gameState.loseGame();
            player.stopAnimation();
          }
          physics.isGrounded = false;
        }
      }

      // Update debug bounding box visual with collision state
      //player.updateDebugVisual(isColliding);
    },
  };
};
