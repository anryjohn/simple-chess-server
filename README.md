# Getting Started
To start the server, enter

    npm run startServer

The above statement compiles and translates typescript code in this repo into javascript before starting the server.
Alternatively, if you want to run two processes separately, enter

    npx tsc
    node server.js

To start the client, enter
    
    npm run startClient

Alternative
    
    node client.js

# Commands
The game board will be displayed in the terminal in the following format:

    1  R N B Q K B N R
    2  P P P P P P P P
    3  . . . . . . . .
    4  . . . . . . . .
    5  . . . . . . . .
    6  . . . . . . . .
    7  P P P P P P P P
    8  R N B Q K B N R

       A B C D E F G H

To move a piece, select a start coordinate and an end coordinate. Inputs should match the format of the following example:

    A2 to A4
    d4 to e5

To get a description of a piece at a given coordinate, the input should match the format of the following:

    describe b6
    
# How To Play Chess

## Objective

The objective of chess is to checkmate your opponent's king, which means the king is in a position to be captured ("in check") and there is no legal move to escape the threat.

### The Board

    Chess is played on an 8x8 grid of squares, alternating in color (typically black and white).
    Each player starts with 16 pieces: 1 king, 1 queen, 2 rooks, 2 knights, 2 bishops, and 8 pawns.

### Setup

    The board is positioned with a white square at the bottom-right corner.
    Each player places their pieces on the two rows closest to them.
    The second row from each player is filled with pawns.
    The first row (nearest the player) from left to right is: rook, knight, bishop, queen, king, bishop, knight, rook.
    White pieces are placed at the bottom and black pieces at the top.

### How Pieces Move

    You can move your pieces during your turn by typing in the coordinate of the piece you want to move
    to the coordinate you want to move said piece to. For example, "A2 to A4" or "B5 to G5". The ways in which 
    pieces can move are explained below:
    
    King (K): Moves one square in any direction (horizontally, vertically, or diagonally).
    Queen (Q): Moves any number of squares in any direction.
    Rook (R): Moves any number of squares horizontally or vertically.
    Bishop (B): Moves any number of squares diagonally.
    Knight (N): Moves in an "L" shape: two squares in one direction and then one square perpendicular. Knights can jump over other pieces.
    Pawn (P): Moves forward one square. On its first move, a pawn can move forward two squares. Pawns capture diagonally.

### Special Moves (THESE ARE CURRENTLY NOT SUPPORTED)

    Castling: A move involving the king and a rook. The king moves two squares towards a rook, and the rook moves to the square over which the king crossed. Conditions:
        Neither the king nor the rook has previously moved.
        No pieces between the king and the rook.
        The king is not in check, does not move through check, and does not end up in check.

    En Passant: A pawn capturing move. When a pawn moves two squares forward from its starting position and lands beside an opponent's pawn, the opponent's pawn can capture it as if it moved one square forward. This must be done immediately on the next move.

    Promotion: When a pawn reaches the farthest row from its starting position, it is promoted to a queen, rook, bishop, or knight of the same color. The choice is not limited to previously captured pieces.

### Check and Checkmate

    Check: A king is in check if it is under threat of capture on the opponent's next move. A player must move out of check on their turn.
    Checkmate: The king is in check and there is no legal move to escape the threat. The player whose king is checkmated loses the game.

### Draws

    Stalemate: The player whose turn it is to move has no legal moves and their king is not in check.
    Insufficient Material: Neither player has enough pieces to force a checkmate (e.g., king vs. king, king and bishop vs. king, etc.).
    Threefold Repetition: The same board position occurs three times with the same player to move.
    Fifty-move Rule: Fifty moves have been played by each side without any pawn movement or capture.

### Starting the Game

    White always moves first.
    Players alternate turns, moving one piece per turn.