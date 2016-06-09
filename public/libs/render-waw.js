
// Short alias
var Stage = createjs.Stage;
var Container = createjs.Container;
var Graphics = createjs.Graphics;
var Shape = createjs.Shape;
var Text = createjs.Text;
var Ticker = createjs.Ticker;
var Tween = createjs.Tween;


// RENDER ENGINE
/////////////////////////////
var RenderEngine = function(stage) {
	this.worm;
	this.otherWorms = new Array();
	this.foods = new Array();
	this.minimap;
	this.score;
	this.leader;
	this.fps;

	this.stage = stage;

	this.initContainers();
};

RenderEngine.prototype.initContainers = function() {
	this.worldContainer = new Container();
	this.foodContainer = new Container();
	this.otherWormsContainer = new Container();
	this.wormContainer = new Container();
	this.minimapContainer = new Container();
	this.hudContainer = new Container();

	this.createWorldBackground();
	this.worldContainer.regX = -500;
	this.worldContainer.regY = -300;
	this.worldContainer.addChild(this.foodContainer);
	this.worldContainer.addChild(this.otherWormsContainer);

	this.hudContainer.addChild(this.minimapContainer);
	
	this.stage.addChild(this.worldContainer);
	this.stage.addChild(this.wormContainer);
	this.stage.addChild(this.hudContainer);
};

RenderEngine.prototype.createWorldBackground = function() {
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
} 

RenderEngine.prototype.renderFrame = function() {
	this.renderWorm();
	this.renderOtherWorms();
	this.renderFoods();
	this.renderMinimap();
	this.renderScore();
	this.renderLeader();
	this.renderFPS();
	this.stage.update();
}

RenderEngine.prototype.renderWorm = function() {
	if(this.wormNotRendered()) {
		this.worm = new WormShape(this.wormContainer);
		this.worldContainer.x = -Model.worm.x;
		this.worldContainer.y = -Model.worm.y;
	} else {
		this.worldContainer.x = -Model.worm.x;
		this.worldContainer.y = -Model.worm.y;
		this.worm.update();
	}
};

RenderEngine.prototype.renderOtherWorms = function() {
	for(id in Model.otherWorms) {
		if(Model.otherWorms[id] != null) {
			this.renderOtherWorm(id);
		}
	}
};

RenderEngine.prototype.renderOtherWorm = function(id) {
	if(this.otherWormNotRendered(id)) {
		this.otherWorms[id] = new OtherWormShape(this.otherWormsContainer, Model.otherWorms[id]);
	} else {
		this.otherWorms[id].update(Model.otherWorms[id]);
	}
};

RenderEngine.prototype.renderFoods = function() {
	for(id in Model.foods) {
		if(Model.foods[id] != null) {
			this.renderFood(id);
		}
	}
};

RenderEngine.prototype.renderFood = function(id) {
	if(this.foodNotRendered(id)) {
		this.foods[id] = new FoodShape(this.foodContainer, Model.foods[id]);
	}
};

RenderEngine.prototype.renderMinimap = function() {
	if(this.minimapNotRendered()) {
		this.minimap = new MinimapShape(this.minimapContainer);
	} else {
		this.minimap.update();
	}
};

RenderEngine.prototype.renderScore = function() {
	if(this.scoreNotRendered()) {
		this.score = new ScoreText(this.hudContainer);
	} else {
		this.score.update();
	}
};

RenderEngine.prototype.renderLeader = function() {
	if(this.leaderNotRendered()) {
		if(Model.leader != null) {
			this.leader = new LeaderText(this.hudContainer, Model.leader);
		}
	} else {
		this.leader.update(Model.leader);
	}
};

RenderEngine.prototype.renderFPS = function() {
	if(this.fps == null) {
		this.fps = new Text(Math.round(Ticker.getMeasuredFPS()) + " fps", '14px sans-serif', '#FFFFFF');
		this.fps.set({
			x: 20,
			y: 570
		});
		this.hudContainer.addChild(this.fps);
	} else {
		this.fps.text = Math.round(Ticker.getMeasuredFPS()) + " fps"; 
	}
};

RenderEngine.prototype.wormNotRendered = function() {
	return this.worm == null;
};

RenderEngine.prototype.otherWormNotRendered = function(id) {
	return this.otherWorms[id] == null;
};

RenderEngine.prototype.foodNotRendered = function(id) {
	return this.foods[id] == null;
};

RenderEngine.prototype.minimapNotRendered = function(id) {
	return this.minimap == null;
};

RenderEngine.prototype.scoreNotRendered = function() {
	return this.score == null;
};

RenderEngine.prototype.leaderNotRendered = function() {
	return this.leader == null;
};

RenderEngine.prototype.removeWorm = function(id) {
	this.otherWorms[id].remove();
};

RenderEngine.prototype.removeFood = function(id) {
	this.foods[id].remove();
};

RenderEngine.prototype.showGameStage = function() {
	$("#login").fadeOut();
	$("#login").css("display", "none");
	$("#world").fadeIn();
};
/////////////////////////////






