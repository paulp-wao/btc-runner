import type { ISystem } from '~/ecs/system.agg';
import { CameraEntity } from '~/entity/entity.camera';
import { CloudEntity } from '~/entity/entity.cloud';
import { PlayerEntity } from '~/entity/entity.player';
import type { IDiContainer } from '~/util/di-container';

export const createCloudsSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();
  const gameConstants = di.gameConstants();

  let lastSpawnTime = 0;
  const spawnInterval = 60; // Spawn clouds periodically
  let initialized = false;

  // Altitude thresholds for cloud visibility
  // Player Y is negative (higher altitude = more negative)
  // Stars appear when progress > 0.3, which corresponds to upper areas
  // Clouds should be visible near ground (Y closer to 0) and fade as player climbs
  const cloudVisibleMaxY = -300; // Clouds fully visible when Y > this
  const cloudFadeEndY = -400; // Clouds completely hidden when Y < this

  return {
    name: () => 'clouds-system',
    update: (delta: number) => {
      // Spawn initial clouds on first update
      if (!initialized) {
        initialized = true;
        spawnInitialClouds(gameConstants, entityStore);
      }
      const player = entityStore.first(PlayerEntity);
      const camera = entityStore.first(CameraEntity);
      const clouds = entityStore.getAll(CloudEntity);

      if (!player || !camera) return;

      const playerY = player.ctr.y;
      const vpBounds = camera.vpBounds();

      // Calculate cloud visibility based on altitude
      // When player is near ground (Y closer to 0), clouds are visible
      // As player climbs (Y becomes more negative), clouds fade out
      let cloudAlpha = 1;
      if (playerY < cloudFadeEndY) {
        // Player is too high - no clouds (in star territory)
        cloudAlpha = 0;
      } else if (playerY < cloudVisibleMaxY) {
        // Transitioning - fade clouds out
        cloudAlpha = (playerY - cloudFadeEndY) / (cloudVisibleMaxY - cloudFadeEndY);
      }

      // Update existing clouds
      for (const cloud of clouds) {
        cloud.update(delta);
        cloud.setAlpha(cloudAlpha);

        // Remove clouds that have moved off the right side of the screen
        if (cloud.isOffScreen(vpBounds.x + vpBounds.width + 100)) {
          entityStore.remove(cloud);
        }
      }

      // Only spawn new clouds if they would be visible
      if (cloudAlpha > 0) {
        lastSpawnTime += 1;
        if (lastSpawnTime >= spawnInterval) {
          lastSpawnTime = 0;
          spawnCloud(vpBounds, cloudAlpha, entityStore);
        }

        // Ensure there are always some clouds when visible
        if (clouds.length < 3) {
          spawnCloud(vpBounds, cloudAlpha, entityStore);
        }
      }
    },
  };
};

function spawnCloud(
  vpBounds: { x: number; y: number; width: number; height: number },
  alpha: number,
  entityStore: ReturnType<IDiContainer['entityStore']>
): void {
  // Spawn cloud on the left side of the viewport
  const x = vpBounds.x - 50 - Math.random() * 50;

  // Clouds should appear in the upper portion of the visible area
  // but still below where stars would be
  const minY = vpBounds.y + vpBounds.height * 0.1;
  const maxY = vpBounds.y + vpBounds.height * 0.5;
  const y = minY + Math.random() * (maxY - minY);

  // Random scale for variety
  const scale = 0.5 + Math.random() * 1;

  const cloud = new CloudEntity(x, y, scale);
  cloud.setAlpha(alpha);
  cloud.setZIndex(5); // Behind most entities but in front of background
  entityStore.add(cloud);
}

function spawnInitialClouds(
  gameConstants: ReturnType<IDiContainer['gameConstants']>,
  entityStore: ReturnType<IDiContainer['entityStore']>
): void {
  const initialCloudCount = 20; // Start with many clouds
  const width = gameConstants.virtualGameWidth;
  const height = gameConstants.virtualGameHeight;

  for (let i = 0; i < initialCloudCount; i++) {
    // Spread clouds across the entire visible area and beyond
    const x = -100 + Math.random() * (width + 200);

    // Clouds in the upper portion of the screen
    // Y positions are screen coordinates (0 = top of screen)
    const minY = height * 0.05;
    const maxY = height * 0.5;
    const y = minY + Math.random() * (maxY - minY);

    // Varied sizes
    const scale = 0.4 + Math.random() * 1.2;

    const cloud = new CloudEntity(x, y - 200, scale);
    cloud.setAlpha(1);
    cloud.setZIndex(0);
    entityStore.add(cloud);
  }
}
