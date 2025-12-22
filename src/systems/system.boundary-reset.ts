import * as PIXI from 'pixi.js';
import type { ISystem } from '~/ecs/system.agg';
import { BackgroundEntity } from '~/entity/entity.background';
import { PhysicsStateEntity } from '~/entity/entity.physics-state';
import { PlayerEntity } from '~/entity/entity.player';
import { PlayerSpawnEntity } from '~/entity/entity.player-spawn';
import type { IDiContainer } from '~/util/di-container';

export const createBoundaryResetSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();

  return {
    name: () => 'boundary-reset-system',
    update: () => {
      const player = entityStore.first(PlayerEntity);
      const background = entityStore.first(BackgroundEntity);
      const physics = entityStore.first(PhysicsStateEntity);
      const spawn = entityStore.first(PlayerSpawnEntity);
      if (!player || !background || !physics || !spawn) return;

      const playerTop = player.ctr.y;
      const bgBottom = background.ctr.y + background.ctr.height;

      // Check if player is completely below background
      const isBelowBackground = playerTop > bgBottom;

      if (isBelowBackground) {
        player.move(new PIXI.Point(spawn.spawnX, spawn.spawnY));
        physics.velocityY = 0;
      }
    },
  };
};
