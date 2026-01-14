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
      this.drawStars();
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

  private drawStars(): void {
    // Create a seeded random number generator for consistent star placement
    let seed = 12345;
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // Star density increases from bottom (0) to top (1)
    // Bottom: very few stars, Top: many stars
    const totalStars = Math.floor(this.width * this.height / 800); // Adjust density as needed
    
    for (let i = 0; i < totalStars; i++) {
      const x = random() * this.width;
      const y = random() * this.height;
      const progress = y / this.height; // 0 at bottom, 1 at top
      
      // Only draw stars in darker areas (more stars as we go up)
      // Start showing stars around 30% up, increase density toward top
      const starProbability = Math.max(0, (progress - 0.3) / 0.7); // 0 at 30%, 1 at 100%
      
      if (random() < starProbability) {
        // Star size varies slightly
        const starSize = 0.5 + random() * 1.5;
        
        // Star brightness varies - brighter in darker areas
        const brightness = 0.6 + starProbability * 0.4; // 60% to 100% brightness
        
        // Draw star as a small circle
        const starColor = Math.floor(255 * brightness);
        const color = (starColor << 16) | (starColor << 8) | starColor;
        
        this.graphics.circle(x, y, starSize).fill({ color });
      }
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
    // Preserve x position to maintain full canvas width coverage
    const maxOffset = this.height - this.canvasHeight;
    const currentX = this.ctr.position.x;
    this.ctr.position.set(currentX, -progress * maxOffset);
  }
}
