
// Short alias
var Stage = createjs.Stage;
var Container = createjs.Container;
var Graphics = createjs.Graphics;
var Shape = createjs.Shape;
var Text = createjs.Text;
var Ticker = createjs.Ticker;
var Tween = createjs.Tween;

var RenderEngine = function(stage) {
	Model.suscribeRender(this);
	this.init(stage);
};

RenderEngine.prototype = {
	
	// Initialization

	init : function(stage) {
		this.worm = null;
		this.otherWorms = new Array();
		this.foods = new Array();
		this.wormholes = new Array();

		this.hud = null;

		this.stage = stage;

		this.initContainers();
	},

	initContainers : function() {
		this.wormContainer = new Container();
		this.worldContainer = new Container();
		this.foodContainer = new Container();
		this.otherWormsContainer = new Container();
		this.wormholesContainer = new Container()
		this.hudContainer = new Container();

		this.initWorldContainer();
		
		this.stage.addChild(this.worldContainer);
		this.stage.addChild(this.wormContainer);
		this.stage.addChild(this.hudContainer);
	},

	initWorldContainer : function() {
		this.createWorldBackground();
		this.worldContainer.addChild(this.foodContainer);
		this.worldContainer.addChild(this.wormholesContainer);
		this.worldContainer.addChild(this.otherWormsContainer);		
		this.worldContainer.regX = -500;
		this.worldContainer.regY = -300;
	},

	createWorldBackground : function() {
		var worldShape = new Shape();
		var worldImage = new Image();

		worldImage.onload = function(){
		     worldShape.graphics.beginBitmapFill(worldImage, 'repeat');
		     worldShape.graphics.setStrokeStyle(10);
		     worldShape.graphics.beginStroke('red');
		     worldShape.graphics.drawRect(0, 0, 4000, 4000);
		}

		worldImage.src = 'images/stars.jpg';
		this.worldContainer.addChild(worldShape);
	},

	reset : function() {
		this.stage.removeAllChildren();
		this.stage.clear();
		this.init(this.stage);
	},

	showGameStage : function() {
		$("#logo").fadeOut();
		$("#login").fadeOut();
		$("#logo").css("display", "none");
		$("#login").css("display", "none");
		$("#world").fadeIn();
	},

	showLoginStage : function() {
		if(lastScore) {
			$("h3#lastScore").text("Last Score:  " + lastScore);
		}
		if(lastRank) {
			$("h3#lastRank").text("Rank:  " + lastRank);
		}

		$("#world").fadeOut();
		$("#world").css("display", "none");
		$("#logo").delay(200).fadeIn();
		$("#login").delay(500).fadeIn();
	},


	// Object Rendering

	start : function() {
		this.createWorm();
		this.createOtherWorms();
		this.createFoods();
		this.createWormholes();
		this.createHUD();
		this.stage.update();
	},

	renderFrame : function() {
		this.renderWorm();
		this.renderOtherWorms();
		this.renderWormholes();
		this.renderHUD();
		this.stage.update();
	},

	renderOtherWorms : function() {
		for(var i = 0; i < this.otherWorms.length; i++) {
			this.otherWorms[i].render();
		}
	},

	renderWorm : function() {
		if(this.worm) {
			this.worm.render();
			this.moveCamera();
		}
	},

	moveCamera : function() {
		this.worldContainer.x = -Model.worm.x;
		this.worldContainer.y = -Model.worm.y;
	},

	renderWormholes : function() {
		for(var i = 0; i < this.wormholes.length; i++) {
			this.wormholes[i].render();
		}
	},

	renderHUD : function() {
		this.hud.render();
	},

	createOtherWorms : function() {
		for(var i = 0; i < Model.otherWorms.length; i++) {
			var worm = Model.otherWorms[i];
			this.createWorm(worm.id);
		}
	},

	createWorm : function(id) {
		if(id == null) {
			this.worm = new WormShape(this.wormContainer);
			this.moveCamera();
		} else {
			this.otherWorms.push(new WormShape(this.otherWormsContainer, id));
		}
	},

	createFoods : function() {
		for(var i = 0; i < Model.foods.length; i++) {
			var food = Model.foods[i];
			this.createFood(food.id);
		}
	},

	createFood : function(id) {
		this.foods.push(new FoodShape(this.foodContainer, id));
	},

	createWormholes : function() {
		for(var i = 0; i < Model.wormholes.length; i++) {
			var wormhole = Model.wormholes[i];
			this.createWormhole(wormhole.id);
		}
	},

	createWormhole : function(id) {
		this.wormholes.push(new WormholeShape(this.wormholesContainer, id));
	},

	createHUD : function() {
		this.hud = new HUD(this.hudContainer);
	},

	putOnGlasses : function(id) {
		if(id == Model.worm.id) {
			this.worm.createGlasses();
		} else {
			this.otherWorms.get(id).createGlasses();
		}
	},

	removeFood : function(id) {
		this.foods.get(id).remove();
		this.foods.remove(id);
	},

	removeWorm : function(id) {
		this.otherWorms.get(id).remove();
		this.otherWorms.remove(id);
	},

	stopRenderWorm : function() {
		this.worm.remove();
		this.worm = null;
		this.stage.update();
	},

};




