import { BackgroundEntity } from '~/entity/entity.background';
import { CameraEntity } from '~/entity/entity.camera';
import { GraphEntity } from '~/entity/entity.graph';
import { PhysicsStateEntity } from '~/entity/entity.physics-state';
import { PlayerEntity } from '~/entity/entity.player';
import { PlayerSpawnEntity } from '~/entity/entity.player-spawn';
import {
  createBoundaryResetSystem,
  createCamFollowPlayerSystem,
  createCameraUpdateSystem,
  createGravitySystem,
  createGraphCollisionSystem,
  createGraphUpdateSystem,
  createJumpSystem,
  createPlayerMovementSystem,
} from '~/systems';
import type { IDiContainer } from '~/util/di-container';
import type { IScene } from '../scene-engine';

export const simpleScene = (di: IDiContainer): IScene => {
  const appRef = di.appRef();
  const assetLoader = di.assetLoader();
  const entityStore = di.entityStore();
  const gameConstants = di.gameConstants();
  const gameRef = di.gameRef();
  const systemAgg = di.systemAgg();

  return {
    load: async () => {
      const camera = new CameraEntity({ appRef, gameRef, gameConstants });
      
      await assetLoader.preload('bunny');
      
      const background = new BackgroundEntity({
        width: gameConstants.virtualGameWidth * 0.85,
        height: gameConstants.virtualGameHeight * 0.85,
        color: 0x222222,
      });
      
      background.move({ x: 0, y: 0 });
      
      const playerSpawn = new PlayerSpawnEntity({ x: 50, y: 232 });
      
      const bunnySprite = assetLoader.createSprite('bunny');
      const player = new PlayerEntity(bunnySprite);
      
      player.move({ x: playerSpawn.spawnX, y: playerSpawn.spawnY });
      
      const physics = new PhysicsStateEntity();
      
      const graph = new GraphEntity({
        width: gameConstants.virtualGameWidth,
        height: gameConstants.virtualGameHeight,
        maxPoints: 150,
        color: 0x00ff00,
        lineWidth: 2,
      });
      graph.move({ x: 0, y: 0 });
      
      entityStore.add(camera);
      entityStore.add(background);
      entityStore.add(player);
      entityStore.add(physics);
      entityStore.add(playerSpawn);
      entityStore.add(graph);

      systemAgg.add(
        //createPlayerMovementSystem(di),
        //createJumpSystem(di),
        createGravitySystem(di),
        createGraphCollisionSystem(di),
        //createBoundaryResetSystem(di),
        createCamFollowPlayerSystem(di),
        createCameraUpdateSystem(di),
        createGraphUpdateSystem(di),
      );
    },

    update: (delta: number) => {
      systemAgg.update(delta);
    },

    dispose: () => {},
  };
};
