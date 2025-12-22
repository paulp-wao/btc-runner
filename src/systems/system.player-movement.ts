import * as PIXI from 'pixi.js';
import type { ISystem } from '~/ecs/system.agg';
import { PlayerEntity } from '~/entity/entity.player';
import type { IDiContainer } from '~/util/di-container';

export const createPlayerMovementSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();

  const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  const speed = 10;

  const onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        keys.up = true;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        keys.down = true;
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        keys.left = true;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        keys.right = true;
        break;
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        keys.up = false;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        keys.down = false;
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        keys.left = false;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        keys.right = false;
        break;
    }
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  return {
    name: () => 'player-movement-system',
    update: (delta: number) => {
      const player = entityStore.first(PlayerEntity);
      if (!player) return;

      let dx = 0;
      let dy = 0;

      if (keys.up) dy -= 1;
      if (keys.down) dy += 1;
      if (keys.left) dx -= 1;
      if (keys.right) dx += 1;

      if (dx === 0 && dy === 0) return;

      const newX = player.ctr.x + dx * speed * delta;
      const newY = player.ctr.y + dy * speed * delta;

      player.move(new PIXI.Point(newX, newY));
    },
  };
};
