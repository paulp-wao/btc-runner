import type { ISystem } from '~/ecs/system.agg';
import { CameraEntity } from '~/entity/entity.camera';
import { ConfettiEntity } from '~/entity/entity.confetti';
import { MemeEntity, type MemeType } from '~/entity/entity.meme';
import { NyanCatEntity } from '~/entity/entity.nyan-cat';
import { PhysicsStateEntity } from '~/entity/entity.physics-state';
import { PlayerEntity } from '~/entity/entity.player';
import { RainbowTextEntity } from '~/entity/entity.rainbow-text';
import type { IDiContainer } from '~/util/di-container';

export const createCelebrationSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();
  const gameConstants = di.gameConstants();
  const assetLoader = di.assetLoader();
  let celebrationStarted = false;
  let nyanCat: NyanCatEntity | null = null;
  let confetti: ConfettiEntity | null = null;
  const memes: MemeEntity[] = [];
  const texts: RainbowTextEntity[] = [];

  return {
    name: () => 'celebration-system',
    update: (delta: number) => {
      const physics = entityStore.first(PhysicsStateEntity);
      if (!physics) return;

      // Check if game is won and celebration hasn't started
      if (physics.gameWon && !celebrationStarted) {
        celebrationStarted = true;
        console.log('🎉 CELEBRATION STARTED! 🎉');

        const player = entityStore.first(PlayerEntity);
        const camera = entityStore.first(CameraEntity);
        
        // Get the visible area - use camera viewport or player position as reference
        const gameWidth = gameConstants.virtualGameWidth;
        const gameHeight = gameConstants.virtualGameHeight;
        
        // Calculate center position based on player's current location
        // The camera follows the player, so we position relative to player
        let centerX = gameWidth / 2;
        let centerY = gameHeight / 2;
        
        if (player) {
          // Use player position as center, but adjust for camera viewport
          centerX = player.ctr.x;
          centerY = player.ctr.y;
        }
        
        if (camera) {
          const vpBounds = camera.vpBounds();
          centerX = vpBounds.x + vpBounds.width / 2;
          centerY = vpBounds.y + vpBounds.height / 2;
        }

        console.log('Creating celebration entities at center:', centerX, centerY);

        // Create Nyan Cat - position it relative to center
        const nyanCatTexture = assetLoader.getTexture('nyan_cat');
        nyanCat = new NyanCatEntity(nyanCatTexture, gameWidth, gameHeight);
        nyanCat.ctr.x = centerX - gameWidth / 2 - 100; // Start off-screen left of visible area
        nyanCat.ctr.y = centerY;
        entityStore.add(nyanCat);
        console.log('Nyan Cat created at:', nyanCat.ctr.x, nyanCat.ctr.y);

        // Create confetti - position relative to center
        confetti = new ConfettiEntity(gameWidth, gameHeight, 150);
        confetti.ctr.x = centerX - gameWidth / 2;
        confetti.ctr.y = centerY - gameHeight / 2;
        entityStore.add(confetti);
        console.log('Confetti created at:', confetti.ctr.x, confetti.ctr.y);

        // Create multiple memes - position relative to center
        const memeTypes: MemeType[] = ['dancing_baby', 'all_your_base', 'rickroll', 'trollface', 'success_kid', 'bad_luck_brian'];
        for (let i = 0; i < 8; i++) {
          const memeType = memeTypes[Math.floor(Math.random() * memeTypes.length)];
          const meme = new MemeEntity(memeType, gameWidth, gameHeight);
          // Position memes in visible area around center
          meme.ctr.x = centerX - gameWidth / 2 + Math.random() * gameWidth;
          meme.ctr.y = centerY - gameHeight / 2 + Math.random() * gameHeight;
          memes.push(meme);
          entityStore.add(meme);
        }
        console.log('Created', memes.length, 'memes');

        // Create rainbow text messages - position relative to center, no duplicates, Y values at least 100px apart
        // Make sure they're never on the character
        const allMessages = ['EPIC!', 'LEGENDARY!', 'WINNING!', 'FRRFRRFRR!'];
        
        // Shuffle messages to randomize order
        const shuffledMessages = [...allMessages].sort(() => Math.random() - 0.5);
        const numTexts = Math.min(4, shuffledMessages.length);
        
        const startX = centerX - gameWidth / 2 + gameWidth * 0.2;
        const endX = centerX - gameWidth / 2 + gameWidth * 0.8;
        const startY = centerY - gameHeight / 2 + gameHeight * 0.2;
        const endY = centerY - gameHeight / 2 + gameHeight * 0.8;
        const minYSpacing = 100; // Minimum Y spacing between texts
        const minDistanceFromPlayer = 80; // Minimum distance from player position
        
        // Get player position to avoid
        let playerX = centerX;
        let playerY = centerY;
        if (player) {
          playerX = player.ctr.x;
          playerY = player.ctr.y;
        }
        
        const usedYValues: number[] = [];
        
        for (let i = 0; i < numTexts; i++) {
          const message = shuffledMessages[i];
          
          // Find a position that's at least 100px away from all existing Y positions
          // and at least minDistanceFromPlayer away from the player
          let x = 0;
          let y = 0;
          let attempts = 0;
          let foundPosition = false;
          
          while (!foundPosition && attempts < 200) {
            // Try a random position
            x = startX + Math.random() * (endX - startX);
            y = startY + Math.random() * (endY - startY);
            
            // Check if this Y is at least 100px away from all existing Y values
            let validY = true;
            for (const usedY of usedYValues) {
              if (Math.abs(y - usedY) < minYSpacing) {
                validY = false;
                break;
              }
            }
            
            // Check if position is far enough from player
            const distanceFromPlayer = Math.sqrt(
              Math.pow(x - playerX, 2) + Math.pow(y - playerY, 2)
            );
            const validDistance = distanceFromPlayer >= minDistanceFromPlayer;
            
            if (validY && validDistance) {
              foundPosition = true;
              usedYValues.push(y);
            }
            
            attempts++;
          }
          
          // If we couldn't find a valid position after many attempts, space them evenly
          // but still avoid the player area
          if (!foundPosition) {
            const spacing = (endY - startY) / (numTexts + 1);
            y = startY + spacing * (i + 1);
            
            // Try to position X away from player
            if (Math.abs(startX + (endX - startX) / 2 - playerX) < minDistanceFromPlayer) {
              // If center is too close to player, position to the side
              x = playerX < centerX ? endX - 50 : startX + 50;
            } else {
              x = startX + (endX - startX) / 2;
            }
            
            // Double check distance from player
            const distanceFromPlayer = Math.sqrt(
              Math.pow(x - playerX, 2) + Math.pow(y - playerY, 2)
            );
            if (distanceFromPlayer < minDistanceFromPlayer) {
              // Force position away from player
              const angle = Math.atan2(y - playerY, x - playerX);
              x = playerX + Math.cos(angle) * minDistanceFromPlayer;
              y = playerY + Math.sin(angle) * minDistanceFromPlayer;
            }
            
            usedYValues.push(y);
          }
          
          const text = new RainbowTextEntity(message, x, y);
          texts.push(text);
          entityStore.add(text);
        }
        console.log('Created', texts.length, 'text messages');
      }

      // Update celebration entities
      if (celebrationStarted) {
        nyanCat?.update(delta);
        confetti?.update(delta);
        for (const meme of memes) {
          meme.update(delta);
        }
        for (const text of texts) {
          text.update(delta);
        }
      }
    },
  };
};

