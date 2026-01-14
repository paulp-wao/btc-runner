import type { ISystem } from '~/ecs/system.agg';
import { SimpleMeshEntity } from '~/entities/SimpleMesh';
import type { IDiContainer } from '~/util/di-container';

export const createMeshUpdateSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();

  return {
    name: () => 'mesh-update-system',
    update: (delta: number) => {
      const meshEntities = entityStore.getAll(SimpleMeshEntity);
      for (const mesh of meshEntities) {
        mesh.update(delta);
      }
    },
  };
};
