import {describe, it, expect, beforeAll, afterAll} from 'vitest';
import puppeteer from 'puppeteer';
import supertest from 'supertest';
import express from 'express';

const FRONTEND_PORT = 4173;
const BACKEND_PORT = 3010;

describe('Authentication end-to-end', () => {
  /** @type {import('puppeteer').Browser} */
  let browser;

  /** @type {import('http').Server} */
  let previewServer;

  beforeAll(async () => {
    // Backend is started by the npm scripts in this project (docker + backend).
    // Here we just start a simple proxy to the built frontend on port 4173,
    // mirroring the dev experience for puppeteer.
    const app = express();
    app.use(express.static('../frontend/dist'));
    previewServer = app.listen(FRONTEND_PORT);

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // Sanity check that backend is up
    await supertest(`http://localhost:${BACKEND_PORT}`)
        .get('/api/v0/docs/')
        .expect(200);
  }, 20000);

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
    if (previewServer) {
      previewServer.close();
    }
  });

  it('logs in molly and shows the home page', async () => {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${FRONTEND_PORT}/`, {
      waitUntil: 'networkidle0',
    });

    await page.type('input[autocomplete="email"]', 'molly@books.com');
    await page.type('input[autocomplete="current-password"]', 'mollymember');

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({waitUntil: 'networkidle0'}),
    ]);

    const content = await page.content();
    expect(content).toContain('Welcome to your feed');
  }, 20000);

  it('shows seeded posts in the home feed after login', async () => {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${FRONTEND_PORT}/`, {
      waitUntil: 'networkidle0',
    });

    await page.type('input[autocomplete="email"]', 'molly@books.com');
    await page.type('input[autocomplete="current-password"]', 'mollymember');

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({waitUntil: 'networkidle0'}),
    ]);

    const content = await page.content();
    expect(content).toContain('Molly first post');
    expect(content).toContain('Anna admin update');
  }, 20000);

  it('selecting a group filters posts to that group', async () => {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${FRONTEND_PORT}/`, {
      waitUntil: 'networkidle0',
    });

    await page.type('input[autocomplete="email"]', 'molly@books.com');
    await page.type('input[autocomplete="current-password"]', 'mollymember');

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({waitUntil: 'networkidle0'}),
    ]);

    await page.waitForFunction(
        () => document.body.innerText.includes('All posts'),
        {timeout: 5000},
    );
    const booksClubButtons = await page.$x(
        "//div[@role='button'][.//span[contains(., 'Books Club')]]",
    );
    expect(booksClubButtons.length).toBeGreaterThanOrEqual(1);
    await booksClubButtons[0].click();

    await page.waitForNavigation({waitUntil: 'networkidle0'}).catch(() => {});

    const url = page.url();
    expect(url).toContain('/home/group/1');

    const content = await page.content();
    expect(content).toContain('Books Club');
  }, 20000);
});

