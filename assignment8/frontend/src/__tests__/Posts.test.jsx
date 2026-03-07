import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import {
  registerFetchMock,
  mockLoginResponse,
  mockGroupsResponse,
  loginAsMolly,
  applyLoginGroupsPostsMocks,
} from './testHelpers.jsx';

describe('Posts feed', () => {
  registerFetchMock();

  it('shows posts after successful fetch', async () => {
    applyLoginGroupsPostsMocks(
        [{id: 1, name: 'Books Club', description: 'Books'}],
        [
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
        ],
    );

    await loginAsMolly();

    const newerPost = await screen.findByText(/Second newer post/i);
    const firstPost = await screen.findByText(/First post/i);

    expect(newerPost).toBeInTheDocument();
    expect(firstPost).toBeInTheDocument();
  });

  it('shows an error message when posts fetch fails', async () => {
    window.fetch
        .mockResolvedValueOnce(mockLoginResponse())
        .mockResolvedValueOnce(mockGroupsResponse([{id: 1, name: 'G1'}]))
        .mockResolvedValueOnce({ok: false});

    await loginAsMolly();

    const errorMessage =
      await screen.findByText(/unable to load posts/i);
    expect(errorMessage).toBeInTheDocument();
  });
});
