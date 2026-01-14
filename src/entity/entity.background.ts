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
    // In PIXI, y=0 is at top, so we draw from bottom to top
    const steps = 200; // Number of gradient steps for smooth transition
    const stepHeight = this.height / steps;

    for (let i = 0; i < steps; i++) {
      // Draw from bottom (y = height) to top (y = 0)
      const y = this.height - (i * stepHeight);
      const progress = i / (steps - 1); // 0 at bottom (green), 1 at top (black)
      
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

    // Star density increases from bottom (green) to top (black)
    // Since gradient is reversed: y=0 is black (top), y=height is green (bottom)
    // Bottom: very few stars, Top: many stars
    const totalStars = Math.floor(this.width * this.height / 800); // Adjust density as needed
    
    for (let i = 0; i < totalStars; i++) {
      const x = random() * this.width;
      const y = random() * this.height;
      // Reverse progress: y=0 (top/black) should have progress=1, y=height (bottom/green) should have progress=0
      const progress = 1 - (y / this.height); // 1 at top (black), 0 at bottom (green)
      
      // Only draw stars in darker areas (more stars at top where black is)
      // Start showing stars around 30% from bottom, increase density toward top
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
    // The gradient falls downward: starts with green at bottom, black falls from top
    // Gradient is now drawn: green at local y=height (bottom of graphic), black at local y=0 (top of graphic)
    // To show green at canvas bottom: position gradient so local y=height aligns with canvas bottom
    // Canvas bottom is at world y = canvasHeight
    // At progress 0: position.y = canvasHeight - height = -maxOffset (green at bottom of screen)
    // At progress 1: position.y = 0 (black at top of screen)
    // As progress increases, gradient moves UP (y goes from -maxOffset to 0), making black "fall" down
    // Preserve x position to maintain full canvas width coverage
    const maxOffset = this.height - this.canvasHeight;
    const currentX = this.ctr.position.x;
    // Start at -maxOffset (green visible at bottom), move to 0 (black visible at top)
    // As gradient moves up (y increases from negative to 0), black from top appears to fall down
    this.ctr.position.set(currentX, -maxOffset * (1 - progress));
  }
}
