import * as PIXI from 'pixi.js';
import { Entity } from '../ecs/entity';

export interface StartScreenOptions {
  width: number;
  height: number;
}

export class StartScreenEntity extends Entity {
  private pressSpaceText: PIXI.Text;
  private titleText: PIXI.Text;
  private pulseTime = 0;
  private particles: PIXI.Graphics[] = [];

  constructor(options: StartScreenOptions) {
    const container = new PIXI.Container();
    super(container);

    const { width, height } = options;

    // Semi-transparent dark overlay
    const overlay = new PIXI.Graphics();
    overlay.rect(0, 0, width, height);
    overlay.fill({ color: 0x000000, alpha: 0.6 });
    container.addChild(overlay);

    // Create floating particles for cool effect
    for (let i = 0; i < 20; i++) {
      const particle = new PIXI.Graphics();
      particle.circle(0, 0, Math.random() * 3 + 1);
      particle.fill({ color: 0xffffff, alpha: 0.5 });
      particle.x = Math.random() * width;
      particle.y = Math.random() * height;
      (particle as PIXI.Graphics & { speedY: number; speedX: number }).speedY =
        Math.random() * 0.5 + 0.2;
      (particle as PIXI.Graphics & { speedY: number; speedX: number }).speedX =
        (Math.random() - 0.5) * 0.3;
      this.particles.push(particle);
      container.addChild(particle);
    }

    // Title text
    this.titleText = new PIXI.Text({
      text: 'BTC RUNNER',
      style: {
        fontFamily: 'Arial Black, Arial',
        fontSize: 48,
        fontWeight: 'bold',
        fill: 0xf7931a, // Bitcoin orange
        stroke: { color: 0xffffff, width: 4 },
        dropShadow: {
          color: 0x000000,
          blur: 4,
          angle: Math.PI / 4,
          distance: 4,
        },
      },
    });
    this.titleText.anchor.set(0.5);
    this.titleText.x = width / 2;
    this.titleText.y = height / 2 - 50;
    container.addChild(this.titleText);

    // Press Space text with glow effect
    this.pressSpaceText = new PIXI.Text({
      text: 'PRESS SPACE TO START',
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 2 },
        dropShadow: {
          color: 0xf7931a,
          blur: 8,
          angle: 0,
          distance: 0,
        },
      },
    });
    this.pressSpaceText.anchor.set(0.5);
    this.pressSpaceText.x = width / 2;
    this.pressSpaceText.y = height / 2 + 30;
    container.addChild(this.pressSpaceText);

    // Decorative lines
    const topLine = new PIXI.Graphics();
    topLine.rect(width / 2 - 150, height / 2 - 90, 300, 3);
    topLine.fill(0xf7931a);
    container.addChild(topLine);

    const bottomLine = new PIXI.Graphics();
    bottomLine.rect(width / 2 - 100, height / 2 + 60, 200, 2);
    bottomLine.fill(0xf7931a);
    container.addChild(bottomLine);

    // Set high z-index to render on top
    this.setZIndex(100);

    this.titleText.resolution = 3;
    this.pressSpaceText.resolution = 3;
  }

  public update(delta: number): void {
    this.pulseTime += delta * 0.1;

    // Pulsing effect for "Press Space" text
    const pulse = Math.sin(this.pulseTime * 3) * 0.2 + 1;
    this.pressSpaceText.scale.set(pulse);
    this.pressSpaceText.alpha = 0.7 + Math.sin(this.pulseTime * 3) * 0.3;

    // Subtle title float
    this.titleText.y = this.ctr.height / 2 - 50 + Math.sin(this.pulseTime * 1.5) * 3;

    // Animate particles
    for (const particle of this.particles) {
      const p = particle as PIXI.Graphics & { speedY: number; speedX: number };
      p.y -= p.speedY * delta;
      p.x += p.speedX * delta;

      // Reset particle when it goes off screen
      if (p.y < 0) {
        p.y = this.ctr.height;
        p.x = Math.random() * this.ctr.width;
      }
    }
  }

  public show(): void {
    this.ctr.visible = true;
  }

  public hide(): void {
    this.ctr.visible = false;
  }

  public setWinMode(): void {
    this.titleText.text = 'YOU WIN!';
    this.pressSpaceText.text = 'PRESS SPACE TO PLAY AGAIN';
  }

  public setStartMode(): void {
    this.titleText.text = 'BTC RUNNER';
    this.pressSpaceText.text = 'PRESS SPACE TO START';
  }
}
