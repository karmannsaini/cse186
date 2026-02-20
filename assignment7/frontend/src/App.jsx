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

import CssBaseline from '@mui/material/CssBaseline';
import List from './mailbox/List';

/**
 * Simple component with no state.
 * @returns {object} JSX
 */
function App() {
  return (
    <div>
      <CssBaseline />
      <List />
    </div>
  );
}

export default App;
