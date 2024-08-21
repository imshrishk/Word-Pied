// In a file like `pages/api/websocket.js`
import { WebSocketServer } from 'ws';

export default function handler(req, res) {
  if (res.socket.server.wss) {
    res.end();
    return;
  }

  const wss = new WebSocketServer({ noServer: true });

  res.socket.server.wss = wss;

  req.socket.server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
      // Broadcast to all clients
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === client.OPEN) {
          client.send(message.toString());
        }
      });
    });

    ws.on('close', () => console.log('Client disconnected'));
  });

  res.end();
}