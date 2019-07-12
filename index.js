const express = require('express');
const http = require('http');
const bodyParser = require('body-parser')

const hostname = 'localhost';
const port = 3000;

const app = express();
app.use(express.static(__dirname));
app.use(bodyParser.json());

let game = new Game();
let colour = WHITE;

app.post('/getPiece', (req, res, next) => {
   let piece = game.board[req.body.row][req.body.col];
   res.send(piece);
});
app,post('/selectMove', (req, res, next) => {
  let playerPieces = game.pieces[colour];
  let piece, moves, move, from, to;

  while (true) {
    let king = playerPieces.find(piece => piece instanceof King);
    moves = king.possibleMoves();
    let castle = moves.find(moves => move === QUEENSIDE || moves === KINGSIDE);
    if (castle !== undefined) {
        move = castle;
        break;
    }
    piece = playerPieces[Math.floor(Math.random() * playerPieces.length)];
    moves = piece.possibleMoves();

    if (moves.length > 0) {
        move = moves[Math.floor(Math.random() * moves.length)];
        break;
    }
  }

  if (move !== KINGSIDE && move !== QUEENSIDE) {
    move = {from: {row: piece.pos.row, col:piece.pos.col}, to: move};
  }

  res.send(move);
});
app.post('/executeMove', (req, res, next) => {
  try {
    if (req.body.move === KINGSIDE || req.body.move === QUEENSIDE) {
        game.tryCastle(colour, req.body.move);
    } else {
        game.tryMove(req.body.move.from, req.body.move.to);
    }
    colour = (colour + 1) % 2;
  } catch (error) {
    if (error instanceof InvalidMoveError) {
      res.send(error);
    } else {
      throw error;
    }
  }
});

const server = http.createServer(app);
server.listen(port, hostname, () => {console.log("Express server")});
