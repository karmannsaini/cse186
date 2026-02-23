import {useContext} from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import {MailContext} from '../MailContext';

/**
 * Main pane component to display a list of emails.
 * @returns {object} JSX
 */
function MailList() {
  const {
    emails,
    setEmails,
    setActiveEmail,
    mailbox,
  } = useContext(MailContext);

  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return 'Unknown';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
    });
  };

  const handleDelete = async (e, emailObj) => {
    e.stopPropagation();

    console.log('Email Object:', emailObj);

    setEmails(emails.filter((item) => item !== emailObj));

    const targetId = emailObj.id || emailObj.mail?.id || emailObj._id;

    try {
      const url = `http://localhost:3010/api/v0/mail/${targetId}?mailbox=trash`;
      await fetch(url, {method: 'PUT'});
    } catch (err) {
      console.error('Failed to move email to trash', err);
    }
  };

  return (
    <Box>
      {emails.length === 0 ? (
        <Box sx={{p: 4, textAlign: 'center'}}>
          <Typography>No emails in this folder.</Typography>
        </Box>
      ) : (
        <List sx={{width: '100%', bgcolor: 'background.paper', p: 0}}>
          {emails.map((email) => {
            const fromName = (email.from && email.from.name) || 'Unknown';
            const dateStr = formatShortDate(email.received);
            const ariaLabel = `Delete mail from ${fromName} ` +
                              `received ${dateStr}`;

            return (
              <ListItemButton
                key={email.id}
                onClick={() => setActiveEmail(email)}
                divider
                sx={{py: 1.5}}
              >
                {mailbox.toLowerCase() !== 'trash' && (
                  <ListItemIcon sx={{minWidth: 40}}>
                    <IconButton
                      edge="start"
                      aria-label={ariaLabel}
                      onClick={(e) => handleDelete(e, email)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemIcon>
                )}

                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{fontWeight: 500}}>
                      {fromName}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {email.subject}
                    </Typography>
                  }
                  sx={{m: 0}}
                />
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{ml: 2, minWidth: '60px', textAlign: 'right'}}
                >
                  {dateStr}
                </Typography>
              </ListItemButton>
            );
          })}
        </List>
      )}
    </Box>
  );
}

export default MailList;
