import type { ISystem } from '~/ecs/system.agg';
import { GameStateEntity } from '~/entity/entity.game-state';
import { PhysicsStateEntity } from '~/entity/entity.physics-state';
import type { IDiContainer } from '~/util/di-container';

export const createJumpSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();

  const jumpForce = -300;
  const boostedJumpForce = -600; // Double height when walking up
  const maxJumps = 2;
  let jumpCount = 0;
  let jumpPressed = false;
  let canJump = true;
  let upKeyPressed = false;

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      upKeyPressed = true;
    }
    if (e.key === ' ' || e.code === 'Space') {
      // Only register jump if game is playing
      const gameState = entityStore.first(GameStateEntity);
      if (gameState?.isPlaying() && canJump && jumpCount < maxJumps) {
        jumpPressed = true;
        canJump = false;
      }
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      upKeyPressed = false;
    }
    if (e.key === ' ' || e.code === 'Space') {
      canJump = true;
    }
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  return {
    name: () => 'jump-system',
    update: () => {
      const physics = entityStore.first(PhysicsStateEntity);
      if (!physics) return;

      // Reset jump count when grounded
      if (physics.isGrounded) {
        jumpCount = 0;
      }

      if (jumpPressed) {
        // Double jump height when walking upward
        physics.velocityY = upKeyPressed ? boostedJumpForce : jumpForce;
        physics.isGrounded = false;
        jumpCount++;
        jumpPressed = false;
      }
    },
  };
};
