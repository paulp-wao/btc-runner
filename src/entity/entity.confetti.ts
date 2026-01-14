import * as PIXI from 'pixi.js';
import { Entity } from '../ecs/entity';

export class ConfettiEntity extends Entity {
  private particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: number;
    size: number;
    rotation: number;
    rotationSpeed: number;
  }> = [];
  private readonly graphics: PIXI.Graphics;
  private readonly gameWidth: number;
  private readonly gameHeight: number;

  constructor(gameWidth: number, gameHeight: number, count: number = 100) {
    const container = new PIXI.Container();
    super(container);

    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.graphics = new PIXI.Graphics();
    container.addChild(this.graphics);

    // Create particles - use local coordinates relative to container
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xff8800];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * gameWidth,
        y: Math.random() * gameHeight,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4 - 1, // Slight upward bias
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 10,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
      });
    }

    this.setZIndex(80);
  }

  public update(delta: number): void {
    this.graphics.clear();

    for (const particle of this.particles) {
      // Update position (local to container)
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.rotation += particle.rotationSpeed * delta;

      // Apply gravity
      particle.vy += 0.2 * delta;

      // Wrap around edges (local coordinates)
      if (particle.x < -10) particle.x = this.gameWidth + 10;
      if (particle.x > this.gameWidth + 10) particle.x = -10;
      if (particle.y > this.gameHeight + 10) {
        particle.y = -10;
        particle.vy = (Math.random() - 0.5) * 4 - 1;
      }
      if (particle.y < -10) {
        particle.y = this.gameHeight + 10;
        particle.vy = (Math.random() - 0.5) * 4 - 1;
      }

      // Draw particle (local coordinates)
      this.graphics.beginFill(particle.color);
      this.graphics.drawRect(
        particle.x - particle.size / 2,
        particle.y - particle.size / 2,
        particle.size,
        particle.size
      );
      this.graphics.endFill();
    }
  }
}

