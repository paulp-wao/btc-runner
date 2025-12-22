import { describe, expect, it } from 'vitest';
import { createDiContainer } from './di-container';

describe('#diContainer', () => {
  const di = createDiContainer();
  for (const key of Object.keys(di)) {
    // camera requires setup and canvas;
    if (key === 'camera') continue;

    it(`diContainer.${key}`, () => {
      // @ts-expect-error
      const obj = di[key]();
      expect(obj).toBeTruthy();
    });
  }
});
