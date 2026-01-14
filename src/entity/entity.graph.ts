import * as PIXI from 'pixi.js';
import { Entity } from '../ecs/entity';

export class GraphEntity extends Entity {
  private readonly graphics: PIXI.Graphics;
  private readonly width: number;
  private readonly height: number;
  private readonly color: number;
  private readonly lineWidth: number;
  private dataPoints: number[] = [];
  private maxPoints: number;

  constructor(props: {
    width: number;
    height: number;
    maxPoints?: number;
    color?: number;
    lineWidth?: number;
  }) {
    const { width, height, maxPoints = 100, color = 0x00ff00, lineWidth = 2 } = props;
    const graphics = new PIXI.Graphics();
    super(graphics);

    this.graphics = graphics;
    this.width = width;
    this.height = height;
    this.color = color;
    this.lineWidth = lineWidth;
    this.maxPoints = maxPoints;
    
  }

  public updateCurve(newValue: number): void {
    // Normalize the value to fit within the graph height (0 to height)
    // Assuming values are between -1 and 1, adjust as needed
    const normalizedValue = ((newValue + 1) / 2) * this.height;
    
    this.dataPoints.push(normalizedValue);
    
    // Keep only the last maxPoints values
    if (this.dataPoints.length > this.maxPoints) {
      this.dataPoints.shift();
    }
    
    this.redraw();
  }

  private redraw(): void {
    this.graphics.clear();
    
    if (this.dataPoints.length < 2) {
      return;
    }

    const pointSpacing = this.width / (this.maxPoints - 1);
    
    // Draw the curve line directly from data points
    this.graphics.moveTo(0, this.dataPoints[0]);
    
    for (let i = 1; i < this.dataPoints.length; i++) {
      const x = i * pointSpacing;
      const y = this.dataPoints[i];
      this.graphics.lineTo(x, y);
    }
    
    this.graphics.stroke({ color: this.color, width: this.lineWidth });
  }

  public move(point: { x: number; y: number }): void {
    this.ctr.position.set(point.x, point.y);
  }

  /**
   * Get the Y value of the curve at a given X position (in world coordinates)
   * Returns null if X is outside the curve range
   */
  public getCurveYAtX(worldX: number): number | null {
    if (this.dataPoints.length < 2) return null;
    
    // Convert world X to local X (relative to graph position)
    const localX = worldX - this.ctr.x;
    
    // Check if X is within the curve bounds
    if (localX < 0 || localX > this.width) return null;
    
    const pointSpacing = this.width / (this.maxPoints - 1);
    const pointIndex = localX / pointSpacing;
    
    // Get the two surrounding points for interpolation
    const lowerIndex = Math.floor(pointIndex);
    const upperIndex = Math.ceil(pointIndex);
    
    if (lowerIndex < 0 || upperIndex >= this.dataPoints.length) return null;
    
    if (lowerIndex === upperIndex) {
      // Exact point match
      return this.ctr.y + this.dataPoints[lowerIndex];
    }
    
    // Linear interpolation between the two points
    const lowerY = this.dataPoints[lowerIndex];
    const upperY = this.dataPoints[upperIndex];
    const lowerX = lowerIndex * pointSpacing;
    const upperX = upperIndex * pointSpacing;
    
    const t = (localX - lowerX) / (upperX - lowerX);
    const interpolatedY = lowerY + (upperY - lowerY) * t;
    
    return this.ctr.y + interpolatedY;
  }
}

