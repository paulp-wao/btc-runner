import type { ISystem } from '~/ecs/system.agg';
import { MoonEntity } from '~/entity/entity.moon';
import { PhysicsStateEntity } from '~/entity/entity.physics-state';
import { PlayerEntity } from '~/entity/entity.player';
import type { IDiContainer } from '~/util/di-container';

export const createMoonCollisionSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();

  return {
    name: () => 'moon-collision-system',
    update: (_delta: number) => {
      const player = entityStore.first(PlayerEntity);
      const moon = entityStore.first(MoonEntity);
      const physics = entityStore.first(PhysicsStateEntity);

      if (!player || !moon || !physics) return;

      // Moon is anchored at center (0.5, 0.5), so we need to calculate the top surface
      const moonX = moon.ctr.x;
      const moonY = moon.ctr.y;
      const moonRadius = (moon.ctr.width / 2) * 0.8; // Use 80% of radius for landing area

      // Player is anchored at bottom-center (0.5, 1), so ctr.y is the bottom
      const playerBottom = player.ctr.y;
      const playerX = player.ctr.x;

      // Check if player is horizontally within the moon's landing area
      const horizontalDistance = Math.abs(playerX - moonX);
      if (horizontalDistance > moonRadius) return;

      // Calculate the y position of the moon's surface at the player's x position (circular surface)
      const surfaceOffset = Math.sqrt(moonRadius * moonRadius - horizontalDistance * horizontalDistance);
      const moonSurfaceY = moonY - surfaceOffset;

      // Check if player is falling and their bottom is at or below the moon surface
      if (physics.velocityY >= 0 && playerBottom >= moonSurfaceY) {
        // Land the player on the moon
        player.move({ x: player.ctr.x, y: moonSurfaceY });
        physics.velocityY = 0;
        physics.isGrounded = true;
        physics.gameWon = true;
        player.setCelebrating(true);
      }
    },
  };
};
