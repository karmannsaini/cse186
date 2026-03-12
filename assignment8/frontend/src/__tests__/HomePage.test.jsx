import {describe, it, expect} from 'vitest';
import {screen, render} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';
import {ThemeProvider, createTheme} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {AppRoutes} from '../App.jsx';
import {AuthProvider, AuthContext} from '../auth/AuthContext.jsx';
import HomePage from '../home/HomePage.jsx';
import {
  registerFetchMock,
  loginAsMolly,
  applyLoginGroupsPostsMocks,
  mockLoginResponse,
  mockGroupsResponse,
  mockPostsResponse,
} from './testHelpers.jsx';

/** Default groups for feed tests. */
const DEFAULT_GROUPS = [{id: 1, name: 'Books Club', description: 'Books'}];
/** Default post for feed tests. */
const DEFAULT_POST = [{
  id: 1,
  authorId: 1,
  content: {
    text: 'A post',
    createdAt: '2025-01-01T10:00:00.000Z',
    visibility: 'PUBLIC',
  },
}];

/** Apply default groups + post mocks and prepare for login. */
function setupDefaultFeed() {
  applyLoginGroupsPostsMocks(DEFAULT_GROUPS, DEFAULT_POST);
}

/** Log in as molly and wait until feed post appears. */
async function loginAndWaitForFeed() {
  await loginAsMolly();
  await screen.findByText(/a post/i);
}

/**
 * @typedef {{resolve: function(object): void, reject: function(Error): void}}
 *   UnmountSettleGroupsArg
 */

/**
 * Log in, unmount (logout) before groups fetch settles, then settle it.
 * @param {function(UnmountSettleGroupsArg): void} settleGroups Callback that
 *   receives {resolve, reject} to settle the groups promise.
 */
async function unmountThenSettleGroups(settleGroups) {
  let resolvePromise;
  let rejectPromise;
  const groupsPromise = new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });
  window.fetch
      .mockResolvedValueOnce(mockLoginResponse())
      .mockReturnValueOnce(groupsPromise)
      .mockResolvedValueOnce(mockPostsResponse(DEFAULT_POST));
  await loginAsMolly();
  const logoutBtn = await screen.findByRole('button', {name: /logout/i});
  await userEvent.click(logoutBtn);
  settleGroups({resolve: resolvePromise, reject: rejectPromise});
  await screen.findByLabelText(/email address/i);
}

