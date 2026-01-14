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
  private framesBetweenPoints: number; // Number of frames that should elapse between points being added
  private scrollOffset: number; // Current scroll offset in pixels

  constructor(props: {
    width: number;
    height: number;
    maxPoints?: number;
    color?: number;
    lineWidth?: number;
    framesBetweenPoints?: number; // Number of frames between adding new points (default: 1)
  }) {
    const { width, height, maxPoints = 100, color = 0x00ff00, lineWidth = 2, framesBetweenPoints = 10 } = props;
    const graphics = new PIXI.Graphics();
    super(graphics);

    this.graphics = graphics;
    this.width = width;
    this.height = height;
    this.color = color;
    this.lineWidth = lineWidth;
    this.maxPoints = maxPoints;
    this.framesBetweenPoints = framesBetweenPoints;
    this.scrollOffset = 0;
    
    // Pre-populate the graph with initial data points
    this.initializeDataPoints();
  }

  private initializeDataPoints(): void {
    // Generate initial data points using the same sine wave formula as the update system
    // Generate backwards in time so the last point (rightmost) is at time 0,
    // which matches where the update system starts, ensuring smooth continuity
    const timeStep = 0.1; // Step size for generating initial points
    let time = -(this.maxPoints - 1) * timeStep; // Start from negative time
    
    for (let i = 0; i < this.maxPoints; i++) {
      const value = 
        Math.sin(time) * 0.5 +
        Math.sin(time * 2.3) * 0.3 +
        Math.sin(time * 0.7) * 0.2;
      
      const normalizedValue = ((value + 1) / 2) * this.height;
      this.dataPoints.push(normalizedValue);
      
      time += timeStep;
    }
    
    // Draw the initial graph
    this.redraw();
  }

  public setFramesBetweenPoints(frames: number): void {
    this.framesBetweenPoints = Math.max(1, frames);
  }

  public getFramesBetweenPoints(): number {
    return this.framesBetweenPoints;
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

  public updateScroll(_delta: number): void {
    if (this.dataPoints.length < 2) return;
    
    const pointSpacing = this.width / (this.maxPoints - 1);
    
    // Calculate scroll speed per frame to ensure graph always fills the screen
    // If we add a point every N frames, we need to scroll by pointSpacing/N per frame
    // This ensures that after N frames, we've scrolled exactly one point spacing,
    // which matches when a new point is added, keeping the graph filled
    const scrollPerFrame = pointSpacing / this.framesBetweenPoints;
    this.scrollOffset += scrollPerFrame;
    
    // When scroll offset exceeds point spacing, we need to remove the oldest data point
    // and reset the offset to maintain proper alignment
    while (this.scrollOffset >= pointSpacing && this.dataPoints.length > 1) {
      this.scrollOffset -= pointSpacing;
      this.dataPoints.shift(); // Remove oldest point
    }
    
    // Redraw to show the updated scroll position
    this.redraw();
  }

  public redraw(): void {
    this.graphics.clear();
    
    if (this.dataPoints.length < 2) {
      return;
    }

    const pointSpacing = this.width / (this.maxPoints - 1);
    
    // Draw the curve line with scroll offset applied
    // Start from the first point, offset by scroll amount
    const startX = -this.scrollOffset;
    this.graphics.moveTo(startX, this.dataPoints[0]);
    
    for (let i = 1; i < this.dataPoints.length; i++) {
      const x = i * pointSpacing - this.scrollOffset;
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
    
    const pointSpacing = this.width / (this.maxPoints - 1);
    
    // Account for scroll offset when calculating point index
    const adjustedX = localX + this.scrollOffset;
    
    // Check if X is within the curve bounds (accounting for scroll)
    if (adjustedX < 0 || adjustedX > this.width) return null;
    
    const pointIndex = adjustedX / pointSpacing;
    
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

