import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {MailContext} from '../MailContext';
import MailViewer from '../mailbox/MailViewer';

const mockEmail = {
  id: '123',
  from: {name: 'Professor', address: 'prof@ucsc.edu'},
  subject: 'Great Job on TDD',
  received: '2026-02-21T10:00:00Z',
  content: 'You are on track for a maximum grade!',
};

describe('MailViewer Component TDD', () => {
  it('Displays the subject of the active email', () => {
    render(
        <MailContext.Provider value={{activeEmail: mockEmail}}>
          <MailViewer />
        </MailContext.Provider>,
    );
    expect(screen.getByText('Great Job on TDD')).toBeInTheDocument();
  });

  it('Displays the full content of the email', () => {
    render(
        <MailContext.Provider value={{activeEmail: mockEmail}}>
          <MailViewer />
        </MailContext.Provider>,
    );
    expect(screen.getByText(/ maximum grade/i)).toBeInTheDocument();
  });

  it('Shows nothing if no email is active', () => {
    const {container} = render(
        <MailContext.Provider value={{activeEmail: null}}>
          <MailViewer />
        </MailContext.Provider>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('Calls setActiveEmail(null) when the Back button is clicked', () => {
    const setActiveEmail = vi.fn();
    render(
        <MailContext.Provider value={{activeEmail: mockEmail, setActiveEmail}}>
          <MailViewer />
        </MailContext.Provider>,
    );

    const backButton = screen.getByRole('button', {name: /back/i});
    backButton.click();

    expect(setActiveEmail).toHaveBeenCalledWith(null);
  });
});
