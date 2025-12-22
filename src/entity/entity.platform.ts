import * as PIXI from 'pixi.js';
import { Entity } from '../ecs/entity';

export class PlatformEntity extends Entity {
  constructor(props: { width: number; height: number; color?: number }) {
    const { width, height, color = 0xffffff } = props;
    const graphics = new PIXI.Graphics().rect(0, 0, width, height).fill({ color });
    super(graphics);
  }

  public setPosition(x: number, y: number) {
    this.ctr.position.set(x, y);
  }
}
