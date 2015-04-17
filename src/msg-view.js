var $ = require('jquery');
var inherits = require('inherits');
var templates = require('templates');
var ko = require('knockout');
var EventEmitter = require('eventemitter2').EventEmitter2;

// viewmodel
function MessagesViewModel() {
	this.messages = ko.observableArray();
}
// end viewmodel

function MessagesView(parent) {
	EventEmitter.call(this);
	var self = this;
	
	self.viewModel = new MessagesViewModel();
	
	templates.get('message-container.html').then(function(template) {
		var tmpl = $(template);
		ko.applyBindings(self.viewModel, tmpl.get(0));
		$(parent).append(tmpl);
	});
}
inherits(MessagesView, EventEmitter);

MessagesView.prototype.addMessage = function(message) {
	this.viewModel.messages.push(message);
}

MessagesView.prototype.clear = function() {
	
}

module.exports = MessagesView;