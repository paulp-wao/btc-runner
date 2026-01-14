import * as PIXI from 'pixi.js';
import { Entity } from '../ecs/entity';

export type MemeType = 'dancing_baby' | 'all_your_base' | 'rickroll' | 'trollface' | 'success_kid' | 'bad_luck_brian';

export class MemeEntity extends Entity {
  private readonly sprite: PIXI.Sprite;
  private velocityX: number;
  private velocityY: number;
  private rotationSpeed: number;
  private readonly gameWidth: number;
  private readonly gameHeight: number;
  private readonly memeType: MemeType;

  constructor(memeType: MemeType, gameWidth: number, gameHeight: number) {
    const container = new PIXI.Container();
    super(container);

    this.memeType = memeType;
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    
    // Random velocities
    this.velocityX = (Math.random() - 0.5) * 2;
    this.velocityY = (Math.random() - 0.5) * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.1;

    this.sprite = new PIXI.Sprite();
    container.addChild(this.sprite);
    
    // Try to load meme image
    this.loadMemeTexture().then(() => {
      if (this.sprite.texture && this.sprite.texture !== PIXI.Texture.EMPTY) {
        this.sprite.anchor.set(0.5, 0.5);
        const scale = 0.15 + Math.random() * 0.15;
        this.sprite.scale.set(scale, scale);
      } else {
        this.createFallback();
      }
    }).catch(() => {
      // Fallback to colored rectangle with text
      this.createFallback();
    });

    // Position will be set by celebration system
    // Default to center for now
    this.ctr.x = gameWidth / 2;
    this.ctr.y = gameHeight / 2;
    this.setZIndex(90);
  }

  private async loadMemeTexture(): Promise<void> {
    // Using more reliable meme image URLs
    const memeUrls: Record<MemeType, string> = {
      dancing_baby: 'https://upload.wikimedia.org/wikipedia/en/7/7f/Dancing_Baby.gif',
      all_your_base: 'https://i.kym-cdn.com/photos/images/original/000/000/128/all-your-base.jpg',
      rickroll: 'https://i.kym-cdn.com/photos/images/original/001/206/252/3fa.gif',
      trollface: 'https://i.kym-cdn.com/photos/images/original/000/000/091/trollface.jpg',
      success_kid: 'https://i.kym-cdn.com/photos/images/original/000/000/554/1243209155952.jpg',
      bad_luck_brian: 'https://i.kym-cdn.com/photos/images/original/000/000/554/1243209155952.jpg',
    };

    try {
      const url = memeUrls[this.memeType];
      const texture = PIXI.Texture.from({
        source: url,
        scaleMode: 'nearest',
      });
      this.sprite.texture = texture;
    } catch (e) {
      // If loading fails, create fallback
      throw e;
    }
  }

  private createFallback(): void {
    const graphics = new PIXI.Graphics();
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    graphics.beginFill(color);
    graphics.drawRect(-30, -30, 60, 60);
    graphics.endFill();
    
    graphics.beginFill(0xffffff);
    graphics.drawRect(-25, -25, 50, 50);
    graphics.endFill();
    
    // Create a simple texture from graphics
    const canvas = document.createElement('canvas');
    canvas.width = 60;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
      ctx.fillRect(0, 0, 60, 60);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(5, 5, 50, 50);
      this.sprite.texture = PIXI.Texture.from(canvas);
      this.sprite.anchor.set(0.5, 0.5);
      const scale = 0.15 + Math.random() * 0.15;
      this.sprite.scale.set(scale, scale);
    }
  }

  public update(delta: number): void {
    this.ctr.x += this.velocityX * delta;
    this.ctr.y += this.velocityY * delta;
    this.ctr.rotation += this.rotationSpeed * delta;

    // Bounce off edges - use a larger bounds area since we're in world space
    const margin = 50;
    if (this.ctr.x < -margin || this.ctr.x > this.gameWidth + margin) {
      this.velocityX *= -1;
    }
    if (this.ctr.y < -margin || this.ctr.y > this.gameHeight + margin) {
      this.velocityY *= -1;
    }

    // Keep in bounds with margin
    const margin2 = 100;
    this.ctr.x = Math.max(-margin2, Math.min(this.gameWidth + margin2, this.ctr.x));
    this.ctr.y = Math.max(-margin2, Math.min(this.gameHeight + margin2, this.ctr.y));
  }
}

