var color = require('randomcolor');
var Vector = require('v2d');
var FIFOArray = require('./utils/FIFOArray');

var CircularBoundary = require('./circular-boundary');
var Food = require('./food');

module.exports = function Worm(id, nickname) {

	this.id = id;
	this.nickname = nickname == null ? '' : nickname;
	this.x;
	this.y;
	this.score = 0;
	this.head;
	this.segments = new FIFOArray();
	this.color = color.randomColor();
	this.glasses = false;
	this.kills = 0;
	this.lastUpdate = null;

	this.deltaDisplacement = 15;
	this.modul = 0;


	this.tail = function() {
		return this.segments.last();
	};

	this.length = function() {
		return this.score / 50 + 5;
	}

	this.generateHead = function() {
		var randomX = 1000 + Math.random() * 2000;
		var randomY = 1000 + Math.random() * 2000;
		this.head = new WormHead(randomX, randomY);
		this.x = randomX;
		this.y = randomY;
	};

	this.generateHead();
	
	this.moveTo = function(displacement) {
		this.head.moveTo(displacement);
		this.x = this.head.x;
		this.y = this.head.y;

		this.modul += Vector.len(displacement);
		
		if(this.modul >= this.deltaDisplacement) {
			this.modul = this.modul - this.deltaDisplacement;
			this.segments.add(new WormSegment(this.x, this.y));
			if(this.segments.length > this.length()) {
				while(this.segments.length >= this.length()) {
					this.segments.remove();
				}
			}
		}
	};

	this.lookTo = function(angle) {
		this.head.lookTo(angle);
	};

	this.eat = function(food) {
		this.score += food.points;
	};

	this.nitro = function(food) {
		this.score -= 5;
	};

	this.addKill = function() {
		this.kills++;
	};

	this.putOnTheGlasses = function() {
		this.glasses = true;
	};

	this.collectBounty = function(worm) {
		this.eat(new Food(null, 0, 0, null, worm.kills * 100));
		this.putOnTheGlasses();
	};

	this.collideFood = function(food) {
		return this.head.collide(food);
	};

	this.collideHeadToBody = function(otherWorm) {
		if(this.id != otherWorm.id) {
			var collision = (this.head.collide(otherWorm.head)) && (this.score < otherWorm.score);
			if(!collision) {
				for(i = 0; i < otherWorm.segments.length; i++) {
					collision = collision || (this.head.collide(otherWorm.segments[i]));
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
	this.nextMove = Vector(0,0);
	this.rotation = 0;
	this.boundary = new CircularBoundary(this.x, this.y, 23);


	this.collide = function(collisionable) {
		return this.boundary.collide(collisionable.boundary);
	};

	this.lookTo = function(angle) {
		this.rotation = angle;
	};
	
	this.vectorizedPosition = function() {
		return Vector(this.x, this.y);
	}

	this.moveTo = function(displacement) {
		var newPosition = Vector.sum(this.vectorizedPosition(), this.nextMove);
		this.x = newPosition.x;
		this.y = newPosition.y;
		this.nextMove = displacement;
		this.boundary.update(this);
	};

}


function WormSegment(x,y) {

	this.x = x;
	this.y = y;
	this.nextMove = Vector(0,0);
	this.boundary = new CircularBoundary(this.x, this.y, 20);

	this.vectorizedPosition = function() {
		return Vector(this.x, this.y);
	}

	this.move = function(next) {
		var newPosition = Vector.sum(this.vectorizedPosition(), this.nextMove);
		this.x = newPosition.x;
		this.y = newPosition.y;
		this.nextMove = next.nextMove;
		this.boundary.update(this);
	};

}
