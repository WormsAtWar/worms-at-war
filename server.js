var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Vector = require('v2d');

var Worm = require('./model/worm');
var Food = require('./model/food');

app.use(express.static(__dirname + '/public'));

server.listen(process.env.PORT || 3000, function() {
	console.log("Socket listening on port %d ", this.address().port);
});


/*------------------------------------------*/
/*------------------ GAME ------------------*/
/*------------------------------------------*/

var wormID = 0;
var worms = new Array();

var foodMax = 20;
var foods = new Array();
 
createFood();

function createFood() {
	for(id = 0; id < foodMax; id++) {
		var randomX = Math.random() * 1000;
		var randomY = Math.random() * 600;

		foods[id] = new Food(id, randomX, randomY);
	}
}

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
		socket.on('wormLogin', onWormLogin);
		socket.on('wormUpdate', onWormUpdate);
		socket.on('disconnect', onDisconnect);
	}


	function onWormLogin(nickname) {
		var worm = new Worm(wormID, nickname, 0, 0);

		myID = wormID;

		socket.emit('loginSuccess', { worm: worm, otherWorms: worms, foods: foods });

		worms[myID] = worm;

		socket.broadcast.emit('newWormLogin', worms[myID]);

		wormID++;
	}


	function onWormUpdate(state) {
		var now = Date.now();
		var then = worms[myID].lastUpdate == null ? Date.now() : worms[myID].lastUpdate;
		var delta = (now - then) / 1000;

		updateDestiny(state);
		updateVelocity(delta);
		updatePosition(delta);
		updateHeadRotation();
		detectCollisions();

		worms[myID].lastUpdate = now;

		var wormUpdated = worms[myID];

		socket.emit('wormUpdated', wormUpdated);
		socket.broadcast.emit('otherWormUpdated', wormUpdated);
	}

	function onDisconnect(data) {
		worms.splice(myID, 1, null);
		io.sockets.emit('otherWormDisconnect', myID);
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

		worms[myID].moveTo(cartesianPosition.x, cartesianPosition.y);
		worms[myID].boundary.x = cartesianPosition.x;
		worms[myID].boundary.y = cartesianPosition.y;
	}

	function updateHeadRotation(delta) {
		var angleRadians = polarVelocity.w;

		worms[myID].lookTo(angleRadians * (180 / Math.PI));
	}

	function detectCollisions() {
		for(id in foods) {
			var food = foods[id];
			if(food != null) {
				if(worms[myID].boundary.collide(food.boundary)) {
					worms[myID].eat(food);
					io.sockets.emit('foodSwallowed', food.id);
					foods.splice(food.id, 1, null);
				}
			}
		}
	}

	function mousePosition(state) {
		return Vector(state.mouseX, state.mouseY);
	}

	function currentPosition() {
		return Vector(worms[myID].x, worms[myID].y);
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