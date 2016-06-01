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

var foodMax = 30;
var foodCount = 0;
var foods = new Array();
 
createFood();
setInterval(supplyFood, 3000);

function createFood() {
	for(id = 0; id < foodMax; id++) {
		var randomX = (Math.random() * 990) + 5;
		var randomY = (Math.random() * 590) + 5;
		foods[id] = new Food(id, randomX, randomY);
		foodCount++;
	}
}

function supplyFood() {
	if(foodCount < foodMax) {
		var randomX = (Math.random() * 990) + 5;
		var randomY = (Math.random() * 590) + 5;
		var food = new Food(foods.length, randomX, randomY);

		foods[food.id] = food;
		io.sockets.emit('suppliedFood', food);
		foodCount++;
	}
}

setInterval(updateLeader, 5000);

function updateLeader() {
	var leader = getLeader();
	io.sockets.emit('updateLeader', leader);
}

function getLeader() {
	var leader;

	for(id in worms) {
		var eachWorm = worms[id];
		if(eachWorm != null) {
			if(leader != null) {
			    if(eachWorm.score > leader.score) {
			    	leader = eachWorm;
			    }
			} else {
				leader = eachWorm;
			}
		}
	}

	return leader;
}

io.sockets.on('connection', function(socket) {

	bindEvents();
	
	var myID;

	////////////// Movement variables //////////////
	var polarVelocity = {r: 100, w: 0};
	var angularVelocity = Math.PI * 1;
	var destinyDirection = Vector.unit(Vector(1,1));
	////////////////////////////////////////////////


	var gameLoopID;

	function gameLoop() {
		var now = Date.now();
		var then = worms[myID].lastUpdate == null ? Date.now() : worms[myID].lastUpdate;
		var delta = (now - then) / 1000;

		updateVelocity(delta);
		updatePosition(delta);
		updateHeadRotation();
		detectCollisions();

		worms[myID].lastUpdate = now;

		var wormUpdated = worms[myID];

		socket.emit('wormUpdated', wormUpdated);
		socket.broadcast.emit('otherWormUpdated', wormUpdated);
	}


	//////////////// Events Handlers ////////////////
	function bindEvents() {
		socket.on('wormLogin', onWormLogin);
		socket.on('destinyUpdate', onDestinyUpdate);
		socket.on('speedUp', onSpeedUp);
		socket.on('slowDown', onSlowDown);
		socket.on('disconnect', onDisconnect);
	}


	function onWormLogin(nickname) {
		var worm = new Worm(wormID, nickname);

		myID = wormID;

		socket.emit('loginSuccess', { worm: worm, otherWorms: worms, foods: foods });

		worms[myID] = worm;

		socket.broadcast.emit('newWormLogin', worms[myID]);

		wormID++;

		gameLoopID = setInterval(gameLoop, 1000/60);
	}

	function onDestinyUpdate(state) {
		updateDestiny(state);
	}

	function onSpeedUp(data) {
		polarVelocity = {r: 180, w: polarVelocity.w}; // speed * 1.8
		angularVelocity -= angularVelocity / 4; // less mobility on turns
	}

	function onSlowDown(data) {
		polarVelocity = {r: 100, w: polarVelocity.w};
		angularVelocity = Math.PI * 1;
	}

	function onDisconnect(data) {
		clearInterval(gameLoopID);
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
	}

	function updateHeadRotation(delta) {
		var angleRadians = polarVelocity.w;

		worms[myID].lookTo(angleRadians * (180 / Math.PI));
	}

	function detectCollisions() {
		detectFoodCollisions();
		detectWormsCollisions();
	}

	function detectFoodCollisions() {
		for(id in foods) {
			var food = foods[id];
			if(food != null) {
				if(worms[myID].collideFood(food)) {
					worms[myID].eat(food);
					io.sockets.emit('foodSwallowed', food.id);
					foods.splice(food.id, 1, null);
					foodCount--;
				}
			}
		}
	}

	function detectWormsCollisions() {
		for(id in worms) {
			var worm = worms[id];
			if(worm != null) {
				if(worms[myID].collideHeadToBody(worm)) {
					console.log("worm " + worms[myID].nickname + " is death :(");
					socket.emit("dead", null);
				}
			}
		}
	}

	function mousePosition(state) {
		return Vector(state.mouseX, state.mouseY);
	}

	function currentPosition() {
		return Vector(worms[myID].segments[0].x, worms[myID].segments[0].y);
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