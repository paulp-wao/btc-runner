import type { ISystem } from '~/ecs/system.agg';
import { GraphEntity } from '~/entity/entity.graph';
import { MoonEntity } from '~/entity/entity.moon';
import type { IDiContainer } from '~/util/di-container';

export const createMoonUpdateSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();

  return {
    name: () => 'moon-update-system',
    update: (_delta: number) => {
      const moon = entityStore.first(MoonEntity);
      const graph = entityStore.first(GraphEntity);

      if (!moon || !graph) return;

      // Keep moon positioned at the end of the graph as it scrolls
      // Offset further right and up so player needs to jump to reach it
      const graphEndPoint = graph.getEndPoint();
      moon.move({ x: graphEndPoint.x + 150, y: graphEndPoint.y + 150 });
    },
  };
};
