import * as PIXI from 'pixi.js';
import { bench, describe } from 'vitest';
import { Entity } from '~/ecs/entity.ts';
import { type IEntityStore, createEntityStore } from './entity.store.ts';

class TestEntity extends Entity {}
class AnotherEntity extends Entity {}

let store: IEntityStore;
let gameRef: PIXI.Container;
let entities: TestEntity[];
let anotherEntities: AnotherEntity[];
let entityToAdd: TestEntity;
let entityToRemove: TestEntity;
let targetId: string;

describe('EntityStore', () => {
  describe('add', () => {
    bench(
      'add single entity',
      () => {
        store.add(entityToAdd);
      },
      {
        setup: () => {
          gameRef = new PIXI.Container();
          store = createEntityStore(gameRef);
          entityToAdd = new TestEntity(new PIXI.Container());
        },
      },
    );

    bench(
      'add 100 entities',
      () => {
        store.add(...entities);
      },
      {
        setup: () => {
          gameRef = new PIXI.Container();
          store = createEntityStore(gameRef);
          entities = Array.from({ length: 100 }, () => new TestEntity(new PIXI.Container()));
        },
      },
    );

    bench(
      'add 1000 entities',
      () => {
        store.add(...entities);
      },
      {
        setup: () => {
          gameRef = new PIXI.Container();
          store = createEntityStore(gameRef);
          entities = Array.from({ length: 1000 }, () => new TestEntity(new PIXI.Container()));
        },
      },
    );
  });

  describe('remove', () => {
    bench(
      'remove single entity',
      () => {
        store.remove(entityToRemove);
      },
      {
        setup: () => {
          gameRef = new PIXI.Container();
          store = createEntityStore(gameRef);
          entityToRemove = new TestEntity(new PIXI.Container());
          store.add(entityToRemove);
        },
      },
    );

    bench(
      'remove from store with 100 entities',
      () => {
        store.remove(entityToRemove);
      },
      {
        setup: () => {
          gameRef = new PIXI.Container();
          store = createEntityStore(gameRef);
          entities = Array.from({ length: 100 }, () => new TestEntity(new PIXI.Container()));
          store.add(...entities);
          entityToRemove = entities[50];
        },
      },
    );

    bench(
      'remove 50 entities from store with 100',
      () => {
        store.remove(...entities.slice(0, 50));
      },
      {
        setup: () => {
          gameRef = new PIXI.Container();
          store = createEntityStore(gameRef);
          entities = Array.from({ length: 100 }, () => new TestEntity(new PIXI.Container()));
          store.add(...entities);
        },
      },
    );
  });

  describe('getAll', () => {
    bench(
      'getAll from empty store',
      () => {
        store.getAll(TestEntity);
      },
      {
        setup: () => {
          gameRef = new PIXI.Container();
          store = createEntityStore(gameRef);
        },
      },
    );

    bench(
      'getAll with 100 entities',
      () => {
        store.getAll(TestEntity);
      },
      {
        setup: () => {
          gameRef = new PIXI.Container();
          store = createEntityStore(gameRef);
          entities = Array.from({ length: 100 }, () => new TestEntity(new PIXI.Container()));
          store.add(...entities);
        },
      },
    );

    bench(
      'getAll with mixed types (100 each)',
      () => {
        store.getAll(TestEntity);
      },
      {
        setup: () => {
          gameRef = new PIXI.Container();
          store = createEntityStore(gameRef);
          entities = Array.from({ length: 100 }, () => new TestEntity(new PIXI.Container()));
          anotherEntities = Array.from({ length: 100 }, () => new AnotherEntity(new PIXI.Container()));
          store.add(...entities, ...anotherEntities);
        },
      },
    );
  });

  describe('first', () => {
    bench(
      'first from empty store',
      () => {
        store.first(TestEntity);
      },
      {
        setup: () => {
          gameRef = new PIXI.Container();
          store = createEntityStore(gameRef);
        },
      },
    );

    bench(
      'first with 100 entities',
      () => {
        store.first(TestEntity);
      },
      {
        setup: () => {
          gameRef = new PIXI.Container();
          store = createEntityStore(gameRef);
          entities = Array.from({ length: 100 }, () => new TestEntity(new PIXI.Container()));
          store.add(...entities);
        },
      },
    );
  });

  describe('getById', () => {
    bench(
      'getById cache miss (first lookup)',
      () => {
        store.getById(targetId);
      },
      {
        setup: () => {
          gameRef = new PIXI.Container();
          store = createEntityStore(gameRef);
          entities = Array.from({ length: 100 }, () => new TestEntity(new PIXI.Container()));
          store.add(...entities);
          targetId = entities[50].id;
        },
      },
    );

    bench(
      'getById cache hit (repeated lookup)',
      () => {
        store.getById(targetId);
      },
      {
        setup: () => {
          gameRef = new PIXI.Container();
          store = createEntityStore(gameRef);
          entities = Array.from({ length: 100 }, () => new TestEntity(new PIXI.Container()));
          store.add(...entities);
          targetId = entities[50].id;
          store.getById(targetId);
        },
      },
    );

    bench(
      'getById non-existent id',
      () => {
        store.getById('non-existent-id');
      },
      {
        setup: () => {
          gameRef = new PIXI.Container();
          store = createEntityStore(gameRef);
          entities = Array.from({ length: 100 }, () => new TestEntity(new PIXI.Container()));
          store.add(...entities);
        },
      },
    );
  });

  describe('clear', () => {
    bench(
      'clear empty store',
      () => {
        store.clear();
      },
      {
        setup: () => {
          gameRef = new PIXI.Container();
          store = createEntityStore(gameRef);
        },
      },
    );

    bench(
      'clear store with 100 entities',
      () => {
        store.clear();
      },
      {
        setup: () => {
          gameRef = new PIXI.Container();
          store = createEntityStore(gameRef);
          entities = Array.from({ length: 100 }, () => new TestEntity(new PIXI.Container()));
          store.add(...entities);
        },
      },
    );

    bench(
      'clear store with 1000 entities',
      () => {
        store.clear();
      },
      {
        setup: () => {
          gameRef = new PIXI.Container();
          store = createEntityStore(gameRef);
          entities = Array.from({ length: 1000 }, () => new TestEntity(new PIXI.Container()));
          store.add(...entities);
        },
      },
    );
  });
});
