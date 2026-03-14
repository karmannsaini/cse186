import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  registerFetchMock,
  mockPostsResponse,
  loginAsMolly,
  applyLoginGroupsPostsMocks,
} from './testHelpers.jsx';

describe('Groups and group posts', () => {
  registerFetchMock();

  it('shows group list in drawer after login', async () => {
    applyLoginGroupsPostsMocks(
        [
          {id: 1, name: 'Books Club', description: 'Books'},
          {id: 2, name: 'Cooking Circle', description: 'Cooking'},
        ],
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

    await loginAsMolly();

    await screen.findByText(/all feed post/i);

    expect(screen.getAllByText('All posts').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Books Club').length).toBeGreaterThanOrEqual(1);
    expect(
        screen.getAllByText('Cooking Circle').length,
    ).toBeGreaterThanOrEqual(1);
  }, 15000);

  it('shows group posts when a group is selected', async () => {
    applyLoginGroupsPostsMocks(
        [{id: 1, name: 'Books Club', description: 'Books'}],
        [{
          id: 10,
          authorId: 1,
          content: {
            text: 'All feed post',
            createdAt: '2025-01-01T10:00:00.000Z',
            visibility: 'PUBLIC',
          },
        }],
    );
    window.fetch.mockResolvedValueOnce(mockPostsResponse([
      {
        id: 20,
        authorId: 2,
        content: {
          text: 'Books Club only post',
          createdAt: '2025-01-02T10:00:00.000Z',
          visibility: 'PUBLIC',
        },
      },
    ]));

    await loginAsMolly();

    await screen.findByText(/all feed post/i);

    const booksClubButtons =
        screen.getAllByRole('button', {name: /books club/i});
    await userEvent.click(booksClubButtons[0]);

    const groupPost = await screen.findByText(/Books Club only post/i);
    expect(groupPost).toBeInTheDocument();
  }, 15000);
});
