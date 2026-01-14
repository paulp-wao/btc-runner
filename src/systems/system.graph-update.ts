import type { ISystem } from '~/ecs/system.agg';
import { GraphEntity } from '~/entity/entity.graph';
import type { IDiContainer } from '~/util/di-container';

export const createGraphUpdateSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();
  let time = 0;
  let frameCounter = 0;

  return {
    name: () => 'graph-update-system',
    update: (delta: number) => {
      const graph = entityStore.first(GraphEntity);
      if (!graph) return;
      
      // Update scroll every frame for smooth movement
      graph.updateScroll(delta);
      
      // Track frames and only add a point when the interval is reached
      const framesBetweenPoints = graph.getFramesBetweenPoints();
      
      // Add first point immediately, then wait for interval between subsequent points
      if (frameCounter === 0) {
        // Add point on first frame or when counter resets
        time += delta * 0.5;
        const value = 
          Math.sin(time) * 0.5 +
          Math.sin(time * 2.3) * 0.3 +
          Math.sin(time * 0.7) * 0.2;
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

