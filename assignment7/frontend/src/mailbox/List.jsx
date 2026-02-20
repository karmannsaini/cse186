import {useState, useEffect} from 'react';
import {List as MuiList} from '@mui/material';
import ListItem from './ListItem';

const List = () => {
  // Adding default values so MUI elements exist before the fetch completes
  const [mailboxes, setMailboxes] = useState(['Inbox', 'Sent', 'Trash']);

  useEffect(() => {
    fetch('http://localhost:3010/api/v0/mailbox')
        .then((response) => response.json())
        .then((data) => setMailboxes(data))
        .catch(() => {});
  }, []);

  return (
    <MuiList aria-label="Mailbox List">
      {mailboxes.map((name) => (
        <ListItem key={name} name={name} />
      ))}
    </MuiList>
  );
};

export default List;
