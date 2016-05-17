
module.exports  = function Worm(id, nickname, x, y) {

	this.id = id;
	this.nickname = nickname == null ? '' : nickname;
	this.x = x;
	this.y = y;
	this.headRotation = 0;
	this.lastUpdate = null;

	this.moveTo = function(x, y) {
		this.x = x;
		this.y = y;
	};

	this.lookTo = function(angle) {
		this.headRotation = angle;
	};

}