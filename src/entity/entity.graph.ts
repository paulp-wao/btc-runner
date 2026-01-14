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
  private ticks: number; 
  private pointSpacing: number;
  private framesPerPoint: number;



  constructor(props: {
    width: number;
    height: number;
    maxPoints?: number;
    color?: number;
    lineWidth?: number;
    pointSpacing?: number;
    framesPerPoint?: number;
  }) {
    const { width, height, maxPoints = 100, color = 0x00ff00, lineWidth = 2, pointSpacing = 10, framesPerPoint = 10 } = props;
    const graphics = new PIXI.Graphics();
    super(graphics);

    this.graphics = graphics;
    this.width = width;
    this.height = height;
    this.color = color;
    this.lineWidth = lineWidth;
    this.maxPoints = maxPoints;
    this.pointSpacing = pointSpacing;
    this.framesPerPoint = framesPerPoint;
    this.ticks = 0;
    
    // Pre-populate the graph with initial data points
    this.initializeDataPoints();
  }

  private initializeDataPoints(): void {
      let predeterminedPoints = [0, 3, 5, 6, 3, 1, -3, -9, -20, -35, -50, -55, -56, -54, -50, -53, -59, -69, -80, -95];
      for (let i = 0; i < predeterminedPoints.length; i++) {
        this.dataPoints.push(predeterminedPoints[i]);
      }
    
    // Draw the initial graph
    this.redraw();
  }

  public updateCurve(newValue: number): void {
    
    let lastValue = this.dataPoints[this.dataPoints.length - 1];
    let newAbsoluteValue = lastValue + newValue;
    this.dataPoints.push(newAbsoluteValue);
    
    // // Keep only the last maxPoints values
    // if (this.dataPoints.length > this.maxPoints) {
    //   this.dataPoints.shift();
    // }
    
    // this.redraw();
  }

  public updateScroll(_delta: number): void {
    if (this.dataPoints.length < 2) return;
    
    this.ticks += 1;
    
    // Redraw to show the updated scroll position
    this.redraw();
  }

  public redraw(): void {
    this.graphics.clear();
    
    if (this.dataPoints.length < 2) {
      return;
    }

    
    // Draw the curve line with scroll offset applied
    // Start from the first point, offset by scroll amount
    const startX = -this.ticks;
    this.graphics.moveTo(startX, this.dataPoints[0]);

    let offset = this.getOffset();
    
    for (let i = 1; i < this.dataPoints.length; i++) {
      const x = i * this.pointSpacing - this.ticks;
      const y = this.dataPoints[i];
      this.graphics.lineTo(x, y);
    }
    
    this.graphics.stroke({ color: this.color, width: this.lineWidth });
  }

  public move(point: { x: number; y: number }): void {
    this.ctr.position.set(point.x, point.y);
  }

  private getOffset(): number {
    return this.ticks * (this.pointSpacing/this.framesPerPoint);
  }

  /**
   * Returns the y value of the graph at the given x coordinate.
   * Uses linear interpolation between data points.
   * @param x The x coordinate in the graph's coordinate system
   * @returns The corresponding y value, or null if x is outside the graph bounds
   */
  public getYAtX(x: number): number | null {
    if (this.dataPoints.length === 0) {
      return null;
    }

    // Convert x coordinate to point index accounting for scroll offset
    // x = i * pointSpacing - ticks
    // i = (x + ticks) / pointSpacing
    const pointIndex = (x + this.getOffset()) / this.pointSpacing;

    // Handle boundary cases
    if (pointIndex < 0) {
      // x is before the first point, return first point's y value
      return this.dataPoints[0];
    }

    if (pointIndex >= this.dataPoints.length - 1) {
      // x is at or after the last point, return last point's y value
      return this.dataPoints[this.dataPoints.length - 1];
    }

    // Linear interpolation between two points
    const lowerIndex = Math.floor(pointIndex);
    const upperIndex = Math.ceil(pointIndex);
    const t = pointIndex - lowerIndex; // interpolation factor (0 to 1)

    const y1 = this.dataPoints[lowerIndex];
    const y2 = this.dataPoints[upperIndex];

    return y1 + (y2 - y1) * t;
  }

  
}

