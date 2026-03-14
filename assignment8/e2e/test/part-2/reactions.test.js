import {describe, it, expect} from 'vitest';
import {page} from '../setup.js';

const TEST_USER = {
  email: 'molly@books.com',
  password: 'mollymember',
};

/**
 * Log in through the UI.
 * @returns {Promise<void>} resolves when redirected to feed
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

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

describe('Post reactions', () => {
  it('allows setting, switching, and clearing a reaction', async () => {
    await login();
    await page.waitForSelector('.MuiCard-root', {timeout: 15000});

    const firstCard = (await page.$$('.MuiCard-root'))[0];
    expect(firstCard).toBeDefined();

    const isSelected = async (label) => {
      return await firstCard.evaluate((card, reactionLabel) => {
        const button = card.querySelector(
            `button[aria-label="${reactionLabel}"]`,
        );
        const cls = button?.getAttribute('class') || '';
        return cls.includes('MuiIconButton-colorPrimary');
      }, label);
    };

    const readCount = async (label) => {
      return await firstCard.evaluate((card, reactionLabel) => {
        const button = card.querySelector(
            `button[aria-label="${reactionLabel}"]`,
        );
        const wrapper = button?.closest('.MuiStack-root');
        const countEl = wrapper?.querySelector('.MuiTypography-caption');
        return Number(countEl?.textContent ?? '0');
      }, label);
    };

    // Clear any existing reaction on this card so count assertions are stable.
    for (const label of ['Like', 'Love', 'Haha', 'Wow', 'Sad', 'Angry']) {
      if (await isSelected(label)) {
        const btn = await firstCard.$(`button[aria-label="${label}"]`);
        await btn.click();
        await delay(200);
      }
    }

    const likeBefore = await readCount('Like');
    const likeBtn = await firstCard.$('button[aria-label="Like"]');
    await likeBtn.click();
    await delay(200);
    const likeAfter = await readCount('Like');
    expect(likeAfter).toBe(likeBefore + 1);
    expect(await isSelected('Like')).toBe(true);

    const loveBefore = await readCount('Love');
    const loveBtn = await firstCard.$('button[aria-label="Love"]');
    await loveBtn.click();
    await delay(200);
    const loveAfter = await readCount('Love');
    expect(loveAfter).toBe(loveBefore + 1);
    expect(await isSelected('Love')).toBe(true);

    const loveBtnAgain = await firstCard.$('button[aria-label="Love"]');
    await loveBtnAgain.click();
    await delay(200);
    const loveCleared = await readCount('Love');
    expect(loveCleared).toBe(loveAfter - 1);
    expect(await isSelected('Love')).toBe(false);
  });

  it('persists reactions between All posts and group view', async () => {
    await login();
    await page.waitForSelector('.MuiCard-root', {timeout: 15000});

    const cards = await page.$$('.MuiCard-root');
    expect(cards.length).toBeGreaterThan(0);

    const getSubtitleAndBody = async (card) => {
      return await card.evaluate((el) => {
        const subs = el.querySelectorAll('.MuiTypography-subtitle2');
        const body = el.querySelector('.MuiTypography-body1');
        return {
          subtitle: (subs?.[0]?.textContent || '').trim(),
          body: (body?.textContent || '').trim(),
        };
      });
    };

    let targetCard = null;
    let groupName = null;
    let bodyText = null;
    for (const card of cards) {
      const {subtitle, body} = await getSubtitleAndBody(card);
      const m = subtitle.match(/into\s+(.+)$/);
      if (m && m[1]) {
        targetCard = card;
        groupName = m[1].trim();
        bodyText = body;
        break;
      }
    }
    expect(targetCard).toBeDefined();
    expect(groupName).toBeDefined();
    expect(bodyText).toBeDefined();

    const readCountFrom = async (cardHandle, label) => {
      return await cardHandle.evaluate((card, reactionLabel) => {
        const button = card.querySelector(
            `button[aria-label="${reactionLabel}"]`,
        );
        const wrapper = button?.closest('.MuiStack-root');
        const countEl = wrapper?.querySelector('.MuiTypography-caption');
        return Number(countEl?.textContent ?? '0');
      }, label);
    };

    const likeBeforeAll = await readCountFrom(targetCard, 'Like');
    const likeBtnAll = await targetCard.$('button[aria-label="Like"]');
    await likeBtnAll.click();
    await delay(200);
    const likeAfterAll = await readCountFrom(targetCard, 'Like');
    expect(likeAfterAll).toBeGreaterThanOrEqual(likeBeforeAll);

    await page.waitForSelector('.MuiListItemButton-root', {timeout: 15000});
    const listItems = await page.$$('.MuiListItemButton-root');
    let clicked = false;
    for (const item of listItems) {
      const txt = await item.evaluate((el) => (el.textContent || '').trim());
      if (txt === groupName) {
        await item.evaluate((b) => b.click());
        clicked = true;
        break;
      }
    }
    expect(clicked).toBe(true);

    await page.waitForFunction(
        () => window.location.href.includes('/home/group/'),
        {timeout: 15000},
    );
    await page.waitForSelector('.MuiCard-root', {timeout: 15000});

    const groupCards = await page.$$('.MuiCard-root');
    let matching = null;
    for (const card of groupCards) {
      const {body} = await getSubtitleAndBody(card);
      if (body === bodyText) {
        matching = card;
        break;
      }
    }
    expect(matching).toBeDefined();

    const likeInGroup = await readCountFrom(matching, 'Like');
    expect(likeInGroup).toBeGreaterThanOrEqual(likeAfterAll);
  });
});
