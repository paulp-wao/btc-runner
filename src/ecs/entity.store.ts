import type * as PIXI from 'pixi.js';
import type { Entity } from '~/ecs/entity';

export interface IEntityStore {
  add<T extends Entity>(...entities: T[]): void;
  remove(...entities: Entity[]): void;
  // biome-ignore lint/suspicious/noExplicitAny: use of any is needed here
  getAll<T extends Entity>(type: new (...args: any[]) => T): T[];
  // biome-ignore lint/suspicious/noExplicitAny: use of any is needed here
  first<T extends Entity>(type: new (...args: any[]) => T): T | undefined;
  getById(id: string): Entity | undefined;
  clear(): void;
}

export class EntityStore implements IEntityStore {
  private _store = new Map<string, Entity[]>();
  private _gameRef: PIXI.Container;

  constructor(props: { gameRef: PIXI.Container }) {
    this._gameRef = props.gameRef;
  }

  public add<T extends Entity>(...entities: T[]) {
    for (const entity of entities) {
      const key = entity.constructor.name;
      if (!this._store.has(key)) {
        this._store.set(key, []);
      }
      this._store.get(key)?.push(entity);
      this._gameRef.addChild(entity.ctr);
    }
  }

  public remove(...entities: Entity[]) {
    for (const entity of entities) {
      const key = entity.constructor.name;
      const list = this._store.get(key);
      if (!list) continue;

      const index = list.indexOf(entity);
      if (index !== -1) {
        const entToRemove = list[index];
        list.splice(index, 1);
        this._gameRef.removeChild(entToRemove.ctr);
        this._idCache.delete(entToRemove.id);
      }

      if (list.length === 0) {
        this._store.delete(key);
      }
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny: need this to allow search by ctr name
  public getAll<T extends Entity>(type: new (...args: any[]) => T): T[] {
    return (this._store.get(type.name) as T[]) || [];
  }

  private _idCache = new Map<string, Entity>();
  public getById(id: string): Entity | undefined {
    const cacheHit = this._idCache.get(id);
    if (cacheHit) return cacheHit;

    for (const [_, entities] of this._store.entries()) {
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        if (entity.id === id) {
          this._idCache.set(entity.id, entity);
          return entity;
        }
      }
    }

    return undefined;
  }

  // biome-ignore lint/suspicious/noExplicitAny: need this to allow search by ctr name
  public first<T extends Entity>(type: new (...args: any[]) => T) {
    const result = this._store.get(type.name)?.at(0);
    return result as T | undefined;
  }

  public clear() {
    this._store.clear();
  }
}

export const createEntityStore = (gameRef: PIXI.Container): IEntityStore => {
  return new EntityStore({ gameRef });
};
