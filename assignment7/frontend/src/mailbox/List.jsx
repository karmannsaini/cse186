import {useContext} from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import {MailContext} from '../MailContext';

/**
 * Renders the sidebar list of mailboxes.
 * @returns {object} JSX
 */
function MailboxList() {
  // 1. We pull setActiveEmail out of the context here
  const
    {mailboxes, mailbox, setMailbox, setActiveEmail} = useContext(MailContext);

  const getIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName === 'inbox') return <MailOutlineIcon />;
    if (lowerName === 'sent') return <SendIcon />;
    if (lowerName === 'trash') return <DeleteIcon />;
    return <MailOutlineIcon />;
  };

  return (
    <List sx={{pt: 0}}>
      {mailboxes.map((boxName) => (
        <ListItemButton
          key={boxName}
          selected={mailbox === boxName}
          onClick={() => {
            setMailbox(boxName);
            if (setActiveEmail) setActiveEmail(null);
          }}
        >
          <ListItemIcon>{getIcon(boxName)}</ListItemIcon>
          <ListItemText primary={boxName} />
        </ListItemButton>
      ))}
    </List>
  );
}

export default MailboxList;
