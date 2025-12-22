import * as PIXI from 'pixi.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { Entity } from '~/entity/entity.ts';
import { createEntityStore } from './entity.store.ts';

class TestEntity extends Entity {}
class AnotherEntity extends Entity {}

describe('EntityStore', () => {
  let sut: ReturnType<typeof createEntityStore>;
  let gameRef: PIXI.Container;

  beforeEach(() => {
    gameRef = new PIXI.Container();
    sut = createEntityStore(gameRef);
  });

  it('should add an entity and retrieve it by type', () => {
    const actual = new TestEntity(new PIXI.Container());

    sut.add(actual);
    const expected = sut.first(TestEntity);

    expect(expected?.id).toBe(actual.id);
  });

  it('should add multiple entities and retrieve all by type', () => {
    const e1 = new TestEntity(new PIXI.Container());
    const e2 = new TestEntity(new PIXI.Container());

    sut.add(e1, e2);
    const results = sut.getAll(TestEntity);

    expect(results.length).toBe(2);
    expect(results.map((e) => e.id)).toContain(e1.id);
    expect(results.map((e) => e.id)).toContain(e2.id);
  });

  it('should return undefined for first() when no entities exist', () => {
    const result = sut.first(TestEntity);
    expect(result).toBeUndefined();
  });

  it('should remove an entity and update store', () => {
    const e1 = new TestEntity(new PIXI.Container());
    sut.add(e1);

    sut.remove(e1);

    const results = sut.getAll(TestEntity);
    expect(results.length).toBe(0);
    expect(sut.first(TestEntity)).toBeUndefined();
  });

  it('should not throw when removing an entity that was never added', () => {
    const e1 = new TestEntity(new PIXI.Container());
    expect(() => sut.remove(e1)).not.toThrow();
  });

  it('should delete the store key when last entity of a type is removed', () => {
    const e1 = new TestEntity(new PIXI.Container());
    sut.add(e1);

    sut.remove(e1);

    const results = sut.getAll(TestEntity);
    expect(results).toEqual([]);
  });

  it('should keep separate lists for different entity types', () => {
    const t1 = new TestEntity(new PIXI.Container());
    const a1 = new AnotherEntity(new PIXI.Container());

    sut.add(t1, a1);

    const testEntities = sut.getAll(TestEntity);
    const anotherEntities = sut.getAll(AnotherEntity);

    expect(testEntities.length).toBe(1);
    expect(anotherEntities.length).toBe(1);
  });

  it('should clear all entities', () => {
    const t1 = new TestEntity(new PIXI.Container());
    const a1 = new AnotherEntity(new PIXI.Container());

    sut.add(t1, a1);
    sut.clear();

    expect(sut.getAll(TestEntity).length).toBe(0);
    expect(sut.getAll(AnotherEntity).length).toBe(0);
    expect(sut.first(TestEntity)).toBeUndefined();
  });

  it('should add child entities to the PIXI.Container', () => {
    const e1 = new TestEntity(new PIXI.Container());
    sut.add(e1);

    expect(gameRef.children.includes(e1.ctr)).toBe(true);
  });

  it('should remove child entities from the PIXI.Container', () => {
    const e1 = new TestEntity(new PIXI.Container());
    sut.add(e1);

    sut.remove(e1);
    expect(gameRef.children.includes(e1.ctr)).toBe(false);
  });
});
