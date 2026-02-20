import {createContext, useState} from 'react';
import PropTypes from 'prop-types';

export const MailboxContext = createContext();

export const MailboxProvider = ({children}) => {
  const [mailboxes, setMailboxes] = useState([]);
  const [currentMailbox, setCurrentMailbox] = useState('Inbox');

  return (
    <MailboxContext.Provider value={{mailboxes,
      setMailboxes, currentMailbox, setCurrentMailbox}}>
      {children}
    </MailboxContext.Provider>
  );
};

MailboxProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
