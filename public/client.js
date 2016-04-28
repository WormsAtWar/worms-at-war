
var players = new Array();

var player = {
	id: '',
	nickname: '',
	x: 0,
	y: 0
};


// NETWORK LAYER
/////////////////
var IO = {

	init : function() {
		IO.socket = io.connect();
		IO.bindEvents();
	},

	bindEvents : function() {
		IO.socket.on('newStart', IO.onNewStart);
		IO.socket.on('newOpponent', IO.onNewOpponent);
		IO.socket.on('removePlayer', IO.onRemovePlayer);
		IO.socket.on('playerUpdatedPosition', IO.onPlayerUpdatedPosition);
	},
	
	onNewStart : function(data) {
		player.id = data.id;
		player.nickname = data.nickname;
		player.x = data.x;
		player.y = data.y;

		players = data.currentPlayers;
		players[player.id] = {
			id: player.id,
			nickname: player.nickname,
			x: player.x,
			y: player.y
		};

		renderOpponents();
	},

	onNewOpponent : function(data) {
		players[data.id] = data;
		renderOpponent(data);
	},

	onRemovePlayer : function(data) {
		stage.removeChild(renderedOpponents[data.id]);
		players.splice(data.id, 1, undefined);
		renderedOpponents.splice(data.id, 1, undefined);
		//console.log('opponent ' + data.id + ' removed')
		stage.update();
	},

	onPlayerUpdatedPosition : function(data) {
		players[data.id] = data;
	},

	updatePosition : function(event) {
		var newX = renderedPlayer.x;
		var newY = renderedPlayer.y;

		player.x = newX;
		player.y = newY;

		IO.socket.emit('updatePosition', player);
	},

};

IO.init();


// GAME ENGINE
///////////////

// Short alias
var Stage = createjs.Stage;
var Container = createjs.Container;
var Graphics = createjs.Graphics;
var Shape = createjs.Shape;
var Ticker = createjs.Ticker;
var Tween = createjs.Tween;

var canvas = $("#gameCanvas").get(0);

var stage = new Stage(canvas);

var renderedPlayer;
renderPlayer();

var renderedOpponents = new Array();

Ticker.setFPS(60);
bindEngineEvents();


function renderPlayer() {
	renderedPlayer = new Shape(new Graphics().beginFill('red'));
	renderedPlayer.graphics.drawCircle(player.x, player.y, 40);
	renderedPlayer.setPPS(170, 170);
	stage.addChild(renderedPlayer);
}

function renderOpponents() {
	for (id in players) {
		var opponent = players[id];

		if (id != player.id && opponent != undefined) {
			var renderedOpponent = new Shape(new Graphics().beginFill('red'));
			renderedOpponent.graphics.drawCircle(-player.x, -player.y, 40);
			renderedOpponent.setPPS(170, 170);
			renderedOpponents[opponent.id] = renderedOpponent;
			stage.addChild(renderedOpponent);
		} else {
			renderedOpponents[id] = undefined;
		}
	}
}

function renderOpponent(opponent) {
	if (opponent.id != player.id) {
		var renderedOpponent = new Shape(new Graphics().beginFill('red'));
		renderedOpponent.graphics.drawCircle(opponent.x, opponent.y, 40);
		renderedOpponent.setPPS(170, 170);
		renderedOpponents[opponent.id] = renderedOpponent;
		stage.addChild(renderedOpponent);
	} else {
		renderedOpponents[opponent.id] = undefined;
	}
}

function bindEngineEvents() {
	// Player Events
	Ticker.addEventListener('tick', IO.updatePosition);
	Ticker.addEventListener('tick', renderPlayerMovements);

	// Opponents Events
	Ticker.addEventListener('tick', renderOpponentsMovements);
}

function renderPlayerMovements(event) {
	var duration = renderedPlayer.timeToDestination(stage.mouseX, stage.mouseY);

	Tween.get(renderedPlayer, { override: true })
		.to({ x: stage.mouseX, y: stage.mouseY }, duration);

	stage.update();
}

function renderOpponentsMovements(event) {
	
	for (id in renderedOpponents) {
		if (renderedOpponents[id] != undefined) {
			var opponent = players[id];
			renderedOpponents[id].x = opponent.x;
			renderedOpponents[id].y = opponent.y;
			//console.log('Opponent ' + opponent.id + ' moves to: x=' + opponent.x + ' y=' + opponent.y);
		}
	}
	stage.update();
}


