// Your vitest common setup functionaltiy goes in here
import {beforeAll, afterAll, beforeEach, afterEach} from 'vitest';
import puppeteer from 'puppeteer';
import path from 'path';
import express from 'express';
import http from 'http';

import 'dotenv/config';
import backend from '../../backend/src/app.js';

export let frontend;
export let browser;
export let page;

const UI_PORT = 3000;
const API_PORT = 3010;
export const BASE_URL = `http://localhost:${UI_PORT}`;

beforeAll(() => {
  backend.listen(API_PORT, () => {
    console.log(`Backend Running at http://localhost:${API_PORT}`);
  });

  frontend = http.createServer(
      express()
          .use('/assets', express.static(
              path.join(__dirname, '..', '..', 'frontend', 'dist', 'assets')))
          .get('/', function(req, res) {
            res.sendFile('index.html', {
              root: path.join(__dirname, '..', '..', 'frontend', 'dist'),
            });
          }),
  );

  frontend.listen(UI_PORT, () => {
    console.log(`Frontend Running at ${BASE_URL}`);
  });
});

afterAll(async () => {
  backend.close();
  await frontend.close();
  setImmediate(() => {
    frontend.emit('close');
  });
});

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  page = await browser.newPage();
  await page.goto(BASE_URL);
});

afterEach(async () => {
  const childProcess = browser && browser.process && browser.process();
  if (childProcess) {
    await childProcess.kill(9);
  }
});

export const clickOn = async (p, selector) => {
  const clickable = await p.waitForSelector(selector);
  await clickable.click();
  clickable.dispose();
};
