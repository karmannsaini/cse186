import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {MailContext} from '../MailContext';
import MailboxList from '../mailbox/List';

describe('MailboxList Component', () => {
  it('Displays correct Mailbox list', () => {
    const mockContext = {
      mailboxes: ['Inbox', 'Sent'],
      mailbox: 'Inbox',
      setMailbox: vi.fn(),
    };

    render(
        <MailContext.Provider value={mockContext}>
          <MailboxList />
        </MailContext.Provider>,
    );
    expect(screen.getByLabelText('Mailbox List')).toBeInTheDocument();
    expect(screen.getByText('Inbox')).toBeInTheDocument();
    expect(screen.getByText('Sent')).toBeInTheDocument();
  });

  it('Calls setMailbox when a mailbox is clicked', () => {
    const setMailboxMock = vi.fn();
    const mockContext = {
      mailboxes: ['Inbox', 'Sent'],
      mailbox: 'Inbox',
      setMailbox: setMailboxMock,
    };

    render(
        <MailContext.Provider value={mockContext}>
          <MailboxList />
        </MailContext.Provider>,
    );

    const sentButton = screen.getByText('Sent');
    sentButton.click();

    expect(setMailboxMock).toHaveBeenCalledWith('Sent');
  });

  it('Renders the correct icons for Trash and custom folders', () => {
    const mockContext = {
      mailboxes: ['Trash', 'CustomFolder'],
      mailbox: 'Inbox',
      setMailbox: vi.fn(),
    };

    render(
        <MailContext.Provider value={mockContext}>
          <MailboxList />
        </MailContext.Provider>,
    );

    expect(screen.getByText('Trash')).toBeInTheDocument();
    expect(screen.getByText('CustomFolder')).toBeInTheDocument();
  });

  it('Handles legacy object-based mailboxes and missing names', () => {
    const mockContext = {
      mailboxes: [{name: 'Inbox'}, {}],
      mailbox: 'Inbox',
      setMailbox: vi.fn(),
    };

    render(
        <MailContext.Provider value={mockContext}>
          <MailboxList />
        </MailContext.Provider>,
    );
    expect(screen.getByText('Inbox')).toBeInTheDocument();
  });
});
