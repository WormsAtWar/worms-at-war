var clientId = 0;
var players = new Array();

exports.start = function(io) {
	
	io.sockets.on('connection', function (socket) {
		var thisClientId;
		
		newStart();
		bindEvents();
	
		function newStart() {
			socket.emit('newStart', { id: clientId, nickname: '', x: 0, y: 0, currentPlayers: players });

			socket.broadcast.emit('newOpponent', { id: clientId, nickname: '', x: 0, y: 0 });
			
			players[clientId] = { id: clientId, nickname: '', x: 0, y: 0 };

			thisClientId = clientId;
			
			clientId++;
		}

		function bindEvents() {
			socket.on('updatePosition', onUpdatePosition);
			socket.on('disconnect', onDisconnect);
		}

		function onDisconnect(data) {
			var id = thisClientId;
			players.splice(id, 1, undefined);
			//console.log('player ' + id + ' disconnected')
			io.sockets.emit('removePlayer', { id: id });
		}

		function onUpdatePosition(data) {
			players[data.id] = data;
			io.sockets.emit('playerUpdatedPosition', data);
		}

	});

}