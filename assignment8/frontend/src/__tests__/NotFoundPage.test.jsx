import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import NotFoundPage from '../NotFoundPage.jsx';

describe('NotFoundPage', () => {
  it('renders not-found message and Go to Home link', () => {
    render(
        <MemoryRouter>
          <NotFoundPage />
        </MemoryRouter>,
    );
    expect(screen.getByText(/we can't find that page/i)).toBeInTheDocument();
    const homeLink = screen.getByRole('link', {name: /go to home/i});
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/home');
  });
});
