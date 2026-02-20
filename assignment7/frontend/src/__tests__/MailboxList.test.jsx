import {it, beforeAll, afterAll, afterEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {setupServer} from 'msw/node';
import List from '../mailbox/List';

const server = setupServer(
    http.get('http://localhost:3010/api/v0/mailbox', () => {
      return HttpResponse.json(['Inbox', 'Sent', 'Trash']);
    }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('Displays correct Mailbox list', async () => {
  render(<List />);
  await screen.findByLabelText('Mailbox List');
  await screen.findByText('Inbox');
});
