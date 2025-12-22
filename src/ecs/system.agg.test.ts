import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSystemAgg, type ISystem } from './system.agg';

describe('SystemAgg', () => {
  let sut: ReturnType<typeof createSystemAgg>;

  const makeSystem = (id: string): ISystem => ({
    name: () => id,
    update: vi.fn(),
  });

  beforeEach(() => {
    sut = createSystemAgg();
  });

  it('should start with an empty system list', () => {
    expect(sut.getAll()).toEqual([]);
  });

  it('should add a system', () => {
    const sys = makeSystem('test');
    sut.add(sys);

    expect(sut.getAll()).toHaveLength(1);
    expect(sut.getAll()[0].name()).toBe('test');
  });

  it('should throw when adding a system with duplicate name', () => {
    const sys1 = makeSystem('duplicate');
    const sys2 = makeSystem('duplicate');

    sut.add(sys1);

    expect(() => sut.add(sys2)).toThrow('only a sinlge isntance of a system can run');
  });

  it('should call update on all systems with the given delta', () => {
    const sys1 = makeSystem('s1');
    const sys2 = makeSystem('s2');

    sut.add(sys1, sys2);

    sut.update(0.5);

    expect(sys1.update).toHaveBeenCalledWith(0.5);
    expect(sys2.update).toHaveBeenCalledWith(0.5);
  });

  it('should remove a system by reference', () => {
    const sys1 = makeSystem('s1');
    const sys2 = makeSystem('s2');
    sut.add(sys1, sys2);

    sut.remove(sys1);

    expect(sut.getAll()).toHaveLength(1);
    expect(sut.getAll()[0].name()).toBe('s2');
  });

  it('should remove multiple systems at once', () => {
    const sys1 = makeSystem('s1');
    const sys2 = makeSystem('s2');
    const sys3 = makeSystem('s3');
    sut.add(sys1, sys2, sys3);

    sut.remove(sys1, sys3);

    const names = sut.getAll().map((s) => s.name());
    expect(names).toEqual(['s2']);
  });

  it('should clear all systems', () => {
    const sys1 = makeSystem('s1');
    const sys2 = makeSystem('s2');
    sut.add(sys1, sys2);

    sut.clearAll();

    expect(sut.getAll()).toEqual([]);
  });

  it('should ignore remove on systems that do not exist', () => {
    const sys1 = makeSystem('s1');
    sut.add(sys1);

    sut.remove(makeSystem('fake'));

    expect(sut.getAll()).toHaveLength(1);
  });
});
