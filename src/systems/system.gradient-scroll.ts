import type { ISystem } from '~/ecs/system.agg';
import { BackgroundEntity } from '~/entity/entity.background';
import type { IDiContainer } from '~/util/di-container';

export const createGradientScrollSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();
  let scrollProgress = 0; // 0 = green (bottom), 1 = black (top)

  return {
    name: () => 'gradient-scroll-system',
    update: (delta: number) => {
      const background = entityStore.first(BackgroundEntity);
      if (!background) return;

      // Increment scroll progress over time
      // Adjust the speed multiplier to control how fast it scrolls
      const scrollSpeed = 0.01; // Adjust this value to change scroll speed
      scrollProgress += delta * scrollSpeed;
      
      // Clamp progress between 0 and 1
      scrollProgress = Math.min(1, scrollProgress);
      
      // Update background position based on progress
      background.updateScrollProgress(scrollProgress);
    },
  };
};

