export interface ISystem {
  name: () => string;
  update: (delta: number) => void;
}

export interface ISystemAgg {
  update: (delta: number) => void;
  add: (...systems: ISystem[]) => void;
  remove: (...systems: ISystem[]) => void;
  clearAll: () => void;
  getAll: () => ISystem[];
}

export const createSystemAgg = (): ISystemAgg => {
  let _list: ISystem[] = [];

  return {
    update: (delta: number) => {
      for (let i = 0; i < _list.length; i++) {
        _list[i].update(delta);
      }
    },
    add: (...systems: ISystem[]) => {
      for (const system of systems) {
        if (_list.find((s) => s.name() === system.name())) {
          throw new Error('only a sinlge isntance of a system can run');
        }
        _list.push(system);
      }
    },
    remove: (...systems: ISystem[]) => {
      const toRemove = new Set(systems.map((s) => s.name()));
      _list = _list.filter((s) => !toRemove.has(s.name()));
    },
    clearAll: () => {
      _list.length = 0;
    },
    getAll: () => {
      return _list;
    },
  };
};
