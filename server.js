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
    ws.close(1000, '- Server is full. Please try again later.');
    return;
  } else {
    connectedClients.push(ws);
    console.log('New client connected. Number of connected clients:', connectedClients.length);
    ws.send('- Welcome to the WebSocket Chess server!');

    if (connectedClients.length < MAX_CLIENTS) {
      sendToClients("- Waiting on additional player(s) to start game...");
    } else {
      sendToClients("- All players connected. Game can now begin.");
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
    sendToClients('- Other player has forfeited and disconnected. Please wait for another player.')
  });

  ws.on('message', (message) => {
    const input = String(`${message}`)
    console.log('Received: ', input);

    // Regular expression to match the 'help' input
    const helpRegex = /help/i;
    // Regular expression to match the coordinate format "2a" or "describe 2a"
    const describePieceRegex = /describe\s([A-Ha-h])(\d+)/i;
    // Regular expression to match the move piece coordinate format "2A to 4A"
    const movePieceRegex = /^([A-Ha-h])(\d+) to ([A-Ha-h])(\d+)$/;

    switch (true) {
      case helpRegex.test(input):
        handleHelp(ws);
        break;
      case describePieceRegex.test(input):
        handleDescribePiece(ws, describePieceRegex, input);
        break;
      case movePieceRegex.test(input):
        handleMovePiece(ws, movePieceRegex, input);
        break;
      default:
        ws.send("- Input not recognized. Type 'help' you need instructions on how to play.")
    }
  });
});

// Shorthand for broadcasting to all clients
function sendToClients(message) {
  connectedClients.forEach((client) => { 
    client.send(message)
  });
}

function handleHelp(ws) {
  const helpMessage = "For instructions on how to play, please go through the README file in the main project directory.";
  ws.send(`\n- ${helpMessage}`);
}

function handleDescribePiece(ws, regex, message) {
  const match = message.match(regex);
  if (!match) throw "Unable to determine piece coordinates."

  const col = match[1].toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0)
  const row = parseInt(match[2], 10) - 1;

  const piece = chessGame.getPiece([row, col]);
  const possibleMoves = chessGame.displayPieceMoves([row, col])

  ws.send("- Piece: " + piece.name);
  ws.send("- Possible Moves: " + possibleMoves);
}

function handleMovePiece(ws, regex, message) {
  const [start, end] = inputToCoordinates(regex, message);
  const success = chessGame.movePiece(ws, start, end);
  if (!success[0]) {
    ws.send("> " + success[1]);
  } else {
    chessGame.endTurn();
  }
}

function inputToCoordinates(regex, message) {
    const match = message.match(regex);
    if (!match) throw "Unable to determine piece coordinates."
  
    // Get coordinates from input
    const startCol = match[1].toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0)
    const startRow = parseInt(match[2], 10) - 1;
    const endCol = match[3].toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
    const endRow = parseInt(match[4], 10) - 1;

    return [
      [startRow, startCol], [endRow, endCol]
    ];
}