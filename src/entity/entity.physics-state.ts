import * as PIXI from 'pixi.js';
import { Entity } from '../ecs/entity';

export class PhysicsStateEntity extends Entity {
  public velocityY = 0;
  public isGrounded = false;
  public gameWon = false;

  constructor() {
    const ctr = new PIXI.Container();
    ctr.visible = false;
    super(ctr);
  }
}
