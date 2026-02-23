import {render, screen, waitFor} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {MailContext} from '../MailContext';
import MailList from '../mailbox/MailList';

describe('MailList Component TDD', () => {
  const mockEmails = [
    {
      id: '1',
      subject: 'Perfect Score',
      from: {name: 'Prof', address: 'prof@ucsc.edu'},
      received: '2026-02-23T00:00:00Z',
    },
  ];

  const renderWithContext = (mailbox, emails, setActiveEmail = vi.fn()) => {
    return render(
        <MailContext.Provider value={{
          emails,
          mailbox,
          setActiveEmail,
          setEmails: vi.fn(),
        }}>
          <MailList />
        </MailContext.Provider>,
    );
  };

  it('Displays the current mailbox name', () => {
    renderWithContext('Inbox', []);
    expect(screen.getByText('No emails in this folder.')).toBeInTheDocument();
  });

  it('Displays the sender name of an email', () => {
    renderWithContext('Inbox', mockEmails);
    expect(screen.getByText('Prof')).toBeInTheDocument();
  });

  it('Displays the subject of an email', () => {
    renderWithContext('Inbox', mockEmails);
    expect(screen.getByText('Perfect Score')).toBeInTheDocument();
  });

  it('Displays a "No emails" message when the list is empty', () => {
    renderWithContext('Inbox', []);
    expect(screen.getByText('No emails in this folder.')).toBeInTheDocument();
  });

  it('Calls setActiveEmail when an email row is clicked', () => {
    const setActiveEmailMock = vi.fn();
    renderWithContext('Inbox', mockEmails, setActiveEmailMock);

    const row = screen.getByText('Perfect Score').closest('[role="button"]');
    row.click();

    expect(setActiveEmailMock).toHaveBeenCalledWith(mockEmails[0]);
  });

  it('Displays "Unknown" if sender data is missing', () => {
    const missingSender = [{...mockEmails[0], from: null}];
    renderWithContext('Inbox', missingSender);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('Calls handleDelete when the delete icon is clicked', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ok: true})));

    renderWithContext('Inbox', mockEmails);

    const deleteButton = screen.getByLabelText(/Delete mail from/i);
    deleteButton.click();
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/v0/mail/1?mailbox=trash'),
          expect.objectContaining({method: 'PUT'}),
      );
    });
  });

  it('Logs error when handleDelete fetch fails', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Fail'))));

    renderWithContext('Inbox', mockEmails);
    const deleteBtn = screen.getByLabelText(/Delete mail from/i);
    deleteBtn.click();

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(
          'Failed to move email to trash',
          expect.any(Error),
      );
    });
    spy.mockRestore();
  });

  it('Uses fallback ID fields when standard id is missing', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ok: true})));
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const fallbackEmail = {
      _id: '999-fallback',
      subject: 'Fallback Test',
      from: {name: 'Tester', address: 't@t.com'},
      received: '2026-02-23T00:00:00Z',
    };

    renderWithContext('Inbox', [fallbackEmail]);

    const deleteBtn = screen.getByLabelText(/Delete mail from/i);
    deleteBtn.click();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('999-fallback'),
          expect.any(Object),
      );
    });
    spy.mockRestore();
  });
});
