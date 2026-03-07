import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import PostCard from '../posts/PostCard.jsx';

describe('PostCard', () => {
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
    render(<PostCard post={post} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText(/posted/i)).toBeInTheDocument();
  });

  it('handles content as string', () => {
    const post = {
      id: 2,
      authorId: 1,
      content: 'Plain string content',
    };
    render(<PostCard post={post} />);
    expect(screen.getByText('Plain string content')).toBeInTheDocument();
  });

  it('shows (No content) when content has no text', () => {
    const post = {
      id: 3,
      authorId: 1,
      content: {},
    };
    render(<PostCard post={post} />);
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
    render(<PostCard post={post} />);
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
    render(<PostCard post={post} />);
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
    render(<PostCard post={post} groups={groups} />);
    expect(
        screen.getByText(/group post by jane doe into books club/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Group-only post')).toBeInTheDocument();
  });
});
