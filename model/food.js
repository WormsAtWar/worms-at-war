var CircularBoundary = require('./circular-boundary');

module.exports = function Food(id, x, y, points) {

	this.id = id;
	this.x = x;
	this.y = y;
	this.points = points || 10;
	this.boundary = new CircularBoundary(this.x, this.y, 5);
	
}