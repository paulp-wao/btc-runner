import type { ISystem } from '~/ecs/system.agg';
import { GraphEntity } from '~/entity/entity.graph';
import { PhysicsStateEntity } from '~/entity/entity.physics-state';
import { PlayerEntity } from '~/entity/entity.player';
import type { IDiContainer } from '~/util/di-container';

export const createGraphCollisionSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();

  return {
    name: () => 'graph-collision-system',
    update: (_delta: number) => {
      const player = entityStore.first(PlayerEntity);
      const physics = entityStore.first(PhysicsStateEntity);
      const graph = entityStore.first(GraphEntity);

      if (!player || !physics || !graph) return;

      // Player sprite is anchored at bottom-center (0.5, 1), so ctr.y IS the bottom
      const playerBottom = player.ctr.y;
      let isColliding = false;

      // ctr.x IS already the center due to anchor (0.5)
      const playerCenter = player.ctr.x;
      const curveY = graph.getYAtX(playerCenter);

      if (curveY !== null) {
        // Only check collision when player is falling or stationary (not jumping upward)
        if (physics.velocityY >= 0 && playerBottom >= curveY) {
            isColliding = true;
            player.move({ x: player.ctr.x, y: curveY });
            physics.velocityY = 0;
            physics.isGrounded = true;
        }
      }

      // Update debug bounding box visual with collision state
      player.updateDebugVisual(isColliding);

    },
  };
};

