// gameplay.ts

import { ChessBoard, AllPieces, Pawn, King } from './chessboard';


class ChessGame {
    private board: ChessBoard;
    private currentTurn: 'white' | 'black';
    private chessPlayers: {
        white : WebSocket,
        black : WebSocket
    };
    private whiteKing: King;
    private blackKing: King;
    private gameOver: boolean;

    constructor(players: [WebSocket, WebSocket]) {
        this.board = new ChessBoard();
        this.board.initialize();
        this.currentTurn = 'white';

        this.chessPlayers = this.playerCoinToss(players)
        this.whiteKing = this.board.getPiece([7, 4]) as King;
        this.blackKing = this.board.getPiece([0, 4]) as King;

        // Initially disable gameplay
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

    // Start game
    startGame() {
        // Enable gameplay
        this.gameOver = false;

        const currentTurnPlayer = this.chessPlayers[this.currentTurn];
        const otherPlayerColor = this.currentTurn === 'white' ? 'black' : 'white';
        const otherTurnPlayer = this.chessPlayers[otherPlayerColor];

        currentTurnPlayer.send('- You are White. Your pieces are at the bottom of the board.');
        currentTurnPlayer.send('\n' + this.displayBoard('white') + '\n');
        currentTurnPlayer.send('- Your turn.');
        otherTurnPlayer.send('- You are Black. Your pieces are at the bottom of the board.');
        otherTurnPlayer.send('\n' + this.displayBoard('black') + '\n');
        otherTurnPlayer.send('- Please wait while White makes their turn.');
    }

    stopGame() {
        this.gameOver = true;
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
        if (!gameOver || losingColor === null) {
            currentTurnPlayer.send('- Your turn.\n');
            otherTurnPlayer.send('- Please wait while ' + this.currentTurn[0].toUpperCase() + 
                this.currentTurn.slice(1) + ' makes their turn.\n');
        } else {
            const winningColor = losingColor === 'white' ? 'black' : 'white';
            this.chessPlayers[winningColor].send('- You win.');
            this.chessPlayers[losingColor].send('- You lose.');

            this.gameOver = true;
        }
    }

    getCurrentTurnPlayer() {
        return this.chessPlayers[this.currentTurn];
    }

    getBoard() {
        return this.board;
    }

    // Method to print the current board state
    displayBoard(playerColor: string = 'white') {
        const rotate = (playerColor === "black");
        return this.board.printBoard(rotate);
    }

    getPiece(coord: [number, number]) {
        return this.board.getPiece(coord);
    }

    displayPieceMoves(coord: [number, number]) {
        const piece = this.getPiece(coord);
        if (!piece) return "None"; 
        const possibleMoves = piece.possibleMoves();
        
        let moveList = []
        for (const pm of possibleMoves) {
            const col = pm[0] + 1;
            const row = String.fromCharCode(pm[1] + 'A'.charCodeAt(0));
            moveList.push(`[${row}${col}]`);
        }

        if (!moveList.length) return "None";
        return moveList.join(" ");
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
        // Check if king is checked and the selected piece is not the king
        const king = this.currentTurn === 'white' ? this.whiteKing : this.blackKing;
        if (piece.name !== "King" && this.board.isPositionUnderAttack(king.color, king.position)) {
            return [false, "Your king is checked. You cannot move any other piece."]
        }

        // Check if selected piece can actually move to specified location
        const validMoves = piece.possibleMoves();
        const isValidMove = validMoves.some(([col, row]) => end[0] === col && end[1] === row);
        if (!isValidMove) {
            return [false, "This is not a valid coordinate that this piece can move to."];
        }
    
        return [true, "Valid move."]
    }

    // Check if either King is checkmated
    private checkWinCondition(): [boolean, 'white' | 'black' | null] {
        const kings = [this.whiteKing, this.blackKing];
        kings.forEach((k) => {
            if (!k.possibleMoves().length && this.board.isPositionUnderAttack(k.color, k.position)) {
                return [true, k.color];
            }
        });
        return [false, null];
    }
}

export = ChessGame ;