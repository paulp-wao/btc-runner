type Callback<T> = (payload: T) => void;
// biome-ignore lint/suspicious/noExplicitAny: use of any is needed here
interface Listener<K extends keyof any, V> {
  id: string;
  event: K;
  callback: Callback<V>;
}

export interface IEventBus {
  on: <K extends keyof EventMap>(event: K, callback: Callback<EventMap[K]>) => string;
  fire: <K extends keyof EventMap>(event: K, payload: EventMap[K]) => void;
  count: () => number;
  remove: (id: string) => void;
  clear: () => void;
}

export type EventMap = {
  eventName: { count: number };
  camShake: {
    duration?: number;
    magnitude?: number;
  };
};

// biome-ignore lint/suspicious/noExplicitAny: use of any is needed here
export const eventBus = <EventMap extends Record<string, any>>() => {
  // biome-ignore lint/suspicious/noExplicitAny: use of any is needed here
  const listeners = new Map<string, Listener<keyof EventMap, any>>();

  const on = <K extends keyof EventMap>(event: K, callback: Callback<EventMap[K]>): string => {
    const time = Date.now().toString().slice(-8);
    const randNum = Math.floor(Math.random() * 100_000_000);
    const id = `evt_${time}_${randNum}`;
    listeners.set(id, { id, event, callback });
    return id;
  };

  const fire = <K extends keyof EventMap>(event: K, payload: EventMap[K]): void => {
    for (const listener of listeners.values()) {
      if (listener.event === event) {
        (listener.callback as Callback<EventMap[K]>)(payload);
      }
    }
  };

  const remove = (id: string): void => {
    listeners.delete(id);
  };

  const clear = () => listeners.clear();

  const count = () => listeners.size;

  return {
    on,
    fire,
    count,
    remove,
    clear,
  };
};

export const createEventBus = () => {
  const bus = eventBus<EventMap>();
  return bus;
};
