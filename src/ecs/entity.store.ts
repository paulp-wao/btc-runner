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
  private _idCache = new Map<string, Entity>();
  private _indexCache = new Map<Entity, number>();
  // biome-ignore lint/suspicious/noExplicitAny: cache constructor to name mapping
  private _ctorNameCache = new Map<new (...args: any[]) => Entity, string>();
  private _gameRef: PIXI.Container;

  constructor(props: { gameRef: PIXI.Container }) {
    this._gameRef = props.gameRef;
  }

  public add<T extends Entity>(...entities: T[]) {
    const store = this._store;
    const indexCache = this._indexCache;
    const gameRef = this._gameRef;
    // biome-ignore lint/suspicious/noExplicitAny: need to cache constructor
    let prevCtor: (new (...args: any[]) => Entity) | undefined;
    let prevKey: string | undefined;
    let prevList: Entity[] | undefined;
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      // biome-ignore lint/suspicious/noExplicitAny: constructor type
      const ctor = entity.constructor as new (...args: any[]) => Entity;
      let key: string;
      let list: Entity[];
      // Fast path: same type as previous entity
      if (ctor === prevCtor && prevKey !== undefined && prevList !== undefined) {
        key = prevKey;
        list = prevList;
      } else {
        key = this._getKey(ctor);
        const existing = store.get(key);
        if (existing === undefined) {
          list = [];
          store.set(key, list);
        } else {
          list = existing;
        }
        prevCtor = ctor;
        prevKey = key;
        prevList = list;
      }
      indexCache.set(entity, list.length);
      list.push(entity);
      gameRef.addChild(entity.ctr);
    }
  }

  public remove(...entities: Entity[]) {
    const store = this._store;
    const indexCache = this._indexCache;
    const idCache = this._idCache;
    const gameRef = this._gameRef;
    // biome-ignore lint/suspicious/noExplicitAny: need to cache constructor
    let prevCtor: (new (...args: any[]) => Entity) | undefined;
    let prevKey: string | undefined;
    let prevList: Entity[] | undefined;
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      const index = indexCache.get(entity);
      if (index === undefined) continue;

      // biome-ignore lint/suspicious/noExplicitAny: constructor type
      const ctor = entity.constructor as new (...args: any[]) => Entity;
      let key: string;
      let list: Entity[] | undefined;
      // Fast path: same type as previous entity
      if (ctor === prevCtor && prevKey !== undefined) {
        key = prevKey;
        list = prevList;
      } else {
        key = this._getKey(ctor);
        list = store.get(key);
        prevCtor = ctor;
        prevKey = key;
        prevList = list;
      }
      if (list === undefined) continue;

      // Swap-remove: O(1) instead of O(n) splice
      const lastIndex = list.length - 1;
      if (index !== lastIndex) {
        const swapped = list[lastIndex];
        list[index] = swapped;
        indexCache.set(swapped, index);
      }
      list.pop();
      indexCache.delete(entity);
      gameRef.removeChild(entity.ctr);
      idCache.delete(entity.id);

      if (list.length === 0) {
        store.delete(key);
        prevList = undefined;
      }
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny: need this to allow search by ctr name
  public getAll<T extends Entity>(type: new (...args: any[]) => T): T[] {
    return (this._store.get(type.name) as T[]) || [];
  }

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
    return this._store.get(type.name)?.[0] as T | undefined;
  }

  public clear() {
    this._store.clear();
    this._indexCache.clear();
  }

  // biome-ignore lint/suspicious/noExplicitAny: need to accept any constructor
  private _getKey(ctor: new (...args: any[]) => Entity): string {
    let key = this._ctorNameCache.get(ctor);
    if (key === undefined) {
      key = ctor.name;
      this._ctorNameCache.set(ctor, key);
    }
    return key;
  }
}

export const createEntityStore = (gameRef: PIXI.Container): IEntityStore => {
  return new EntityStore({ gameRef });
};
