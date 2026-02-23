import React from 'react';
import {Box, Typography, Paper, Divider} from '@mui/material';
import {MailContext} from '../MailContext';

/**
 * Main pane component to display the contents of a selected email
 * @returns {object} JSX
 */
function MailViewer() {
  const {activeEmail} = React.useContext(MailContext);

  // Formats the date to match the wireframe (e.g., "June 21, 2026 at 14:30")
  const formatFullDate = (isoString) => {
    const date = new Date(isoString);
    if (isNaN(date)) return 'Unknown Date';

    const datePart = date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    const timePart = date.toLocaleTimeString('en-US', {
      hour12: false, hour: '2-digit', minute: '2-digit',
    });
    return `${datePart} at ${timePart}`;
  };

  // Defensive fallback just in case the component mounts before state is ready
  if (!activeEmail) {
    return (
      <Box display="flex"
        justifyContent="center" alignItems="center" height="100%" p={2}>
        <Typography variant="h6" color="text.secondary">
          Select an email to read
        </Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{p: 2, height: '100%', overflow: 'auto'}}>
      {/* Subject */}
      <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
        {activeEmail.subject}
      </Typography>

      {/* Sender and Date Row */}
      <Box display="flex"
        justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="subtitle1" component="span" fontWeight="bold">
            {(activeEmail.from && activeEmail.from.name) || 'Unknown Sender'}
          </Typography>
          <Typography
            variant="body2"
            component="span"
            color="text.secondary"
            sx={{ml: 1}}
          >
            {activeEmail.from &&
              activeEmail.from.address ? `<${activeEmail.from.address}>` : ''}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {formatFullDate(activeEmail.received)}
        </Typography>
      </Box>

      {/* A subtle divider before the main content */}
      <Divider sx={{mb: 3}} />

      {/* Email Content */}
      <Typography variant="body1" sx={{whiteSpace: 'pre-wrap'}}>
        {activeEmail.content}
      </Typography>
    </Paper>
  );
}

export default MailViewer;
