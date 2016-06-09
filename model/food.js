var CircularBoundary = require('./circular-boundary');

var availablePoints = [5, 10, 15, 20];

module.exports = function Food(id, x, y, points) {

	this.id = id;
	this.x = x;
	this.y = y;
	this.points = points == null ? availablePoints[Math.floor(Math.random() * availablePoints.length)] : points;
	this.boundary = new CircularBoundary(this.x, this.y, this.points / 2);
	
}