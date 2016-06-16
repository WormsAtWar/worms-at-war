
module.exports = function CircularBoundary(x, y, radius) {

	this.x = x;
	this.y = y;
	this.radius = radius;
	

	this.update = function(subject) {
		this.x = subject.x;
		this.y = subject.y;
	};

	this.collide = function(boundary) {
		var dx = this.x - boundary.x;
		var dy = this.y - boundary.y;
		var distance = Math.sqrt(dx * dx + dy * dy);

		return distance < this.radius + boundary.radius;
	};

}