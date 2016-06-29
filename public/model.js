
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
		this.team = null;
		this.foods = new Array();
		this.wanted = null;
		this.topTen = new Array();
		this.wormholes = new Array();
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

	notifyWormholeCreated : function(id) {
		this.soundsObserver.wormholeCreated();
		this.renderObserver.createWormhole(id);
	},

	notifyNewWormhole : function(id) {
		this.renderObserver.createWormhole(id);
	},

	notifyTeleportation : function() {
		this.soundsObserver.teleportation();
	},

	notifyWormholeCollapsed : function(id) {
		this.renderObserver.removeWormhole(id);
	},

	notifyDead : function() {
		this.soundsObserver.stopBackgroundMusic();
		this.soundsObserver.death();
		this.renderObserver.dead();
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

	wormholeAvailable : function() {
		return !this.worm.wormholeCreated && this.worm.score >= 100;
	},

	isMostWanted : function(worm) {
		return Model.wanted && worm.id == model.wanted.id;
	},

	wantedNotTeamMember : function() {
		return Model.team && Model.wanted && !Model.team.members.includes(Model.wanted.id);
	},

};