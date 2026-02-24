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

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {month: 'short', day: '2-digit'});
  };

  // Format the primary text based on mailbox
  const getPrimaryText = (email, currentMailbox) => {
    const fromName = email.from?.name || email.from || 'Unknown';
    const toName = email.to?.name || email.to || 'Unknown';

    if (currentMailbox === 'Sent') return toName;
    if (currentMailbox === 'Trash') return fromName + ' to ' + toName;
    return fromName; // Inbox default
  };

  // Format the aria-label safely keeping it under 80 chars
  const getDeleteLabel = (email, currentMailbox) => {
    const dateStr = formatDate(email.received || email.sent);

    if (currentMailbox === 'Sent') {
      const toName = email.to?.name || email.to || 'Unknown';
      return 'Delete mail to ' + toName + ' sent ' + dateStr;
    }

    const fromName = email.from?.name || email.from || 'Unknown';
    return 'Delete mail from ' + fromName + ' received ' + dateStr;
  };

  const handleDelete = async (e, emailObj) => {
    e.stopPropagation();

    const targetId = emailObj.id || emailObj.mail?.id || emailObj._id;

    try {
      const url = `http://localhost:3010/api/v0/mail/${targetId}?mailbox=trash`;
      await fetch(url, {method: 'PUT'});
      // Ensure the DB update finishes BEFORE removing from the UI!
      setEmails(emails.filter((item) => item !== emailObj));
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
          {emails.map((email) => (
            <ListItemButton
              key={email.id}
              divider
              onClick={() => setActiveEmail(email)}
            >
              <ListItemIcon>
                {mailbox !== 'Trash' && (
                  <IconButton
                    edge="start"
                    aria-label={getDeleteLabel(email, mailbox)}
                    onClick={(e) => handleDelete(e, email)}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </ListItemIcon>

              <ListItemText
                primary={getPrimaryText(email, mailbox)}
                secondary={email.subject}
              />

              <Typography variant="body2" color="text.secondary">
                {formatDate(email.received || email.sent)}
              </Typography>
            </ListItemButton>
          ))}
        </List>
      )}
    </Box>
  );
}

export default MailList;
