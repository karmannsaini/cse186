/*
#######################################################################
#
# Copyright (C) 2020-2026  David C. Harrison. All right reserved.
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
      'Nov 14');
});

test('Seventh Sent Mail', async () => {
  await clickOn(page, '::-p-text(Sent)');
  await mailExistsIn(page,
      'Wiatt Abson',
      'Intuitive executive help-desk',
      'Oct 21');
});

test('Third Trash Mail', async () => {
  await clickOn(page, '::-p-text(Trash)');
  await mailExistsIn(page,
      'Duke Wingeat to CSE186 Student',
      'Profound 4th generation framework',
      'Nov 06');
});

test('Delete Third Inbox Mail', async () => {
  await mailExistsIn(page,
      'Lishe Splevins',
      'Organic actuating solution',
      'Nov 06');
  await clickOn(page,
      '::-p-aria(Delete mail from Lishe Splevins received Nov 06)');
  await clickOn(page, '::-p-text(Trash)');
  await altMailExistsIn(page,
      'Lishe Splevins to CSE186 Student',
      'Lishe Splevins',
      'Organic actuating solution',
      'Nov 06');
});

test('Delete Third Sent Mail', async () => {
  await clickOn(page, '::-p-text(Sent)');
  await mailExistsIn(page,
      'Antoine Pennycord',
      'Compatible uniform algorithm',
      'Nov 09');
  await clickOn(page,
      '::-p-aria(Delete mail to Antoine Pennycord sent Nov 09)');
  await clickOn(page, '::-p-text(Trash)');
  await mailExistsIn(page,
      'CSE186 Student to Antoine Pennycord',
      'Compatible uniform algorithm',
      'Nov 09');
});
