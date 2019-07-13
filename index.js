const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const chess = require('./chess');

const hostname = 'localhost';
const port = 3000;

const app = express();
app.use(express.static(__dirname));
app.use(bodyParser.json());

let game = new chess.Game();
let colour = chess.WHITE;

app.post('/getPiece', (req, res, next) => {
  let piece = game.board[req.body.row][req.body.col];
  if (piece !== null) {
    res.json({name: piece.constructor.name, colour: (piece.colour === chess.WHITE ? "white" : "black")})
  } else {
    res.json(piece);
  }
});
app.post('/selectMove', (req, res, next) => {
  let playerPieces = game.pieces[colour];

  let piece = playerPieces.find(piece => piece instanceof chess.King);
  let moves = piece.possibleMoves();
  let move = moves.find(move => move === chess.QUEENSIDE || move === chess.KINGSIDE);

  if (move === undefined) {
    while (true) {
      piece = playerPieces[Math.floor(Math.random() * playerPieces.length)];
      moves = piece.possibleMoves();

      if (moves.length > 0) {
          move = moves[Math.floor(Math.random() * moves.length)];
          res.send({from: {row: piece.pos.row, col: piece.pos.col}, to: move});
          return;
      }
    }
  } else {
    if (move === chess.KINGSIDE){
      res.send({from: {row: piece.pos.row, col: piece.pos.col}, to: {row: piece.pos.row, col: piece.pos.col + 2}});
    } else {
      res.send({from: {row: piece.pos.row, col: piece.pos.col}, to: {row: piece.pos.row, col: piece.pos.col - 2}});
    }
  }
});
app.post('/executeMove', (req, res, next) => {
  console.log(req.body);
  try {
    game.tryMove(req.body.move);
  } catch (error) {
    if (error instanceof chess.InvalidMoveError) {
      res.send({error: error.message});
      return;
    } else {
      throw error;
    }
  }
  game.print();
  colour = (colour + 1) % 2;
  if (game.isMate(colour)) {
    res.send({result: (colour === chess.WHITE ? "Black" : "White") + " Wins!"});
    return;
  }
  if (game.isStalemate(colour)) {
    res.send({result: "Stalemate"});
    return;
  }
  if (game.fiftyMoveDraw) {
    res.send({result: "50 Move Draw"});
    return;
  }
  if (game.isRepetition()) {
    res.send({result: "Repetition"});
    return;
  }
  if (game.isInsufficientMaterial()) {
    res.send({result: "Insufficient Material"});
    return;
  }
  res.send({});
});

const server = http.createServer(app);
server.listen(port, hostname, () => {console.log("Express server")});
