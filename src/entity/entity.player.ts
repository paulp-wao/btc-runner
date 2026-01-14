import * as PIXI from 'pixi.js';
import { Entity } from '../ecs/entity';

export class PlayerEntity extends Entity {
  private readonly debugGraphics: PIXI.Graphics;

  constructor(sprite: PIXI.Sprite) {
    super(sprite);
    this.ctr.scale.set(0.75, 0.75);
    
    // Create debug graphics for bounding box
    this.debugGraphics = new PIXI.Graphics();
    this.ctr.addChild(this.debugGraphics);
    this.updateBoundingBoxVisual();
  }

  public move(point: { x: number; y: number }): void {
    this.ctr.position.set(point.x, point.y);
  }

  private updateBoundingBoxVisual(isColliding: boolean = false): void {
    this.debugGraphics.clear();
    
    // Draw bounding box outline
    // Position is relative to the container, so we use 0, 0
    this.debugGraphics.rect(0, 0, this.ctr.width, this.ctr.height);
    
    // Blue when colliding, black when not colliding
    const color = isColliding ? 0x0000ff : 0x000000;
    this.debugGraphics.stroke({ color, width: 2 });
  }

  public updateDebugVisual(isColliding: boolean = false): void {
    this.updateBoundingBoxVisual(isColliding);
  }
}
