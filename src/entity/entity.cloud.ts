import * as PIXI from 'pixi.js';
import { Entity } from '../ecs/entity';

export class CloudEntity extends Entity {
  private readonly graphics: PIXI.Graphics;
  public speed: number;
  public readonly cloudWidth: number;

  constructor(x: number, y: number, scale: number = 1) {
    const container = new PIXI.Container();
    super(container);

    this.graphics = new PIXI.Graphics();
    container.addChild(this.graphics);

    // Draw a fluffy cloud shape
    this.cloudWidth = this.drawCloud(scale);

    this.ctr.position.set(x, y);
    // Clouds move at different speeds based on their size (parallax effect)
    this.speed = 0.3 + Math.random() * 0.4;
  }

  private drawCloud(scale: number): number {
    this.graphics.clear();

    // Draw multiple overlapping circles to create a fluffy cloud
    const baseRadius = 15 * scale;
    const color = 0xffffff;
    const alpha = 0.8 + Math.random() * 0.2;

    // Main body - series of overlapping circles
    this.graphics.circle(0, 0, baseRadius);
    this.graphics.circle(baseRadius * 0.8, -baseRadius * 0.2, baseRadius * 0.9);
    this.graphics.circle(-baseRadius * 0.7, baseRadius * 0.1, baseRadius * 0.7);
    this.graphics.circle(baseRadius * 1.5, baseRadius * 0.1, baseRadius * 0.6);
    this.graphics.circle(-baseRadius * 1.3, -baseRadius * 0.1, baseRadius * 0.5);
    this.graphics.circle(baseRadius * 0.3, -baseRadius * 0.5, baseRadius * 0.6);

    this.graphics.fill({ color, alpha });

    // Return approximate width for bounds checking
    return baseRadius * 3.5;
  }

  public update(delta: number): void {
    // Move cloud from left to right
    this.ctr.x += this.speed * delta;
  }

  public isOffScreen(rightBound: number): boolean {
    return this.ctr.x - this.cloudWidth > rightBound;
  }

  public setAlpha(alpha: number): void {
    this.graphics.alpha = alpha;
  }
}
