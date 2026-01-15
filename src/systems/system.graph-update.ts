import type { ISystem } from '~/ecs/system.agg';
import type { IEntityStore } from '~/ecs/entity.store';
import { GraphEntity } from '~/entity/entity.graph';
import { PhysicsStateEntity } from '~/entity/entity.physics-state';
import { PlayerEntity } from '~/entity/entity.player';
import { SweatDropEntity } from '~/entity/entity.sweat-drop';
import type { IDiContainer } from '~/util/di-container';

export const createGraphUpdateSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();
  let lastSweatSpawnTime = 0;
  const sweatSpawnInterval = 10; // Spawn sweat drops every 0.15 seconds

  return {
    name: () => 'graph-update-system',
    update: (delta: number) => {
      const graph = entityStore.first(GraphEntity);
      const physics = entityStore.first(PhysicsStateEntity);
      const player = entityStore.first(PlayerEntity);
      if (!graph) return;

      // Stop scrolling when game is won
      if (physics?.gameWon) {
        player?.setAnimationSpeedMultiplier(0.5);
        return;
      }

      // Calculate speed multiplier based on graph slope at player position
      let speedMultiplier = 1;
      if (player && physics?.isGrounded) {
        const playerX = player.ctr.x;
        const slope = graph.getSlopeAtX(playerX);

        if (slope !== null) {
          // Only slow down on upward slopes (positive slope)
          // Calculate the angle in degrees from the slope
          // slope = tan(angle), so angle = atan(slope)
          const angleRadians = Math.atan(slope);
          const angleDegrees = angleRadians * (180 / Math.PI);

          const steepThreshold = -60;

          // Slow down based on angle steepness (only for upward slopes)
          if (angleDegrees < steepThreshold) {
            speedMultiplier = 0.1;
            // Slow down player animation to half speed
            player.setAnimationSpeedMultiplier(0.5);

            // Spawn sweat drops periodically
            lastSweatSpawnTime++;
            if (lastSweatSpawnTime >= sweatSpawnInterval) {
              lastSweatSpawnTime = 0;
              spawnSweatDrops(player, entityStore, di);
            }
          } else {
            // Restore normal animation speed
            player.setAnimationSpeedMultiplier(1.0);
            lastSweatSpawnTime = 0; // Reset timer when not on steep slope
          }
        } else {
          // Restore normal animation speed when not on a slope
          player.setAnimationSpeedMultiplier(1.0);
        }

      }
      // Update scroll with speed multiplier
      graph.updateScroll(delta, speedMultiplier);
    },
  };
};

function spawnSweatDrops(player: PlayerEntity, entityStore: IEntityStore, di: IDiContainer): void {
    // Spawn from the top of the player (head area)
    // Player is anchored at bottom-center, so we need to offset upward
    const spawnX = player.ctr.x + - 5 +(Math.random() - 0.5) * 5; // Random horizontal spread
    const spawnY = player.getTopY() - 5 + Math.random() * 10; // Top of player

    // Random velocity - mostly upward and to the sides
    const velocityX = -5 - Math.random() * 5;
    const velocityY =  -1 - Math.random() * 5; // Mostly upward

    const sweatDrop = new SweatDropEntity(spawnX, spawnY, velocityX, velocityY, di);
    entityStore.add(sweatDrop);
}
