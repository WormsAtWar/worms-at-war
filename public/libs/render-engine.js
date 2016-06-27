
// Short alias
var Stage = createjs.Stage;
var Container = createjs.Container;
var Graphics = createjs.Graphics;
var Shape = createjs.Shape;
var Bitmap = createjs.Bitmap;
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

	removeWormhole : function(id) {
		this.wormholes.get(id).remove();
		this.wormholes.remove(id);
	},

	removeFood : function(id) {
		if(this.foods.get(id)) {
			this.foods.get(id).remove();
			this.foods.remove(id);
		}
	},

	removeWorm : function(id) {
		this.otherWorms.get(id).remove();
		this.otherWorms.remove(id);
	},

	dead : function() {
		this.stopRenderWorm();
		this.hud.dead();
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
	this.halo = new Array();
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
		this.createWantedHalo();
		this.createBody();
		this.createHead();
		this.renderGlasses();
		this.createNick();
	},

	createWantedHalo : function() {
		if(Model.wanted && Model.wanted.id == this.worm.id) {
			for(var i = this.worm.segments.length-1; i > 0; i--) {
				var segment = this.worm.segments[i];
				this.halo[i] = new Shape();
				this.halo[i].graphics.beginRadialGradientFill(['yellow','rgba(0,0,0,0)'], [0.2, 1], 0, 0, 0, 0, 0, 45)
										.drawCircle(0, 0, 45);
				this.halo[i].set({
					x: this.id != null ? segment.x : segment.x - this.worm.x + 500,
					y: this.id != null ? segment.y : segment.y - this.worm.y + 300
				});
				this.container.addChild(this.halo[i]);
			}
		}
	},

	createBody : function() {
		for(var i = this.worm.segments.length-1; i >= 0; i--) {
			this.createSegment(i);
		}
	},

	createSegment : function(index) {
		var segment = this.worm.segments[index];
		var colorEffect = this.worm.onSpeed ? 'white' : 'black';

		this.segments[index] = new Shape();
		this.segments[index].graphics.beginRadialGradientFill([this.worm.color, colorEffect], [0, 1], -5, 0, 10, 0, 0, 35)
										.drawCircle(0, 0, 20);
		this.segments[index].set({
			x: this.id != null ? segment.x : segment.x - this.worm.x + 500,
			y: this.id != null ? segment.y : segment.y - this.worm.y + 300
		});

		this.container.addChild(this.segments[index]);
	},

	createHead : function() {
		var colorEffect = this.worm.onSpeed ? 'white' : 'black';

		this.head = new Shape();
		this.head.graphics.beginRadialGradientFill([this.worm.color, colorEffect], [0, 1], -10, 0, 10, 0, 5, 35)
							.drawCircle(0, 0, 23);
		this.createEyes();
		this.head.set({
			x: this.id != null ? this.worm.x : 500,
			y: this.id != null ? this.worm.y : 300,
			rotation: this.worm.head.rotation
		});
		this.container.addChild(this.head);

	},

	createEyes : function() {
		if(!this.worm.glasses || this.withoutGlasses()) {
			this.head.graphics.setStrokeStyle(2, 'square')
							.beginStroke('#000000')
							.beginFill('white').drawCircle(10, -15, 10)
							.beginFill('white').drawCircle(10, 15, 10)
							.beginFill('black').drawCircle(13, -15, 4)
							.beginFill('black').drawCircle(13, 15, 4)
							.endStroke();
		}
	},

	createGlasses : function() {
		this.glasses = new Bitmap('images/glasses.png');
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

	withoutGlasses : function() {
		return !this.worm.glasses || !(this.glasses && this.glasses.alpha == 1);
	},

	remove : function() {
		this.container.removeChild(this.head, this.nickname, this.glasses);
		for(var i = 0; i < this.segments.length; i++) {
			this.container.removeChild(this.segments[i]);
		}
		for(var i = 0; i < this.halo.length; i++) {
			this.container.removeChild(this.halo[i]);
		}
		this.segments = new Array();
		this.halo = new Array();
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
		this.origin = new Bitmap('images/wormhole.png');
		this.origin.set({
			alpha: 0,
			regX: 75,
			regY: 75,
			x: this.wormhole.origin.x, 
			y: this.wormhole.origin.y,
		});
		this.container.addChild(this.origin);
		Tween.get(this.origin).to({ alpha: 1 }, 500);
	},

	createDestiny : function() {
		this.destiny = new Bitmap('images/wormhole_exit.png');
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
		Tween.get(this.origin)
			.to({ alpha: 0 }, 1000)
			.call(function() {
		    	this.container.removeChild(this.origin);
		    },
		[], this);
		Tween.get(this.destiny)
			.to({ alpha: 0 }, 1000)
			.call(function() {
		    	this.container.removeChild(this.destiny);
		    },
		[], this);
	},

};






var HUD = function(container) {
	this.container = container;
	this.init();
};

HUD.prototype = {

	init : function() {

		this.opaqueLayer;
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

	dead : function() {
		this.opaqueLayer = new Shape();
		this.opaqueLayer.graphics.beginFill('black').drawRect(0, 0, 1000, 600);
		this.opaqueLayer.alpha = 0;
		this.container.addChild(this.opaqueLayer);
		Tween.get(this.opaqueLayer).to({ alpha: 0.8 }, 1500);
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
			this.wantedBlip.graphics.beginFill('red').drawCircle(0, 0, 4)
									.beginFill('white').drawCircle(0, 0, 3)
									.beginFill('red').drawCircle(0, 0, 2);
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
		this.nickname = new Text(this.normalizedNick(worm.nickname), '14px sans-serif', worm.color);
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

	normalizedNick : function(nickname) {
		return nickname.length > 13 ? nickname.slice(0, 10) + "..." : nickname;
	},

	remove : function() {
		this.container.removeChild(this.position, this.nickname, this.score);
	},

};