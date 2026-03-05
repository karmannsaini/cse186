import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.jsx';

const originalFetch = window.fetch;

describe('Posts feed', () => {
  beforeEach(() => {
    window.fetch = vi.fn();
    sessionStorage.clear();
  });

  afterEach(() => {
    window.fetch = originalFetch;
    sessionStorage.clear();
  });

  const renderApp = () => render(<App />);

  it('shows posts after successful fetch', async () => {
    window.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            token: 'fake-token',
            user: {
              id: 1,
              email: 'molly@books.com',
              displayName: 'Molly Member',
              roles: ['member'],
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ([
            {id: 1, name: 'Books Club', description: 'Books'},
          ]),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ([
            {
              id: 1,
              authorId: 1,
              content: {
                text: 'First post',
                createdAt: '2025-01-01T10:00:00.000Z',
                visibility: 'PUBLIC',
              },
            },
            {
              id: 2,
              authorId: 1,
              content: {
                text: 'Second newer post',
                createdAt: '2025-01-02T10:00:00.000Z',
                visibility: 'PUBLIC',
              },
            },
          ]),
        });

    renderApp();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const button = screen.getByRole('button', {name: /sign in/i});

    await userEvent.type(emailInput, 'molly@books.com');
    await userEvent.type(passwordInput, 'mollymember');
    await userEvent.click(button);

    const newerPost = await screen.findByText(/Second newer post/i);
    const firstPost = await screen.findByText(/First post/i);

    expect(newerPost).toBeInTheDocument();
    expect(firstPost).toBeInTheDocument();
  });

  it('shows an error message when posts fetch fails', async () => {
    window.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            token: 'fake-token',
            user: {
              id: 1,
              email: 'molly@books.com',
              displayName: 'Molly Member',
              roles: ['member'],
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ([{id: 1, name: 'G1'}]),
        })
        .mockResolvedValueOnce({
          ok: false,
        });

    renderApp();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const button = screen.getByRole('button', {name: /sign in/i});

    await userEvent.type(emailInput, 'molly@books.com');
    await userEvent.type(passwordInput, 'mollymember');
    await userEvent.click(button);

    const errorMessage =
      await screen.findByText(/unable to load posts/i);
    expect(errorMessage).toBeInTheDocument();
  });
});

