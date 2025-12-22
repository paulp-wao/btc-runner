import * as PIXI from 'pixi.js';

export interface IScene {
  load: (game: PIXI.ContainerChild) => Promise<void>;
  update: (delta: number) => void;
  dispose: () => void;
}

export interface ISceneEngine {
  next: (nextScene: () => IScene) => Promise<void>;
}

export const createSceneEngine = (game: PIXI.Container): ISceneEngine => {
  let gameTicker: PIXI.Ticker | undefined;
  let currentScene: IScene | undefined;

  return {
    next: async (nextScene: () => IScene) => {
      if (!game) throw new Error('game not init when calling next');

      game.removeChildren();
      game.removeAllListeners();
      currentScene?.dispose();

      if (gameTicker) gameTicker.destroy();

      currentScene = nextScene();
      const update = (tick: PIXI.Ticker) => {
        const delta = tick.deltaMS * 0.01;
        currentScene?.update(delta);
      };
      gameTicker = new PIXI.Ticker().add(update);

      await currentScene.load(game);

      gameTicker.start();
    },
  };
};
