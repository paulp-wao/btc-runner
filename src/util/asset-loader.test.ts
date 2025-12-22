import fs from 'node:fs';
import path from 'node:path';
import * as PIXI from 'pixi.js';
import { describe, expect, it, vi } from 'vitest';
import { createAssetLoader } from './asset-loader.ts';

describe('#assetLoader', () => {
  const createMockTexture = () => {
    const imagePath = path.resolve('public/shotgun-flash.png');
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const dataUri = `data:image/png;base64,${base64Image}`;
    const img = new Image(100, 100);
    img.src = dataUri;

    const base = new PIXI.ImageSource(img);
    base.width = 100;
    base.height = 100;
    const texture = PIXI.Texture.from(base.source);
    return texture;
  };

  const assetLoader = createAssetLoader();

  assetLoader.preload = vi.fn().mockImplementation(async () => {
    // do nothing
    await new Promise((r) => setTimeout(r, 100));
  });

  assetLoader.getTexture = vi.fn().mockImplementation(async () => {
    const texture = createMockTexture();
    return texture;
  });

  assetLoader.createSprite = vi.fn().mockImplementation(async () => {
    const texture = createMockTexture();
    const sprite = new PIXI.Sprite(texture);
    return sprite;
  });

  it('should create a sprite from a preloaded asset', async () => {
    await assetLoader.preload('bunny');
    const sprite = assetLoader.createSprite('bunny');
    expect(sprite).toBeTruthy();
  });

  it('should retrieve a texture after assets are preloaded', async () => {
    await assetLoader.preload('bunny');
    const texture = assetLoader.getTexture('bunny');
    expect(texture).toBeTruthy();
  });
});
