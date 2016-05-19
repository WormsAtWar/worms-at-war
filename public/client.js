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

	wormNotRendered : function() {
		return Render.worm == null;
	},

	otherWormNotRendered : function(id) {
		return Render.otherWorms[id] == null;
	},
};

function renderFrame() {
	renderWorm();
	renderOtherWorms();
	stage.update();
}

function renderWorm() {
	if(Render.wormNotRendered()) {
		Render.worm = new WormShape(stage, worm);
	} else {
		Render.worm.update(worm);
	}
}

function renderOtherWorms() {
	for(id in otherWorms) {
		var otherWorm = otherWorms[id];
		if(itsOtherWorm(otherWorm)) {
			renderOtherWorm(otherWorm);
		} else {
			Render.otherWorms[id].remove();
			Render.otherWorms[id] = null;
		}
	}
}

function renderOtherWorm(otherWorm) {
	if(Render.otherWormNotRendered(otherWorm.id)) {
		var offsetX = worm.x == 0 ? worm.x : otherWorm.x;
		var offsetY = worm.y == 0 ? worm.y : otherWorm.y;

		Render.otherWorms[otherWorm.id] = new WormShape(stage, otherWorm, offsetX, offsetY);
	} else {
		Render.otherWorms[otherWorm.id].update(otherWorm);
	}
}

function itsOtherWorm(otherWorm) {
	return otherWorm != null ? otherWorm.id != worm.id : false;
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