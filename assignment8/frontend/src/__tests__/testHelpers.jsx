import {beforeEach, afterEach, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.jsx';

const originalFetch = typeof window !== 'undefined' ? window.fetch : undefined;

/**
 * Register fetch mock setup/teardown. Call in describe block.
 */
export function registerFetchMock() {
  beforeEach(() => {
    window.fetch = vi.fn();
    sessionStorage.clear();
    localStorage.clear();
  });
  afterEach(() => {
    window.fetch = originalFetch;
    sessionStorage.clear();
    localStorage.clear();
  });
}

/**
 * Mock login response for window.fetch.
 * @returns {object} mock response
 */
export function mockLoginResponse() {
  return {
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
  };
}

/**
 * Mock groups API response.
 * @param {Array<{id: number, name: string, description: string}>} groups
 *     group objects
 * @returns {object} mock response
 */
export function mockGroupsResponse(groups) {
  return {
    ok: true,
    json: async () => groups,
  };
}

/**
 * Mock posts API response.
 * @param {Array<object>} posts post objects
 * @returns {object} mock response
 */
export function mockPostsResponse(posts) {
  return {
    ok: true,
    json: async () => posts,
  };
}

/**
 * Default render function for App.
 * @returns {object} render result
 */
export function renderApp() {
  return render(<App />);
}

/**
 * Get login form elements from the rendered app.
 * @returns {{emailInput: Element, passwordInput: Element, button: Element}}
 *     email input, password input, and sign-in button
 */
export function getLoginInputs() {
  return {
    emailInput: screen.getByLabelText(/email address/i),
    passwordInput: screen.getByLabelText(/password/i, {selector: 'input'}),
    button: screen.getByRole('button', {name: /sign in/i}),
  };
}

/**
 * Render App and perform login as molly@books.com.
 * @param {() => object} renderFn render function (default: renderApp)
 * @returns {Promise<void>}
 */
export async function loginAsMolly(renderFn = renderApp) {
  renderFn();
  const {emailInput, passwordInput, button} = getLoginInputs();
  await userEvent.type(emailInput, 'molly@books.com');
  await userEvent.type(passwordInput, 'mollymember');
  await userEvent.click(button);
}

/**
 * Apply login + groups + posts mocks to window.fetch.
 * @param {Array<object>} groups group objects
 * @param {Array<object>} posts post objects
 * @returns {void}
 */
export function applyLoginGroupsPostsMocks(groups, posts) {
  window.fetch.mockImplementation((input) => {
    const url = String(input);
    if (url.includes('/api/v0/auth/login')) {
      return Promise.resolve(mockLoginResponse());
    }
    if (url.includes('/api/v0/groups') && !url.includes('/posts')) {
      return Promise.resolve(mockGroupsResponse(groups));
    }
    if (url.includes('/api/v0/posts') ||
      (url.includes('/api/v0/groups/') && url.includes('/posts'))) {
      return Promise.resolve(mockPostsResponse(posts));
    }
    return Promise.resolve({ok: false, json: async () => ({})});
  });
}
