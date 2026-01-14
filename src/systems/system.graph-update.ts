import type { ISystem } from '~/ecs/system.agg';
import { GraphEntity } from '~/entity/entity.graph';
import { PhysicsStateEntity } from '~/entity/entity.physics-state';
import type { IDiContainer } from '~/util/di-container';

export const createGraphUpdateSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();

  return {
    name: () => 'graph-update-system',
    update: (delta: number) => {
      const graph = entityStore.first(GraphEntity);
      const physics = entityStore.first(PhysicsStateEntity);
      if (!graph) return;

      // Stop scrolling when game is won
      if (physics?.gameWon) return;

      // Update scroll every frame for smooth movement
      graph.updateScroll(delta);
    },
  };
};
