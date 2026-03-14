import {describe, it, expect, beforeEach} from 'vitest';
import {page} from '../setup.js';

const TEST_USER = {
  email: 'molly@books.com',
  password: 'mollymember',
};

/**
 * Log in through the UI and wait for feed.
 * @returns {Promise<void>} resolves after navigation to feed
 */
async function login() {
  await page.waitForSelector('input[autocomplete="email"]');
  await page.type('input[autocomplete="email"]', TEST_USER.email);
  await page.type('input[autocomplete="current-password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForFunction(
      () => {
        const p = window.location.pathname;
        return p === '/home' || p === '/home/';
      },
      {timeout: 15000},
  );
  await page.waitForSelector('::-p-text(Welcome to your feed)');
}

/**
 * Click the "Post" button in the composer.
 * @returns {Promise<void>} resolves after click
 */
async function clickPostButton() {
  const postBtnHandle = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find((b) =>
      (b.textContent || '').trim().toLowerCase() === 'post') || null;
  });
  const postBtn = postBtnHandle.asElement();
  expect(postBtn).toBeTruthy();
  await postBtn.click();
  postBtn.dispose();
}

describe('Create posts', () => {
  beforeEach(async () => {
    await login();
  }, 20000);

  it('creates a new top-level post and shows it in the feed', async () => {
    await page.waitForSelector('.MuiCard-root', {timeout: 5000});
    const composer = await page.waitForSelector('textarea', {timeout: 3000});
    await composer.type('E2E top-level post');
    composer.dispose();
    await clickPostButton();
    await page.waitForFunction(
        () => document.body.innerText.includes('E2E top-level post'),
        {timeout: 15000},
    );
    const bodyText = await page.evaluate(() => document.body.innerText);
    expect(bodyText).toContain('E2E top-level post');
  }, 20000);

  it('shows validation error when post text is only whitespace', async () => {
    await page.waitForSelector('textarea', {timeout: 3000});
    const composer = await page.$('textarea');
    await composer.type('   ');
    composer.dispose();
    await clickPostButton();
    await page.waitForSelector('::-p-text(Post text is required)', {
      timeout: 5000,
    });
    const bodyText = await page.evaluate(() => document.body.innerText);
    expect(bodyText).toContain('Post text is required');
  }, 20000);

  it('creates a post in group view and shows it', async () => {
    await page.waitForSelector('.MuiCard-root', {timeout: 5000});
    const menuButton = await page.$('button[aria-label=\'open menu\']');
    if (menuButton) {
      const isVisible = await menuButton.evaluate(
          (el) => el.offsetParent !== null,
      );
      if (isVisible) {
        await menuButton.click();
      }
      menuButton.dispose();
    }
    await page.waitForSelector('::-p-text(Books Club)', {timeout: 5000});
    await page.waitForSelector('.MuiListItemButton-root', {timeout: 5000});
    const listItems = await page.$$('.MuiListItemButton-root');
    expect(listItems.length).toBeGreaterThan(0);

    const booksIdx = await page.evaluate(() => {
      const items = document.querySelectorAll('.MuiListItemButton-root');
      return Array.from(items).findIndex((el) =>
        (el.textContent || '').includes('Books Club'));
    });
    expect(booksIdx).toBeGreaterThanOrEqual(0);
    await listItems[booksIdx].evaluate((el) => el.click());

    await page.waitForFunction(
        () => window.location.pathname.includes('/home/group/'),
        {timeout: 5000},
    );
    // Ensure group posts have loaded before we create a post, otherwise the
    // initial fetch can complete after clicking "Post" and confuse the wait.
    await page.waitForFunction(
        () => document.body.innerText.includes('Molly first post'),
        {timeout: 10000},
    );

    const composer = await page.waitForSelector('textarea', {timeout: 3000});
    await composer.type('E2E group post');
    composer.dispose();
    await clickPostButton();

    await page.waitForFunction(
        () => {
          const body = document.body.innerText || '';
          const hasText = body.includes('E2E group post');
          const hasError = /unable to create post/i.test(body);
          return hasText || hasError;
        },
        {timeout: 25000},
    );

    const bodyText = await page.evaluate(() => document.body.innerText);
    expect(bodyText).not.toMatch(/unable to create post/i);
    expect(bodyText).toContain('E2E group post');
  }, 30000);
});

