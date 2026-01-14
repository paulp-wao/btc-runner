import type { ISystem } from '~/ecs/system.agg';
import { GraphEntity } from '~/entity/entity.graph';
import type { IDiContainer } from '~/util/di-container';

export const createGraphUpdateSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();
  let time = 0;

  return {
    name: () => 'graph-update-system',
    update: (delta: number) => {
      const graph = entityStore.first(GraphEntity);
      if (!graph) return;

      // Generate a dynamic value using a combination of sine waves
      // This creates an interesting, continuously changing curve
      time += delta * 0.1; // Adjust speed of animation
      
      const value = 
        Math.sin(time) * 0.5 +
        Math.sin(time * 2.3) * 0.3 +
        Math.sin(time * 0.7) * 0.2;
      
      graph.updateCurve(value);
    },
  };
};

