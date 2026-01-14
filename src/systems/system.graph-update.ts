import type { ISystem } from '~/ecs/system.agg';
import { GraphEntity } from '~/entity/entity.graph';
import type { IDiContainer } from '~/util/di-container';

export const createGraphUpdateSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();
  let frameCounter = 0;
  let lastValue = 0;

  return {
    name: () => 'graph-update-system',
    update: (delta: number) => {
      const graph = entityStore.first(GraphEntity);
      if (!graph) return;
      
      // Update scroll every frame for smooth movement
      graph.updateScroll(delta);
      
      // Track frames and only add a point when the interval is reached
      const framesBetweenPoints = 10;
      
      // Add first point immediately, then wait for interval between subsequent points
      if (frameCounter === 0) {
        let value = lastValue + Math.random() * 4 - 2;
        lastValue = value;
        graph.updateCurve(value);
      }
      
      frameCounter++;
      
      // Reset counter after the specified number of frames have elapsed
      if (frameCounter >= framesBetweenPoints) {
        frameCounter = 0;
      }
    },
  };
};

