import * as PIXI from 'pixi.js';
import { Entity } from '../ecs/entity';

export interface PlayerAnimations {
  running: PIXI.AnimatedSprite;
  jumping: PIXI.AnimatedSprite;
}

export class PlayerEntity extends Entity {
  private runningSprite: PIXI.AnimatedSprite;
  private jumpingSprite: PIXI.AnimatedSprite;
  private isJumping = false;
  private collisionWidth: number;
  private collisionHeight: number;

  constructor(animations: PlayerAnimations) {
    const container = new PIXI.Container();
    super(container);

    this.runningSprite = animations.running;
    this.jumpingSprite = animations.jumping;

    // Anchor at bottom-center so both sprites share the same "feet" position
    this.runningSprite.anchor.set(0.5, 1);
    this.jumpingSprite.anchor.set(0.5, 1);

    // Jump animation plays once and holds on last frame
    this.jumpingSprite.loop = false;

    container.addChild(this.runningSprite);
    container.addChild(this.jumpingSprite);

    this.runningSprite.visible = true;
    this.jumpingSprite.visible = false;
    this.runningSprite.play();

    this.ctr.scale.set(0.1, 0.1);

    // Store collision dimensions based on running sprite (consistent hitbox)
    this.collisionWidth = this.runningSprite.width * 0.1;
    this.collisionHeight = this.runningSprite.height * 0.1;
  }

  // Override rect to use consistent collision dimensions
  public override get rect(): PIXI.Rectangle {
    return new PIXI.Rectangle(
      this.ctr.x - this.collisionWidth / 2,
      this.ctr.y - this.collisionHeight,
      this.collisionWidth,
      this.collisionHeight,
    );
  }

  // Override moveRect to use consistent collision dimensions
  public override get moveRect(): PIXI.Rectangle {
    const heightBuffer = this.collisionHeight / 1.5;
    const widthBuffer = this.collisionWidth / 1.5;
    return new PIXI.Rectangle(
      this.ctr.x - this.collisionWidth / 2 + widthBuffer / 2,
      this.ctr.y - this.collisionHeight + heightBuffer,
      this.collisionWidth - widthBuffer,
      this.collisionHeight - heightBuffer,
    );
  }

  public move(point: { x: number; y: number }): void {
    this.ctr.position.set(point.x, point.y);
  }

  public setJumping(jumping: boolean): void {
    if (this.isJumping === jumping) return;

    this.isJumping = jumping;

    // Stop both first
    this.runningSprite.stop();
    this.jumpingSprite.stop();

    if (jumping) {
      this.runningSprite.visible = false;
      this.jumpingSprite.visible = true;
      this.jumpingSprite.gotoAndPlay(0);
    } else {
      this.jumpingSprite.visible = false;
      this.jumpingSprite.currentFrame = 0;
      this.runningSprite.visible = true;
      this.runningSprite.play();
    }
  }
}
