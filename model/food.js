var CircularBoundary = require('./circular-boundary');

var availablePoints = [5, 10, 15, 20];

module.exports = function Food(id, x, y) {

	this.id = id;
	this.x = x;
	this.y = y;
	this.points = availablePoints[Math.floor(Math.random() * availablePoints.length)];
	this.boundary = new CircularBoundary(this.x, this.y, this.points / 2);
	
}