var worm;
var otherWorms = new Array();
var foods = new Array();

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
		IO.socket.on('foodSwallowed', IO.onFoodSwallowed);
		IO.socket.on('otherWormDisconnect', IO.onOtherWormDisconnect);
	},

	onLoginSuccess : function(data) {
		worm = data.worm;
		otherWorms = data.otherWorms;
		foods = data.foods;
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

	onFoodSwallowed : function(id) {
		foods.splice(id, 1, null);
		Render.removeFood(id);
	},

	onOtherWormDisconnect : function(id) {
		otherWorms.splice(id, 1, null);
		Render.removeWorm(id);
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

	foods: new Array(),

	wormNotRendered : function() {
		return Render.worm == null;
	},

	otherWormNotRendered : function(id) {
		return Render.otherWorms[id] == null;
	},

	foodNotRendered : function(id) {
		return Render.foods[id] == null;
	},

	removeWorm : function(id) {
		Render.otherWorms[id].remove();
		Render.otherWorms.splice(id, 1, null);
	},

	removeFood : function(id) {
		Render.foods[id].remove();
		Render.foods.splice(id, 1, null);
	},
};

function renderFrame() {
	renderFoods();
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

function renderFoods() {
	for(id in foods) {
		var food = foods[id];
		if(itsFood(food)) {
			renderFood(food);
		}
	}
}

function renderFood(food) {
	if(Render.foodNotRendered(food.id)) {
		//var offsetX = worm.x == 0 ? worm.x : otherWorm.x;
		//var offsetY = worm.y == 0 ? worm.y : otherWorm.y;

		Render.foods[food.id] = new FoodShape(stage, food/*, offsetX, offsetY*/);
	}
}

function itsOtherWorm(otherWorm) {
	return otherWorm != null ? otherWorm.id != worm.id : false;
}

function itsFood(food) {
	return food != null;
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