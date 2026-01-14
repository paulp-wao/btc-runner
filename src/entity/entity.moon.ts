import * as PIXI from 'pixi.js';
import { Entity } from '../ecs/entity';

export class MoonEntity extends Entity {
  private readonly sprite: PIXI.Sprite;

  constructor(texture: PIXI.Texture) {
    const sprite = new PIXI.Sprite(texture);
    super(sprite);

    this.sprite = sprite;
    this.sprite.anchor.set(0.5, 0.5);
  }

  public move(point: { x: number; y: number }): void {
    this.ctr.position.set(point.x, point.y);
  }

  public setScale(scale: number): void {
    this.ctr.scale.set(scale, scale);
  }
}