// Worm Visual Representation
/////////////////////////////
var WormShape = function(container) {
	Shape.call(this);

	this.color = Model.worm.color;
	this.bodySegments = new Array();

	this.create(container);
};

// Extends of Shape class
WormShape.prototype = Object.create(Shape.prototype);
WormShape.prototype.constructor = WormShape;

WormShape.prototype.create = function(container) {
	this.renderBody(container)
	this.renderHead(container);
	this.renderNickname();
};

WormShape.prototype.renderBody = function(container) {
	for(i = Model.worm.segments.length-1; i > 0; i--) {
		this.renderBodySegment(container, i, Model.worm.segments[i]);
	}
};

WormShape.prototype.renderBodySegment = function(container, index, segment) {
	this.bodySegments[index] = new Shape();
	this.bodySegments[index].graphics.beginFill(this.color).drawCircle(0, 0, 20);
	this.bodySegments[index].set({ 
		x: segment.x, 
		y: segment.y, 
	});
	
	container.addChild(this.bodySegments[index]);
};

WormShape.prototype.renderHead = function(container) {
	this.graphics.beginFill(this.color).drawCircle(0, 0, 20);
	this.graphics.setStrokeStyle(2, 'square').beginStroke('#000000');
	this.graphics.beginFill('white').drawCircle(5, -8, 8); //ojo izquierdo
	this.graphics.beginFill('white').drawCircle(5, 8, 8); //ojo derecho
	this.graphics.beginFill('black').drawCircle(9, -8, 2); //pupila izquierda
	this.graphics.beginFill('black').drawCircle(9, 8, 2); //pupila derecha
	this.set({ 
		x: 500, 
		y: 300, 
		rotation:Model.worm.segments[0].rotation, 
	});

	container.addChild(this);
};

WormShape.prototype.renderNickname = function() {
	this.nickname = new Text(Model.worm.nickname, 'bold 14px sans-serif', '#FFFFFF');
	this.nickname.set({
		regX: this.nickname.getMeasuredWidth() / 2,
		regY: -20,
		x: this.x,
		y: this.y,
	});

	this.parent.addChild(this.nickname);
};

WormShape.prototype.remove = function() {
	this.parent.removeChild(this.nickname);

	for(i = 0; i < this.bodySegments.length; i++) {
		this.parent.removeChild(this.bodySegments[i]);
	}

	this.parent.removeChild(this);
};

WormShape.prototype.update = function() {
	this.lookTo(Model.worm.segments[0].rotation);
	
	for(i = 1; i < Model.worm.segments.length; i++) {
		if(this.segmentNotRendered(i)) {
			this.renderBodySegment(this.parent, i, Model.worm.segments[i]);
		} else {
			this.bodySegments[i].x = Model.worm.segments[i].x - Model.worm.x + 500;
			this.bodySegments[i].y = Model.worm.segments[i].y - Model.worm.y + 300;
		}
	}
};

WormShape.prototype.moveTo = function(x, y) {
	this.x = x;
	this.y = y;
	this.nickname.x = x;
	this.nickname.y = y;
};

WormShape.prototype.lookTo = function(angle) {
	this.rotation = angle;
};

WormShape.prototype.segmentNotRendered = function(id) {
	return this.bodySegments[id] == null;
};
/////////////////////////////






// Other Worm Visual Representation
///////////////////////////////////
var OtherWormShape = function(container, worm) {
	Shape.call(this);

	this.color = worm.color;
	this.bodySegments = new Array();
	this.nickname;

	this.create(container, worm);
};

// Extends of Shape class
OtherWormShape.prototype = Object.create(Shape.prototype);
OtherWormShape.prototype.constructor = OtherWormShape;

OtherWormShape.prototype.create = function(container, worm) {
	this.renderBody(container, worm)
	this.renderHead(container, worm.segments[0]);
	this.renderNickname(worm.nickname);
};

OtherWormShape.prototype.renderBody = function(container, worm) {
	for(i = worm.segments.length-1; i > 0; i--) {
		this.renderBodySegment(container, i, worm.segments[i]);
	}
};

OtherWormShape.prototype.renderBodySegment = function(container, index, segment) {
	this.bodySegments[index] = new Shape();
	this.bodySegments[index].graphics.beginFill(this.color).drawCircle(0, 0, 20);
	this.bodySegments[index].set({ 
		x: segment.x, 
		y: segment.y, 
	});
	
	container.addChild(this.bodySegments[index]);
};

OtherWormShape.prototype.renderHead = function(container, head) {
	this.graphics.beginFill(this.color).drawCircle(0, 0, 20);
	this.graphics.setStrokeStyle(2, 'square').beginStroke('#000000');
	this.graphics.beginFill('white').drawCircle(5, -8, 8); //ojo izquierdo
	this.graphics.beginFill('white').drawCircle(5, 8, 8); //ojo derecho
	this.graphics.beginFill('black').drawCircle(9, -8, 2); //pupila izquierda
	this.graphics.beginFill('black').drawCircle(9, 8, 2); //pupila derecha
	this.set({ 
		x: head.x, 
		y: head.y, 
		rotation: head.rotation, 
	});

	container.addChild(this);
};

