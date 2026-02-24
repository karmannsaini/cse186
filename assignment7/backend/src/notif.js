import {WebSocketServer} from 'ws';

let wss;

export const initStatus = (server) => {
  wss = new WebSocketServer({server});
};

export const notify = () => {
  if (wss) {
    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // 1 = OPEN
        client.send('update');
      }
    });
  }
};
