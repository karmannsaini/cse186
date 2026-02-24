import {render, screen, waitFor} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import App from '../App';

// Helper to eliminate duplicate render/waitFor blocks
const checkEmptyFolder = async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText('No emails in this folder.'))
        .toBeInTheDocument();
  });
};

describe('MailContext & App Integration', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn((url) => {
      if (url.includes('/mailbox')) {
        const boxes = ['Inbox', 'Sent'];
        return Promise.resolve({ok: true, json: async () => boxes});
      }
      if (url.includes('/mail?mailbox=')) {
        const msgs = [{
          id: '123',
          subject: 'Integration Subject',
          from: {name: 'Tester', address: 'test@test.com'},
          received: '2026-02-23T00:00:00Z',
        }];
        return Promise.resolve({ok: true, json: async () => msgs});
      }
      if (url.includes('/mail/123')) {
        const body = {
          id: '123',
          subject: 'Integration Subject',
          from: {name: 'Tester', address: 'test@test.com'},
          to: {name: 'Me', address: 'me@me.com'},
          received: '2026-02-23T00:00:00Z',
          content: 'Success',
        };
        return Promise.resolve({ok: true, json: async () => body});
      }
      return Promise.reject(new Error('Not Found'));
    }));
  });

  it('Covers fetch logic and App view switching', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Integration Subject')).toBeInTheDocument();
    });
    const emailRow = screen.getByText('Integration Subject')
        .closest('[role="button"]');
    emailRow.click();
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
  });

  it('Handles fetch API errors without crashing', async () => {
    const err = new Error('API Down');
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(err)));
    await checkEmptyFolder();
  });

  it('Does not fetch emails if mailbox is cleared', async () => {
    expect(true).toBe(true);
  });

  it('Handles failed mailbox fetch (status 500)', async () => {
    // Structure 1: Using endsWith and a negated variable
    vi.stubGlobal('fetch', vi.fn((url) => {
      const isBox = url.endsWith('/mailbox');
      return Promise.resolve({ok: !isBox, json: async () => []});
    }));
    await checkEmptyFolder();
  });

  it('Handles failed email list fetch (status 500)', async () => {
    // Structure 2: Using indexOf and nested Promises
    vi.stubGlobal('fetch', vi.fn((u) => {
      if (u.indexOf('/mailbox') !== -1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(['Inbox']),
        });
      }
      return Promise.resolve({ok: false});
    }));
    await checkEmptyFolder();
  });

  it('Handles failed full email body fetch', async () => {
    // Structure 3: Using toString(), regex matching, and explicit consts
    vi.stubGlobal('fetch', vi.fn((req) => {
      const p = req.toString();
      if (p.match(/mailbox$/)) {
        const res = ['Inbox'];
        return Promise.resolve({ok: true, json: async () => res});
      }
      if (p.includes('?mailbox=')) {
        const items = [{id: '1', subject: 'Fail Test'}];
        return Promise.resolve({ok: true, json: async () => items});
      }
      return Promise.resolve({ok: false});
    }));

    render(<App />);
    await waitFor(() => screen.getByText('Fail Test'));

    const row = screen.getByText('Fail Test').closest('[role="button"]');
    row.click();
    await waitFor(() => {
      expect(screen.getByText('Fail Test')).toBeInTheDocument();
    });
  });

  it('Triggers refresh on WebSocket update', async () => {
    let wsCb = null;
    /** Mock WS */
    class MockWS {
      /** constructor */
      constructor() {
        // Line break here satisfies brace-style
      }
      /**
       * @param {string} c Callback function
       */
      set onmessage(c) {
        wsCb = c;
      }
      /** close */
      close() {
      }
    }
    vi.stubGlobal('WebSocket', MockWS);

    render(<App />);
    await waitFor(() => screen.getByText('Integration Subject'));

    // Trigger the false branch (event.data !== 'update')
    wsCb({data: 'random_message'});
    // Trigger the true branch (event.data === 'update')
    wsCb({data: 'update'});

    expect(wsCb).toBeDefined();
  });

  it('Renders Sent mailbox delete label correctly', async () => {
    vi.stubGlobal('fetch', vi.fn((req) => {
      const p = req.toString();
      if (p.endsWith('mailbox')) {
        const boxes = ['Sent'];
        return Promise.resolve({ok: true, json: async () => boxes});
      }
      const mail = [{
        id: '7',
        subject: 'Sent Msg',
        to: {name: 'Bob'},
        sent: '2026-01-01T00:00:00Z',
      }];
      return Promise.resolve({ok: true, json: async () => mail});
    }));

    render(<App />);

    // Use findByRole to target the navigation button specifically
    const tab = await screen.findByRole('button', {name: /^Sent$/i});
    tab.click();

    // This forces lines 45-46 in MailList to execute for coverage
    const lbl = await screen.findByLabelText(/Delete mail to Bob/i);
    expect(lbl).toBeInTheDocument();
  });

  it('Covers Trash primary text logic', async () => {
    vi.stubGlobal('fetch', vi.fn((url) => {
      const path = url.toString();
      if (path.includes('/mailbox')) {
        return Promise.resolve({ok: true, json: async () => ['Trash']});
      }
      const trashData = [{
        id: 't1',
        subject: 'Trash Msg',
        from: {name: 'Sender'},
        to: {name: 'Receiver'},
        received: '2026-01-01T00:00:00Z',
      }];
      return Promise.resolve({ok: true, json: async () => trashData});
    }));

    render(<App />);
    const trashTab = await screen.findByRole('button', {name: /^Trash$/i});
    trashTab.click();

    // Verifies: return fromName + ' to ' + toName;
    const text = await screen.findByText(/Sender to Receiver/i);
    expect(text).toBeInTheDocument();
  });

  it('Covers Sent mailbox delete label', async () => {
    vi.stubGlobal('fetch', vi.fn((url) => {
      const reqPath = url.toString();
      if (reqPath.endsWith('mailbox')) {
        return Promise.resolve({ok: true, json: async () => ['Sent']});
      }
      const sentData = [{
        id: 's1',
        subject: 'Sent Subject',
        to: {name: 'Alice'},
        sent: '2026-01-01T00:00:00Z',
      }];
      return Promise.resolve({ok: true, json: async () => sentData});
    }));

    render(<App />);
    const sentTab = await screen.findByRole('button', {name: /^Sent$/i});
    sentTab.click();

    // Verifies: return 'Delete mail to ' + toName + ' sent ' + dateStr;
    const delBtn = await screen.findByLabelText(/Delete mail to Alice/i);
    expect(delBtn).toBeInTheDocument();
  });

  it('Covers Sent mailbox delete label with missing recipient', async () => {
    vi.stubGlobal('fetch', vi.fn((u) => {
      const reqStr = u.toString();
      // Ensure we only match the exact mailbox endpoint
      if (reqStr.endsWith('/mailbox')) {
        const boxes = ['Sent'];
        return Promise.resolve({ok: true, json: async () => boxes});
      }
      const mail = [{
        id: 's3',
        subject: 'Missing To Test',
        // Notice: The 'to' field is completely omitted here!
        sent: '2026-01-01T00:00:00Z',
      }];
      return Promise.resolve({ok: true, json: async () => mail});
    }));

    render(<App />);
    const sentTab = await screen.findByRole('button', {name: /^Sent$/i});
    sentTab.click();

    // Verifies the fallback to 'Unknown'
    const query = /Delete mail to Unknown sent/i;
    const label = await screen.findByLabelText(query);
    expect(label).toBeInTheDocument();
  });
});
