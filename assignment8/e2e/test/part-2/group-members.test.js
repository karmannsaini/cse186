import {describe, it, expect} from 'vitest';
import {page, BASE_URL} from '../setup.js';

const TEST_USER = {
  email: 'molly@books.com',
  password: 'mollymember',
};

/**
 * Log in through the UI and land on the feed.
 * @returns {Promise<void>} resolves after navigation
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

describe('Group members', () => {
  it('shows the members of Books Club when requested', async () => {
    await login();
    await page.waitForSelector('.MuiListItemButton-root', {timeout: 5000});

    const listItems = await page.$$('.MuiListItemButton-root');
    let clicked = false;
    for (const item of listItems) {
      const txt = await item.evaluate((el) => (el.textContent || '').trim());
      if (txt === 'Books Club') {
        await item.evaluate((el) => el.click());
        clicked = true;
        break;
      }
    }
    expect(clicked).toBe(true);

    await page.waitForFunction(
        () => window.location.href.includes('/home/group/'),
        {timeout: 5000},
    );
    await page.waitForSelector('::-p-text(Books Club)', {timeout: 5000});

    const membersButton = await page.waitForSelector(
        'button:has-text("View members")',
        {timeout: 5000},
    ).catch(async () => {
      // Fallback for environments without :has-text support.
      return await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find((b) =>
          (b.textContent || '').trim() === 'View members') || null;
      });
    });

    const btnElement = membersButton.asElement ?
      membersButton.asElement() :
      membersButton;
    expect(btnElement).toBeTruthy();
    await btnElement.click();

    await page.waitForFunction(
        () => {
          const body = document.body.innerText || '';
          return body.includes('Members of Books Club');
        },
        {timeout: 5000},
    );

    const bodyText = await page.evaluate(() => document.body.innerText);
    expect(bodyText).toContain('Molly Member');
    expect(bodyText).toContain('Anna Admin');
  }, 20000);

  it('does not show a members list on the All posts view', async () => {
    await page.goto(BASE_URL, {waitUntil: 'networkidle0'});
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

    const hasMembersHeading = await page.evaluate(() => {
      const body = document.body.innerText || '';
      return body.includes('Members of');
    });
    expect(hasMembersHeading).toBe(false);
  }, 20000);
});

