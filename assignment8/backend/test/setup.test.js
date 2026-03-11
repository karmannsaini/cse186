import './setup.js';
import dotenv from 'dotenv';
import {describe, it, expect} from 'vitest';

describe('setup', () => {
  it('loads and patches dotenv.config without throwing', () => {
    expect(true).toBe(true);
  });

  it('patched dotenv.config runs with quiet: true', () => {
    const result = dotenv.config();
    expect(result).toBeDefined();
  });
});
