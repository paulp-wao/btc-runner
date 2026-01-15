import * as PIXI from 'pixi.js';
import { type IAnimateOptions, type IClampOptions, type IFollowOptions, Viewport } from 'pixi-viewport';
import { Entity } from '../ecs/entity';
import type { IGameConstants } from '../util/game.constants';

export class CameraEntity extends Entity {
  private readonly viewport: Viewport;

  constructor(props: {
    appRef: PIXI.Application;
    gameRef: PIXI.Container;
    gameConstants: IGameConstants;
  }) {
    const ctr = new PIXI.Container();
    ctr.visible = false;
    super(ctr);

    const { appRef, gameRef, gameConstants } = props;

    this.viewport = new Viewport({
      screenWidth: gameConstants.virtualGameWidth,
      screenHeight: gameConstants.virtualGameHeight,
      passiveWheel: false,
      events: appRef.renderer.events,
      noTicker: true,
    });

    this.viewport.addChild(gameRef);
    appRef.stage.addChild(this.viewport);

    this.viewport.clampZoom({
      minScale: 0.1,
      maxScale: 10,
    });
  }

  public animate(options: IAnimateOptions): Viewport {
    return this.viewport.animate(options);
  }

  public centerPos(): PIXI.Point {
    return new PIXI.Point(this.viewport.center.x, this.viewport.center.y);
  }

  public zeroPos(): PIXI.Point {
    return new PIXI.Point(this.viewport.left, this.viewport.top);
  }

  public zoomPercent(): number {
    return this.viewport.scale.x;
  }

  public vpBounds(): PIXI.Rectangle {
    const vp = this.viewport.getVisibleBounds();
    return new PIXI.Rectangle(vp.x, vp.y, vp.width, vp.height);
  }

  public follow(ctr: PIXI.Container, opt?: IFollowOptions): void {
    this.viewport.follow(ctr, opt);
  }

  public addFilter(...filters: PIXI.Filter[]): void {
    this.viewport.filters = filters;
  }

  public clamp(options?: IClampOptions): void {
    this.viewport.clamp(options);
  }

  public update(delta: number): void {
    this.viewport.update(delta * 1.15);
  }

  public moveCenter(x: number, y: number): void {
    this.viewport.moveCenter(x, y);
  }
}
