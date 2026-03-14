import {describe, beforeEach, it, expect} from 'vitest';
import {page, BASE_URL} from '../setup.js';

const TEST_USER = {
  email: 'molly@books.com',
  password: 'mollymember',
};

describe('Responsiveness and Routing', () => {
  beforeEach(async () => {

  });

  it('shows usable layout at mobile viewport with menu button', async () => {
    await page.setViewport({width: 375, height: 667});
    await page.goto(BASE_URL);

    await page.waitForSelector('input[autocomplete="email"]');
    await page.type('input[autocomplete="email"]', TEST_USER.email);
    await page.type('input[autocomplete="current-password"]',
        TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForFunction(
        () => {
          const p = window.location.pathname;
          return p === '/home' || p === '/home/';
        },
        {timeout: 15000},
    );

    const bodyText = await page.evaluate(() => document.body.innerText);
    expect(bodyText).toContain('Welcome to your feed');

    const menuButton = await page.$('button[aria-label="open menu"]');
    expect(menuButton).not.toBeNull();
  });

  it('shows Not Found page for invalid group ID', async () => {
    await page.goto(BASE_URL);
    await page.waitForSelector('input[autocomplete="email"]');
    await page.type('input[autocomplete="email"]',
        TEST_USER.email);
    await page.type('input[autocomplete="current-password"]',
        TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForFunction(
        () => {
          const p = window.location.pathname;
          return p === '/home' || p === '/home/';
        },
        {timeout: 15000},
    );

    await page.waitForSelector('::-p-text(Welcome to your feed)', {
      timeout: 5000,
    });
    const invalidGroupUrl =
      `${BASE_URL}/home/group/00000000-0000-0000-0000-000000000000`;
    await page.goto(invalidGroupUrl, {waitUntil: 'networkidle0'});

    const bodyText = await page.evaluate(() => document.body.innerText);
    expect(bodyText).toMatch(/can't find that page|not found/i);
  });

  it('shows Not Found page for unknown route', async () => {
    await page.goto(`${BASE_URL}/unknown-route`, {
      waitUntil: 'networkidle0',
    });

    const bodyText = await page.evaluate(() => document.body.innerText);
    expect(bodyText).toMatch(/can't find that page|not found/i);

    const goHomeLink = await page.$('a[href="/home"]');
    expect(goHomeLink).not.toBeNull();
  });
});
