import * as PIXI from 'pixi.js';
import { Polygon, Vector } from '../collision detection/SAT';
import { Entity } from '../ecs/entity';

export class GraphEntity extends Entity {
  private readonly graphics: PIXI.Graphics;
  private readonly width: number;
  private readonly height: number;
  private readonly color: number;
  private readonly lineWidth: number;
  private dataPoints: number[] = [];
  private maxPoints: number;
  private polygon: Polygon;

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
    
    // Initialize polygon with empty points - will be updated as data comes in
    this.polygon = new Polygon(new Vector(0, 0), []);
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
    const polygonPoints: Vector[] = [];
    
    // Create polygon points along the curve
    for (let i = 0; i < this.dataPoints.length; i++) {
      const x = i * pointSpacing;
      const y = this.dataPoints[i];
      polygonPoints.push(new Vector(x, y));
    }
    
    // Close the polygon by adding points at the bottom corners
    // This creates a filled area under the curve
    if (polygonPoints.length > 0) {
      const lastX = (this.dataPoints.length - 1) * pointSpacing;
      polygonPoints.push(new Vector(lastX, this.height)); // Bottom right
      polygonPoints.push(new Vector(0, this.height)); // Bottom left
    }
    
    // Update the polygon with the new points
    // Points are relative to the polygon's position (which is set to entity position)
    this.polygon.setPoints(polygonPoints);
    
    // Draw the polygon visually
    if (polygonPoints.length >= 3) {
      this.graphics.moveTo(polygonPoints[0].x, polygonPoints[0].y);
      for (let i = 1; i < polygonPoints.length; i++) {
        this.graphics.lineTo(polygonPoints[i].x, polygonPoints[i].y);
      }
      this.graphics.closePath();
      this.graphics.stroke({ color: this.color, width: this.lineWidth });
    }
  }

  public move(point: { x: number; y: number }): void {
    this.ctr.position.set(point.x, point.y);
    // Update polygon position to match entity position
    this.polygon.pos.copy(new Vector(point.x, point.y));
  }

  public getPolygon(): Polygon {
    return this.polygon;
  }
}

