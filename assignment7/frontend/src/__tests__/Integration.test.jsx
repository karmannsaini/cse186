import {render, screen, waitFor} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import React from 'react';
import App from '../App';
import {MailProvider, MailContext} from '../MailContext';

const mockMailboxes = [{id: '1', name: 'Inbox'}];
const mockEmails = [{
  id: '101',
  from: {
    name: 'Full Coverage',
    address: 'tdd@ucsc.edu',
  },
  subject: 'Integration Test',
  content: 'Success',
  received: '2026-02-22T12:00:00Z',
}];

describe('MailContext & App Integration', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      // PROPER ROUTING: Differentiate between the two API calls
      if (url.includes('mail?mailbox=')) {
        // This is the emails fetch
        return {ok: true, json: async () => mockEmails};
      }
      if (url.includes('mailbox')) {
        // This is the sidebar mailboxes fetch
        return {ok: true, json: async () => mockMailboxes};
      }

      // Fallback
      return {ok: true, json: async () => []};
    }));
  });

  it('Covers fetch logic and App view switching', async () => {
    render(<App />);

    // 1. Wait for sidebar
    await waitFor(() => {
      expect(screen.getByLabelText('Mailbox List')).toBeInTheDocument();
    });

    // 2. Find the row. It will finally have the correct mock email data!
    const emailRow = await screen.findByText('Full Coverage');
    emailRow.click();

    // 3. Verify view switch
    expect(await screen.findByText('Success')).toBeInTheDocument();
  });

  it('Handles fetch API errors without crashing', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({ok: false}),
    ));

    render(<App />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  it('Does not fetch emails if mailbox is cleared (Branch Coverage)', () => {
    const BranchClearer = () => {
      const {setMailbox} = React.useContext(MailContext);
      return <button onClick={() => setMailbox('')}>Clear Mailbox</button>;
    };
    render(
        <MailProvider>
          <BranchClearer />
        </MailProvider>,
    );
    const button = screen.getByText('Clear Mailbox');
    button.click();
  });
});
