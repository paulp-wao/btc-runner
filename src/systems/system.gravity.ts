import * as PIXI from 'pixi.js';
import type { ISystem } from '~/ecs/system.agg';
import { PhysicsStateEntity } from '~/entity/entity.physics-state';
import { PlayerEntity } from '~/entity/entity.player';
import type { IDiContainer } from '~/util/di-container';

export const createGravitySystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();

  const gravity = 500;

  return {
    name: () => 'gravity-system',
    update: (delta: number) => {
      delta *= 0.125;
      const player = entityStore.first(PlayerEntity);
      const physics = entityStore.first(PhysicsStateEntity);
      if (!player || !physics) return;

      physics.velocityY += gravity * delta;

      const newY = player.ctr.y + physics.velocityY * delta;

      player.move(new PIXI.Point(player.ctr.x, newY));
    },
  };
};
