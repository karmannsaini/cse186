import {describe, it, expect} from 'vitest';
import {page} from '../setup.js';

const TEST_USER = {
  email: 'molly@books.com',
  password: 'mollymember',
};

describe('Authentication Flow', () => {
  it('allows a user to log in with valid credentials', async () => {
    await page.waitForSelector('input[autocomplete="email"]');
    await page.waitForSelector('input[autocomplete="current-password"]');

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

    const feedHeading = await page.waitForSelector(
        '::-p-text(Welcome to your feed)',
        {timeout: 5000},
    );
    expect(feedHeading).not.toBeNull();
  });

  it('prevents a user from logging in with invalid credentials', async () => {
    await page.waitForSelector('input[autocomplete="email"]');

    await page.type('input[autocomplete="email"]', TEST_USER.email);
    await page.type('input[autocomplete="current-password"]', 'wrongpassword');

    await page.click('button[type="submit"]');

    const errorMessage = await page.waitForSelector(
        '::-p-text(Invalid email or password)',
        {timeout: 5000},
    );
    expect(errorMessage).not.toBeNull();
  });

  it('allows login with valid credentials after a failed attempt', async () => {
    await page.waitForSelector('input[autocomplete="email"]');
    await page.type('input[autocomplete="email"]', TEST_USER.email);
    await page.type('input[autocomplete="current-password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await page.waitForSelector('::-p-text(Invalid email or password)', {
      timeout: 5000,
    });

    await page.click('input[autocomplete="current-password"]', {clickCount: 3});
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

    const feedHeading = await page.waitForSelector(
        '::-p-text(Welcome to your feed)',
        {timeout: 5000},
    );
    expect(feedHeading).not.toBeNull();
  });

  it('allows an authenticated user to log out', async () => {
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

    const logoutBtn = await page.waitForSelector('::-p-text(Logout)');
    expect(logoutBtn).not.toBeNull();
    await logoutBtn.click();
    const emailInput = await page.waitForSelector(
        'input[autocomplete="email"]',
        {timeout: 5000},
    );
    expect(emailInput).not.toBeNull();
  });
});
