import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  registerFetchMock,
  mockLoginResponse,
  loginAsMolly,
  renderApp,
  getLoginInputs,
} from './testHelpers.jsx';

describe('Authentication flow', () => {
  registerFetchMock();

  it('renders login form with email and password fields', () => {
    renderApp();
    const {emailInput, passwordInput, button} = getLoginInputs();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });

  it('logs in and navigates to home on valid credentials', async () => {
    window.fetch.mockResolvedValueOnce(mockLoginResponse());

    await loginAsMolly(renderApp);

    const homeHeading = await screen.findByText(/welcome to your feed/i);
    expect(homeHeading).toBeInTheDocument();

    const logoutButton = screen.getByRole('button', {name: /logout/i});
    await userEvent.click(logoutButton);

    const emailInputAfterLogout =
      await screen.findByLabelText(/email address/i);
    expect(emailInputAfterLogout).toBeInTheDocument();
  });

  it('shows an error message when login fails', async () => {
    window.fetch.mockResolvedValueOnce({ok: false});
    renderApp();
    const {emailInput, passwordInput, button} = getLoginInputs();
    await userEvent.type(emailInput, 'wrong@books.com');
    await userEvent.type(passwordInput, 'wrongpassword');
    await userEvent.click(button);

    const errorMessage =
      await screen.findByText(/invalid email or password/i);
    expect(errorMessage).toBeInTheDocument();
  });
});
