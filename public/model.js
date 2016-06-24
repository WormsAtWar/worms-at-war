
var Model = function() {
	this.reset();
	this.renderObserver = null;
	this.soundsObserver = null;
};

Model.prototype = {

	suscribeRender : function(render) {
		this.renderObserver = render;
	},

	suscribeSounds : function(sounds) {
		this.soundsObserver = sounds;
	},

	reset : function() {
		this.worm = null;
		this.otherWorms = new Array();
		this.foods = new Array();
		this.wanted = null;
		this.topTen = new Array();
	},

	notifyLoginSuccess : function() {
		this.renderObserver.start();
		this.renderObserver.showGameStage();

		this.soundsObserver.mute(!$('#sounds').is(":checked"));
		this.soundsObserver.playBackgroundMusic();
	},

	notifyNewWormLogin : function(id) {
		this.renderObserver.createWorm(id);
	},

	notifySuppliedFood : function(id) {
		this.renderObserver.createFood(id);
	},

	notifyFoodSwallowed : function(id) {
		this.renderObserver.removeFood(id);
	},

	notifyWantedDead : function(id) {
		this.soundsObserver.wantedDead();
		this.renderObserver.putOnGlasses(id);
	},

	notifyDead : function() {
		this.soundsObserver.stopBackgroundMusic();
		this.soundsObserver.death();
		this.renderObserver.stopRenderWorm();
	},

	notifyAfterDeadEnds : function() {
		this.renderObserver.reset();
		this.renderObserver.showLoginStage();
	},

	notifyWormDisconnect : function(id) {
		this.renderObserver.removeWorm(id);
	},

	wormsAmount : function() {
		return this.otherWorms.length + 1;
	},

};