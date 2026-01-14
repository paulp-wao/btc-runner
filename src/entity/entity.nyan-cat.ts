import * as PIXI from 'pixi.js';
import { Entity } from '../ecs/entity';

export class NyanCatEntity extends Entity {
  private readonly sprite: PIXI.Sprite;
  private velocityX: number;
  private readonly gameWidth: number;
  private readonly gameHeight: number;

  constructor(texture: PIXI.Texture, gameWidth: number, gameHeight: number) {
    const container = new PIXI.Container();
    super(container);

    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.velocityX = 3;

    // Create Nyan Cat sprite from preloaded texture
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.scale.set(0.25, 0.25); // Smaller scale
    container.addChild(this.sprite);

    // Start off-screen to the left
    this.ctr.x = -100;
    this.ctr.y = gameHeight * 0.3; // Middle-ish of screen
    this.setZIndex(100);
  }

  public update(delta: number): void {
    this.ctr.x += this.velocityX * delta;
    
    // Add some vertical movement (sine wave)
    this.ctr.y += Math.sin(this.ctr.x * 0.01) * 0.5;
    
    // Rotate slightly
    this.ctr.rotation += 0.02 * delta;
    
    // Remove when off screen
    if (this.ctr.x > this.gameWidth + 200) {
      this.ctr.x = -100;
      // Randomize Y position for next pass
      this.ctr.y = Math.random() * this.gameHeight * 0.6 + this.gameHeight * 0.2;
    }
  }
}

