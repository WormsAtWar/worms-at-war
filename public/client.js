var worm;
var otherWorms = new Array();
var foods = new Array();
var leader;

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
		IO.socket.on('suppliedFood', IO.onSuppliedFood);
		IO.socket.on('foodSwallowed', IO.onFoodSwallowed);
		IO.socket.on('updateLeader', IO.onUpdateLeader);
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

	onSuppliedFood : function(data) {
		foods[data.id] = data;
	},

	onFoodSwallowed : function(id) {
		foods.splice(id, 1, null);
		Render.removeFood(id);
	},

	onUpdateLeader : function(data) {
		leader = data;
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

stage.snapToPixelEnabled = true;

stage.addEventListener('stagemousedown', function() {
	IO.socket.emit('speedUp', null);
});

stage.addEventListener('stagemouseup', function() {
	IO.socket.emit('slowDown', null);
});

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

	score: null,

	leader: null,

	wormNotRendered : function() {
		return Render.worm == null;
	},

	otherWormNotRendered : function(id) {
		return Render.otherWorms[id] == null;
	},

	foodNotRendered : function(id) {
		return Render.foods[id] == null;
	},

	scoreNotRendered : function() {
		return Render.score == null;
	},

	leaderNotRendered : function() {
		return Render.leader == null;
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
	renderScore();
	renderLeader();
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
		Render.otherWorms[otherWorm.id] = new WormShape(stage, otherWorm);
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
		Render.foods[food.id] = new FoodShape(stage, food);
	}
}

function renderScore() {
	if(Render.scoreNotRendered()) {
		Render.score = new ScoreText(stage, worm);
	} else {
		Render.score.update(worm);
	}
}

function renderLeader() {
	if(Render.leaderNotRendered()) {
		if(leader != null) {
			Render.leader = new LeaderText(stage, leader);
		}
	} else {
		Render.leader.update(leader);
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