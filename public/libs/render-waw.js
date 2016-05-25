
// Worm Visual Representation
/////////////////////////////
var WormShape = function(stage, worm) {
	createjs.Shape.call(this);

	this.color = worm.color;
	this.bodySegments = new Array();
	this.nickname;

	this.create(stage, worm);
};

// Extends of Shape class
WormShape.prototype = Object.create(createjs.Shape.prototype);
WormShape.prototype.constructor = WormShape;

WormShape.prototype.create = function(stage, worm) {
	this.renderBody(stage, worm)
	this.renderHead(stage, worm.segments[0]);
	this.renderNickname(worm.nickname);
};

WormShape.prototype.renderBody = function(stage, worm) {
	for(i = worm.segments.length-1; i > 0; i--) {
		this.renderBodySegment(stage, i, worm.segments[i]);
	}
};

WormShape.prototype.renderBodySegment = function(stage, index, segment) {
	this.bodySegments[index] = new Shape();
	this.bodySegments[index].graphics.beginFill(this.color).drawCircle(0, 0, 20);
	this.bodySegments[index].set({ x: segment.x, y: segment.y });
	stage.addChild(this.bodySegments[index]);
};

WormShape.prototype.renderHead = function(stage, head) {
	this.graphics.beginFill(this.color).drawCircle(0, 0, 20);
	this.graphics.setStrokeStyle(2,"square").beginStroke("#000000");
	this.graphics.beginFill("white").drawCircle(5, -8, 8); //ojo izquierdo
	this.graphics.beginFill("white").drawCircle(5, 8, 8); //ojo derecho
	this.graphics.beginFill("black").drawCircle(9, -8, 2); //pupila izquierda
	this.graphics.beginFill("black").drawCircle(9, 8, 2); //pupila derecha
	this.set({ x: head.x, y: head.y });
	this.rotation = head.rotation;

	stage.addChild(this);
};

WormShape.prototype.renderNickname = function(nickname) {
	this.nickname = new Text(nickname, "14px Arial", "#FFFFFF");
	this.nickname.regX = this.nickname.getMeasuredWidth() / 2;
	this.nickname.regY = -20;
	this.nickname.x = this.x;
 	this.nickname.y = this.y;
	this.stage.addChild(this.nickname);
};

WormShape.prototype.remove = function() {
	this.stage.removeChild(this.nickname);

	for(i = 0; i < this.bodySegments.length; i++) {
		this.stage.removeChild(this.bodySegments[i]);
	}

	this.stage.removeChild(this);
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
var FoodShape = function(stage, food) {
	createjs.Shape.call(this);
	this.create(stage, food);
};

// Extends of Shape class
FoodShape.prototype = Object.create(createjs.Shape.prototype);
FoodShape.prototype.constructor = FoodShape;

FoodShape.prototype.create = function(stage, food) {
	this.graphics.beginFill('red').drawCircle(food.x, food.y, food.points / 2);
	this.alpha = 0;
	stage.addChild(this);
	createjs.Tween.get(this).to({ alpha: 1 }, 1000);
};

FoodShape.prototype.remove = function() {
	this.stage.removeChild(this);
};
/////////////////////////////


// Score Visual Representation
//////////////////////////////
var ScoreText = function(stage, worm) {
	createjs.Text.call(this);
	this.create(stage, worm);
};

// Extends of Text class
ScoreText.prototype = Object.create(createjs.Text.prototype);
ScoreText.prototype.constructor = ScoreText;

ScoreText.prototype.create = function(stage, worm) {
	this.text = worm.score;
	this.font = "bold 24px Arial";
	this.color = 'yellow';
	this.x = 20;
 	this.y = 20;
	stage.addChild(this);
};

ScoreText.prototype.update = function(worm) {
	this.text = worm.score;
};
/////////////////////////////


// Leader Visual Representation
//////////////////////////////
var LeaderText = function(stage, leader) {
	createjs.Text.call(this);
	this.create(stage, leader);
};

// Extends of Text class
LeaderText.prototype = Object.create(createjs.Text.prototype);
LeaderText.prototype.constructor = LeaderText;

LeaderText.prototype.create = function(stage, leader) {
	this.text = leader.nickname + " - " + leader.score;
	this.font = 'bold 12px Arial';
	this.color = 'yellow';
	this.x = 850;
 	this.y = 20;
	stage.addChild(this);
};

LeaderText.prototype.update = function(leader) {
	this.text = leader.nickname + " - " + leader.score;
};
/////////////////////////////