
var Model = new Model();

var lastScore = 0;
var lastRank = 0;
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
		IO.socket.on('updateTopTen', IO.onUpdateTopTen);
		IO.socket.on('updateWanted', IO.onUpdateWanted);
		IO.socket.on('wantedDead', IO.onWantedDead);
		IO.socket.on('wormholeCreated', IO.onWormholeCreated);
		IO.socket.on('newWormhole', IO.onNewWormhole);
		IO.socket.on('teleportation', IO.onTeleportation);
		IO.socket.on('wormholeCollapsed', IO.onWormholeCollapsed);
		IO.socket.on('leagueUpdate', IO.onLeagueUpdate);
		IO.socket.on('otherWormDisconnect', IO.onOtherWormDisconnect);
	},

	onLoginSuccess : function(data) {
		Model.worm = data.worm;
		Model.otherWorms = data.otherWorms;
		Model.league = data.league;
		Model.foods = data.foods;
		Model.wormholes = data.wormholes;
		Model.notifyLoginSuccess();
		status = 'success';
	},

	onNewWormLogin : function(data) {
		Model.otherWorms.push(data);
		Model.notifyNewWormLogin(data.id);
	},

	onWormUpdated : function(data) {
		Model.worm = data;
	},

	onOtherWormUpdated : function(data) {
		Model.otherWorms.replace(data);
	},

	onSuppliedFood : function(data) {
		Model.foods.push(data);
		Model.notifySuppliedFood(data.id);
	},

	onFoodSwallowed : function(id) {
		Model.foods.remove(id);
		Model.notifyFoodSwallowed(id);
	},

	onDead : function(data) {
		Model.notifyDead();
		setTimeout(function() {
			lastScore = Model.worm.score;
			lastRank = Model.worm.rank;
			Model.reset();
			status = 'waiting';
			Model.notifyAfterDeadEnds();
		}, 3000);
	},

	onUpdateTopTen : function(data) {
		Model.topTen = data;
	},

	onUpdateWanted : function(data) {
		Model.wanted = data;
	},

	onWantedDead : function(id) {
		Model.notifyWantedDead(id);
	},

	onWormholeCreated : function(data) {
		Model.wormholes.push(data);
		Model.notifyWormholeCreated(data.id);
	},

	onNewWormhole : function(data) {
		Model.wormholes.push(data);
		Model.notifyNewWormhole(data.id);
	},

	onTeleportation : function(data) {
		Model.notifyTeleportation();
	},

	onWormholeCollapsed : function(id) {
		Model.wormholes.remove(id);
		Model.notifyWormholeCollapsed(id);
	},

	onLeagueUpdate : function(data) {
		if(data && Model.league && data.id == Model.league.id){
			Model.league = data;
		}
	},

	onOtherWormDisconnect : function(id) {
		Model.otherWorms.remove(id);
		Model.notifyWormDisconnect(id);
	}

};


/////////////////
// GAME ENGINE //
/////////////////

var Key = {
	SPACE: 32,
}

var canvas = $("#gameCanvas").get(0);
var stage = new Stage(canvas);

stage.addEventListener('stagemousedown', function() {
	IO.socket.emit('speedUp', null);
});

stage.addEventListener('stagemouseup', function() {
	IO.socket.emit('slowDown', null);
});

$(window).keydown(function(key) {
    if(key.which == Key.SPACE && status == 'success') {
    	IO.socket.emit('wormholeCreation', null);
    }
});

var Render = new RenderEngine(stage);
var SoundEngine = new SoundEngine();

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
		if(frame == 10) { // destiny update rate limited to 6 times per second
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

function loginSolo() {
	var loginData = {
		nickname: $("#nicknameSoloInput").val() || '',
		color: $('#loginSoloForm').colorpicker('getValue')
	};

	IO.init();
	
	IO.socket.emit('wormLogin', loginData);
}

function loginLeague() {
	var loginData = {
		nickname: $("#nicknameLeagueInput").val() || '',
		color: $('#loginLeagueForm').colorpicker('getValue'),
		leaguename: $("#leagueInput").val()
	};

	IO.init();
	
	IO.socket.emit('wormLogin', loginData);
}

Render.showLoginStage();


$(function() { 
	$('#loginSoloForm').colorpicker({
		color: '#FF0000',
		format: 'hex',
		input: false
	});
	$('#loginLeagueForm').colorpicker({
		color: '#FF0000',
		format: 'hex',
		input: false
	});
});


///////////////////////////////////////////////
Array.prototype.get = function(id) {
	return this.find(function(elem) {
		return elem.id == id;
	});
};

Array.prototype.getIndex = function(id) {
	return this.indexOf(this.get(id));
};

Array.prototype.replace = function(elem) {
	var index = this.getIndex(elem.id);
	if(index >= 0) {
		this.splice(index, 1, elem);
	}
};

Array.prototype.remove = function(id) {
	this.splice(this.getIndex(id), 1);
};
///////////////////////////////////////////////
