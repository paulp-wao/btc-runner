import type { ISystem } from '~/ecs/system.agg';
import { PhysicsStateEntity } from '~/entity/entity.physics-state';
import { PlayerEntity } from '~/entity/entity.player';
import type { IDiContainer } from '~/util/di-container';

export const createPlayerAnimationSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();

  return {
    name: () => 'player-animation-system',
    update: () => {
      const physics = entityStore.first(PhysicsStateEntity);
      const player = entityStore.first(PlayerEntity);

      if (!physics || !player) return;

      // Switch to jumping animation when not grounded, running when grounded
      player.setJumping(!physics.isGrounded);
    },
  };
};
