import { BackgroundEntity } from '~/entity/entity.background';
import { CameraEntity } from '~/entity/entity.camera';
import { PhysicsStateEntity } from '~/entity/entity.physics-state';
import { PlatformEntity } from '~/entity/entity.platform';
import { PlayerEntity } from '~/entity/entity.player';
import { PlayerSpawnEntity } from '~/entity/entity.player-spawn';
import {
  createBoundaryResetSystem,
  createCamFollowPlayerSystem,
  createCameraUpdateSystem,
  createGravitySystem,
  createJumpSystem,
  createPlatformCollisionSystem,
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
      
      const platform1 = new PlatformEntity({ width: 100, height: 16 });
      platform1.setPosition(50, 250);
      
      const platform2 = new PlatformEntity({ width: 120, height: 16 });
      platform2.setPosition(200, 200);
      
      const platform3 = new PlatformEntity({ width: 80, height: 16 });
      platform3.setPosition(380, 150);
      
      const platform4 = new PlatformEntity({ width: 150, height: 16 });
      platform4.setPosition(100, 100);
      
      const physics = new PhysicsStateEntity();
      
      entityStore.add(camera);
      entityStore.add(background);
      entityStore.add(platform1, platform2, platform3, platform4);
      entityStore.add(player);
      entityStore.add(physics);
      entityStore.add(playerSpawn);

      systemAgg.add(
        createPlayerMovementSystem(di),
        createJumpSystem(di),
        createGravitySystem(di),
        createPlatformCollisionSystem(di),
        createBoundaryResetSystem(di),
        createCamFollowPlayerSystem(di),
        createCameraUpdateSystem(di),
      );
    },

    update: (delta: number) => {
      systemAgg.update(delta);
    },

    dispose: () => {},
  };
};
