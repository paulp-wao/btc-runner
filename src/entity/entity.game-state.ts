import * as PIXI from 'pixi.js';
import { Entity } from '../ecs/entity';

export type GameState = 'waiting' | 'playing' | 'won' | 'lost';

export class GameStateEntity extends Entity {
  public state: GameState = 'waiting';

  constructor() {
    const ctr = new PIXI.Container();
    ctr.visible = false;
    super(ctr);
  }

  public isWaiting(): boolean {
    return this.state === 'waiting';
  }

  public isPlaying(): boolean {
    return this.state === 'playing';
  }

  public isWon(): boolean {
    return this.state === 'won';
  }

  public isLost(): boolean {
    return this.state === 'lost';
  }

  public startGame(): void {
    this.state = 'playing';
  }

  public winGame(): void {
    this.state = 'won';
  }

  public loseGame(): void {
    this.state = 'lost';
  }

  public reset(): void {
    this.state = 'waiting';
  }
}
