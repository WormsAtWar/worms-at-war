var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var Vector = require('v2d');

app.use(express.static(__dirname + '/public'));

server.listen(process.env.PORT || 3000, function() {
	console.log("Socket listening on port %d ", this.address().port);
});

/*------------------------------------------*/
/*------------------ GAME ------------------*/
/*------------------------------------------*/

var playerID = 0;
var players = new Array();

io.sockets.on('connection', function(socket) {

	bindEvents();
	
	var myID;

	////////////// Movement variables //////////////
	var polarVelocity = {r: 100, w: 0};
	var angularVelocity = Math.PI * 1;
	var destinyDirection = Vector.unit(Vector(1,1));
	////////////////////////////////////////////////


	//////////////// Events Handlers ////////////////

	function bindEvents() {
		socket.on('playerLogin', onPlayerLogin);
		socket.on('playerUpdate', onPlayerUpdate);
		socket.on('disconnect', onDisconnect);
	}


	function onPlayerLogin(nickname) {
		var player = {
			id: playerID,
			nickname: nickname == null ? '' : nickname,
			x: 0,
			y: 0,
			headRotation: 0, // degrees
			lastUpdate: null,
			delta: null
		};

		myID = playerID;

		socket.emit('loginSuccess', { player: player, currentPlayers: players });

		players[myID] = player;

		socket.broadcast.emit('newPlayerLogin', players[myID]);

		playerID++;
	}


	function onPlayerUpdate(state) {
		var now = Date.now();
		var then = players[myID].lastUpdate == null ? Date.now() : players[myID].lastUpdate;
		var delta = (now - then) / 1000;

		updateDestiny(state);
		updateVelocity(delta);
		updatePosition(delta);
		updateHeadRotation();

		players[myID].lastUpdate = now;
		players[myID].delta = delta;

		var playerUpdated = players[myID];

		socket.emit('playerUpdated', { player: playerUpdated, itsMe: true });
		socket.broadcast.emit('playerUpdated', { player: playerUpdated, itsMe: false });
	}

	function onDisconnect(data) {
		players.splice(myID, 1, null);
		io.sockets.emit('playerDisconnect', myID);
	}

	/////////////////////////////////////////////////



	function updateDestiny(state) {
		destinyDirection = Vector.unit(Vector.dif(mousePosition(state), currentPosition()));
	}

	function updateVelocity(delta) {
		var theta = polarVelocity.w;

		if(!correctDirection()) {
			var correctAngle = Vector.toPolar(destinyDirection).w;

			var distanceBySum;                           ; 
			var distanceBySub;

			// calcula distancia entre theta y correcAngle, por suma y por resta
			if(theta >= correctAngle) {
				// -PI--------ca---|-----t-------PI //
				distanceBySub = Math.abs(theta - correctAngle);
				distanceBySum = Math.abs(correctAngle - (-Math.PI)) + Math.abs(Math.PI - theta); 
			} else {
				// -PI-----t-------|-------ca-----PI //
				distanceBySub = Math.abs(theta - (-Math.PI)) + Math.abs(Math.PI - correctAngle);
				distanceBySum = Math.abs(correctAngle - theta);
			}

			if(distanceBySum <= distanceBySub) {
				theta += angularVelocity * delta;
			} else {
				theta -= angularVelocity * delta;
			}

			theta = setAngle(theta);
		}
		
		polarVelocity = {r: polarVelocity.r, w: theta};
	}

	function updatePosition(delta) {
		var cartesianPosition = Vector.sum(currentPosition(), currentVelocity(delta));

		players[myID].x = cartesianPosition.x;
		players[myID].y = cartesianPosition.y;
	}

	function updateHeadRotation(delta) {
		var angleRadians = polarVelocity.w;

		players[myID].headRotation = angleRadians * (180 / Math.PI);
	}

	function mousePosition(state) {
		return Vector(state.mouseX, state.mouseY);
	}

	function currentPosition() {
		return Vector(players[myID].x, players[myID].y);
	}

	function currentVelocity(delta) {
		return Vector.scl(Vector.fromPolar(polarVelocity), delta);
	}

	function currentDirection() {
		return Vector.fromPolar(Vector(1, polarVelocity.r));
	}

	function correctDirection() {
		var distance = Vector.len(Vector.dif(destinyDirection, currentDirection()));
		return distance < 0.0001;
	}

	function setAngle(angle) {
		angle = angle > Math.PI ? angle - 2 * Math.PI : angle;
		angle = angle < -Math.PI ? angle + 2 * Math.PI : angle; 
		return angle;
	}

});