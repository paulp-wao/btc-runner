import * as PIXI from 'pixi.js';
import { Entity } from '../ecs/entity';

export class RainbowTextEntity extends Entity {
  private readonly text: PIXI.Text;
  private hue: number = 0;

  constructor(message: string, x: number, y: number) {
    const container = new PIXI.Container();
    super(container);

    const style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 48,
      fontWeight: 'bold',
      fill: 0xffffff,
      stroke: 0x000000,
      strokeThickness: 3,
      dropShadow: true,
      dropShadowColor: 0x000000,
      dropShadowBlur: 3,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 4,
    });

    this.text = new PIXI.Text(message, style);
    this.text.anchor.set(0.5, 0.5);
    this.text.resolution = 3;
    container.addChild(this.text);

    this.ctr.x = x;
    this.ctr.y = y;
    this.setZIndex(110);
  }

  public update(delta: number): void {
    this.hue += 0.02 * delta;
    if (this.hue > 1) this.hue -= 1;

    // Convert HSV to RGB
    const h = this.hue * 6;
    const c = 1;
    const x = c * (1 - Math.abs((h % 2) - 1));
    let r = 0, g = 0, b = 0;

    if (h < 1) { r = c; g = x; b = 0; }
    else if (h < 2) { r = x; g = c; b = 0; }
    else if (h < 3) { r = 0; g = c; b = x; }
    else if (h < 4) { r = 0; g = x; b = c; }
    else if (h < 5) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    const color = (Math.floor(r * 255) << 16) | (Math.floor(g * 255) << 8) | Math.floor(b * 255);
    this.text.style.fill = color;

    // Pulsing scale
    this.ctr.scale.set(1 + Math.sin(this.hue * Math.PI * 4) * 0.1);
  }
}

