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
		console.log(players);
		console.log(newPlayer.id + ' connects');
	},

	onPlayerUpdated : function(data) {
		if(data.itsMe) {
			player = data.player;
		} else {
			players[data.player.id] = data.player;
		}
		//console.log(data.player);
	},

	onPlayerDisconnect : function(id) {
		players.splice(id, 1, undefined);
		console.log(id + ' disconnects');
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
		Render.player = new Shape(new Graphics().beginFill('yellow'));
		Render.player.graphics.drawCircle(player.x, player.y, 20);
		stage.addChild(Render.player);
	} else {
		Render.player.x = player.x;
		Render.player.y = player.y;
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
		
		Render.opponents[opponent.id] = new Shape(new Graphics().beginFill('yellow'));
		Render.opponents[opponent.id].graphics.drawCircle(opponentX, opponentY, 20);
		stage.addChild(Render.opponents[opponent.id]);
	} else {
		Render.opponents[opponent.id].x = opponent.x;
		Render.opponents[opponent.id].y = opponent.y;
	}
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