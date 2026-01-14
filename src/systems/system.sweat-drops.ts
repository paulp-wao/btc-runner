import type { ISystem } from '~/ecs/system.agg';
import { SweatDropEntity } from '~/entity/entity.sweat-drop';
import type { IDiContainer } from '~/util/di-container';

export const createSweatDropsSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();

  return {
    name: () => 'sweat-drops-system',
    update: (delta: number) => {
      const sweatDrops = entityStore.getAll(SweatDropEntity);

      for (const drop of sweatDrops) {
        drop.update(delta);

        if (drop.isExpired()) {
          entityStore.remove(drop);
        }
      }
    },
  };
};

