const express = require('express');
const http = require('http');

const hostname = 'localhost';
const port = 3000;

const app = express();

//app.use(express.json());
app.use(express.static(__dirname));

const server = http.createServer(app);
server.listen(port, hostname, () => {console.log("Express server")});
