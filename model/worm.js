var color = require('randomcolor');

var CircularBoundary = require('./circular-boundary');

module.exports = function Worm(id, nickname, x, y, nickColor) {

	this.id = id;
	this.nickname = nickname == null ? '' : nickname;
	this.x = x;
	this.y = y;
	this.score = 0;
	this.boundary = new CircularBoundary(this.x, this.y, 20);
	this.headRotation = 0;
	this.color = color.randomColor({ luminosity: 'dark' });
	this.lastUpdate = null;

	this.moveTo = function(x, y) {
		this.x = x;
		this.y = y;
	};

	this.lookTo = function(angle) {
		this.headRotation = angle;
	};

	this.eat = function(food) {
		this.score += food.points;
	};

}