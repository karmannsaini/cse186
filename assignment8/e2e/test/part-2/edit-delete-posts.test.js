import {describe, it, expect} from 'vitest';
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
  await Promise.all([
    page.waitForNavigation({waitUntil: 'networkidle0'}),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForSelector('::-p-text(Welcome to your feed)');
}

/**
 * Find the first card that shows edit/delete controls for the logged-in user.
 * This corresponds to posts authored by the current user (Molly).
 * @returns {Promise<import('puppeteer').ElementHandle<Element>>} card handle
 */
async function findOwnPostCard() {
  await page.waitForSelector('.MuiCard-root', {timeout: 15000});
  const cards = await page.$$('.MuiCard-root');
  expect(cards.length).toBeGreaterThan(0);

  for (const card of cards) {
    const hasEditControls = await card.evaluate((el) => !!el.querySelector(
        'button[aria-label="Edit post"]',
    ));
    if (hasEditControls) return card;
  }

  throw new Error('No editable post card found for current user');
}

describe('Edit and delete posts', () => {
  it('allows author to edit a post inline and persist changes', async () => {
    await login();
    const card = await findOwnPostCard();

    // Capture original body text so we can assert it changes.
    const originalBody = await card.evaluate((el) => {
      const body = el.querySelector('.MuiTypography-body1');
      return (body?.textContent || '').trim();
    });
    expect(originalBody.length).toBeGreaterThan(0);

    // Click Edit, change text, Save.
    const editBtn = await card.$('button[aria-label="Edit post"]');
    expect(editBtn).toBeTruthy();
    await editBtn.click();

    await card.waitForSelector('textarea');
    const textarea = await card.$('textarea');
    expect(textarea).toBeTruthy();
    await textarea.click({clickCount: 3});
    await textarea.type('Edited in E2E');

    const saveHandle = await card.evaluateHandle((el) => {
      const buttons = Array.from(el.querySelectorAll('button'));
      return buttons.find((b) =>
        (b.textContent || '').trim().toLowerCase() === 'save') || null;
    });
    const saveBtn = saveHandle.asElement();
    expect(saveBtn).toBeTruthy();
    await saveBtn.click();

    const cardHandle = await card.evaluateHandle((el) => el);
    await page.waitForFunction(
        (el) => {
          const body = el.querySelector('.MuiTypography-body1');
          return (body?.textContent || '').includes('Edited in E2E');
        },
        {timeout: 15000},
        cardHandle,
    );

    const updatedBody = await card.evaluate((el) => {
      const body = el.querySelector('.MuiTypography-body1');
      return (body?.textContent || '').trim();
    });
    expect(updatedBody).toContain('Edited in E2E');
  });

  it('lets author cancel an edit and keep original content', async () => {
    await login();
    const card = await findOwnPostCard();

    const originalBody = await card.evaluate((el) => {
      const body = el.querySelector('.MuiTypography-body1');
      return (body?.textContent || '').trim();
    });

    const editBtn = await card.$('button[aria-label="Edit post"]');
    await editBtn.click();

    await page.waitForSelector('textarea');
    const textarea = await page.$('textarea');
    await textarea.click({clickCount: 3});
    await textarea.type('This should not persist');

    const cancelHandle = await card.evaluateHandle((el) => {
      const buttons = Array.from(el.querySelectorAll('button'));
      return buttons.find((b) => (b.textContent || '').trim() === 'Cancel') ||
        null;
    });
    const cancelBtn = cancelHandle.asElement();
    expect(cancelBtn).toBeTruthy();
    await cancelBtn.click();

    const bodyAfterCancel = await card.evaluate((el) => {
      const body = el.querySelector('.MuiTypography-body1');
      return (body?.textContent || '').trim();
    });
    expect(bodyAfterCancel).toBe(originalBody);
  });

  it(
      'allows author to delete a post and removes it from the feed',
      async () => {
        await login();
        const card = await findOwnPostCard();

        const bodyText = await card.evaluate((el) => {
          const body = el.querySelector('.MuiTypography-body1');
          return (body?.textContent || '').trim();
        });
        expect(bodyText.length).toBeGreaterThan(0);

        const deleteBtn = await card.$('button[aria-label="Delete post"]');
        expect(deleteBtn).toBeTruthy();
        await deleteBtn.click();

        // Wait for the card with that body text to disappear from the DOM.
        await page.waitForFunction(
            (text) => {
              const cards = document.querySelectorAll('.MuiCard-root');
              return !Array.from(cards).some((cardEl) => {
                const body = cardEl.querySelector('.MuiTypography-body1');
                return (body?.textContent || '').trim() === text;
              });
            },
            {timeout: 15000},
            bodyText,
        );
      },
  );
});

