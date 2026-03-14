import {beforeAll, afterAll, beforeEach, afterEach} from 'vitest';
import puppeteer from 'puppeteer';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import express from 'express';
import http from 'node:http';

import 'dotenv/config';
import backend from '../../backend/src/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distRoot = path.join(__dirname, '..', '..', 'frontend', 'dist');

export let frontend;
export let browser;
export let page;

const UI_PORT = 3000;
const API_PORT = 3010;
export const BASE_URL = `http://localhost:${UI_PORT}`;

/**
 * Start a server listening on the given port.
 * @param {object} server http/server
 * @param {number} port port number
 * @returns {Promise<void>} resolves when listening
 */
function listen(server, port) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, () => resolve());
  });
}

/**
 * Close an http server.
 * @param {object|undefined} server node server
 * @returns {Promise<void>} closes when server is stopped
 */
function close(server) {
  return new Promise((resolve) => {
    if (!server) {
      resolve();
      return;
    }
    server.close(() => resolve());
  });
}

/**
 * Start backend and static frontend servers.
 * @returns {Promise<void>} resolves when both servers are listening
 */
beforeAll(async () => {
  const frontendApp = express();
  frontendApp.use(express.static(distRoot));
  frontendApp.use((_req, res) => {
    res.sendFile(path.join(distRoot, 'index.html'));
  });
  frontend = http.createServer(frontendApp);

  await Promise.all([
    listen(backend, API_PORT),
    listen(frontend, UI_PORT),
  ]);
});

afterAll(async () => {
  await Promise.all([
    close(backend),
    close(frontend),
  ]);
});

/** Timeout (ms) for selectors and navigation; increase on slower devices. */
const DEFAULT_TIMEOUT_MS = 15000;

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  page = await browser.newPage();
  await page.setViewport({width: 1280, height: 800});
  page.setDefaultTimeout(DEFAULT_TIMEOUT_MS);
  await page.goto(BASE_URL);
});

afterEach(async () => {
  if (browser) {
    await browser.close();
  }
});

export const DEFAULT_TIMEOUT = DEFAULT_TIMEOUT_MS;

export const clickOn = async (p, selector) => {
  const clickable = await p.waitForSelector(selector);
  await clickable.click();
  clickable.dispose();
};
