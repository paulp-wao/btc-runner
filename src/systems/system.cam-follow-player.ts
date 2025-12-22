import type { ISystem } from '~/ecs/system.agg';
import { PlayerEntity } from '~/entity/entity.player';
import type { IDiContainer } from '~/util/di-container';

export const createCamFollowPlayerSystem = (di: IDiContainer): ISystem => {
  const camera = di.camera();
  const entityStore = di.entityStore();

  let initialized = false;

  return {
    name: () => 'cam-follow-player-system',
    update: () => {
      if (initialized) return;

      const player = entityStore.first(PlayerEntity);
      if (!player) return;

      camera.follow(player.ctr, {
        speed: 0,
        acceleration: null,
        radius: 0,
      });

      initialized = true;
    },
  };
};
