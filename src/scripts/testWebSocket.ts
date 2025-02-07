import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
  console.log('Connected to WebSocket server');
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  console.log('Received update:', message);
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

// Keep the connection alive
process.on('SIGINT', () => {
  ws.close();
  process.exit();
}); 