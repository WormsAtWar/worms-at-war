var player;
var players = new Array();

var status = 'waiting';


// NETWORK LAYER
/////////////////
var IO = {

	init : function() {
		IO.socket = io.connect();
		IO.bindEvents();
	},

	bindEvents : function() {
		IO.socket.on('loginSuccess', IO.onLoginSuccess); //when I login
		IO.socket.on('newPlayerLogin', IO.onNewPlayerLogin); // when other player login
		IO.socket.on('playerUpdated', IO.onPlayerUpdated); // when any player change
		IO.socket.on('playerDisconnect', IO.onPlayerDisconnect); // when other player disconnect
	},

	onLoginSuccess : function(data) {
		player = data.player;
		players = data.currentPlayers;
		status = 'success';
	},

	onNewPlayerLogin : function(newPlayer) {
		players[newPlayer.id] = newPlayer;
	},

	onPlayerUpdated : function(data) {
		if(data.itsMe) {
			player = data.player;
		} else {
			players[data.player.id] = data.player;
		}
	},

	onPlayerDisconnect : function(id) {
		players.splice(id, 1, undefined);
	}

};


/////////////////
// GAME ENGINE //
/////////////////

// Short alias
var Stage = createjs.Stage;
var Container = createjs.Container;
var Graphics = createjs.Graphics;
var Shape = createjs.Shape;
var Ticker = createjs.Ticker;
var Tween = createjs.Tween;

var canvas = $("#gameCanvas").get(0);
var stage = new Stage(canvas);

Ticker.setFPS(60);

/////////////////////////////
//-------------------------//
//        GAME LOOP        //
//-------------------------//
/////////////////////////////
Ticker.addEventListener('tick', function(event) {
	if(status == 'success') {
		update();
		renderFrame();
	}
});
/////////////////////////////
/////////////////////////////

function update() {
	var state = {
		mouseX: stage.mouseX,
		mouseY: stage.mouseY
	};
	IO.socket.emit('playerUpdate', state);
}

var Render = {
	player: null,
	opponents: new Array(),
};

function renderFrame() {
	renderPlayer();
	renderOpponents();
	stage.update();
}

function renderPlayer() {
	if(playerNotRendered()) {
		renderHead(player.x, player.y);
		stage.addChild(Render.player);
	} else {
		Render.player.x = player.x;
		Render.player.y = player.y;
		Render.player.rotation = player.headRotation;
	}
}

function renderOpponents() {

	for(id in players) {
		var opponent = players[id];
		if(itsOpponent(opponent)) {
			renderOpponent(opponent);
		} else {
			Render.opponents[opponent.id] = null;
		}
	}
}

function renderOpponent(opponent) {
	if(opponentNotRendered(opponent.id)) {
		var opponentX = player.x == 0 ? -player.x : opponent.x;
		var opponentY = player.y == 0 ? -player.y : opponent.y;
		
		renderHead(opponentX, opponentY);
		stage.addChild(Render.opponents[opponent.id]);
	} else {
		Render.opponents[opponent.id].x = opponent.x;
		Render.opponents[opponent.id].y = opponent.y;
		Render.opponents[id].rotation = opponent.headRotation;
	}
}

function renderHead(x, y) {
	Render.opponents[id] = new Shape();
	Render.opponents[id].graphics.setStrokeStyle(2,"square").beginStroke("#000000");
	Render.opponents[id].graphics.beginFill('yellow');
	Render.opponents[id].graphics.drawCircle(x, y, 20);
	Render.opponents[id].graphics.beginFill("white").drawCircle(5, -8, 8);
	Render.opponents[id].graphics.beginFill("white").drawCircle(5, 8, 8);
	Render.opponents[id].graphics.beginFill("black").drawCircle(9, -8, 2);
	Render.opponents[id].graphics.beginFill("black").drawCircle(9, 8, 2);
}

function itsOpponent(opponent) {
	return opponent.id != player.id && opponent != null;
}

function playerNotRendered() {
	return Render.player == null;
}

function opponentNotRendered(id) {
	return Render.opponents[id] == null;
}


function renderGame() {
	var nickname = $("#nicknameInput").val() || '';
	
	showGameStage()
	IO.init();
	
	IO.socket.emit('playerLogin', nickname);
}

function showGameStage() {
	$("#start").fadeOut();
	$("#start").css("display", "none");
	$("#game").fadeIn();
}
///////////////////////////////////////////////

$("#game").hide();

$("#startButton").click(function() {
    renderGame();
});