describe('HomePage', () => {
  registerFetchMock();

  it('shows title in app bar when no group is selected', async () => {
    setupDefaultFeed();
    await loginAndWaitForFeed();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('opens mobile drawer when menu button is clicked', async () => {
    setupDefaultFeed();
    await loginAndWaitForFeed();
    const menuButton = screen.getByRole('button', {name: /open menu/i});
    await userEvent.click(menuButton);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent('All posts');
    expect(dialog).toHaveTextContent('Books Club');

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes mobile drawer when backdrop is clicked', async () => {
    setupDefaultFeed();
    await loginAndWaitForFeed();
    const menuButton = screen.getByRole('button', {name: /open menu/i});
    await userEvent.click(menuButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const backdrop = document.querySelector('.MuiBackdrop-root');
    await userEvent.click(backdrop);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('navigates to all posts when All posts is clicked in drawer', async () => {
    setupDefaultFeed();
    window.fetch
        .mockResolvedValueOnce({ok: true, json: async () => []})
        .mockResolvedValueOnce({ok: true, json: async () => []});
    await loginAndWaitForFeed();
    const menuButton = screen.getByRole('button', {name: /open menu/i});
    await userEvent.click(menuButton);
    const allPostsBtn = await screen.findByRole('button', {name: /all posts/i});
    await userEvent.click(allPostsBtn);

    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('shows No posts in this group when group has no posts', async () => {
    applyLoginGroupsPostsMocks(
        [{id: 1, name: 'Empty Group', description: 'Empty'}],
        [{
          id: 1,
          authorId: 1,
          content: {
            text: 'All feed post',
            createdAt: '2025-01-01T10:00:00.000Z',
            visibility: 'PUBLIC',
          },
        }],
    );
    window.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await loginAsMolly();

    await screen.findByText(/all feed post/i);

    const emptyGroupBtn =
        screen.getByRole('button', {name: /empty group/i});
    await userEvent.click(emptyGroupBtn);

    const noPostsMsg = await screen.findByText(/no posts in this group/i);
    expect(noPostsMsg).toBeInTheDocument();
  });

  it('shows error when posts fetch fails', async () => {
    window.fetch
        .mockResolvedValueOnce(mockLoginResponse())
        .mockResolvedValueOnce(mockGroupsResponse(
            [{id: 1, name: 'Books Club', description: 'Books'}]))
        .mockResolvedValueOnce({ok: false, json: async () => ({})});

    await loginAsMolly();

    const errMsg = await screen.findByText(/unable to load posts/i);
    expect(errMsg).toBeInTheDocument();
  });

  it('shows error when posts fetch throws', async () => {
    window.fetch
        .mockResolvedValueOnce(mockLoginResponse())
        .mockResolvedValueOnce(mockGroupsResponse(
            [{id: 1, name: 'Books Club', description: 'Books'}]))
        .mockRejectedValueOnce(new Error('Network error'));

    await loginAsMolly();

    const errMsg = await screen.findByText(/unable to load posts/i);
    expect(errMsg).toBeInTheDocument();
  });

  it('handles groups fetch failure gracefully', async () => {
    window.fetch
        .mockResolvedValueOnce(mockLoginResponse())
        .mockResolvedValueOnce({ok: false})
        .mockResolvedValueOnce({
          ok: true,
          json: async () => DEFAULT_POST,
        });
    await loginAndWaitForFeed();
    const allPostsBtn = screen.getByRole('button', {name: /all posts/i});
    expect(allPostsBtn).toBeInTheDocument();
  });

  it('handles groups fetch throw gracefully', async () => {
    window.fetch
        .mockResolvedValueOnce(mockLoginResponse())
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => DEFAULT_POST,
        });
    await loginAndWaitForFeed();
    expect(screen.queryByText(/a post/i)).toBeInTheDocument();
  });

  it('does not fetch when token is empty', async () => {
    window.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: '',
        user: {
          id: 1,
          email: 'molly@books.com',
          displayName: 'Molly Member',
          roles: ['member'],
        },
      }),
    });
    await loginAsMolly();
    await screen.findByText(/welcome to your feed/i);
    expect(window.fetch).toHaveBeenCalledTimes(1);
  });

  it('cleans up on unmount before fetch resolves', async () => {
    let resolveGroups;
    const groupsPromise = new Promise((r) => {
      resolveGroups = r;
    });
    let resolvePosts;
    const postsPromise = new Promise((r) => {
      resolvePosts = r;
    });
    window.fetch
        .mockResolvedValueOnce(mockLoginResponse())
        .mockReturnValueOnce(groupsPromise)
        .mockReturnValueOnce(postsPromise);
    await loginAsMolly();

    const logoutBtn = await screen.findByRole('button', {name: /logout/i});
    await userEvent.click(logoutBtn);

    resolveGroups({ok: true, json: async () => []});
    resolvePosts({ok: true, json: async () => []});

    await screen.findByLabelText(/email address/i);
  });

  it('does not set error when posts fetch rejects after unmount', async () => {
    let rejectPosts;
    const postsPromise = new Promise((_, reject) => {
      rejectPosts = reject;
    });

    window.fetch
        .mockResolvedValueOnce(mockLoginResponse())
        .mockResolvedValueOnce(mockGroupsResponse(
            [{id: 1, name: 'Books Club', description: 'Books'}]))
        .mockReturnValueOnce(postsPromise);

    await loginAsMolly();

    const logoutBtn = await screen.findByRole('button', {name: /logout/i});
    await userEvent.click(logoutBtn);

    rejectPosts(new Error('Network error'));

    await screen.findByLabelText(/email address/i);
  });

  it('shows NotFound when group ID in URL is not in loaded groups',
      async () => {
        const auth = {
          user: {
            id: 1,
            email: 'molly@books.com',
            displayName: 'Molly',
            roles: ['member'],
          },
          token: 'fake-token',
        };
        localStorage.setItem('auth', JSON.stringify(auth));

        window.fetch
            .mockResolvedValueOnce(mockGroupsResponse([
              {id: 1, name: 'Books Club', description: 'Books'},
            ]))
            .mockResolvedValueOnce(mockPostsResponse([]));

        render(
            <ThemeProvider theme={createTheme()}>
              <CssBaseline />
              <AuthProvider>
                <MemoryRouter initialEntries={['/home/group/999']}>
                  <AppRoutes />
                </MemoryRouter>
              </AuthProvider>
            </ThemeProvider>,
        );

        const notFoundMsg =
            await screen.findByText(/we can't find that page/i);
        expect(notFoundMsg).toBeInTheDocument();
      });

  it('handles groups API returning non-array', async () => {
    window.fetch
        .mockResolvedValueOnce(mockLoginResponse())
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        })
        .mockResolvedValueOnce(mockPostsResponse(DEFAULT_POST));
    await loginAndWaitForFeed();
    expect(screen.getByText(/welcome to your feed/i)).toBeInTheDocument();
    expect(screen.getByText(/a post/i)).toBeInTheDocument();
  });

  it('does not set groups error when groups fetch returns !ok after unmount',
      async () => {
        await unmountThenSettleGroups(({resolve}) =>
          resolve({ok: false, json: async () => ({})}));
      });

  it('does not set groups error when groups fetch throws after unmount',
      async () => {
        await unmountThenSettleGroups(({reject}) =>
          reject(new Error('Network error')));
      });

  it('renders app bar without user display when user is null', async () => {
    window.fetch
        .mockResolvedValueOnce(mockGroupsResponse(DEFAULT_GROUPS))
        .mockResolvedValueOnce(mockPostsResponse([]));
    const mockLogout = () => {};
    render(
        <ThemeProvider theme={createTheme()}>
          <CssBaseline />
          <AuthContext.Provider
            value={{
              user: null,
              token: 'fake-token',
              login: async () => {},
              logout: mockLogout,
            }}
          >
            <MemoryRouter initialEntries={['/home']}>
              <HomePage title="Home" />
            </MemoryRouter>
          </AuthContext.Provider>
        </ThemeProvider>,
    );
    await screen.findByText(/welcome to your feed/i);
    expect(screen.getByRole('button', {name: /logout/i})).toBeInTheDocument();
  });

  it('updates feed state when a post is edited and deleted', async () => {
    applyLoginGroupsPostsMocks(
        DEFAULT_GROUPS,
        [{
          id: 7,
          authorId: 1,
          authorDisplayName: 'Molly',
          content: {
            text: 'Editable post',
            createdAt: '2025-01-01T10:00:00.000Z',
            visibility: 'PUBLIC',
          },
          reactions: {},
        }, {
          id: 8,
          authorId: 2,
          authorDisplayName: 'Other',
          content: {
            text: 'Other post',
            createdAt: '2025-01-01T10:00:00.000Z',
            visibility: 'PUBLIC',
          },
          reactions: {},
        }],
    );

    await loginAsMolly();
    await screen.findByText(/editable post/i);
    await screen.findByText(/other post/i);

    // Make sure any follow-up fetches used by edit/delete succeed.
    window.fetch.mockResolvedValue({ok: true});

    // Edit flow (covers HomePage onPostUpdated mapping).
    await userEvent.click(screen.getByRole('button', {name: /edit post/i}));
    const editor = screen.getByLabelText(/edit post/i, {selector: 'textarea'});
    await userEvent.clear(editor);
    await userEvent.type(editor, 'Edited text');
    await userEvent.click(screen.getByRole('button', {name: /save/i}));
    expect(await screen.findByText(/edited text/i)).toBeInTheDocument();
    expect(screen.getByText(/other post/i)).toBeInTheDocument();

    // Delete flow (covers HomePage onPostDeleted filter).
    await userEvent.click(screen.getByRole('button', {name: /delete post/i}));
    expect(screen.queryByText(/edited text/i)).not.toBeInTheDocument();
  }, 10000);
});
