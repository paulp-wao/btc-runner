import { BackgroundEntity } from '~/entity/entity.background';
import { CameraEntity } from '~/entity/entity.camera';
import { GraphEntity } from '~/entity/entity.graph';
import { PhysicsStateEntity } from '~/entity/entity.physics-state';
import { PlatformEntity } from '~/entity/entity.platform';
import { PlayerEntity } from '~/entity/entity.player';
import { PlayerSpawnEntity } from '~/entity/entity.player-spawn';
import {
  createBoundaryResetSystem,
  createCameraUpdateSystem,
  createCamFollowPlayerSystem,
  createGravitySystem,
  createGraphCollisionSystem,
  createGraphUpdateSystem,
  createJumpSystem,
  createPlatformCollisionSystem,
  createPlayerAnimationSystem,
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

      await assetLoader.preload('running_egg', 'jumping_egg', 'celebration_egg');

      const background = new BackgroundEntity({
        width: gameConstants.virtualGameWidth * 3, // 3x width to cover camera movement
        height: gameConstants.virtualGameHeight * 10, // 10x the canvas height
        useGradient: true,
        canvasHeight: gameConstants.virtualGameHeight,
      });

      // Position to cover full visible area (start at negative x to cover left side when camera moves)
      background.move({ x: -gameConstants.virtualGameWidth, y: 0 });
      background.updateScrollProgress(0);

      const playerSpawn = new PlayerSpawnEntity({ x: 50, y: 232 });

      // Running egg sheet: 3 frames horizontal
      const runningEggSprite = assetLoader.createAnimatedSprite('running_egg', {
        frames: 3,
        frameWidth: 237,  // Adjust to actual frame width
        frameHeight: 269, // Adjust to actual frame height
        animationSpeed: 0.15,
      });

      // Jumping egg sheet: 4 frames horizontal
      const jumpingEggSprite = assetLoader.createAnimatedSprite('jumping_egg', {
        frames: 2,
        frameWidth: 233.25,  // Adjust to actual frame width
        frameHeight: 400, // Adjust to actual frame height
        animationSpeed: 0.25,
      });

      const celebrationEggSprite = assetLoader.createAnimatedSprite('celebration_egg', {
        frames: 2,
        frameWidth: 512,  // Adjust to actual frame width
        frameHeight: 488, // Adjust to actual frame height
        animationSpeed: 0.25,
      });

      const player = new PlayerEntity({
        running: runningEggSprite,
        jumping: jumpingEggSprite,
      });

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
      //entityStore.add(platform1, platform2, platform3, platform4);
      entityStore.add(player);
      entityStore.add(physics);
      entityStore.add(playerSpawn);
      entityStore.add(graph);


      systemAgg.add(
        createPlayerMovementSystem(di),
        createJumpSystem(di),
        createGravitySystem(di),
        createPlayerAnimationSystem(di),
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
