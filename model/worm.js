var color = require('randomcolor');
var Vector = require('v2d');

var CircularBoundary = require('./circular-boundary');
var Food = require('./food');

module.exports = function Worm(id, nickname) {

	this.id = id;
	this.nickname = nickname == null ? '' : nickname;
	this.x;
	this.y;
	this.score = 0;
	this.segments = new Array();
	this.color = color.randomColor();
	this.glasses = false;
	this.kills = 0;
	this.lastUpdate = null;


	this.head = function() {
		return this.segments[0];
	};

	this.tail = function() {
		return this.segments[this.segments.length-1];
	};

	this.generateHead = function() {
		var randomX = 1000 + Math.random() * 2000;
		var randomY = 1000 + Math.random() * 2000;
		this.segments[0] = new WormHead(randomX, randomY);
		this.x = randomX;
		this.y = randomY;
	};

	this.generateBody = function() {
		for(i = 1; i < 6; i++) {
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
		this.x = x;
		this.y = y;
	};

	this.lookTo = function(angle) {
		this.head().lookTo(angle);
	};

	this.eat = function(food) {
		this.score += food.points;
		while(this.segments.length <= this.score / 50 + 5) {
			this.grow();
		}
	};

	this.grow = function() {
		this.segments[this.segments.length] = new WormSegment(this.segments[this.segments.length-1]);
	};

	this.nitro = function(food) {
		this.score -= 5;
		if(this.segments.length > this.score / 50 + 5) {
			this.shrink();
		}
	};

	this.shrink = function() {
		this.segments = this.segments.slice(0, this.segments.length-1);
	};

	this.addKill = function() {
		this.kills++;
	};

	this.collectBounty = function(worm) {
		this.eat(new Food(null, 0, 0, null, worm.kills * 100));
		this.glasses = true;
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
			if(collision) {
				otherWorm.addKill();
			}
			return collision;
		} else {
			return false;
		}
	};

	this.collideWithBorder = function() {
		return !((this.x + 20 < 4000 && this.x - 20 > 0) && (this.y + 20 < 4000 && this.y - 20 > 0));
	}

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
