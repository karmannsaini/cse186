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

import {test} from 'vitest';

import {browser, page, clickOn, mailExistsIn} from './setup';

test('Websocket Updates', async () => {
  const tab = await browser.newPage();
  await tab.goto('http://localhost:3000');
  await clickOn(tab, '::-p-text(Trash)');
  const pages = await browser.pages();
  await pages[1].bringToFront();
  await mailExistsIn(page,
      'Judon Cromar',
      'Organized dynamic array',
      '2024');
  await clickOn(page,
      '::-p-aria(Delete mail from Judon Cromar received 2024)');
  await pages[2].bringToFront();
  await mailExistsIn(tab,
      'Judon Cromar to CSE186 Student',
      'Organized dynamic array',
      '2024');
});
