
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
	this.score;
	this.leader;

	this.stage = stage;

	this.foodContainer;
	this.wormsContainer;
	this.hudContainer;
	this.initContainers();
};

RenderEngine.prototype.initContainers = function() {
	this.foodContainer = new Container();
	this.wormsContainer = new Container();
	this.hudContainer = new Container();

	this.stage.addChild(this.foodContainer);
	this.stage.addChild(this.wormsContainer);
	this.stage.addChild(this.hudContainer);
};

RenderEngine.prototype.renderFrame = function() {
	this.renderWorm();
	this.renderOtherWorms();
	this.renderFoods();
	this.renderScore();
	this.renderLeader();
	this.stage.update();
}

RenderEngine.prototype.renderWorm = function() {
	if(this.wormNotRendered()) {
		this.worm = new WormShape(this.wormsContainer, Model.worm);
	} else {
		this.worm.update(Model.worm);
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
		this.otherWorms[id] = new WormShape(this.wormsContainer, Model.otherWorms[id]);
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

RenderEngine.prototype.renderScore = function() {
	if(this.scoreNotRendered()) {
		this.score = new ScoreText(this.hudContainer, Model.worm);
	} else {
		this.score.update(Model.worm);
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

RenderEngine.prototype.wormNotRendered = function() {
	return this.worm == null;
};

RenderEngine.prototype.otherWormNotRendered = function(id) {
	return this.otherWorms[id] == null;
};

RenderEngine.prototype.foodNotRendered = function(id) {
	return this.foods[id] == null;
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
	$("#start").fadeOut();
	$("#start").css("display", "none");
	$("#game").fadeIn();
};








/////////////////////////////


// Worm Visual Representation
/////////////////////////////
var WormShape = function(container, worm) {
	createjs.Shape.call(this);

	this.color = worm.color;
	this.bodySegments = new Array();
	this.nickname;

	this.create(container, worm);
};

// Extends of Shape class
WormShape.prototype = Object.create(createjs.Shape.prototype);
WormShape.prototype.constructor = WormShape;

WormShape.prototype.create = function(container, worm) {
	this.renderBody(container, worm)
	this.renderHead(container, worm.segments[0]);
	this.renderNickname(worm.nickname);
};

WormShape.prototype.renderBody = function(container, worm) {
	for(i = worm.segments.length-1; i > 0; i--) {
		this.renderBodySegment(container, i, worm.segments[i]);
	}
};

WormShape.prototype.renderBodySegment = function(container, index, segment) {
	this.bodySegments[index] = new Shape();
	this.bodySegments[index].graphics.beginFill(this.color).drawCircle(0, 0, 20);
	this.bodySegments[index].set({ x: segment.x, y: segment.y });
	container.addChild(this.bodySegments[index]);
};

WormShape.prototype.renderHead = function(container, head) {
	this.graphics.beginFill(this.color).drawCircle(0, 0, 20);
	this.graphics.setStrokeStyle(2,"square").beginStroke("#000000");
	this.graphics.beginFill("white").drawCircle(5, -8, 8); //ojo izquierdo
	this.graphics.beginFill("white").drawCircle(5, 8, 8); //ojo derecho
	this.graphics.beginFill("black").drawCircle(9, -8, 2); //pupila izquierda
	this.graphics.beginFill("black").drawCircle(9, 8, 2); //pupila derecha
	this.set({ x: head.x, y: head.y });
	this.rotation = head.rotation;

	container.addChild(this);
};

WormShape.prototype.renderNickname = function(nickname) {
	this.nickname = new Text(nickname, "14px Arial", "#FFFFFF");
	this.nickname.regX = this.nickname.getMeasuredWidth() / 2;
	this.nickname.regY = -20;
	this.nickname.x = this.x;
 	this.nickname.y = this.y;
	this.parent.addChild(this.nickname);
};

WormShape.prototype.remove = function() {
	this.parent.removeChild(this.nickname);

	for(i = 0; i < this.bodySegments.length; i++) {
		this.parent.removeChild(this.bodySegments[i]);
	}

	this.parent.removeChild(this);
};

WormShape.prototype.update = function(worm) {
	this.moveTo(worm.segments[0].x, worm.segments[0].y);
	this.lookTo(worm.segments[0].rotation);
	
	for(i = 1; i < worm.segments.length; i++) {
		this.bodySegments[i].x = worm.segments[i].x;
		this.bodySegments[i].y = worm.segments[i].y;
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
/////////////////////////////


// Food Visual Representation
/////////////////////////////
var FoodShape = function(container, food) {
	createjs.Shape.call(this);
	this.create(container, food);
};

// Extends of Shape class
FoodShape.prototype = Object.create(createjs.Shape.prototype);
FoodShape.prototype.constructor = FoodShape;

FoodShape.prototype.create = function(container, food) {
	this.graphics.beginFill('red').drawCircle(food.x, food.y, food.points / 2);
	this.alpha = 0;
	container.addChild(this);
	Tween.get(this).to({ alpha: 1 }, 1000);
};

FoodShape.prototype.remove = function() {
	this.parent.removeChild(this);
};
/////////////////////////////


// Score Visual Representation
//////////////////////////////
var ScoreText = function(container, worm) {
	createjs.Text.call(this);
	this.create(container, worm);
};

// Extends of Text class
ScoreText.prototype = Object.create(createjs.Text.prototype);
ScoreText.prototype.constructor = ScoreText;

ScoreText.prototype.create = function(container, worm) {
	this.text = worm.score;
	this.font = "bold 24px Arial";
	this.color = 'yellow';
	this.x = 20;
 	this.y = 20;
	container.addChild(this);
};

ScoreText.prototype.update = function(worm) {
	this.text = worm.score;
};
/////////////////////////////


// Leader Visual Representation
//////////////////////////////
var LeaderText = function(container, leader) {
	createjs.Text.call(this);
	this.create(container, leader);
};

// Extends of Text class
LeaderText.prototype = Object.create(createjs.Text.prototype);
LeaderText.prototype.constructor = LeaderText;

LeaderText.prototype.create = function(container, leader) {
	this.text = leader.nickname + " - " + leader.score;
	this.font = 'bold 12px Arial';
	this.color = 'yellow';
	this.x = 850;
 	this.y = 20;
	container.addChild(this);
};

LeaderText.prototype.update = function(leader) {
	this.text = leader.nickname + " - " + leader.score;
};
/////////////////////////////