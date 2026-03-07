/* @vitest-environment node */
import {describe, it, expect} from 'vitest';

describe('testHelpers in node env', () => {
  it('loads when window is undefined', async () => {
    expect(typeof globalThis.window).toBe('undefined');
    const mod = await import('./testHelpers.jsx');
    expect(mod.registerFetchMock).toBeDefined();
  }, 10000);
});
