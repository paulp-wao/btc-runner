import * as PIXI from 'pixi.js';
import { Entity } from '../ecs/entity';

export interface PlayerAnimations {
  running: PIXI.AnimatedSprite;
  jumping: PIXI.AnimatedSprite;
  celebrating: PIXI.AnimatedSprite;
}

export class PlayerEntity extends Entity {
  private runningSprite: PIXI.AnimatedSprite;
  private jumpingSprite: PIXI.AnimatedSprite;
  private celebratingSprite: PIXI.AnimatedSprite;
  private isJumping = false;
  private isCelebrating = false;
  private collisionWidth: number;
  private collisionHeight: number;
  private readonly debugGraphics: PIXI.Graphics;
  private originalRunningSpeed: number;
  private originalJumpingSpeed: number;
  private originalCelebratingSpeed: number;

  constructor(animations: PlayerAnimations) {
    const container = new PIXI.Container();
    super(container);

    this.runningSprite = animations.running;
    this.jumpingSprite = animations.jumping;
    this.celebratingSprite = animations.celebrating;

    // Anchor at bottom-center so both sprites share the same "feet" position
    this.runningSprite.anchor.set(0.5, 1);
    this.jumpingSprite.anchor.set(0.5, 1);
    this.celebratingSprite.anchor.set(0.5, 1);

    // Jump animation plays once and holds on last frame
    this.jumpingSprite.loop = false;

    container.addChild(this.runningSprite);
    container.addChild(this.jumpingSprite);
    container.addChild(this.celebratingSprite);

    this.runningSprite.visible = true;
    this.jumpingSprite.visible = false;
    this.celebratingSprite.visible = false;
    this.runningSprite.play();

    // Store original animation speeds
    this.originalRunningSpeed = this.runningSprite.animationSpeed;
    this.originalJumpingSpeed = this.jumpingSprite.animationSpeed;
    this.originalCelebratingSpeed = this.celebratingSprite.animationSpeed;

    this.ctr.scale.set(0.1, 0.1);

    // Store collision dimensions based on running sprite (consistent hitbox)
    this.collisionWidth = this.runningSprite.width * 0.1;
    this.collisionHeight = this.runningSprite.height * 0.1;

    // Create debug graphics for bounding box
    this.debugGraphics = new PIXI.Graphics();
    this.ctr.addChild(this.debugGraphics);
    this.updateBoundingBoxVisual();
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
    if (this.isJumping === jumping || this.isCelebrating) return;

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

  public setCelebrating(celebrating: boolean): void {
    if (this.isCelebrating === celebrating) return;

    this.isCelebrating = celebrating;

    // Stop all animations first
    this.runningSprite.stop();
    this.jumpingSprite.stop();
    this.celebratingSprite.stop();

    if (celebrating) {
      this.isJumping = false;
      this.runningSprite.visible = false;
      this.jumpingSprite.visible = false;
      this.celebratingSprite.visible = true;
      this.celebratingSprite.gotoAndPlay(0);
    } else {
      this.celebratingSprite.visible = false;
      this.celebratingSprite.currentFrame = 0;
      this.runningSprite.visible = true;
      this.runningSprite.play();
    }
  }

  private updateBoundingBoxVisual(isColliding: boolean = false): void {
    this.debugGraphics.clear();

    // Draw bounding box outline using collision dimensions
    // Position is relative to the container
    const x = -this.collisionWidth / 2;
    const y = -this.collisionHeight;
    this.debugGraphics.rect(x, y, this.collisionWidth, this.collisionHeight);

    // Blue when colliding, black when not colliding
    const color = isColliding ? 0x0000ff : 0x000000;
    this.debugGraphics.stroke({ color, width: 2 });
  }

  public updateDebugVisual(isColliding: boolean = false): void {
    this.updateBoundingBoxVisual(isColliding);
  }

  /**
   * Sets the animation speed multiplier for all sprites.
   * @param multiplier Speed multiplier (1.0 = normal speed, 0.5 = half speed, etc.)
   */
  public setAnimationSpeedMultiplier(multiplier: number): void {
    this.runningSprite.animationSpeed = this.originalRunningSpeed * multiplier;
    this.jumpingSprite.animationSpeed = this.originalJumpingSpeed * multiplier;
    this.celebratingSprite.animationSpeed = this.originalCelebratingSpeed * multiplier;
  }

  /**
   * Gets the top Y position of the player (for spawning effects above the player)
   */
  public getTopY(): number {
    return this.ctr.y - this.collisionHeight;
  }
}
