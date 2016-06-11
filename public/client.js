var Model = {
	worm: null,
	otherWorms: new Array(),
	foods: new Array(),
	leader: null,
	wanted: null
}
var lastScore = 0;

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
		IO.socket.on('dead', IO.onDead);
		IO.socket.on('updateLeader', IO.onUpdateLeader);
		IO.socket.on('updateWanted', IO.onUpdateWanted);
		IO.socket.on('otherWormDisconnect', IO.onOtherWormDisconnect);
	},

	onLoginSuccess : function(data) {
		Model.worm = data.worm;
		Model.otherWorms = data.otherWorms;
		Model.foods = data.foods;
		status = 'success';
	},

	onNewWormLogin : function(data) {
		Model.otherWorms[data.id] = data;
	},

	onWormUpdated : function(data) {
		Model.worm = data;
	},

	onOtherWormUpdated : function(data) {
		Model.otherWorms[data.id] = data;
	},

	onSuppliedFood : function(data) {
		Model.foods[data.id] = data;
	},

	onFoodSwallowed : function(id) {
		Model.foods.splice(id, 1, null);
		Render.removeFood(id);
	},

	onDead : function(score) {
		status = 'waiting';
		lastScore = score;
		Model = {
			worm: null,
			otherWorms: new Array(),
			foods: new Array(),
			leader: null
		}
		Render.reset();
		Render.showLoginStage();
	},

	onUpdateLeader : function(data) {
		Model.leader = data;
	},

	onUpdateWanted : function(data) {
		Model.wanted = data;
	},

	onOtherWormDisconnect : function(id) {
		Model.otherWorms.splice(id, 1, null);
		Render.removeWorm(id);
	}

};


/////////////////
// GAME ENGINE //
/////////////////

var canvas = $("#gameCanvas").get(0);
var stage = new Stage(canvas);

stage.addEventListener('stagemousedown', function() {
	IO.socket.emit('speedUp', null);
});

stage.addEventListener('stagemouseup', function() {
	IO.socket.emit('slowDown', null);
});

var Render = new RenderEngine(stage);

Ticker.framerate = 60;
Ticker.timingMode = Ticker.RAF;
var frame = 1;

/////////////////////////////
//-------------------------//
//       CLIENT LOOP       //
//-------------------------//
/////////////////////////////
Ticker.addEventListener('tick', function(event) {
	if(status == 'success') {
		Render.renderFrame();
		if(frame == 15) { // destiny update rate limited to 4 times per second
			destinyUpdate();
			frame = 1;
		} else {
			frame++;
		}
	}
});

/////////////////////////////
/////////////////////////////

function destinyUpdate() {
	var state = {
		mouseX: stage.mouseX,
		mouseY: stage.mouseY
	};
	IO.socket.emit('destinyUpdate', state);
}


///////////////////////////////////////////////

function startGame() {
	var nickname = $("#nicknameInput").val() || '';
	
	Render.showGameStage();
	IO.init();
	
	IO.socket.emit('wormLogin', nickname);
}


$("#world").hide();

$("#startButton").click(function() {
    startGame();
});