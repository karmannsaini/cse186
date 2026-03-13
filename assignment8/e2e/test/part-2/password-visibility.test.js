import {describe, it, expect} from 'vitest';
import {page} from '../setup.js';

/**
 * Verify the password field can be shown/hidden on the login page.
 */
describe('Login password visibility', () => {
  it('toggles password input type using the eye icon', async () => {
    await page.waitForSelector('input[autocomplete="current-password"]');
    const passwordInput =
      await page.$('input[autocomplete="current-password"]');

    const typeBefore = await passwordInput.evaluate((el) => el.type);
    expect(typeBefore).toBe('password');

    const showBtn = await page.waitForSelector(
        'button[aria-label="Show password"]',
        {timeout: 5000},
    );
    await showBtn.click();

    const typeAfterShow = await passwordInput.evaluate((el) => el.type);
    expect(typeAfterShow).toBe('text');

    const hideBtn = await page.waitForSelector(
        'button[aria-label="Hide password"]',
        {timeout: 5000},
    );
    await hideBtn.click();

    const typeAfterHide = await passwordInput.evaluate((el) => el.type);
    expect(typeAfterHide).toBe('password');
  });

  it('resets to hidden password field on fresh visit', async () => {
    await page.waitForSelector('input[autocomplete="current-password"]');
    const passwordInput =
      await page.$('input[autocomplete="current-password"]');

    const showBtn = await page.waitForSelector(
        'button[aria-label="Show password"]',
        {timeout: 5000},
    );
    await showBtn.click();

    const typeAfterShow = await passwordInput.evaluate((el) => el.type);
    expect(typeAfterShow).toBe('text');

    // Simulate a fresh visit to the login page (e.g., after logout).
    await page.goto(page.url(), {waitUntil: 'networkidle0'});
    await page.waitForSelector('input[autocomplete="current-password"]');
    const passwordInputAfterReload =
      await page.$('input[autocomplete="current-password"]');
    const typeAfterReload =
      await passwordInputAfterReload.evaluate((el) => el.type);
    expect(typeAfterReload).toBe('password');
  });
});

