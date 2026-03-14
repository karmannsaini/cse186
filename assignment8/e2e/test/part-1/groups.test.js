import {describe, it, expect, beforeEach} from 'vitest';
import {page, BASE_URL} from '../setup.js';

const TEST_USER = {
  email: 'molly@books.com',
  password: 'mollymember',
};

/** Books Club group UUID from backend seed (molly is a member). */
const BOOKS_CLUB_GROUP_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';

describe('Groups and Deep Linking', () => {
  beforeEach(async () => {
    await page.setViewport({width: 1280, height: 800});

    await page.waitForSelector('input[autocomplete="email"]');
    await page.type('input[autocomplete="email"]', TEST_USER.email);
    await page.type('input[autocomplete="current-password"]',
        TEST_USER.password);

    await Promise.all([
      page.waitForNavigation({waitUntil: 'networkidle0'}),
      page.click('button[type="submit"]'),
    ]);
  });

  it('displays a list of groups the user belongs to', async () => {
    await page.waitForSelector('::-p-text(Welcome to your feed)');
    await page.waitForSelector('.MuiListItemButton-root', {timeout: 15000});

    const listItems = await page.$$('.MuiListItemButton-root');
    expect(listItems.length).toBeGreaterThan(3);
  });

  it('displays Books Club in the group list', async () => {
    await page.waitForSelector('::-p-text(Welcome to your feed)');
    const bodyText = await page.evaluate(() => document.body.innerText);
    expect(bodyText).toContain('Books Club');
  });

  it('filters posts and deep links the URL on select', async () => {
    await page.waitForSelector('::-p-text(Welcome to your feed)');
    await page.waitForSelector('.MuiListItemButton-root', {timeout: 15000});

    const listItems = await page.$$('.MuiListItemButton-root');
    const firstGroupBtn = listItems[1];
    const groupName = await firstGroupBtn.evaluate((el) => el.textContent);

    await firstGroupBtn.evaluate((b) => b.click());

    await page.waitForFunction(
        () => window.location.href.includes('/home/group/'),
        {timeout: 15000},
    );
    expect(page.url()).toContain('/home/group/');

    await page.waitForFunction(
        (name) => {
          const h5 = document.querySelector('h5');
          return h5 && h5.textContent === name;
        },
        {timeout: 15000},
        groupName,
    );

    await page.waitForSelector('.MuiCard-root', {timeout: 15000});
    const posts = await page.$$('.MuiCard-root');
    expect(posts.length).toBeGreaterThan(0);
  });

  it('direct navigation to group URL shows that group (deep linking)',
      async () => {
        await page.waitForSelector('::-p-text(Welcome to your feed)');
        await page.goto(
            `${BASE_URL}/home/group/${BOOKS_CLUB_GROUP_ID}`,
            {waitUntil: 'networkidle0'},
        );

        await page.waitForFunction(
            () => document.body.innerText.includes('Books Club'),
            {timeout: 15000},
        );
        const bodyText = await page.evaluate(() => document.body.innerText);
        expect(bodyText).toContain('Books Club');
        expect(page.url()).toContain(`/home/group/${BOOKS_CLUB_GROUP_ID}`);
      });

  it('navigating to All posts returns to main feed and updates URL',
      async () => {
        await page.waitForSelector('::-p-text(Welcome to your feed)');
        await page.waitForSelector('.MuiListItemButton-root', {timeout: 15000});

        const listItems = await page.$$('.MuiListItemButton-root');
        await listItems[1].evaluate((b) => b.click());
        await page.waitForFunction(
            () => window.location.href.includes('/home/group/'),
            {timeout: 15000},
        );

        const listButtons = await page.$$('.MuiListItemButton-root');
        const visibleAllPosts = await page.evaluate(() => {
          const btns = document.querySelectorAll('.MuiListItemButton-root');
          return Array.from(btns).findIndex((el) =>
            el.textContent.trim() === 'All posts' && el.offsetParent !== null);
        });
        const idx = visibleAllPosts >= 0 ? visibleAllPosts : 0;
        await listButtons[idx].evaluate((el) => el.click());

        await page.waitForFunction(
            () => {
              const u = window.location.pathname;
              return u === '/home' || u === '/home/';
            },
            {timeout: 15000},
        );
        const bodyText = await page.evaluate(() => document.body.innerText);
        expect(bodyText).toContain('Welcome to your feed');
      });
});
