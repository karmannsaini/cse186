import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import {MailContext} from '../MailContext';
import MailViewer from '../mailbox/MailViewer';

describe('MailViewer Component TDD', () => {
  const mockEmail = {
    id: '123',
    subject: 'Test Subject',
    from: {name: 'Sender', address: 'sender@test.com'},
    to: {name: 'Me', address: 'me@test.com'},
    received: '2026-02-23T00:00:00Z',
    content: 'Test Content',
  };

  it('Displays the subject of the active email', () => {
    render(
        <MailContext.Provider value={{activeEmail: mockEmail}}>
          <MailViewer />
        </MailContext.Provider>,
    );
    expect(screen.getByText('Test Subject')).toBeInTheDocument();
  });

  it('Displays the full content of the email', () => {
    render(
        <MailContext.Provider value={{activeEmail: mockEmail}}>
          <MailViewer />
        </MailContext.Provider>,
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('Shows nothing if no email is active', () => {
    render(
        <MailContext.Provider value={{activeEmail: null}}>
          <MailViewer />
        </MailContext.Provider>,
    );
    // Updated to match the Advanced UI design
    expect(screen.getByText('Select an email to read')).toBeInTheDocument();
  });

  it('Displays fallback text when sender data is completely missing', () => {
    const brokenEmail = {
      id: '999',
      subject: 'No Sender',
      from: {}, // Empty from object!
      received: '2026-02-23T00:00:00Z',
    };
    render(
        <MailContext.Provider value={{activeEmail: brokenEmail}}>
          <MailViewer />
        </MailContext.Provider>,
    );

    expect(screen.getByText('Unknown Sender')).toBeInTheDocument();
  });
});
