// client.js
const WebSocket = require('ws');
const readline = require('readline');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
  console.log('Connected to the server.');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('line', (input) => {
    ws.send(input);
  });
});

ws.on('message', (message) => {
  console.log(`${message}`);
});

ws.on('close', () => {
  console.log('Disconnected from the server.');
});

ws.on('error', (error) => {
  console.error(`WebSocket error: ${error}`);
});
