import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {AuthProvider, useAuth} from '../auth/AuthContext.jsx';

const originalFetch = window.fetch;

/**
 * Component that calls useAuth without a provider.
 * @returns {null} nothing
 */
function ThrowingConsumer() {
  useAuth();
  return null;
}

/**
 * Component that exposes login and logout controls.
 * @returns {object} rendered test component
 */
function TestConsumer() {
  const {user, login, logout} = useAuth();
  return (
    <div>
      <div>{user ? user.email : 'none'}</div>
      <button
        type="button"
        onClick={() => login('molly@books.com', 'mollymember')}
      >
        Login
      </button>
      <button type="button" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    window.fetch = vi.fn();
    sessionStorage.clear();
  });

  afterEach(() => {
    window.fetch = originalFetch;
    sessionStorage.clear();
  });

  it('throws when useAuth is used outside of provider', () => {
    expect(() => render(<ThrowingConsumer />))
        .toThrow('useAuth must be used within an AuthProvider');
  });

  it('rehydrates user and token from sessionStorage on mount', async () => {
    const stored = {
      user: {id: 2, email: 'anna@books.com', displayName: 'Anna Admin'},
      token: 'stored-token',
    };
    sessionStorage.setItem('auth', JSON.stringify(stored));

    render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
    );

    await screen.findByText('anna@books.com');
  });

  it('clears sessionStorage when stored auth is invalid', () => {
    sessionStorage.setItem('auth', 'not valid json');

    render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
    );

    expect(sessionStorage.getItem('auth')).toBeNull();
    expect(screen.getByText('none')).toBeInTheDocument();
  });

  it('clears user on logout', async () => {
    window.fetch.mockResolvedValueOnce({
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
    });

    render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
    );

    const loginButton = screen.getByText(/login/i);
    await userEvent.click(loginButton);

    await screen.findByText('molly@books.com');

    const logoutButton = screen.getByText(/^logout$/i);
    await userEvent.click(logoutButton);

    await screen.findByText('none');
  });
});

