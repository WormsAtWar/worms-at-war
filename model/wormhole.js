var Vector = require('v2d');

var CircularBoundary = require('./circular-boundary');

module.exports = function Wormhole(id, worm) {
	
	this.id = id;
	this.origin;
	this.destiny;

	this.setOrigin = function(worm) {
		var originPosition = Vector.sum(worm.head.vectorizedPosition(), Vector.scl(worm.head.displacement, 150));
		this.origin = {
			x: originPosition.x,
			y: originPosition.y,
		};
	};

	this.setDestiny = function() {
		this.destiny = {
			x: 500 + Math.random() * 3000,
			y: 500 + Math.random() * 3000,
		}
	};

	this.setOrigin(worm);
	this.setDestiny();

	this.boundary = new CircularBoundary(this.origin.x, this.origin.y, 10);

};