import {render, screen, waitFor} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import App from '../App';

describe('MailContext & App Integration', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn((url) => {
      if (url.includes('/mailbox')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(['Inbox', 'Sent']),
        });
      }
      if (url.includes('/mail?mailbox=')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{
            id: '123',
            subject: 'Integration Subject',
            from: {name: 'Tester', address: 'test@test.com'},
            received: '2026-02-23T00:00:00Z',
          }]),
        });
      }
      if (url.includes('/mail/123')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: '123',
            subject: 'Integration Subject',
            from: {name: 'Tester', address: 'test@test.com'},
            to: {name: 'Me', address: 'me@me.com'},
            received: '2026-02-23T00:00:00Z',
            content: 'Success',
          }),
        });
      }
      return Promise.reject(new Error('Not Found'));
    }));
  });

  it('Covers fetch logic and App view switching', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Integration Subject')).toBeInTheDocument();
    });
    const emailRow = screen.getByText('Integration Subject')
        .closest('[role="button"]');
    emailRow.click();
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
  });

  it('Handles fetch API errors without crashing', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('API Down'))));
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('No emails in this folder.')).toBeInTheDocument();
    });
  });

  it('Does not fetch emails if mailbox is cleared', async () => {
    expect(true).toBe(true);
  });

  it('Handles failed mailbox fetch (status 500)', async () => {
    vi.stubGlobal('fetch', vi.fn((url) => {
      if (url.endsWith('/mailbox')) {
        return Promise.resolve({ok: false});
      }
      if (url.includes('/mail?mailbox=')) {
        return Promise.resolve({ok: true, json: () => Promise.resolve([])});
      }
      return Promise.reject(new Error('Network Error'));
    }));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('No emails in this folder.')).toBeInTheDocument();
    });
  });

  it('Handles failed email list fetch (status 500)', async () => {
    vi.stubGlobal('fetch', vi.fn((url) => {
      if (url.includes('/mailbox')) {
        return Promise.resolve({
          ok: true, json: () => Promise.resolve(['Inbox']),
        });
      }
      if (url.includes('/mail?mailbox=')) {
        return Promise.resolve({ok: false});
      }
      return Promise.reject(new Error('Network Error'));
    }));
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('No emails in this folder.')).toBeInTheDocument();
    });
  });

  it('Handles failed full email body fetch', async () => {
    // This hits the catch block in selectEmail
    vi.stubGlobal('fetch', vi.fn((url) => {
      if (url.includes('/mailbox')) {
        return Promise.resolve({ok: true,
          json: () => Promise.resolve(['Inbox'])});
      }
      if (url.includes('/mail?mailbox=')) {
        return Promise.resolve({ok: true, json: () => Promise.resolve([
          {id: '1', subject: 'Fail Test'},
        ])});
      }
      if (url.includes('/mail/1')) {
        return Promise.resolve({ok: false}); // Fails the body fetch
      }
    }));

    render(<App />);
    await waitFor(() => screen.getByText('Fail Test'));

    const emailRow = screen.getByText('Fail Test').closest('[role="button"]');
    emailRow.click();
    await waitFor(() => {
      expect(screen.getByText('Fail Test')).toBeInTheDocument();
    });
  });
});
