
// Short alias
var Sound = createjs.Sound;


var SoundEngine = function() {
	Model.suscribeSounds(this);
	this.init();
};

SoundEngine.prototype = {
	init : function() {
		Sound.registerSounds([
			{ src: 'background_music.ogg', id: 'backgroundMusic' },
			{ src: 'death.ogg', id: 'death' },
			{ src: 'TurnDownForWhat.ogg', id: 'wantedDead' }
		], 'sounds/');
	},

	mute : function(muted) {
		Sound.muted = muted;
	},

	death : function() {
		Sound.play('death');
	},

	wantedDead : function() {
		Sound.play('wantedDead');
	},

	playBackgroundMusic : function() {
		this.backgroundMusic = Sound.play('backgroundMusic', { volume: 0.05, loop: -1 });
	},

	stopBackgroundMusic : function() {
		Sound.stop(this.backgroundMusic);
	},
};
