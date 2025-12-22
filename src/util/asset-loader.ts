import * as PIXI from 'pixi.js';
import bunny_url from '../assets/images/bunny.png';

const assetMap = {
  bunny: bunny_url,
};

export const assetFilePath = ['bunny'] as const;
export type AssetName = (typeof assetFilePath)[number];

const assertNoMissingAssetName = () => {
  for (const mapKey in assetMap) {
    const name = mapKey as AssetName;
    if (!assetFilePath.includes(name)) {
      throw new Error(`"${name}" is not a valid AssetName`);
    }
  }
};

export interface IAssetLoader {
  createSprite: (name: AssetName) => PIXI.Sprite;
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