OtherWormShape.prototype.renderNickname = function(nickname) {
	this.nickname = new Text(nickname, '14px sans-serif', '#FFFFFF');
	this.nickname.set({
		regX: this.nickname.getMeasuredWidth() / 2,
		regY: -20,
		x: this.x,
		y: this.y,
	});

	this.parent.addChild(this.nickname);
};

OtherWormShape.prototype.remove = function() {
	this.parent.removeChild(this.nickname);

	for(i = 0; i < this.bodySegments.length; i++) {
		this.parent.removeChild(this.bodySegments[i]);
	}

	this.parent.removeChild(this);
};

OtherWormShape.prototype.update = function(worm) {
	this.moveTo(worm.x, worm.y);
	this.lookTo(worm.segments[0].rotation);
	
	for(i = 1; i < worm.segments.length; i++) {
		if(this.segmentNotRendered(i)) {
			this.renderBodySegment(this.parent, i, worm.segments[i]);
		} else {
			this.bodySegments[i].x = worm.segments[i].x;
			this.bodySegments[i].y = worm.segments[i].y;
		}
	}
};

OtherWormShape.prototype.moveTo = function(x, y) {
	this.x = x;
	this.y = y;
	this.nickname.x = x;
	this.nickname.y = y;
};

OtherWormShape.prototype.lookTo = function(angle) {
	this.rotation = angle;
};

OtherWormShape.prototype.segmentNotRendered = function(id) {
	return this.bodySegments[id] == null;
};
/////////////////////////////






// Food Visual Representation
/////////////////////////////
var FoodShape = function(container, food) {
	Shape.call(this);
	this.create(container, food);
};

// Extends of Shape class
FoodShape.prototype = Object.create(Shape.prototype);
FoodShape.prototype.constructor = FoodShape;

FoodShape.prototype.create = function(container, food) {
	this.graphics.beginFill(food.color).drawCircle(food.x, food.y, food.points / 2);
	this.set({ alpha: 0 });

	container.addChild(this);
	
	Tween.get(this).to({ alpha: 1 }, 1000);
};

FoodShape.prototype.remove = function() {
	this.parent.removeChild(this);
};
/////////////////////////////






// Minimap Visual Representation
/////////////////////////////
var MinimapShape = function(container) {
	Shape.call(this);

	this.wormBlip;

	this.create(container);
};

// Extends of Shape class
MinimapShape.prototype = Object.create(Shape.prototype);
MinimapShape.prototype.constructor = MinimapShape;

MinimapShape.prototype.create = function(container) {
	this.graphics.beginFill('grey').drawRect(0, 0, 80, 80);
	this.set({
		x: 900,
		y: 500,
		alpha: 0.5
	});
	container.addChild(this);
	
	this.renderWormBlip();
};

MinimapShape.prototype.renderWormBlip = function() {
	var blipX = this.x + Model.worm.x / 50;
	var blipY = this.y + Model.worm.y / 50;

	this.wormBlip = new Shape();
	this.wormBlip.graphics.beginFill(Model.worm.color).drawCircle(0, 0, 3);
	this.wormBlip.set({
		x: blipX,
		y: blipY
	});

	this.parent.addChild(this.wormBlip);
};

MinimapShape.prototype.update = function() {
	this.wormBlip.x = this.x + Model.worm.x / 50;
	this.wormBlip.y = this.y + Model.worm.y / 50;
};
/////////////////////////////






// Score Visual Representation
//////////////////////////////
var ScoreText = function(container) {
	Text.call(this);
	this.create(container);
};

// Extends of Text class
ScoreText.prototype = Object.create(Text.prototype);
ScoreText.prototype.constructor = ScoreText;

ScoreText.prototype.create = function(container) {
	this.text = Model.worm.score;
	this.font = "bold 24px sans-serif";
	this.color = 'yellow';
	this.x = 20;
 	this.y = 20;
	container.addChild(this);
};

ScoreText.prototype.update = function() {
	this.text = Model.worm.score;
};
/////////////////////////////






// Leader Visual Representation
//////////////////////////////
var LeaderText = function(container, leader) {
	Text.call(this);
	this.create(container, leader);
};

// Extends of Text class
LeaderText.prototype = Object.create(Text.prototype);
LeaderText.prototype.constructor = LeaderText;

LeaderText.prototype.create = function(container, leader) {
	this.set({
		text: leader.nickname + " - " + leader.score,
		font: 'bold 12px sans-serif',
		color: 'yellow',
		x: 850,
		y: 20,
	});

	container.addChild(this);
};

LeaderText.prototype.update = function(leader) {
	this.text = leader.nickname + " - " + leader.score;
};
/////////////////////////////