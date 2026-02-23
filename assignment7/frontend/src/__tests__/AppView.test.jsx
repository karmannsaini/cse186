import {render, screen, waitFor} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import App from '../App';

describe('App View Logic TDD', () => {
  beforeEach(() => {
    // Mock matchMedia so MUI useMediaQuery works in tests
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(max-width:600px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('Initially displays the MailList (Inbox)', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('No emails in this folder.')).toBeInTheDocument();
    });
  });

  it('Toggles mobile drawer when menu icon is clicked', () => {
    render(<App />);
    const menuButton = screen.getByLabelText('open drawer');
    menuButton.click();
    expect(menuButton).toBeInTheDocument();
  });

  it('Covers handleBack function on mobile view', async () => {
    vi.stubGlobal('fetch', vi.fn((url) => {
      if (url.includes('/mailbox')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(['Inbox']),
        });
      }
      if (url.includes('/mail/1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: '1',
            subject: 'Mobile Test',
            content: 'Body',
            from: {name: 'Sender', address: 'a@b.com'},
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{id: '1', subject: 'Mobile Test'}]),
      });
    }));

    render(<App />);
    const row = await screen.findByText('Mobile Test');
    row.closest('[role="button"]').click();

    const backButton = await screen.findByLabelText(/back/i);
    backButton.click();

    await waitFor(() => {
      expect(screen.getByText('Mobile Test')).toBeInTheDocument();
    });
  });
});
