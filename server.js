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

var foodMax = 300;

var foodCount = 0;
var foods = new Array();
 
createFood();
setInterval(supplyFood, 3000);

function createFood() {
	for(id = 0; id < foodMax; id++) {
		var randomX = (Math.random() * 3980) + 10;
		var randomY = (Math.random() * 3980) + 10;
		foods[id] = new Food(id, randomX, randomY, null, null, true);
		foodCount++;
	}
}

function supplyFood() {
	if(foodCount < foodMax) {
		var randomX = (Math.random() * 3980) + 10;
		var randomY = (Math.random() * 3980) + 10;
		supplyFoodOn(randomX, randomY, null, true, null);
	}
}

function supplyFoodOn(x, y, color, autoGenerated, points) {
	var food = new Food(foods.length, x, y, color, points, autoGenerated);
	foods[food.id] = food;
	io.sockets.emit('suppliedFood', food);
	if(food.autoGenerated) {
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

setInterval(updateWanted, 5000);

function updateWanted() {
	var wanted = getWanted();
	io.sockets.emit('updateWanted', wanted);
}

function getWanted() {
	var wanted;

	for(id in worms) {
		var eachWorm = worms[id];
		if(eachWorm != null && eachWorm.kills > 0) {
			if(wanted != null) {
			    if(eachWorm.kills > wanted.kills) {
			    	wanted = eachWorm;
			    }
			} else {
				wanted = eachWorm;
			}
		}
	}

	return wanted;
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
	var nitroLoopID;

	function gameLoop() {
		var now = Date.now();
		var then = worms[myID].lastUpdate == null ? Date.now() : worms[myID].lastUpdate;
		var delta = (now - then) / 1000;
		
		worms[myID].lastUpdate = now;
		
		updateVelocity(delta);
		updatePosition(delta);
		updateHeadRotation();
		detectCollisions();

		var wormUpdated = worms[myID];

		if(wormUpdated != null) {
			socket.emit('wormUpdated', wormUpdated);
			socket.broadcast.emit('otherWormUpdated', wormUpdated);
		}
	}

	function nitroLoop() {
		if(worms[myID].score >= 5) {
			worms[myID].nitro();
			supplyFoodOn(worms[myID].tail().x, worms[myID].tail().y, worms[myID].color, null, 5);
		} else {
			onSlowDown();
			clearInterval(nitroLoopID);
		}
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

		gameLoopID = setInterval(gameLoop, 1000/20);
	}

	function onDestinyUpdate(state) {
		updateDestiny(state);
	}

	function onSpeedUp(data) {
		if(worms[myID].score >= 5) {
			polarVelocity = {r: 180, w: polarVelocity.w}; // speed * 1.8
			angularVelocity -= angularVelocity / 4; // less mobility on turns
			nitroLoopID = setInterval(nitroLoop, 1000/4);
		}
	}

	function onSlowDown(data) {
		polarVelocity = {r: 100, w: polarVelocity.w};
		angularVelocity = Math.PI * 1;
		clearInterval(nitroLoopID);
	}

	function onDisconnect(data) {
		clearInterval(gameLoopID);
		clearInterval(nitroLoopID);
		worms.splice(myID, 1, null);
		io.sockets.emit('otherWormDisconnect', myID);
	}
	/////////////////////////////////////////////////


	function updateDestiny(state) {
		destinyDirection = Vector.unit(Vector.dif(mousePosition(state), centeredPosition()));
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
		if(mustDead()) {
			dropFoodByDead();
			socket.emit("dead", worms[myID].score);
			socket.disconnect();
		}
	}

	function detectFoodCollisions() {
		for(id in foods) {
			var food = foods[id];
			if(food != null) {
				if(worms[myID].collideFood(food)) {
					worms[myID].eat(food);
					io.sockets.emit('foodSwallowed', food.id);
					foods.splice(food.id, 1, null);
					if(food.autoGenerated) {
						foodCount--;
					}

				}
			}
		}
	}

	function mustDead() {
		return detectWormsCollisions() || detectBordersCollisions();
	}

	function detectWormsCollisions() {
		var collision = false;

		for(id in worms) {
			var worm = worms[id];
			if(worm != null) {
				collision = collision || worms[myID].collideHeadToBody(worm);		
			}
			if(collision && itsMostWanted(worms[myID])) {
				worm.collectBounty(worms[myID]);
				io.sockets.emit('wantedDead', null);
				break;
			}
		}

		return collision;
	}

	function itsMostWanted(worm) {
		var wanted = getWanted();
		return wanted != null ? worm.id == wanted.id : false;
	}

	function detectBordersCollisions() {
		return worms[myID].collideWithBorder();
	}

	function dropFoodByDead() {
		for(var id in worms[myID].segments) {
			var segment = worms[myID].segments[id];
			dropFoodOn(segment);
		}
	}

	function dropFoodOn(segment) {
		var foodX = segment.x - 20 + Math.random() * 40;
		var foodY = segment.y - 20 + Math.random() * 40;
		supplyFoodOn(foodX, foodY, worms[myID].color);
	}


	function mousePosition(state) {
		return Vector(state.mouseX, state.mouseY);
	}

	function currentPosition() {
		return Vector(worms[myID].x, worms[myID].y);
	}

	function centeredPosition() {
		return Vector(500, 300);
	}

	function currentVelocity(delta) {
		return Vector.scl(Vector.fromPolar(polarVelocity), delta);
	}

	function currentDirection() {
		return Vector.fromPolar(Vector(1, polarVelocity.r));
	}

	function correctDirection() {
		var distance = Vector.len(Vector.dif(destinyDirection, currentDirection()));
		return distance < 0.000001;
	}

	function setAngle(angle) {
		angle = angle > Math.PI ? angle - 2 * Math.PI : angle;
		angle = angle < -Math.PI ? angle + 2 * Math.PI : angle; 
		return angle;
	}

});