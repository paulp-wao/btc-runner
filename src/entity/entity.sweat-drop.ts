import * as PIXI from 'pixi.js';
import { Entity } from '../ecs/entity';
import type { IDiContainer } from '../util/di-container';

export class SweatDropEntity extends Entity {
  private readonly sprite: PIXI.Sprite;
  public velocityX: number;
  public velocityY: number;
  public lifetime: number;
  public maxLifetime: number;

  constructor(x: number, y: number, velocityX: number, velocityY: number, di: IDiContainer) {
    const container = new PIXI.Container();
    super(container);
    const assetLoader = di.assetLoader();
    const sweatDropTexture = assetLoader.getTexture('sweat_drop');
    this.sprite = new PIXI.Sprite(sweatDropTexture);
    // Anchor at center for rotation/positioning
    this.sprite.anchor.set(0.5, 0.5);
    // Scale down to 25% of original size
    this.sprite.scale.set(0.25, 0.25);
    container.addChild(this.sprite);

    this.ctr.position.set(x, y);
    this.ctr.zIndex = 25; // Higher than player (20) so sweat drops render on top
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.maxLifetime = 30; // 1 second lifetime
    this.lifetime = this.maxLifetime;
  }

  public update(delta: number): void {
    // Update position based on velocity
    this.ctr.x += this.velocityX * delta;
    this.velocityY += 0.5
    this.ctr.y += this.velocityY * delta;

    // Rotate counter-clockwise based on velocityY (faster fall = faster rotation)
    // Negative velocityY means moving down, so we use negative for counter-clockwise
    let rotation = -1 * (5 + this.velocityY)/10 * (.5 * Math.PI);
    if (rotation > Math.PI * .5){
      rotation = Math.PI * .5;
    }
    this.sprite.rotation = rotation; 

    // Update lifetime
    this.lifetime -= 1;

    // Update alpha based on remaining lifetime
    const alpha = Math.max(0, this.lifetime / this.maxLifetime);
    this.sprite.alpha = alpha;
  }

  public isExpired(): boolean {
    return this.lifetime <= 0;
  }
}

