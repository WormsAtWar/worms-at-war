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
		players.splice(id, 1, null);
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
var Text = createjs.Text;
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
	nicknames: new Array(),
};

function renderFrame() {
	renderPlayer();
	renderOpponents();
	renderNicknames();
	stage.update();
}

function renderPlayer() {
	if(playerNotRendered()) {
		renderPlayerHead();
		stage.addChild(Render.player);
	} else {
		Tween.get(Render.player).to({x: player.x, y: player.y, rotation: player.headRotation}, player.delta)
		//Render.player.x = player.x;
		//Render.player.y = player.y;
		//Render.player.rotation = player.headRotation;
	}
}

function renderPlayerHead(x, y) {
	Render.player = new Shape();
	Render.player.graphics.setStrokeStyle(2,"square").beginStroke("#000000");
	Render.player.graphics.beginFill('green');
	Render.player.graphics.drawCircle(player.x, player.y, 20);
	Render.player.graphics.beginFill("white").drawCircle(5, -8, 8); //ojo izquierdo
	Render.player.graphics.beginFill("white").drawCircle(5, 8, 8); //ojo derecho
	Render.player.graphics.beginFill("black").drawCircle(9, -8, 2); //pupila izquierda
	Render.player.graphics.beginFill("black").drawCircle(9, 8, 2); //pupila derecha
}

function renderOpponents() {
	for(id in players) {
		var opponent = players[id];
		if(itsOpponent(opponent)) {
			renderOpponent(opponent);
		} else {
			stage.removeChild(Render.opponents[id]);
			Render.opponents[id] = null;
		}
	}
}

function renderOpponent(opponent) {
	if(opponentNotRendered(opponent.id)) {
		var opponentX = player.x == 0 ? -player.x : opponent.x;
		var opponentY = player.y == 0 ? -player.y : opponent.y;
		
		renderOpponentHead(opponent.id, opponentX, opponentY);
		stage.addChild(Render.opponents[opponent.id]);
	} else {
		Tween.get(Render.opponents[opponent.id]).to({x: opponent.x, y: opponent.y, rotation: opponent.headRotation}, opponent.delta);
		//Render.opponents[opponent.id].x = opponent.x;
		//Render.opponents[opponent.id].y = opponent.y;
		//Render.opponents[id].rotation = opponent.headRotation;
	}
}

function renderOpponentHead(id, x, y) {
	Render.opponents[id] = new Shape();
	Render.opponents[id].graphics.setStrokeStyle(2,"square").beginStroke("#000000");
	Render.opponents[id].graphics.beginFill('green');
	Render.opponents[id].graphics.drawCircle(x, y, 20);
	Render.opponents[id].graphics.beginFill("white").drawCircle(5, -8, 8); //ojo izquierdo
	Render.opponents[id].graphics.beginFill("white").drawCircle(5, 8, 8); //ojo derecho
	Render.opponents[id].graphics.beginFill("black").drawCircle(9, -8, 2); //pupila izquierda
	Render.opponents[id].graphics.beginFill("black").drawCircle(9, 8, 2); //pupila derecha
}

function renderNicknames() {
	for(id in players) {
		var opponent = players[id];
		if(itsOpponent(opponent)) {
			renderNickname(opponent);
		} else {
			stage.removeChild(Render.nicknames[id]);
			Render.nicknames[id] = null;
		}
	}
}

function renderNickname(opponent) {
	if(nicknameNotRendered(opponent.id)) {
		var opponentNicknameX = player.x == 0 ? -player.x : opponent.x;
		var opponentNicknameY = player.y == 0 ? -player.y + 20 : opponent.y + 20;
		Render.nicknames[opponent.id] = new Text(opponent.nickname, "14px Arial", "#FFFFFF");
 		Render.nicknames[opponent.id].x = opponentNicknameX;
 		Render.nicknames[opponent.id].y = opponentNicknameY;
		stage.addChild(Render.nicknames[opponent.id]);
	} else {
		Tween.get(Render.nicknames[opponent.id]).to({x: opponent.x, y: opponent.y + 20}, opponent.delta);
		//Render.nicknames[opponent.id].x = opponent.x;
		//Render.nicknames[opponent.id].y = opponent.y + 20;
	}
}

function itsOpponent(opponent) {
	return opponent != null ? opponent.id != player.id : false;
}

function playerNotRendered() {
	return Render.player == null;
}

function opponentNotRendered(id) {
	return Render.opponents[id] == null;
}

function nicknameNotRendered(id) {
	return Render.nicknames[id] == null;
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