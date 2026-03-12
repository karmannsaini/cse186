import {describe, it, expect, beforeEach} from 'vitest';
import {page} from '../setup.js';

const TEST_USER = {
  email: 'molly@books.com',
  password: 'mollymember',
};

describe('Posts Feed', () => {
  beforeEach(async () => {
    await page.waitForSelector('input[autocomplete="email"]');
    await page.type('input[autocomplete="email"]', TEST_USER.email);
    await page.type('input[autocomplete="current-password"]',
        TEST_USER.password);

    await Promise.all([
      page.waitForNavigation({waitUntil: 'networkidle0'}),
      page.click('button[type="submit"]'),
    ]);
  });

  it('displays a list of posts for the authenticated user', async () => {
    await page.waitForSelector('::-p-text(Welcome to your feed)');
    await page.waitForSelector('.MuiCard-root', {timeout: 5000});
    const posts = await page.$$('.MuiCard-root');
    expect(posts.length).toBeGreaterThan(0);
  });

  it('displays seeded posts from the API', async () => {
    await page.waitForSelector('::-p-text(Welcome to your feed)');
    const bodyText = await page.evaluate(() => document.body.innerText);
    expect(bodyText).toContain('Molly first post');
    expect(bodyText).toContain('Anna admin update');
  });

  it('renders post metadata accurately', async () => {
    await page.waitForSelector('::-p-text(Welcome to your feed)');
    await page.waitForSelector('.MuiCard-root', {timeout: 5000});
    const firstPostText = await page.$eval(
        '.MuiCard-root',
        (el) => el.textContent,
    );
    const hasValidSubtitle = firstPostText.includes('Public Post from') ||
                             firstPostText.includes('Group Post by');
    expect(hasValidSubtitle).toBe(true);
    expect(firstPostText.includes('Posted ')).toBe(true);
  });
});
