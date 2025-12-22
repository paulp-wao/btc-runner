import type { ISystem } from '~/ecs/system.agg';
import { CameraEntity } from '~/entity/entity.camera';
import type { IDiContainer } from '~/util/di-container';

export const createCameraUpdateSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();
  const camera = entityStore.first(CameraEntity);

  return {
    name: () => 'camera-update-system',
    update: (delta: number) => {
      camera?.update(delta);
    },
  };
};
