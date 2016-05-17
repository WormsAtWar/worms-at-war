var worm;
var otherWorms = new Array();

var status = 'waiting';


// NETWORK LAYER
/////////////////
var IO = {

	init : function() {
		IO.socket = io.connect();
		IO.bindEvents();
	},

	bindEvents : function() {
		IO.socket.on('loginSuccess', IO.onLoginSuccess);
		IO.socket.on('newWormLogin', IO.onNewWormLogin);
		IO.socket.on('wormUpdated', IO.onWormUpdated);
		IO.socket.on('otherWormUpdated', IO.onOtherWormUpdated);
		IO.socket.on('otherWormDisconnect', IO.onOtherWormDisconnect);
	},

	onLoginSuccess : function(data) {
		worm = data.worm;
		otherWorms = data.otherWorms;
		status = 'success';
	},

	onNewWormLogin : function(data) {
		otherWorms[data.id] = data;
	},

	onWormUpdated : function(data) {
		worm = data;
	},

	onOtherWormUpdated : function(data) {
		otherWorms[data.id] = data;
	},

	onOtherWormDisconnect : function(id) {
		otherWorms.splice(id, 1, null);
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
	IO.socket.emit('wormUpdate', state);
}

var Render = {
	worm: null,
	otherWorms: new Array(),
	nicknames: new Array(),
};

function renderFrame() {
	renderWorm();
	renderOtherWorms();
	renderNicknames();
	stage.update();
}

function renderWorm() {
	if(wormNotRendered()) {
		renderWormHead();
		stage.addChild(Render.worm);
	} else {
		Render.worm.x = worm.x;
		Render.worm.y = worm.y;
		Render.worm.rotation = worm.headRotation;
	}
}

function renderWormHead(x, y) {
	Render.worm = new Shape();
	Render.worm.graphics.setStrokeStyle(2,"square").beginStroke("#000000");
	Render.worm.graphics.beginFill('green');
	Render.worm.graphics.drawCircle(worm.x, worm.y, 20);
	Render.worm.graphics.beginFill("white").drawCircle(5, -8, 8); //ojo izquierdo
	Render.worm.graphics.beginFill("white").drawCircle(5, 8, 8); //ojo derecho
	Render.worm.graphics.beginFill("black").drawCircle(9, -8, 2); //pupila izquierda
	Render.worm.graphics.beginFill("black").drawCircle(9, 8, 2); //pupila derecha
}

function renderOtherWorms() {
	for(id in otherWorms) {
		var otherWorm = otherWorms[id];
		if(itsOtherWorm(otherWorm)) {
			renderOtherWorm(otherWorm);
		} else {
			stage.removeChild(Render.otherWorms[id]);
			Render.otherWorms[id] = null;
		}
	}
}

function renderOtherWorm(otherWorm) {
	if(otherWormNotRendered(otherWorm.id)) {
		var otherWormX = worm.x == 0 ? -worm.x : otherWorm.x;
		var otherWormY = worm.y == 0 ? -worm.y : otherWorm.y;
		
		renderOtherWormHead(otherWorm.id, otherWormX, otherWormY);
		stage.addChild(Render.otherWorms[otherWorm.id]);
	} else {
		Render.otherWorms[otherWorm.id].x = otherWorm.x;
		Render.otherWorms[otherWorm.id].y = otherWorm.y;
		Render.otherWorms[otherWorm.id].rotation = otherWorm.headRotation;
	}
}

function renderOtherWormHead(id, x, y) {
	Render.otherWorms[id] = new Shape();
	Render.otherWorms[id].graphics.setStrokeStyle(2,"square").beginStroke("#000000");
	Render.otherWorms[id].graphics.beginFill('green');
	Render.otherWorms[id].graphics.drawCircle(x, y, 20);
	Render.otherWorms[id].graphics.beginFill("white").drawCircle(5, -8, 8); //ojo izquierdo
	Render.otherWorms[id].graphics.beginFill("white").drawCircle(5, 8, 8); //ojo derecho
	Render.otherWorms[id].graphics.beginFill("black").drawCircle(9, -8, 2); //pupila izquierda
	Render.otherWorms[id].graphics.beginFill("black").drawCircle(9, 8, 2); //pupila derecha
}

function renderNicknames() {
	for(id in otherWorms) {
		var otherWorm = otherWorms[id];
		if(itsOtherWorm(otherWorm)) {
			renderNickname(otherWorm);
		} else {
			stage.removeChild(Render.nicknames[id]);
			Render.otherWorms[id] = null;
		}
	}
}

function renderNickname(otherWorm) {
	if(nicknameNotRendered(otherWorm.id)) {
		var otherWormNicknameX = worm.x == 0 ? -worm.x : otherWorm.x;
		var otherWormNicknameY = worm.y == 0 ? -worm.y + 20 : otherWorm.y + 20;
		Render.nicknames[otherWorm.id] = new Text(otherWorm.nickname, "14px Arial", "#FFFFFF");
 		Render.nicknames[otherWorm.id].x = otherWormNicknameX;
 		Render.nicknames[otherWorm.id].y = otherWormNicknameY;
		stage.addChild(Render.nicknames[otherWorm.id]);
	} else {
		Render.nicknames[otherWorm.id].x = otherWorm.x;
		Render.nicknames[otherWorm.id].y = otherWorm.y + 20;
	}
}

function itsOtherWorm(otherWorm) {
	return otherWorm != null ? otherWorm.id != worm.id : false;
}

function wormNotRendered() {
	return Render.worm == null;
}

function otherWormNotRendered(id) {
	return Render.otherWorms[id] == null;
}

function nicknameNotRendered(id) {
	return Render.nicknames[id] == null;
}

function renderGame() {
	var nickname = $("#nicknameInput").val() || '';
	
	showGameStage()
	IO.init();
	
	IO.socket.emit('wormLogin', nickname);
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