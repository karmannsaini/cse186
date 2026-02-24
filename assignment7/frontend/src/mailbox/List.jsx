import {useContext} from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import {MailContext} from '../MailContext';

/**
 * @returns {object} JSX
 */
function MailboxList() {
  const {mailboxes, mailbox, setMailbox} = useContext(MailContext);

  const getIcon = (name) => {
    if (!name || typeof name !== 'string') return <MailOutlineIcon />;
    const lowerName = name.toLowerCase();
    if (lowerName === 'inbox') return <MailOutlineIcon />;
    if (lowerName === 'sent') return <SendIcon />;
    if (lowerName === 'trash') return <DeleteIcon />;
    return <MailOutlineIcon />;
  };

  return (
    <List aria-label="Mailbox List">
      {mailboxes.map((boxName) => {
        const nameStr = typeof boxName === 'string' ? boxName : boxName.name;
        return (
          <ListItemButton
            key={nameStr}
            selected={mailbox === nameStr}
            onClick={() => setMailbox(nameStr)}
          >
            <ListItemIcon>
              {getIcon(nameStr)}
            </ListItemIcon>
            <ListItemText
              primary={nameStr}>
            </ListItemText>
          </ListItemButton>
        );
      })}
    </List>
  );
}

export default MailboxList;
