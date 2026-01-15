import * as PIXI from 'pixi.js';
import bunny_url from '../assets/images/bunny.png';
import celebration_egg_url from '../assets/images/celebration-egg-sheet.png';
import jumping_egg_url from '../assets/images/jumping-egg-sheet.png';
import moon_url from '../assets/images/moon-image.png';
import nyan_cat_url from '../assets/images/nyan-cat.png';
import running_egg_url from '../assets/images/running-egg-sheet.png';
import sweat_drop_url from '../assets/images/sweat_drop.png';

const assetMap = {
  bunny: bunny_url,
  running_egg: running_egg_url,
  jumping_egg: jumping_egg_url,
  celebration_egg: celebration_egg_url,
  moon: moon_url,
  nyan_cat: nyan_cat_url,
  sweat_drop: sweat_drop_url,
};

export const assetFilePath = ['bunny', 'running_egg', 'jumping_egg', 'celebration_egg', 'moon', 'nyan_cat', 'sweat_drop'] as const;
export type AssetName = (typeof assetFilePath)[number];

const assertNoMissingAssetName = () => {
  for (const mapKey in assetMap) {
    const name = mapKey as AssetName;
    if (!assetFilePath.includes(name)) {
      throw new Error(`"${name}" is not a valid AssetName`);
    }
  }
};

export interface AnimatedSpriteOptions {
  frames: number;
  frameWidth: number;
  frameHeight: number;
  animationSpeed?: number;
}

export interface IAssetLoader {
  createSprite: (name: AssetName) => PIXI.Sprite;
  createAnimatedSprite: (name: AssetName, options: AnimatedSpriteOptions) => PIXI.AnimatedSprite;
  preload: (...names: AssetName[]) => Promise<void>;
  getTexture: (name: AssetName) => PIXI.Texture;
}

export const createAssetLoader = (): IAssetLoader => {
  const textures: Record<string, PIXI.Texture> = {};
  assertNoMissingAssetName();

  return {
    createSprite: (name: AssetName) => {
      const texture = textures[name];
      if (!texture) throw new Error(`asset was not preloaded: "${name}"`);
      const result = new PIXI.Sprite(texture);
      return result;
    },
    createAnimatedSprite: (name: AssetName, options: AnimatedSpriteOptions) => {
      const texture = textures[name];
      if (!texture) throw new Error(`asset was not preloaded: "${name}"`);

      const { frames, frameWidth, frameHeight, animationSpeed = 0.15 } = options;

      const frameTextures = Array.from({ length: frames }, (_, i) => {
        const t = new PIXI.Texture({
          source: texture.source,
          frame: new PIXI.Rectangle(frameWidth * i, 0, frameWidth, frameHeight),
        });
        t.source.scaleMode = 'nearest';
        return t;
      });

      const animatedSprite = new PIXI.AnimatedSprite(frameTextures);
      animatedSprite.animationSpeed = animationSpeed;

      return animatedSprite;
    },
    getTexture: (name: AssetName) => {
      const result = textures[name];
      if (!result) throw new Error(`asset was not preloaded: "${name}"`);
      return textures[name];
    },
    preload: async (...assetNames: AssetName[]) => {
      PIXI.Assets.reset();
      for (const key of assetNames) {
        const path = assetMap[key];
        PIXI.Assets.add({ alias: key, src: path });
      }
      const assets = await PIXI.Assets.load(assetNames);
      for (const key of Object.keys(assets)) {
        if (!assets[key]) continue;
        textures[key] = assets[key];
        textures[key].source.scaleMode = 'nearest';
      }
    },
  };
};
