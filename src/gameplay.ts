// gameplay.ts

import { ChessBoard, AllPieces, Pawn, King } from './chessboard';


class ChessGame {
    private board: ChessBoard;
    private currentTurn: 'white' | 'black';
    private chessPlayers: {
        white : WebSocket,
        black : WebSocket
    };
    private chessPlayerKings: {
        white : King,
        black: King
    }
    private gameOver: boolean;

    constructor(players: [WebSocket, WebSocket]) {
        this.board = new ChessBoard();
        this.board.initialize();
        this.currentTurn = 'white';

        this.chessPlayers = this.playerCoinToss(players)
        this.chessPlayerKings = {
            white : (this.board.getPiece([7, 4]) as King),
            black : (this.board.getPiece([0, 4]) as King)
        }

        this.gameOver = true;
    }

    private playerCoinToss(players: [WebSocket, WebSocket]) {
        // Cointoss to assign who starts first
        const coinToss = Math.random();
        return {
            'white' : coinToss < 0.5 ? players[0] : players[1],
            'black' : coinToss < 0.5 ? players[1] : players[0]    
        }
    }

    getCurrentTurnPlayer() {
        return this.chessPlayers[this.currentTurn];
    }

    // Start game
    startGame() {
        this.gameOver = false;

        const currentTurnPlayer = this.chessPlayers[this.currentTurn];
        const otherPlayerColor = this.currentTurn === 'white' ? 'black' : 'white';
        const otherTurnPlayer = this.chessPlayers[otherPlayerColor];

        currentTurnPlayer.send('\nYou are White. Your pieces are at the bottom of the board.');
        currentTurnPlayer.send(this.displayBoard('white'))
        currentTurnPlayer.send('Your turn.\n');
        otherTurnPlayer.send('\nYou are Black. Your pieces are at the bottom of the board.');
        otherTurnPlayer.send(this.displayBoard('black'))
        otherTurnPlayer.send('Please wait while White makes their turn.\n');
    }

    stopGame() {
        this.gameOver = true;
    }

    // Method to print the current board state
    displayBoard(playerColor: string = 'white') {
        const rotate = (playerColor === "black");
        return "\n" + this.board.printBoard(rotate) + "\n";
    }

    // Method to make a move
    movePiece(player: WebSocket, start: [number, number], end: [number, number]) {
        if (this.gameOver) return [false, ""];
        if (player !== this.getCurrentTurnPlayer()) return [false, "It's not currently your turn."];
        // Validate piece selection and movement
        const isValid = this.validateMovement(start, end);
        if (!isValid[0]) return isValid;
    
        this.board.makeMove(start, end);  
        // Type guard function
        function isPawnOrKing(piece: AllPieces): piece is Pawn | King {
            return piece.name === "Pawn" || piece.name === "King";
        }
        // Check if piece is a pawn or king, adjust hasMoved flag if it is
        let piece = this.board.getPiece(end);
        if (piece && isPawnOrKing(piece)) {
            piece.hasMoved = true;
        }
        return [true, "Successfully made move."];
    }

    // Validate piece movement details
    private validateMovement(start: [number, number], end: [number, number]) {
        // Check if start and end coordinates fall within board constraints
        if (start[0] < 0 || end[0] < 0 || start[1] < 0 || end[1] < 0 ||
            start[0] > 7 || end[0] > 7 || start[1] > 7 || end[1] > 7) {
            return [false, "Invalid coordinates. Coordinates must fall within chessboard 8x8 dimensions."];
        }
    
        const piece = this.board.getPiece(start);
        // Check if selected coordinate has a piece on it
        if (!piece) {
            return [false, "You must choose a coordinate with a piece on it."]; 
        }
        // Check if selected piece belongs to current turn player
        if (piece.color !== this.currentTurn) {
            return [false, "You can only select a piece if it belongs to you."]; 
        }
    

        // Check if selected piece can actually move to specified location
        const validMoves = piece.possibleMoves();
        const isValidMove = validMoves.some(([col, row]) => end[0] === col && end[1] === row);
        if (!isValidMove) {
            return [false, "This is not a valid coordinate that this piece can move to."];
        }
    
        return [true, "Valid move."]
    }

    private checkWinCondition(): [boolean, 'white' | 'black' | null] {
        for (const [color, king] of Object.entries(this.chessPlayerKings)) {
            if (!king.possibleMoves().length && this.board.isPositionUnderAttack(king.color, king.position)) {
                return [true, color as 'white' | 'black'];
            }
        }
        return [false, null];
    }
    
    // Handle the turn cycle from player to player
    endTurn() {
        Object.entries(this.chessPlayers).forEach(([color, player]) => {
            player.send(this.displayBoard(color));
        });
        console.log(this.displayBoard());
    
        this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
        const currentTurnPlayer = this.chessPlayers[this.currentTurn];
        const otherPlayerColor = this.currentTurn === 'white' ? 'black' : 'white';
        const otherTurnPlayer = this.chessPlayers[otherPlayerColor];
    
        let [gameOver, losingColor] = this.checkWinCondition();
        if (!gameOver) {
            currentTurnPlayer.send('Your turn.\n');
            otherTurnPlayer.send('Please wait while ' + this.currentTurn[0].toUpperCase() + 
                this.currentTurn.slice(1) + ' makes their turn.\n');
        } else {
            if (losingColor === null) {
                // Handle the case where there's no losing color, if necessary
                return;
            }
            const winningColor = losingColor === 'white' ? 'black' : 'white';
            this.chessPlayers[winningColor].send('You win.');
            this.chessPlayers[losingColor].send('You lose.');

            this.gameOver = true;
        }
    }
}

export = ChessGame ;