var WormShape = function(container, id) {
	this.container = container;

	this.id = id;

	this.head;
	this.segments = new Array();
	this.nickname;
	this.glasses;

	this.create();
	if(this.worm.glasses) {
		this.createGlasses();
	}
};

WormShape.prototype = {

	updateWorm : function() {
		this.worm = this.id != null ? Model.otherWorms.get(this.id) : Model.worm;
	},

	render : function() {
		this.remove();
		this.create();
	},

	create : function() {
		this.updateWorm();
		this.createBody();
		this.createHead();
		this.renderGlasses();
		this.createNick();
	},

	createBody : function() {
		for(var i = this.worm.segments.length-1; i >= 0; i--) {
			this.createSegment(i);
		}
	},

	createSegment : function(index) {
		var segment = this.worm.segments[index];
		this.segments[index] = new Shape();
		this.segments[index].graphics.beginFill(this.worm.color).drawCircle(0, 0, 20);
		this.segments[index].set({
			x: this.id != null ? segment.x : segment.x - this.worm.x + 500,
			y: this.id != null ? segment.y : segment.y - this.worm.y + 300
		});

		this.container.addChild(this.segments[index]);
	},

	createHead : function() {
		this.head = new Shape();
		this.head.graphics.beginFill(this.worm.color).drawCircle(0, 0, 23);
		this.createEyes();
		this.head.set({
			x: this.id != null ? this.worm.x : 500,
			y: this.id != null ? this.worm.y : 300,
			rotation: this.worm.head.rotation
		});
		this.container.addChild(this.head);

	},

	createEyes : function() {
		this.head.graphics.setStrokeStyle(2, 'square')
							.beginStroke('#000000')
							.beginFill('white').drawCircle(11, -15, 10)
							.beginFill('white').drawCircle(11, 15, 10)
							.beginFill('black').drawCircle(14, -15, 4)
							.beginFill('black').drawCircle(14, 15, 4)
							.endStroke();
	},

	createGlasses : function() {
		var glasses = new Shape();
		var glassesImage = new Image();

		glassesImage.onload = function(){
		     glasses.graphics.beginBitmapFill(glassesImage, 'no-repeat');
		     glasses.graphics.drawRect(0, 0, 20, 65);
		}
		glassesImage.src = 'images/glasses.png';
		this.glasses = glasses;
		this.glasses.set({
			alpha: 0,
			regY: 32.5,
			x: this.head.x, 
			y: this.head.y,
			rotation: this.head.rotation,
		});
		this.container.addChild(this.glasses);
		Tween.get(this.glasses)
			.wait(3000)
			.to({ alpha: 1 }, 1000);
	},

	renderGlasses : function() {
		if(this.glasses) {
			this.container.removeChild(this.glasses);
			this.glasses.set({
				x: this.head.x, 
				y: this.head.y,
				rotation: this.head.rotation,	
			});
			this.container.addChild(this.glasses);
		}
	},

	createNick : function() {
		this.nickname = new Text(this.worm.nickname, 'bold 14px sans-serif', '#FFFFFF');
		this.nickname.set({
			regX: this.nickname.getMeasuredWidth() / 2,
			regY: -30,
			x: this.head.x,
			y: this.head.y
		});
		this.container.addChild(this.nickname);
	},

	remove : function() {
		this.container.removeChild(this.head, this.nickname);
		for(var i = 0; i < this.segments.length; i++) {
			this.container.removeChild(this.segments[i]);
		}
		this.segments = new Array();
	},

};





var FoodShape = function(container, id) {
	this.container = container;

	this.id = id;
	this.food = Model.foods.get(id);

	this.core;
	this.halo;

	this.create();
};

