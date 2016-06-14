
// Short alias
var Sound = createjs.Sound;


var SoundEngine = function() {
	this.init();
};

SoundEngine.prototype.init = function() {
	Sound.registerSounds([
		{ src: 'login.ogg', id : 'login' },
		{ src: 'death.ogg', id : 'death' }
	], 'sounds/');
};

SoundEngine.prototype.login = function() {
	Sound.play('login');
};

SoundEngine.prototype.death = function() {
	Sound.play('death');
};