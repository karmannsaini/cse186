import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {MailContext} from '../MailContext';
import MailList from '../mailbox/MailList';

/**
 * Mock data for testing the email list
 */
const mockEmails = [
  {
    id: '123',
    from: {name: 'Grader', address: 'grader@ucsc.edu'},
    subject: 'Perfect Score',
    received: '2026-02-21T10:00:00Z',
  },
];

/**
 * Helper to render MailList with custom context values
 * @param {string} mailbox name
 * @param {Array} emails list
 */
const renderWithContext = (mailbox, emails) => {
  render(
      <MailContext.Provider value={{mailbox, emails}}>
        <MailList />
      </MailContext.Provider>,
  );
};

describe('MailList Component TDD', () => {
  it('Displays the current mailbox name', () => {
    renderWithContext('Inbox', []);
    expect(screen.getByText('Inbox')).toBeInTheDocument();
  });

  it('Displays the sender name of an email', () => {
    renderWithContext('Inbox', mockEmails);
    expect(screen.getByText('Grader')).toBeInTheDocument();
  });

  it('Displays the subject of an email', () => {
    renderWithContext('Inbox', mockEmails);
    expect(screen.getByText('Perfect Score')).toBeInTheDocument();
  });

  it('Displays a "No emails" message when the list is empty', () => {
    renderWithContext('Inbox', []);
    expect(screen.getByText(/No emails/i)).toBeInTheDocument();
  });
});

it('Calls setActiveEmail when an email row is clicked', () => {
  const setActiveEmail = vi.fn();
  render(
      <MailContext.Provider value={{
        mailbox: 'Inbox',
        emails: mockEmails,
        setActiveEmail,
      }}>
        <MailList />
      </MailContext.Provider>,
  );

  // Click the row containing the subject 'Perfect Score'
  const row = screen.getByText('Perfect Score').closest('tr');
  row.click();

  expect(setActiveEmail).toHaveBeenCalledWith(mockEmails[0]);
});

it('Displays "Unknown" if sender data is missing', () => {
  const badEmailData = {
    id: '999',
    subject: 'Missing Sender',
    received: '2026-02-22T12:00:00Z',
    // Notice 'from' is entirely missing here
  };

  render(
      <MailContext.Provider value={{
        mailbox: 'Inbox',
        emails: [badEmailData],
        setActiveEmail: vi.fn(),
      }}>
        <MailList />
      </MailContext.Provider>,
  );

  expect(screen.getByText('Unknown')).toBeInTheDocument();
});
