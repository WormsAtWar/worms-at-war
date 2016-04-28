
createjs.DisplayObject.prototype.setPPS = function(x = 170, y = 170) {
	this.vX = Math.round(x / Ticker.getFPS());
	this.vY = Math.round(y / Ticker.getFPS());
	this.ppmsX = x / 1000;
	this.ppmsY = y / 1000;
}

createjs.DisplayObject.prototype.timeToDestination = function(x, y) {
	var distX = Math.abs(x - this.x);
	var distY = Math.abs(y - this.y);
	var duration = Math.max(distX / this.ppmsX, distY / this.ppmsY);
	return duration;
}