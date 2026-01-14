import * as PIXI from 'pixi.js';

export interface IScene {
  load: (game: PIXI.ContainerChild) => Promise<void>;
  update: (delta: number) => void;
  dispose: () => void;
}

export interface ISceneEngine {
  next: (nextScene: () => IScene) => Promise<void>;
  reload: () => Promise<void>;
}

export const createSceneEngine = (
  game: PIXI.Container,
  onBeforeReload?: () => void,
): ISceneEngine => {
  let gameTicker: PIXI.Ticker | undefined;
  let currentScene: IScene | undefined;
  let currentSceneFactory: (() => IScene) | undefined;

  const loadScene = async (sceneFactory: () => IScene) => {
    if (!game) throw new Error('game not init when calling next');

    game.removeChildren();
    game.removeAllListeners();
    currentScene?.dispose();

    if (gameTicker) gameTicker.destroy();

    currentSceneFactory = sceneFactory;
    currentScene = sceneFactory();
    const update = (tick: PIXI.Ticker) => {
      const delta = tick.deltaMS * 0.01;
      currentScene?.update(delta);
    };
    gameTicker = new PIXI.Ticker().add(update);

    await currentScene.load(game);

    gameTicker.start();
  };

  return {
    next: loadScene,
    reload: async () => {
      if (currentSceneFactory) {
        onBeforeReload?.();
        await loadScene(currentSceneFactory);
      }
    },
  };
};
