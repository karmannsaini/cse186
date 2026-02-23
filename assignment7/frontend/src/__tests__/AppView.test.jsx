import {render, screen, within} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
// import React from 'react';
import App from '../App';

describe('App View Logic TDD', () => {
  it('Initially displays the MailList (Inbox)', async () => {
    render(<App />);
    const main = screen.getByRole('main');
    expect(within(main).getByText('Inbox')).toBeInTheDocument();
  });

  it('Does not show MailViewer when no email is selected', () => {
    render(<App />);
    const fromLabel = screen.queryByText(/From:/i);
    expect(fromLabel).not.toBeInTheDocument();
  });
});
