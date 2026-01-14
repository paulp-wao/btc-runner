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

      const playerBottom = player.ctr.y + player.ctr.height;
      let isColliding = false;

      const playerCenter = player.ctr.x + player.ctr.width /2;
      const curveY = graph.getCurveYAtX(playerCenter);

      if (curveY !== null) {
        // Only check collision when player is falling or stationary (not jumping upward)
        if (physics.velocityY >= 0 && playerBottom > curveY) {
            player.move({ x: player.ctr.x, y: curveY - player.ctr.height });
            physics.velocityY = 0;
            physics.isGrounded = true;
        }
      }

      // Update debug bounding box visual with collision state
      player.updateDebugVisual(isColliding);

    },
  };
};

