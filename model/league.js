
module.exports = function League(id, leaderID, color) {
	
	this.id = id;
	this.members = [leaderID];
	this.color = color;

	this.addMember = function(memberID) {
		this.members.push(memberID);
	};

	this.removeMember = function(memberID) {
		this.members.splice(this.members.indexOf(memberID),1);
	};

};