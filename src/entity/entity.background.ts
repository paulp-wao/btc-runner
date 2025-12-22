import * as PIXI from 'pixi.js';
import { Entity } from '../ecs/entity';

export class BackgroundEntity extends Entity {
  constructor(props: { width: number; height: number; color?: number }) {
    const { width, height, color = 0x222222 } = props;
    const graphics = new PIXI.Graphics().rect(0, 0, width, height).fill({ color });
    super(graphics);
  }

  public move(point: { x: number; y: number }): void {
    this.ctr.position.set(point.x, point.y);
  }
}
