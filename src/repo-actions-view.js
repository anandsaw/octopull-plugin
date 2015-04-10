var $ = require('jquery');
var inherits = require('inherits');
var EventEmitter = require('eventemitter2').EventEmitter2;

function RepoActionsView() {
	EventEmitter.call(this);
	var self = this;
}
inherits(RepoActionsView, EventEmitter);

RepoActionsView.prototype.clear = function() {
	
}

module.exports = RepoActionsView;