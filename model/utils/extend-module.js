
exports.extendArray = function() {
    Array.prototype.clone = function() {
    	return this.slice(0, this.length);
    };

    Array.prototype.getIndex = function(id) {
        return this.indexOf(this.get(id));
    };

    Array.prototype.get = function(id) {
    	return this.getByProperty('id', id);
    };

    Array.prototype.getByProperty = function(propertyName, value) {
    	return this.find(function(elem) {
    		return elem[propertyName] == value;
    	});
    };
    
    Array.prototype.sortBy = function(propertyName, ascendent) {
    	this.sort(function(elem0, elem1) {
    		return ascendent ? elem0[propertyName] - elem1[propertyName] : elem1[propertyName] - elem0[propertyName];
    	});
    };

    Array.prototype.first = function(quantity) {
    	return quantity ? this.slice(0, quantity) : this[0];
    };

    Array.prototype.removeByID = function(id) {
        this.splice(this.getIndex(id), 1);
    };

};