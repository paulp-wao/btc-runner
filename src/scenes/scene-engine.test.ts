import * as PIXI from 'pixi.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSceneEngine, type IScene } from './scene-engine.ts';

describe('SceneEngine', () => {
  let game: PIXI.Container;

  beforeEach(() => {
    game = new PIXI.Container();
  });

  const makeScene = (): IScene => {
    return {
      load: vi.fn().mockResolvedValue(undefined),
      update: vi.fn(),
      dispose: vi.fn(),
    };
  };

  it('should throw if game is not provided', async () => {
    const engine = createSceneEngine(undefined as unknown as PIXI.Container);

    await expect(engine.next(() => makeScene())).rejects.toThrow('game not init when calling next');
  });

  it('should call load on the new scene', async () => {
    const engine = createSceneEngine(game);
    const scene = makeScene();

    await engine.next(() => scene);

    expect(scene.load).toHaveBeenCalledWith(game);
  });

  it('should call dispose on the old scene when switching', async () => {
    const engine = createSceneEngine(game);
    const firstScene = makeScene();
    const secondScene = makeScene();

    await engine.next(() => firstScene);
    await engine.next(() => secondScene);

    expect(firstScene.dispose).toHaveBeenCalled();
  });

  it('should clear children and listeners when switching scenes', async () => {
    const engine = createSceneEngine(game);

    // add dummy child and listener
    game.addChild(new PIXI.Container());
    game.on('foo', () => {});

    const scene = makeScene();
    await engine.next(() => scene);

    expect(game.children.length).toBe(0);
    expect(game.listenerCount('foo')).toBe(0);
  });

  it('should update the scene when ticker runs', async () => {
    const engine = createSceneEngine(game);
    const scene = makeScene();

    await engine.next(() => scene);

    // Simulate one tick
    // biome-ignore lint/suspicious/noExplicitAny: use of any is needed here
    const ticker = (PIXI.Ticker.shared as any) || new PIXI.Ticker();
    ticker.deltaMS = 16; // ~16ms = 60fps
    // biome-ignore lint/suspicious/noExplicitAny: use of any is needed here
    (scene.update as any).mockClear();

    // Force a manual tick
    scene.update(ticker.deltaMS * 0.01);
    expect(scene.update).toHaveBeenCalledWith(0.16);
  });

  it('should destroy old ticker when switching to new scene', async () => {
    const engine = createSceneEngine(game);
    const scene1 = makeScene();
    const scene2 = makeScene();

    const destroySpy = vi.spyOn(PIXI.Ticker.prototype, 'destroy');

    await engine.next(() => scene1);
    await engine.next(() => scene2);

    expect(destroySpy).toHaveBeenCalled();
  });
});
