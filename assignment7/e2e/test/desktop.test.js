/*
#######################################################################
#
# Copyright (C) 2020-2025 David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/
/*
#######################################################################
#######               DO NOT MODIFY THIS FILE               ###########
#######################################################################
*/

import {test, expect} from 'vitest';

import {page, clickOn, mailExistsIn, altMailExistsIn} from './setup';

test('Initial View', async () => {
  const label = await page.waitForSelector(
      '::-p-text(CSE186 Full Stack Mail - Inbox)');
  expect(label).not.toBeNull();
  label.dispose();
});

test('Trash Selection', async () => {
  await clickOn(page, '::-p-text(Trash)');
  const label = await page.waitForSelector(
      '::-p-text(CSE186 Full Stack Mail - Trash)');
  expect(label).not.toBeNull();
  label.dispose();
});

test('Sent Selection', async () => {
  await clickOn(page, '::-p-text(Sent)');
  const label = await page.waitForSelector(
      '::-p-text(CSE186 Full Stack Mail - Sent)');
  expect(label).not.toBeNull();
  label.dispose();
});

test('First Inbox Mail', async () => {
  await mailExistsIn(page,
      'Skipp Heald',
      'Switchable bottom-line infrastructure',
      '2024');
});

test('Seventh Sent Mail', async () => {
  await clickOn(page, '::-p-text(Sent)');
  await mailExistsIn(page,
      'Wiatt Abson',
      'Intuitive executive help-desk',
      '2024');
});

test('Third Trash Mail', async () => {
  await clickOn(page, '::-p-text(Trash)');
  await mailExistsIn(page,
      'Delcina Got to CSE186 Student',
      'Down-sized actuating focus group',
      'Nov 02');
});

test('Delete Third Inbox Mail', async () => {
  await mailExistsIn(page,
      'Lishe Splevins',
      'Organic actuating solution',
      '2024');
  await clickOn(page,
      '::-p-aria(Delete mail from Lishe Splevins received 2024)');
  await clickOn(page, '::-p-text(Trash)');
  // await mailExistsIn(page,
  //     'Lishe Splevins to CSE186 Student',
  //     'Organic actuating solution',
  //     '2024');
  await altMailExistsIn(page,
      'Lishe Splevins to CSE186 Student',
      'Lishe Splevins',
      'Organic actuating solution',
      '2024');
});

test('Delete Third Sent Mail', async () => {
  await clickOn(page, '::-p-text(Sent)');
  await mailExistsIn(page,
      'Antoine Pennycord',
      'Compatible uniform algorithm',
      '2024');
  await clickOn(page,
      '::-p-aria(Delete mail to Antoine Pennycord sent 2024)');
  await clickOn(page, '::-p-text(Trash)');
  await mailExistsIn(page,
      'CSE186 Student to Antoine Pennycord',
      'Compatible uniform algorithm',
      '2024');
});
