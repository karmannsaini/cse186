import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.jsx';

const originalFetch = window.fetch;

describe('Groups and group posts', () => {
  beforeEach(() => {
    window.fetch = vi.fn();
    sessionStorage.clear();
  });

  afterEach(() => {
    window.fetch = originalFetch;
    sessionStorage.clear();
  });

  const renderApp = () => render(<App />);

  it('shows group list in drawer after login', async () => {
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
            {id: 2, name: 'Cooking Circle', description: 'Cooking'},
          ]),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ([
            {
              id: 1,
              authorId: 1,
              content: {
                text: 'All feed post',
                createdAt: '2025-01-01T10:00:00.000Z',
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

    await screen.findByText(/all feed post/i);

    expect(screen.getAllByText('All posts').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Books Club').length).toBeGreaterThanOrEqual(1);
    expect(
        screen.getAllByText('Cooking Circle').length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('shows group posts when a group is selected', async () => {
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
              id: 10,
              authorId: 1,
              content: {
                text: 'All feed post',
                createdAt: '2025-01-01T10:00:00.000Z',
                visibility: 'PUBLIC',
              },
            },
          ]),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ([
            {
              id: 20,
              authorId: 2,
              content: {
                text: 'Books Club only post',
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

    await screen.findByText(/all feed post/i);

    const booksClubButtons =
        screen.getAllByRole('button', {name: /books club/i});
    await userEvent.click(booksClubButtons[0]);

    const groupPost = await screen.findByText(/Books Club only post/i);
    expect(groupPost).toBeInTheDocument();
  });
});
