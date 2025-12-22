import * as PIXI from 'pixi.js';
import { Entity } from '../ecs/entity';

export class PlayerSpawnEntity extends Entity {
  public readonly spawnX: number;
  public readonly spawnY: number;

  constructor(props: { x: number; y: number }) {
    const ctr = new PIXI.Container();
    ctr.visible = false;
    super(ctr);
    this.spawnX = props.x;
    this.spawnY = props.y;
  }
}
