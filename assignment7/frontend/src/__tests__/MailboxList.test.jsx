import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
// import React from 'react';
import {MailContext} from '../MailContext';
import MailboxList from '../mailbox/List';

describe('MailboxList Component', () => {
  it('Displays correct Mailbox list', () => {
    const mockContext = {
      mailboxes: [{id: '1', name: 'Inbox'}, {id: '2', name: 'Sent'}],
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
      mailboxes: [{id: '1', name: 'Inbox'}, {id: '2', name: 'Sent'}],
      mailbox: 'Inbox',
      setMailbox: setMailboxMock,
    };

    render(
        <MailContext.Provider value={mockContext}>
          <MailboxList />
        </MailContext.Provider>,
    );

    // Click the "Sent" folder
    const sentButton = screen.getByText('Sent');
    sentButton.click();

    // Verify the state updater was called
    expect(setMailboxMock).toHaveBeenCalledWith('Sent');
  });
});
