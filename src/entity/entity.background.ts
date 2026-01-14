import * as PIXI from 'pixi.js';
import { Entity } from '../ecs/entity';

export class BackgroundEntity extends Entity {
  private readonly graphics: PIXI.Graphics;
  private readonly width: number;
  private readonly height: number;
  private readonly isGradient: boolean;
  private readonly canvasHeight: number;

  constructor(props: { width: number; height: number; color?: number; useGradient?: boolean; canvasHeight?: number }) {
    const { width, height, color = 0x222222, useGradient = false, canvasHeight } = props;
    const graphics = new PIXI.Graphics();
    super(graphics);

    this.graphics = graphics;
    this.width = width;
    this.height = height;
    this.isGradient = useGradient;
    // If gradient is used and height is 10x canvas, calculate canvas height
    // Otherwise use provided canvasHeight or default to height
    this.canvasHeight = canvasHeight || (useGradient ? height / 10 : height);

    if (useGradient) {
      this.drawGradient();
    } else {
      graphics.rect(0, 0, width, height).fill({ color });
    }
  }

  private drawGradient(): void {
    this.graphics.clear();
    
    // Create gradient from Green (bottom) -> Blue (middle) -> Black (top)
    // Using multiple rectangles to simulate gradient
    const steps = 200; // Number of gradient steps for smooth transition
    const stepHeight = this.height / steps;

    for (let i = 0; i < steps; i++) {
      const y = i * stepHeight;
      const progress = i / (steps - 1); // 0 at bottom, 1 at top
      
      let r: number, g: number, b: number;
      
      if (progress < 0.5) {
        // Green to Blue (0 to 0.5)
        const localProgress = progress * 2; // 0 to 1
        r = Math.round(0 * (1 - localProgress) + 0 * localProgress);
        g = Math.round(255 * (1 - localProgress) + 102 * localProgress);
        b = Math.round(0 * (1 - localProgress) + 255 * localProgress);
      } else {
        // Blue to Black (0.5 to 1)
        const localProgress = (progress - 0.5) * 2; // 0 to 1
        r = Math.round(0 * (1 - localProgress) + 0 * localProgress);
        g = Math.round(102 * (1 - localProgress) + 0 * localProgress);
        b = Math.round(255 * (1 - localProgress) + 0 * localProgress);
      }
      
      const color = (r << 16) | (g << 8) | b;
      this.graphics.rect(0, y, this.width, stepHeight + 1).fill({ color });
    }
  }

  public move(point: { x: number; y: number }): void {
    this.ctr.position.set(point.x, point.y);
  }

  public updateScrollProgress(progress: number): void {
    // progress: 0 = showing bottom (green), 1 = showing top (black)
    // The gradient is 10x the canvas height, so we need to scroll it
    // Position it so that at progress 0, we see the bottom (green)
    // and at progress 1, we see the top (black)
    // At progress 0: position.y = -(gradientHeight - canvasHeight) = -9 * canvasHeight
    // At progress 1: position.y = 0
    // Always keep x at 0 to cover full canvas width
    const maxOffset = this.height - this.canvasHeight;
    this.ctr.position.set(0, -progress * maxOffset);
  }
}
