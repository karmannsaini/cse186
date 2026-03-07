import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {AuthProvider, useAuth} from '../auth/AuthContext.jsx';
import {registerFetchMock, mockLoginResponse} from './testHelpers.jsx';

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
  registerFetchMock();

  it('throws when useAuth is used outside of provider', () => {
    expect(() => render(<ThrowingConsumer />))
        .toThrow('useAuth must be used within an AuthProvider');
  });

  it('rehydrates user and token from localStorage on mount', async () => {
    const stored = {
      user: {id: 2, email: 'anna@books.com', displayName: 'Anna Admin'},
      token: 'stored-token',
    };
    localStorage.setItem('auth', JSON.stringify(stored));

    render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
    );

    await screen.findByText('anna@books.com');
  });

  it('clears localStorage when stored auth is invalid', () => {
    localStorage.setItem('auth', 'not valid json');

    render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
    );

    expect(localStorage.getItem('auth')).toBeNull();
    expect(screen.getByText('none')).toBeInTheDocument();
  });

  it('clears user on logout', async () => {
    window.fetch.mockResolvedValueOnce(mockLoginResponse());

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
