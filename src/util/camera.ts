import * as PIXI from 'pixi.js';
import { type IAnimateOptions, type IClampOptions, type IFollowOptions, Viewport } from 'pixi-viewport';
import type { IGameConstants } from './game.constants';

export const createCamera = (
  appRef: PIXI.Application,
  gameRef: PIXI.Container,
  gameConstants: IGameConstants,
): ICamera => {
  const viewport = new Viewport({
    screenWidth: gameConstants.virtualGameWidth,
    screenHeight: gameConstants.virtualGameHeight,
    passiveWheel: false,
    events: appRef.renderer.events,
    noTicker: true,
  });

  viewport.addChild(gameRef);
  appRef.stage.addChild(viewport);

  // viewport.decelerate({
  //   friction: 0.98,
  //   minSpeed: 10,
  //   bounce: 0,
  // });

  viewport.clampZoom({
    minScale: 0.1,
    maxScale: 10,
  });

  return {
    animate: (options: IAnimateOptions) => viewport.animate(options),
    centerPos: () => {
      return new PIXI.Point(viewport.center.x, viewport.center.y);
    },
    zeroPos: () => {
      return new PIXI.Point(viewport.left, viewport.top);
    },
    zoomPercent: () => viewport.scale.x,
    vpBounds: () => {
      const vp = viewport.getVisibleBounds();
      return new PIXI.Rectangle(vp.x, vp.y, vp.width, vp.height);
    },
    follow: (ctr: PIXI.Container, opt?: IFollowOptions) => {
      viewport.follow(ctr, opt);
    },
    addFilter: (...filters: PIXI.Filter[]) => {
      viewport.filters = filters;
    },
    clamp: (options?: IClampOptions) => {
      viewport.clamp(options);
    },
    update: (delta: number) => viewport.update(delta * 1.15),
  };
};

export interface ICamera {
  animate: (options: IAnimateOptions) => Viewport;
  centerPos: () => PIXI.Point;
  zeroPos: () => PIXI.Point;
  zoomPercent: () => number;
  vpBounds: () => PIXI.Rectangle;
  follow: (ctr: PIXI.Container, opt?: IFollowOptions) => void;
  addFilter: (...filters: PIXI.Filter[]) => void;
  clamp: (options?: IClampOptions) => void;
  update: (delta: number) => void;
}
