import type { ISystem } from '~/ecs/system.agg';
import { BackgroundEntity } from '~/entity/entity.background';
import { GraphEntity } from '~/entity/entity.graph';
import type { IDiContainer } from '~/util/di-container';

export const createBackgroundScrollSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();
  let accumulatedProgress = 0;
  let previousGraphValue = 0;
  let initialized = false;

  return {
    name: () => 'background-scroll-system',
    update: (delta: number) => {
      // ONLY reads from graph and updates background - does not touch player, physics, or collision
      const background = entityStore.first(BackgroundEntity);
      const graph = entityStore.first(GraphEntity);
      
      if (!background || !graph) return;

      // Read-only access to graph value
      const currentGraphValue = graph.getLatestValue();
      
      // Initialize previous value on first frame
      if (!initialized) {
        previousGraphValue = currentGraphValue;
        initialized = true;
        return;
      }
      
      // Calculate the change in graph value
      // When graph value increases, we're moving up (accumulate progress)
      // The graph oscillates between -1 and 1, so we track net upward movement
      const valueChange = currentGraphValue - previousGraphValue;
      
      // Accumulate progress based on upward movement
      // Scale the change to control scroll speed
      const scrollSpeed = 0.05; // Adjust this to control how fast background scrolls
      
      // Only accumulate when value increases (moving up)
      if (valueChange > 0) {
        accumulatedProgress += valueChange * scrollSpeed;
      }
      
      // Clamp progress between 0 and 1
      accumulatedProgress = Math.max(0, Math.min(1, accumulatedProgress));
      
      // ONLY updates background position - does not affect gameplay
      background.updateScrollProgress(accumulatedProgress);
      
      previousGraphValue = currentGraphValue;
    },
  };
};

