var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var waw = require('./game/worms-at-war');

app.use(express.static(__dirname + '/public'));

server.listen(process.env.PORT || 3000, function() {
	console.log("Socket listening on port %d ", this.address().port);
});

//////////////////////////////////////////////////////

waw.start(io);