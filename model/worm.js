var color = require('randomcolor');
var Vector = require('v2d');

var CircularBoundary = require('./circular-boundary');

module.exports = function Worm(id, nickname) {

	this.id = id;
	this.nickname = nickname == null ? '' : nickname;
	this.score = 0;
	this.segments = new Array();
	this.color = color.randomColor();
	this.lastUpdate = null;


	this.head = function() {
		return this.segments[0];
	};

	this.generateHead = function() {
		var randomX = Math.random() * 3980 + 10;
		var randomY = Math.random() * 3980 + 10;
		this.segments[0] = new WormHead(randomX, randomY);
	};

	this.generateBody = function() {
		for(i = 1; i < 20; i++) {
			this.segments[i] = new WormSegment(this.segments[i-1]);
		}
	};

	this.generateHead();
	this.generateBody();

	this.moveTo = function(x, y) {
		for(i = this.segments.length - 1; i > 0; i--) {
			this.segments[i].moveTo(this.segments[i-1]);
		}
		this.head().moveTo(x, y);
	};

	this.lookTo = function(angle) {
		this.head().lookTo(angle);
	};

	this.eat = function(food) {
		this.score += food.points;
	};

	this.collideFood = function(food) {
		return this.head().collide(food);
	};

	this.collideHeadToBody = function(otherWorm) {
		if(this.id != otherWorm.id) {
			var collision = (this.head().collide(otherWorm.head())) && (this.score < otherWorm.score);
			if(!collision) {
				for(i = 1; i < otherWorm.segments.length; i++) {
					collision = collision || (this.head().collide(otherWorm.segments[i]));
				}
			}
			return collision;
		} else {
			return false;
		}
	};

};


function WormHead(x, y) {

	this.x = x;
	this.y = y;
	this.rotation = 0;
	this.boundary = new CircularBoundary(this.x, this.y, 20);


	this.collide = function(collisionable) {
		return this.boundary.collide(collisionable.boundary);
	};

	this.updateBoundary = function() {
		this.boundary.x = this.x;
		this.boundary.y = this.y;
	};

	this.lookTo = function(angle) {
		this.rotation = angle;
	};
	
	this.vectorizedPosition = function() {
		return Vector(this.x, this.y);
	}

	this.moveTo = function(x, y) {
		this.x = x;
		this.y = y;
		this.updateBoundary();
	};

}


function WormSegment(next) {

	this.x = next.x;
	this.y = next.y;
	this.boundary = new CircularBoundary(this.x, this.y, 20);


	this.collide = function(collisionable) {
		return this.boundary.collide(collisionable);
	};

	this.updateBoundary = function() {
		this.boundary.x = this.x;
		this.boundary.y = this.y;
	};

	this.vectorizedPosition = function() {
		return Vector(this.x, this.y);
	}

	this.moveTo = function(next) {
		this.x = next.x;
		this.y = next.y;
		this.updateBoundary();
	};

}
