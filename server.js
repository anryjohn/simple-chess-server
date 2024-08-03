// server.js
const WebSocket = require('ws');
const fs = require('fs');
const ChessGame = require('./dist/gameplay')

const wss = new WebSocket.Server({ port: 8080 });
const MAX_CLIENTS = 2;
let connectedClients = [];
let chessGame;


console.log('WebSocket server is running on ws://localhost:8080');

wss.on('connection', (ws, req) => {
  if (connectedClients.length >= MAX_CLIENTS) {
    ws.close(1000, 'Server is full. Please try again later.');
    return;
  } else {
    connectedClients.push(ws);
    console.log('New client connected. Number of connected clients:', connectedClients.length);
    ws.send('Welcome to the WebSocket Chess server!');

    if (connectedClients.length < MAX_CLIENTS) {
      sendToClients("Waiting on additional player(s) to start game...");
    } else {
      sendToClients("All players connected. Game can now begin.");
      chessGame = new ChessGame(connectedClients);
      chessGame.startGame();
    }
  }
  
  ws.on('close', () => {
    chessGame.stopGame();
    let tempConnClients = [];
    while(connectedClients.length > 0) {
      let popClient = connectedClients.pop();
      if (popClient !== ws) tempConnClients.push(popClient);
    }

    connectedClients = tempConnClients;
    console.log('Client disconnected. Total clients:', connectedClients.length);
    sendToClients('Other player has forfeited and disconnected. Please wait for another player.')
  });

  ws.on('message', (message) => {
    const input = String(`${message}`)
    console.log('Received: ', input);

    const [start, end] = inputToCoordinates(input);
    const success = chessGame.movePiece(ws, start, end);

    if (!success[0]) ws.send(success[1]);
    else chessGame.endTurn();
  });
});

// Shorthand for broadcasting to all clients
function sendToClients(message) {
  connectedClients.forEach((client) => { 
    client.send(message)
  });
}

function inputToCoordinates(message) {
    // Regular expression to match the coordinate format "2A to 4A"
    const regex = /^([A-Za-z])(\d+) to ([A-Za-z])(\d+)$/;
    const match = message.match(regex);
  
    if (!match) {
      return [false, "Invalid input format. Expected format is '[A-H][1-8] to [A-H][1-8]'."];
    }
  
    // Get coordinates from input
    const startCol = match[1].toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0)
    const startRow = parseInt(match[2], 10) - 1;
    const endCol = match[3].toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
    const endRow = parseInt(match[4], 10) - 1;

    return [
      [startRow, startCol], [endRow, endCol]
    ];
}