import * as PIXI from 'pixi.js';
import { beforeAll, describe, expect, it } from 'vitest';
import { createCamera } from './camera';
import { getGameConstants } from './game.constants';

describe('#camera', () => {
  beforeAll(() => {
    // biome-ignore lint/suspicious/noExplicitAny: use of any is needed here
    (HTMLCanvasElement.prototype as any).getContext = () => ({});
    //@ts-expect-error
    // biome-ignore lint/suspicious/noExplicitAny: use of any is needed here
    PIXI.Application.prototype.init = async function (options: any) {
      this.renderer = {
        render: () => {},
        resize: () => {},
        destroy: () => {},
        view: options.canvas ?? document.createElement('canvas'),
        events: {
          domElement: document.createElement('div'),
          addEventListener: () => {},
          removeEventListener: () => {},
        },
      } as unknown as PIXI.Renderer;
      this.stage = new PIXI.Container();
      return this;
    };
  });

  it('should initialize without errors', async () => {
    const canvas = document.createElement('canvas');
    const app = new PIXI.Application();
    await app.init({ backgroundColor: '#ffffff', canvas });
  });

  it('should expose essential camera properties', async () => {
    const canvas = document.createElement('canvas');
    const appRef = new PIXI.Application();
    await appRef.init({ backgroundColor: '#ffffff', canvas });
    const gameRef = new PIXI.Container();

    const camera = createCamera(appRef, gameRef, getGameConstants());

    expect(camera.centerPos()).toBeTruthy();
    expect(camera.zoomPercent()).toBeTruthy();
    expect(camera.vpBounds()).toBeTruthy();
  });
});
