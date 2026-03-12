import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostCard from '../posts/PostCard.jsx';
import {AuthContext} from '../auth/AuthContext.jsx';

const renderWithAuth = (ui, {token = 'test-token'} = {}) => {
  return render(
      <AuthContext.Provider value={{
        user: {id: 1, displayName: 'Test User'},
        token,
        login: async () => {},
        logout: () => {},
      }}>
        {ui}
      </AuthContext.Provider>,
  );
};

describe('PostCard', () => {
  const basePost = {
    id: 10,
    authorId: 1,
    authorDisplayName: 'Alice',
    content: {
      text: 'Hello',
      createdAt: '2025-01-01T10:00:00.000Z',
    },
    reactions: {},
  };

  const setupPostWithReactions = async (overrides = {}) => {
    const user = userEvent.setup();
    renderWithAuth(<PostCard post={{
      ...basePost,
      ...overrides,
    }} />);
    return user;
  };

  const setupEditableCard = (props = {}) => {
    const user = userEvent.setup({delay: 0});
    renderWithAuth(<PostCard post={basePost} {...props} />);
    return user;
  };

  const openEditor = async (user) => {
    await user.click(screen.getByRole('button', {name: /edit post/i}));
    return screen.getByLabelText(/edit post/i, {selector: 'textarea'});
  };

  const saveEdit = async (user) => {
    await user.click(screen.getByRole('button', {name: /save/i}));
  };

  const cancelEdit = async (user) => {
    await user.click(screen.getByRole('button', {name: /cancel/i}));
  };

  const getLikeCountElement = () => {
    const likeBtn = screen.getByRole('button', {name: 'Like'});
    const likeRow = likeBtn.parentElement;
    const spans = Array.from(likeRow.querySelectorAll('span'));
    return spans.find((s) => /^\d+$/.test(s.textContent.trim()));
  };

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ok: true}));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders post with normal content', () => {
    const post = {
      id: 1,
      authorId: 1,
      content: {
        text: 'Hello world',
        createdAt: '2025-01-01T10:00:00.000Z',
        visibility: 'PUBLIC',
      },
    };
    renderWithAuth(<PostCard post={post} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText(/posted/i)).toBeInTheDocument();
  });

  it('handles content as string', () => {
    const post = {
      id: 2,
      authorId: 1,
      content: 'Plain string content',
    };
    renderWithAuth(<PostCard post={post} />);
    expect(screen.getByText('Plain string content')).toBeInTheDocument();
  });

  it('shows (No content) when content has no text', () => {
    const post = {
      id: 3,
      authorId: 1,
      content: {},
    };
    renderWithAuth(<PostCard post={post} />);
    expect(screen.getByText('(No content)')).toBeInTheDocument();
  });

  it('truncates text over 500 characters', () => {
    const longText = 'a'.repeat(600);
    const post = {
      id: 4,
      authorId: 1,
      content: {
        text: longText,
        createdAt: '2025-01-01T10:00:00.000Z',
      },
    };
    renderWithAuth(<PostCard post={post} />);
    const truncated = screen.getByText(/a+\.\.\./);
    expect(truncated.textContent).toHaveLength(500);
    expect(truncated.textContent.endsWith('...')).toBe(true);
  });

  it('omits date when createdAt is missing', () => {
    const post = {
      id: 5,
      authorId: 1,
      content: {
        text: 'No date post',
      },
    };
    renderWithAuth(<PostCard post={post} />);
    expect(screen.getByText('No date post')).toBeInTheDocument();
    expect(screen.queryByText(/posted/i)).not.toBeInTheDocument();
  });

  it('shows group label and name when post has groupId and groups', () => {
    const post = {
      id: 6,
      authorId: 2,
      authorDisplayName: 'Jane Doe',
      content: {
        text: 'Group-only post',
        createdAt: '2025-01-03T12:00:00.000Z',
        groupId: 1,
      },
    };
    const groups = [
      {id: 1, name: 'Books Club'},
      {id: 2, name: 'Cooking Circle'},
    ];
    renderWithAuth(<PostCard post={post} groups={groups} />);
    expect(
        screen.getByText(/group post by jane doe into books club/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Group-only post')).toBeInTheDocument();
  });

  it('does not call API when token is missing', async () => {
    const user = userEvent.setup();
    renderWithAuth(<PostCard post={basePost} />, {token: ''});
    await user.click(screen.getByRole('button', {name: 'Like'}));
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('does not call edit/delete API when token is missing', async () => {
    const onPostUpdated = vi.fn();
    const onPostDeleted = vi.fn();
    const user = userEvent.setup();
    renderWithAuth(
        <PostCard post={basePost} onPostUpdated={onPostUpdated}
          onPostDeleted={onPostDeleted} />,
        {token: ''},
    );

    await user.click(screen.getByRole('button', {name: /edit post/i}));
    await user.click(screen.getByRole('button', {name: /save/i}));
    await user.click(screen.getByRole('button', {name: /cancel/i}));
    await user.click(screen.getByRole('button', {name: /delete post/i}));

    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(onPostUpdated).not.toHaveBeenCalled();
    expect(onPostDeleted).not.toHaveBeenCalled();
  });

  it('sends PUT and increments count when reacting', async () => {
    const user = await setupPostWithReactions({
      reactions: {like: 0},
    });

    await user.click(screen.getByRole('button', {name: 'Like'}));

    expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3010/api/v0/posts/10/reactions',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          }),
          body: JSON.stringify({type: 'like'}),
        }),
    );

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('switching reaction decrements previous and increments new', async () => {
    const user = await setupPostWithReactions({
      userReaction: 'like',
      reactions: {like: 1, love: 0},
    });

    await user.click(screen.getByRole('button', {name: 'Love'}));

    expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3010/api/v0/posts/10/reactions',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({type: 'love'}),
        }),
    );

    // like should go down to 0, love up to 1
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
  });

  it('toggles reaction off with DELETE', async () => {
    const user = await setupPostWithReactions({
      userReaction: 'like',
      reactions: {like: 1},
    });

    await user.click(screen.getByRole('button', {name: 'Like'}));

    const lastCall = globalThis.fetch.mock.calls.at(-1);
    expect(lastCall[0]).toBe(
        'http://localhost:3010/api/v0/posts/10/reactions');
    expect(lastCall[1].method).toBe('DELETE');
    expect(lastCall[1].headers['Authorization'])
        .toBe('Bearer test-token');

    const likeCount = getLikeCountElement();
    expect(likeCount).toHaveTextContent('0');
  });

  it('does not update state when API call fails', async () => {
    globalThis.fetch.mockRejectedValueOnce(new Error('network'));
    const user = await setupPostWithReactions({
      reactions: {like: 0},
    });

    await user.click(screen.getByRole('button', {name: 'Like'}));

    // still 0 because we ignore failures
    const likeCount = getLikeCountElement();
    expect(likeCount).toHaveTextContent('0');
  });

  it('shows edit/delete controls only for the author', () => {
    renderWithAuth(<PostCard post={{...basePost, authorId: 2}} />);
    expect(screen.queryByRole('button', {name: /edit post/i}))
        .not.toBeInTheDocument();
    expect(screen.queryByRole('button', {name: /delete post/i}))
        .not.toBeInTheDocument();
  });

  it('edits a post with PATCH and calls onPostUpdated', async () => {
    const onPostUpdated = vi.fn();
    const user = setupEditableCard({onPostUpdated});
    const editor = await openEditor(user);
    await user.clear(editor);
    await user.type(editor, 'Updated text');
    await saveEdit(user);

    expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3010/api/v0/posts/10',
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          }),
          body: JSON.stringify({text: 'Updated text'}),
        }),
    );
    expect(onPostUpdated).toHaveBeenCalledWith(10, 'Updated text');
  });

  it('does not call onPostUpdated when PATCH fails', async () => {
    globalThis.fetch.mockResolvedValueOnce({ok: false});
    const onPostUpdated = vi.fn();
    const user = setupEditableCard({onPostUpdated});
    const editor = await openEditor(user);
    await user.type(editor, ' (ignored)');
    await saveEdit(user);
    expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3010/api/v0/posts/10',
        expect.objectContaining({method: 'PATCH'}),
    );
    expect(onPostUpdated).not.toHaveBeenCalled();
  });

  it('keeps edit mode when PATCH throws', async () => {
    globalThis.fetch.mockRejectedValueOnce(new Error('network'));
    const onPostUpdated = vi.fn();
    const user = setupEditableCard({onPostUpdated});
    await openEditor(user);
    await saveEdit(user);
    expect(onPostUpdated).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/edit post/i, {selector: 'textarea'}))
        .toBeInTheDocument();
  });

  it('cancels edit and restores original text', async () => {
    const onPostUpdated = vi.fn();
    const user = setupEditableCard({onPostUpdated});
    const editor = await openEditor(user);
    await user.type(editor, ' (draft)');
    await cancelEdit(user);
    expect(onPostUpdated).not.toHaveBeenCalled();
    expect(
        screen.queryByLabelText(/edit post/i, {selector: 'textarea'}),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('deletes a post with DELETE and calls onPostDeleted', async () => {
    const onPostDeleted = vi.fn();
    const user = setupEditableCard({onPostDeleted});
    await user.click(screen.getByRole('button', {name: /delete post/i}));
    expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3010/api/v0/posts/10',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        }),
    );
    expect(onPostDeleted).toHaveBeenCalledWith(10);
  });

  it.each([
    {
      name: 'fails',
      setupFetch: () => globalThis.fetch.mockResolvedValueOnce({ok: false}),
    },
    {
      name: 'throws',
      setupFetch: () => globalThis.fetch.mockRejectedValueOnce(
          new Error('network'),
      ),
    },
  ])('does not call onPostDeleted when DELETE $name', async ({setupFetch}) => {
    setupFetch();
    const onPostDeleted = vi.fn();
    const user = setupEditableCard({onPostDeleted});
    await user.click(screen.getByRole('button', {name: /delete post/i}));
    expect(onPostDeleted).not.toHaveBeenCalled();
  });
});
