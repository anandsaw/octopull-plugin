var inherits = require('inherits');
var EventEmitter = require('eventemitter2').EventEmitter2;

function WarningsModel() {
	EventEmitter.call(this);
	var self = this;
}
inherits(WarningsModel, EventEmitter);

WarningsModel.get = function() {
	if (WarningsModel._instance) {
		return WarningsModel._instance;
	} else {
		return (WarningsModel._instance = new WarningsModel());
	}
}

module.exports = WarningsModel;