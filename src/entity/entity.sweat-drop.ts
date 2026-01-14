import * as PIXI from 'pixi.js';
import { Entity } from '../ecs/entity';

export class SweatDropEntity extends Entity {
  private readonly graphics: PIXI.Graphics;
  public velocityX: number;
  public velocityY: number;
  public lifetime: number;
  public maxLifetime: number;

  constructor(x: number, y: number, velocityX: number, velocityY: number) {
    const container = new PIXI.Container();
    super(container);

    this.graphics = new PIXI.Graphics();
    container.addChild(this.graphics);

    // Draw a teardrop shape (sweat drop)
    this.drawSweatDrop();

    this.ctr.position.set(x, y);
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.maxLifetime = 30; // 1 second lifetime
    this.lifetime = this.maxLifetime;
  }

  private drawSweatDrop(): void {
    this.graphics.clear();
    
    // Draw a proper teardrop shape: rounded top, tapering to a point at bottom
    const width = 4;
    const height = 8;
    
    // Create teardrop path using bezier curves for smooth shape
    // Start from top-left
    this.graphics.moveTo(-width / 2, -height / 2);
    
    // Top curve (rounded top)
    this.graphics.bezierCurveTo(
      -width / 2, -height / 2 - 0.5,  // Control point 1
      width / 2, -height / 2 - 0.5,   // Control point 2
      width / 2, -height / 2          // End at top-right
    );
    
    // Right side curve down to point
    this.graphics.bezierCurveTo(
      width / 2, height / 6,          // Control point 1
      width / 3, height / 2.5,         // Control point 2
      0, height / 2                   // End at bottom point
    );
    
    // Left side curve back up
    this.graphics.bezierCurveTo(
      -width / 3, height / 2.5,       // Control point 1
      -width / 2, height / 6,          // Control point 2
      -width / 2, -height / 2          // Back to start
    );
    
    // Fill with light blue/cyan color (sweat-like)
    this.graphics.fill({ color: 0xa0d8ef, alpha: 0.9 });
    
    // Add a small highlight at the top-left for realism (light reflection)
    this.graphics.circle(-0.8, -height / 2 + 1.2, 1);
    this.graphics.fill({ color: 0xffffff, alpha: 0.6 });
  }

  public update(delta: number): void {
    // Update position based on velocity
    this.ctr.x += this.velocityX * delta;
    this.velocityY += 0.5
    this.ctr.y += this.velocityY * delta;

    // Update lifetime
    this.lifetime -= 1;

    // Update alpha based on remaining lifetime
    const alpha = Math.max(0, this.lifetime / this.maxLifetime);
    this.graphics.alpha = alpha;
  }

  public isExpired(): boolean {
    return this.lifetime <= 0;
  }
}

