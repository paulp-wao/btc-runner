import { describe, expect, it, vi } from 'vitest';
import { createEventBus } from './event-bus.ts';

describe('EventBus', () => {
  it('should register an event listener and return an id', () => {
    const sut = createEventBus();
    const callback = vi.fn();
    const id = sut.on('eventName', callback);

    expect(typeof id).toBe('string');
    expect(sut.count()).toBe(1);
  });

  it('should fire an event and call the listener with payload', () => {
    const sut = createEventBus();
    const callback = vi.fn();
    sut.on('eventName', callback);

    const payload = { count: 42 };
    sut.fire('eventName', payload);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(payload);
  });

  it('should support multiple listeners for the same event', () => {
    const sut = createEventBus();
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    sut.on('eventName', cb1);
    sut.on('eventName', cb2);

    sut.fire('eventName', { count: 7 });

    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(1);
  });

  it('should remove a listener by id', () => {
    const sut = createEventBus();
    const cb = vi.fn();
    const id = sut.on('eventName', cb);

    sut.remove(id);
    sut.fire('eventName', { count: 100 });

    expect(cb).not.toHaveBeenCalled();
    expect(sut.count()).toBe(0);
  });

  it('should not throw when removing a non-existent listener', () => {
    const sut = createEventBus();
    expect(() => sut.remove('non_existent_id')).not.toThrow();
  });
});