FoodShape.prototype = {

	create : function() {
		this.createHalo();
		this.createCore();
	},

	createHalo : function() {
		this.halo = new Shape();
		this.halo.graphics.beginFill(this.food.color)
						.drawCircle(0, 0, this.food.points / 2 + 5);
		this.halo.set({
			x: this.food.x,
			y: this.food.y,
			alpha: 0
		});

		this.container.addChild(this.halo);

		Tween.get(this.halo).to({ alpha: 0.5 }, 1000);
	},

	createCore : function() {
		this.core = new Shape();
		this.core.graphics.beginFill(this.food.color)
						.drawCircle(0, 0, this.food.points / 2);
		this.core.set({
			x: this.food.x,
			y: this.food.y,
			alpha: 0
		});

		this.container.addChild(this.core);

		Tween.get(this.core).to({ alpha: 1 }, 500);
	},

	remove : function() {
		this.container.removeChild(this.halo, this.core);
	},

};





var WormholeShape = function(container, id) {
	this.container = container;

	this.id = id;
	this.wormhole = Model.wormholes.get(id);

	this.origin;
	this.destiny;

	this.create();
};

WormholeShape.prototype = {

	create : function() {
		this.createOrigin();
		this.createDestiny();
	},

	createOrigin : function() {
		var wormhole = new Shape();
		var wormholeImage = new Image();

		wormholeImage.onload = function(){
		     wormhole.graphics.beginBitmapFill(wormholeImage, 'no-repeat');
		     wormhole.graphics.drawRect(0, 0, 150, 150);
		}
		wormholeImage.src = 'images/wormhole.png';
		this.origin = wormhole;
		this.origin.set({
			regX: 75,
			regY: 75,
			x: this.wormhole.origin.x, 
			y: this.wormhole.origin.y,
		});
		this.container.addChild(this.origin);
		Tween.get(this.origin).to({ alpha: 1 }, 500);
	},

	createDestiny : function() {
		var wormhole_exit = new Shape();
		var wormholeImage = new Image();

		wormholeImage.onload = function(){
		     wormhole_exit.graphics.beginBitmapFill(wormholeImage, 'no-repeat');
		     wormhole_exit.graphics.drawRect(0, 0, 100, 100);
		}
		wormholeImage.src = 'images/wormhole_exit.png';
		this.destiny = wormhole_exit;
		this.destiny.set({
			alpha: 0,
			regX: 50,
			regY: 50,
			x: this.wormhole.destiny.x, 
			y: this.wormhole.destiny.y,
		});
		this.container.addChild(this.destiny);
		Tween.get(this.destiny).to({ alpha: 1 }, 500);
	},

	render : function() {
		this.origin.rotation++;
	},

	remove : function() {
		this.container.removeChild(this.origin, this.destiny);
	},

};






var HUD = function(container) {
	this.container = container;
	this.init();
};

HUD.prototype = {

	init : function() {

		this.elements = new Array();
		this.createElements();
	},

	render : function() {
		for(var i = 0; i < this.elements.length; i++) {
			this.elements[i].render();
		}
	},

	createElements : function() {
		this.createScoreText();
		this.createWantedText();
		this.createMinimap();
		this.createRanking();
	},

	createScoreText : function() {
		this.elements.push(new ScoreText(this.container));
	},

	createWantedText : function() {
		this.elements.push(new WantedText(this.container));
	},

	createMinimap : function() {
		this.elements.push(new Minimap(this.container));
	},

	createRanking : function() {
		this.elements.push(new Ranking(this.container));
	},

};





var ScoreText = function(container) {
	this.container = container;

	this.score;
	this.create();
};

ScoreText.prototype = {

	create : function() {
		this.score = new Text(Model.worm.score, 'bold 24px sans-serif', 'yellow');
		this.score.set({
			x: 20,
			y: 20,
		});
		this.container.addChild(this.score);
	},

	render : function() {
		this.score.text = Model.worm.score;
	},

};




var WantedText = function(container) {
	this.container = container;

	this.wanted;
	this.create();
};

WantedText.prototype = {

	create : function() {
		this.wanted = new Text("Who will be the next MOST WANTED?", 'bold 16px sans-serif', 'white');
		this.wanted.set({
			regX: this.wanted.getMeasuredWidth() / 2,
			x: 500,
			y: 20,
		});
		this.container.addChild(this.wanted);
	},

	render : function() {
		if(Model.wanted) {
			this.wanted.text = "The MOST WANTED is " + Model.wanted.nickname + " with " + Model.wanted.kills + " kills!";
		} else {
			this.wanted.text = "Who will be the next MOST WANTED?";
		}
		this.wanted.regX = this.wanted.getMeasuredWidth() / 2;
	},

};





