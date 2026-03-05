import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.jsx';

const originalFetch = window.fetch;

describe('Authentication flow', () => {
  beforeEach(() => {
    window.fetch = vi.fn();
    sessionStorage.clear();
  });

  afterEach(() => {
    window.fetch = originalFetch;
    sessionStorage.clear();
  });

  const renderWithProviders = () => {
    return render(<App />);
  };

  it('renders login form with email and password fields', () => {
    renderWithProviders();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const button = screen.getByRole('button', {name: /sign in/i});

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });

  it('logs in and navigates to home on valid credentials', async () => {
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

    renderWithProviders();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const button = screen.getByRole('button', {name: /sign in/i});

    await userEvent.type(emailInput, 'molly@books.com');
    await userEvent.type(passwordInput, 'mollymember');
    await userEvent.click(button);

    const homeHeading = await screen.findByText(/welcome to your feed/i);
    expect(homeHeading).toBeInTheDocument();

    const logoutButton = screen.getByRole('button', {name: /logout/i});
    await userEvent.click(logoutButton);

    const emailInputAfterLogout =
      await screen.findByLabelText(/email address/i);
    expect(emailInputAfterLogout).toBeInTheDocument();
  });

  it('shows an error message when login fails', async () => {
    window.fetch.mockResolvedValueOnce({
      ok: false,
    });

    renderWithProviders();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const button = screen.getByRole('button', {name: /sign in/i});

    await userEvent.type(emailInput, 'wrong@books.com');
    await userEvent.type(passwordInput, 'wrongpassword');
    await userEvent.click(button);

    const errorMessage =
      await screen.findByText(/invalid email or password/i);
    expect(errorMessage).toBeInTheDocument();
  });
});

