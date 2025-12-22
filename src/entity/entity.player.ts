import type * as PIXI from 'pixi.js';
import { Entity } from '../ecs/entity';

export class PlayerEntity extends Entity {
  constructor(sprite: PIXI.Sprite) {
    super(sprite);
    this.ctr.scale.set(0.75, 0.75);
  }

  public move(point: { x: number; y: number }): void {
    this.ctr.position.set(point.x, point.y);
  }
}