var Minimap = function(container) {
	this.container = container;

	this.frame;
	this.wormBlip;
	this.wantedBlip;
	this.create();
};

Minimap.prototype = {

	create : function() {
		this.createFrame();
		this.createWormBlip();
		this.createWantedBlip();
	},

	createFrame : function() {
		this.frame = new Shape();
		this.frame.graphics.beginFill('grey').drawRect(0, 0, 80, 80);
		this.frame.set({
			x: 900,
			y: 500,
			alpha: 0.5
		});
		this.container.addChild(this.frame);
	},

	createWormBlip : function() {
		var coords = this.traslateCoords(Model.worm);

		this.wormBlip = new Shape();
		this.wormBlip.graphics.beginFill(Model.worm.color).drawCircle(0, 0, 3);
		this.wormBlip.set({
			x: coords.x,
			y: coords.y
		});

		this.container.addChild(this.wormBlip);
	},

	createWantedBlip : function() {
		if(Model.wanted && Model.wanted.id != Model.worm.id) {
			var coords = this.traslateCoords(Model.wanted);
			this.wantedBlip = new Shape();
			this.wantedBlip.graphics.beginFill('red').drawCircle(0, 0, 4);
			this.wantedBlip.graphics.beginFill('white').drawCircle(0, 0, 3);
			this.wantedBlip.graphics.beginFill('red').drawCircle(0, 0, 2);
			this.wantedBlip.set({
				x: coords.x,
				y: coords.y
			});
			this.container.addChild(this.wantedBlip);
		}
	},

	render : function() {
		this.renderWormBlip();
		this.renderWantedBlip();
	},

	renderWormBlip : function() {
		var coords = this.traslateCoords(Model.worm);
		this.wormBlip.set({
			x: coords.x,
			y: coords.y
		});
	},

	renderWantedBlip : function() {
		this.removeWantedBlip();
		this.createWantedBlip();
	},

	removeWantedBlip : function() {
		this.container.removeChild(this.wantedBlip);
	},

	traslateCoords : function(worm) {
		var blipX = this.frame.x + worm.x / 50;
		var blipY = this.frame.y + worm.y / 50;

		return { x: blipX, y: blipY};
	},

};





var Ranking = function(container) {
	this.container = container;

	this.rank;
	this.topTen = new Array();
	this.create();
};

Ranking.prototype = {

	create : function() {
		this.createRank();
		this.createTopTen();
	},

	createRank : function() {
		this.rank = new Text("", '16px sans-serif', 'yellow');
		this.rank.set({
			x: 20,
			y: 45
		});
		this.container.addChild(this.rank);
	},

	createTopTen : function() {
		for(var i = 0; i < Model.topTen.length; i++) {
			this.topTen.push(new TTRow(this.container, i));
		}
	},
	
	render : function() {
		this.renderRank();
		this.renderTopTen();
	},

	renderRank : function() {
		this.rank.text = Model.worm.rank ? this.rankText() : "";
	},

	renderTopTen : function() {
		this.removeTopTen();
		this.createTopTen();
	},

	rankText : function() {
		return "Rank " + Model.worm.rank + " of " + Model.wormsAmount();
	},

	removeTopTen : function() {
		for(var i = 0; i < this.topTen.length; i++) {
			this.topTen[i].remove();
		}
		this.topTen = new Array();
	},

};

var TTRow = function(container, index) {
	this.container = container;

	this.index = index;

	this.position;
	this.nickname;
	this.score;
	this.create();
};

TTRow.prototype = {

	create : function() {
		this.createPosition();
		this.createNick();
		this.createScore();
	},

	createPosition : function() {
		var worm = Model.topTen[this.index];
		this.position = new Text("#" + (this.index+1), '14px sans-serif', worm.color);
		this.position.set({
			x: 790,
			y: 20 + 14*this.index,
		});
		this.container.addChild(this.position);
	},

	createNick : function() {
		var worm = Model.topTen[this.index];
		this.nickname = new Text(worm.nickname, '14px sans-serif', worm.color);
		this.nickname.set({
			x: 830,
			y: 20 + 14*this.index,
		});
		this.container.addChild(this.nickname);
	},

	createScore : function() {
		var worm = Model.topTen[this.index];
		this.score = new Text(worm.score, '14px sans-serif', worm.color);
		this.score.set({
			regX: this.score.getMeasuredWidth(), 
			x: 980,
			y: 20 + 14*this.index,
		});
		this.container.addChild(this.score);
	},

	remove : function() {
		this.container.removeChild(this.position, this.nickname, this.score);
	},

};