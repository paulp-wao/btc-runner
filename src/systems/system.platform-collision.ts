import * as PIXI from 'pixi.js';
import type { ISystem } from '~/ecs/system.agg';
import { PhysicsStateEntity } from '~/entity/entity.physics-state';
import { PlatformEntity } from '~/entity/entity.platform';
import { PlayerEntity } from '~/entity/entity.player';
import type { IDiContainer } from '~/util/di-container';

export const createPlatformCollisionSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();

  return {
    name: () => 'platform-collision-system',
    update: () => {
      const player = entityStore.first(PlayerEntity);
      const physics = entityStore.first(PhysicsStateEntity);
      if (!player || !physics) return;

      const platforms = entityStore.getAll(PlatformEntity);

      physics.isGrounded = false;

      for (const platform of platforms) {
        const playerTop = player.ctr.y;
        const playerBottom = player.ctr.y + player.ctr.height;
        const playerLeft = player.ctr.x;
        const playerRight = player.ctr.x + player.ctr.width;

        const platTop = platform.ctr.y;
        const platBottom = platform.ctr.y + platform.ctr.height;
        const platLeft = platform.ctr.x;
        const platRight = platform.ctr.x + platform.ctr.width;

        // Check if player overlaps with platform
        const horizontalOverlap = playerRight > platLeft && playerLeft < platRight;
        const verticalOverlap = playerBottom > platTop && playerTop < platBottom;

        if (!horizontalOverlap || !verticalOverlap) continue;

        // Calculate overlap amounts
        const overlapTop = playerBottom - platTop;
        const overlapBottom = platBottom - playerTop;
        const overlapLeft = playerRight - platLeft;
        const overlapRight = platRight - playerLeft;

        // Find the smallest overlap to determine collision direction
        const minOverlap = Math.min(overlapTop, overlapBottom, overlapLeft, overlapRight);

        if (minOverlap === overlapTop && physics.velocityY >= 0) {
          // Landing on top of platform
          player.move(new PIXI.Point(player.ctr.x, platTop - player.ctr.height));
          physics.velocityY = 0;
          physics.isGrounded = true;
        } else if (minOverlap === overlapBottom && physics.velocityY < 0) {
          // Hitting bottom of platform (head bump)
          player.move(new PIXI.Point(player.ctr.x, platBottom));
          physics.velocityY = 0;
        } else if (minOverlap === overlapLeft) {
          // Hitting left side of platform (player coming from left)
          player.move(new PIXI.Point(platLeft - player.ctr.width, player.ctr.y));
        } else if (minOverlap === overlapRight) {
          // Hitting right side of platform (player coming from right)
          player.move(new PIXI.Point(platRight, player.ctr.y));
        }
      }
    },
  };
};
