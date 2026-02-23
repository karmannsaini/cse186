import {createContext, useState, useEffect, useMemo} from 'react';
import PropTypes from 'prop-types';

export const MailContext = createContext();

/**
 * @param {object} props The properties passed to the component
 * @param {object} props.children The child components to render
 * @returns {object} JSX for the provider
 */
export const MailProvider = ({children}) => {
  const [mailboxes, setMailboxes] = useState([]);
  const [mailbox, setMailbox] = useState('Inbox');
  const [emails, setEmails] = useState([]);
  const [activeEmail, setActiveEmail] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3010/api/v0/mailbox')
        .then((res) => {
          if (!res.ok) {
            throw new Error();
          }
          return res.json();
        })
        .then(setMailboxes)
        .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`http://localhost:3010/api/v0/mail?mailbox=${mailbox}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error();
          }
          return res.json();
        })
        .then(setEmails)
        .catch(() => {});
  }, [mailbox]);

  const selectEmail = async (email) => {
    try {
      const res = await fetch(`http://localhost:3010/api/v0/mail/${email.id}`);
      if (!res.ok) {
        throw new Error();
      }
      const full = await res.json();
      setActiveEmail(full);
    } catch {
      setActiveEmail(email);
    }
  };

  const value = useMemo(() => ({
    mailboxes,
    mailbox,
    setMailbox,
    emails,
    setEmails,
    activeEmail,
    setActiveEmail: selectEmail,
  }), [mailboxes, mailbox, emails, activeEmail]);

  return (
    <MailContext.Provider value={value}>
      {children}
    </MailContext.Provider>
  );
};

MailProvider.propTypes = {
  children: PropTypes.node,
};
