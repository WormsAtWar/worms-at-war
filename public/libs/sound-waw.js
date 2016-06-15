
// Short alias
var Sound = createjs.Sound;


var SoundEngine = function() {
	this.init();
};

SoundEngine.prototype.init = function() {
	Sound.registerSounds([
		{ src: 'background_music.ogg', id: 'backgroundMusic' },
		{ src: 'death.ogg', id: 'death' },
		{ src: 'TurnDownForWhat.ogg', id: 'wantedDead' }
	], 'sounds/');
};

SoundEngine.prototype.audioOn = function() {
	Sound.muted = false;
};

SoundEngine.prototype.audioOff = function() {
	Sound.muted = true;
};

SoundEngine.prototype.death = function() {
	Sound.play('death');
};

SoundEngine.prototype.wantedDead = function() {
	Sound.play('wantedDead');
};

SoundEngine.prototype.playBackgroundMusic = function() {
	this.backgroundMusic = Sound.play('backgroundMusic', { volume: 0.05, loop: -1 });
};

SoundEngine.prototype.stopBackgroundMusic = function() {
	Sound.stop(this.backgroundMusic);
};