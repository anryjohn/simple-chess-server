// chessBoard.ts

// Define the base interface for a ChessPiece
interface ChessPiece {
    name: string;
    symbol: string;
    color: 'white' | 'black';
    position: [number, number]; // Position on the board as (row, column)
    describe(): void;
    possibleMoves(): [number, number][];
}

// Define specific interfaces extending ChessPiece
interface Pawn extends ChessPiece {
    hasMoved: boolean;
}

interface Rook extends ChessPiece {}

interface Knight extends ChessPiece {}

interface Bishop extends ChessPiece {}

interface Queen extends ChessPiece {}

interface King extends ChessPiece {
    hasMoved: boolean;
}

// Create a union type for all chess pieces
type AllPieces = Pawn | Rook | Knight | Bishop | Queen | King;

// Define the interface for a ChessBoard
interface Board {
    board: (AllPieces | null)[][];
    initialize(): void;
    getState(): (AllPieces | null)[][];
    makeMove(start: [number, number], end: [number, number]): boolean;
    printBoard(rotate: boolean): void;
}

// Implement the ChessBoard interface
class ChessBoard implements Board {
    board: (AllPieces | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

    initialize() {
        // Initialize pawns
        for (let i = 0; i < 8; i++) {
            this.board[1][i] = this.createPawn("black", [1, i]);
            this.board[6][i] = this.createPawn("white", [6, i]);
        }

        // Initialize rooks
        this.board[0][0] = this.createRook("black", [0, 0]);
        this.board[0][7] = this.createRook("black", [0, 7]);
        this.board[7][0] = this.createRook("white", [7, 0]);
        this.board[7][7] = this.createRook("white", [7, 7]);

        // Initialize knights
        this.board[0][1] = this.createKnight("black", [0, 1]);
        this.board[0][6] = this.createKnight("black", [0, 6]);
        this.board[7][1] = this.createKnight("white", [7, 1]);
        this.board[7][6] = this.createKnight("white", [7, 6]);

        // Initialize bishops
        this.board[0][2] = this.createBishop("black", [0, 2]);
        this.board[0][5] = this.createBishop("black", [0, 5]);
        this.board[7][2] = this.createBishop("white", [7, 2]);
        this.board[7][5] = this.createBishop("white", [7, 5]);

        // Initialize queens
        this.board[0][3] = this.createQueen("black", [0, 3]);
        this.board[7][3] = this.createQueen("white", [7, 3]);

        // Initialize kings
        this.board[0][4] = this.createKing("black", [0, 4]);
        this.board[7][4] = this.createKing("white", [7, 4]);
    }

    getState() {
        return this.board;
    }

    getPiece(coord: [number, number]) {
        return this.board[coord[0]][coord[1]];
    }

    makeMove(start: [number, number], end: [number, number]): boolean {
        const piece = this.board[start[0]][start[1]];
        if (piece) {
            this.board[end[0]][end[1]] = piece;
            piece.position = end;
            this.board[start[0]][start[1]] = null;
            
            return true;
        }
        return false;
    }

    printBoard(rotate: boolean) {
        let board = "";
        for (let i = 0; i < this.board[0].length; i++) {
            let r = rotate ? this.board[0].length - i -1 : i
            let row = this.board[r];
            let rowString = (r + 1) + "  " + row.map(piece => piece ? piece.symbol : ".").join(" ");
            board += rowString + "\n";
        }
        board += "\n   A B C D E F G H";
        return board;
    }

    // Function to check if a given position is under attack by any opponent pieces
    isPositionUnderAttack(color: 'white' | 'black', position: [number, number]): boolean {
        const [row, col] = position;
        const opponentColor = color === 'white' ? 'black' : 'white';

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color === opponentColor) {
                    const opponentMoves = piece.possibleMoves();
                    for (const move of opponentMoves) {
                        if (move[0] === row && move[1] === col) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    // Helper function for creating pawns
    private createPawn(team: 'white' | 'black', position: [number, number]): Pawn {
        const board = this.board; // Capture the reference to the board

        return { 
            name: "Pawn", 
            symbol: "P",
            color: team, 
            position: position, 
            hasMoved: false, 
            describe: function () { 
                console.log(`${this.color} ${this.name} at (${this.position[0]}, ${this.position[1]})`); 
            }, 
            possibleMoves: function () {
                let moves: [number, number][] = [];
                let direction = this.color === "white" ? -1 : 1;
    
                // Standard move
                if (board[this.position[0] + direction][this.position[1]] === null) {
                    moves.push([this.position[0] + direction, this.position[1]]);
                }
    
                // Double move on first move
                if (!this.hasMoved && board[this.position[0] + 2 * direction][this.position[1]] === null) {
                    moves.push([this.position[0] + 2 * direction, this.position[1]]);
                }
    
                // Capture moves
                const leftCapturePiece = board[this.position[0] + direction][this.position[1] - 1];
                if (leftCapturePiece && leftCapturePiece.color !== this.color) {
                    moves.push([this.position[0] + direction, this.position[1] - 1]);
                }
                const rightCapturePiece = board[this.position[0] + direction][this.position[1] + 1];
                if (rightCapturePiece && rightCapturePiece.color !== this.color) {
                    moves.push([this.position[0] + direction, this.position[1] + 1]);
                }
    
                return moves;
            }
        };
    }

    // Helper function for creating rooks
    private createRook(team: 'white' | 'black', position: [number, number]): Rook {
        const board = this.board; // Capture the reference to the board

        return { 
            name: "Rook", 
            symbol: "R",
            color: team, 
            position: position, 
            describe: function () { 
                console.log(`${this.color} ${this.name} at (${this.position[0]}, ${this.position[1]})`); 
            }, 
            possibleMoves: function () {
                let moves: [number, number][] = [];

                // Helper function to add moves in a direction
                const addMovesInDirection = (dx: number, dy: number) => {
                    for (let i = 1; i < 8; i++) {
                        const newRow = this.position[0] + i * dx;
                        const newCol = this.position[1] + i * dy;

                        // Check if the position is within bounds
                        if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;

                        const piece = board[newRow][newCol];
                        if (piece) {
                            // Stop if we hit a piece, but allow capture if it's an opponent's piece
                            if (piece.color !== this.color) {
                                moves.push([newRow, newCol]);
                            }
                            break;
                        } else {
                            // Add the empty square
                            moves.push([newRow, newCol]);
                        }
                    }
                };

                // Add moves in all four directions
                addMovesInDirection(1, 0); // Down
                addMovesInDirection(-1, 0); // Up
                addMovesInDirection(0, 1); // Right
                addMovesInDirection(0, -1); // Left

                return moves;
            }
        };
    }

    // Helper function for creating knights
    private createKnight(team: 'white' | 'black', position: [number, number]): Knight {
        const board = this.board; // Capture the reference to the board

        return { 
            name: "Knight",
            symbol: "N",
            color: team, 
            position: position, 
            describe: function () { console.log(`${this.color} ${this.name} at (${this.position[0]}, ${this.position[1]})`); }, 
            possibleMoves: function () {
                let moves: [number, number][] = [];
                const potentialMoves = [
                    [this.position[0] + 2, this.position[1] + 1],
                    [this.position[0] + 2, this.position[1] - 1],
                    [this.position[0] - 2, this.position[1] + 1],
                    [this.position[0] - 2, this.position[1] - 1],
                    [this.position[0] + 1, this.position[1] + 2],
                    [this.position[0] + 1, this.position[1] - 2],
                    [this.position[0] - 1, this.position[1] + 2],
                    [this.position[0] - 1, this.position[1] - 2]
                ]

                // Check if moves are valid
                for (const move of potentialMoves) {
                    const [newRow, newCol] = move;

                    // Check if the position is within bounds
                    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                        const piece = board[newRow][newCol];
                        // Check if coordinate is empty or if it is occupied by a piece belonging to the opposing player
                        if (!piece || piece.color !== this.color) {
                            moves.push([newRow, newCol]);
                        }
                    }
                };

                return moves;
            }
        }
    }

    // Helper function for creating bishops
    private createBishop(team: 'white' | 'black', position: [number, number]): Bishop {
        const board = this.board; // Capture the reference to the board

        return { 
            name: "Bishop", 
            symbol: "B",
            color: team, 
            position: position, 
            describe: function () { 
                console.log(`${this.color} ${this.name} at (${this.position[0]}, ${this.position[1]})`); 
            }, 
            possibleMoves: function () {
                let moves: [number, number][] = [];

                // Helper function to add moves in a direction
                const addMovesInDirection = (dx: number, dy: number) => {
                    for (let i = 1; i < 8; i++) {
                        const newRow = this.position[0] + i * dx;
                        const newCol = this.position[1] + i * dy;

                        // Check if the position is within bounds
                        if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;

                        const piece = board[newRow][newCol];
                        if (piece) {
                            // Stop if we hit a piece, but allow capture if it's an opponent's piece
                            if (piece.color !== this.color) {
                                moves.push([newRow, newCol]);
                            }
                            break;
                        } else {
                            // Add the empty square
                            moves.push([newRow, newCol]);
                        }
                    }
                };

                // Add moves in all four diagonal directions
                addMovesInDirection(1, 1);   // Down-Right
                addMovesInDirection(-1, -1); // Up-Left
                addMovesInDirection(1, -1);  // Down-Left
                addMovesInDirection(-1, 1);  // Up-Right

                return moves;
            }
        };
    }

    // Helper function for creating queens
    private createQueen(team: 'white' | 'black', position: [number, number]): Queen {
        const board = this.board; // Capture the reference to the board

        return { 
            name: "Queen", 
            symbol: "Q",
            color: team, 
            position: position, 
            describe: function () { 
                console.log(`${this.color} ${this.name} at (${this.position[0]}, ${this.position[1]})`); 
            }, 
            possibleMoves: function () {
                let moves: [number, number][] = [];

                // Helper function to add moves in a direction
                const addMovesInDirection = (dx: number, dy: number) => {
                    for (let i = 1; i < 8; i++) {
                        const newRow = this.position[0] + i * dx;
                        const newCol = this.position[1] + i * dy;

                        // Check if the position is within bounds
                        if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;

                        const piece = board[newRow][newCol];
                        if (piece) {
                            // Stop if we hit a piece, but allow capture if it's an opponent's piece
                            if (piece.color !== this.color) {
                                moves.push([newRow, newCol]);
                            }
                            break;
                        } else {
                            // Add the empty square
                            moves.push([newRow, newCol]);
                        }
                    }
                };

                // Add moves in all eight directions
                addMovesInDirection(1, 0);   // Down
                addMovesInDirection(-1, 0);  // Up
                addMovesInDirection(0, 1);   // Right
                addMovesInDirection(0, -1);  // Left
                addMovesInDirection(1, 1);   // Down-Right
                addMovesInDirection(-1, -1); // Up-Left
                addMovesInDirection(1, -1);  // Down-Left
                addMovesInDirection(-1, 1);  // Up-Right

                return moves;
            }
        };
    }

    // Helper function for creating kings
    private createKing(team: 'white' | 'black', position: [number, number]): King {
        const board = this.board; // Capture the reference to the board
        const isPositionUnderAttack = this.isPositionUnderAttack.bind(this); // Bind the method

        return { 
            name: "King", 
            symbol: "K",
            color: team, 
            position: position, 
            hasMoved: false, 
            describe: function () { 
                console.log(`${this.color} ${this.name} at (${this.position[0]}, ${this.position[1]})`); 
            }, 
            possibleMoves: function () {
                let moves: [number, number][] = [];
                const potentialMoves = [
                    [this.position[0] + 1, this.position[1]],
                    [this.position[0] - 1, this.position[1]],
                    [this.position[0], this.position[1] + 1],
                    [this.position[0], this.position[1] - 1],
                    [this.position[0] + 1, this.position[1] + 1],
                    [this.position[0] - 1, this.position[1] - 1],
                    [this.position[0] + 1, this.position[1] - 1],
                    [this.position[0] - 1, this.position[1] + 1]
                ];

                for (const move of potentialMoves) {
                    const [newRow, newCol] = move;

                    // Check if the position is within bounds
                    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                        const piece = board[newRow][newCol];
                        if (!piece || piece.color !== this.color) {
                            // Temporarily move the king to the new position
                            const originalPosition = this.position;
                            this.position = [newRow, newCol];

                            // Check if the new position puts the king in check
                            const isSafe = !isPositionUnderAttack(this.color, [newRow, newCol]);

                            // Revert the king's position
                            this.position = originalPosition;

                            if (isSafe) {
                                moves.push([newRow, newCol]);
                            }
                        }
                    }
                }

                return moves;
            }
        };
    }
}

export { ChessBoard, Board, ChessPiece, AllPieces, Pawn, King };