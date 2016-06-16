
var FIFOArray = function() {
	Array.call(this);
};

// Extends of Shape class
FIFOArray.prototype = Object.create(Array.prototype);
FIFOArray.prototype.constructor = FIFOArray;

FIFOArray.prototype.add = function(element) {
	this.unshift(element);
};

FIFOArray.prototype.first = function() {
	return this[0];
};

FIFOArray.prototype.last = function() {
	return this[this.length-1];
};

FIFOArray.prototype.remove = function() {
	this.pop();
};

module.exports = FIFOArray;