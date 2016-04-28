var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var waw = require('./game/worms-at-war');

app.use(express.static(__dirname + '/public'));

server.listen(3000, function() {
	console.log("Socket listening on port 3000");
});

//////////////////////////////////////////////////////

waw.start(io);