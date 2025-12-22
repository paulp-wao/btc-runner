import type { ISystem } from '~/ecs/system.agg';
import { PhysicsStateEntity } from '~/entity/entity.physics-state';
import type { IDiContainer } from '~/util/di-container';

export const createJumpSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();

  const jumpForce = -300;
  const maxJumps = 2;
  let jumpCount = 0;
  let jumpPressed = false;
  let canJump = true;

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === ' ' || e.code === 'Space') {
      if (canJump && jumpCount < maxJumps) {
        jumpPressed = true;
        canJump = false;
      }
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
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
        physics.velocityY = jumpForce;
        physics.isGrounded = false;
        jumpCount++;
        jumpPressed = false;
      }
    },
  };
};
