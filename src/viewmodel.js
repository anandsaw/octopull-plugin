var ko = require('knockout');
var $ = require('jquery');
var inherits = require('inherits');
var EventEmitter = require('eventemitter2').EventEmitter2;
require('./ko_custom.js');
require('../libs/arrive.min.js');

global.$ = $;
require('jquery.lifecycle');

/*$(document).ready(function() {
	$(".page-context-loader").lifecycle({
		change: function(property) {
			console.log($(this));
			if (property === "class") {
				if ($(this).hasClass("is-context-loading")) {
					console.log("loading");
				} else {					
					console.log("done loading");
				}
			}
		}
	});
});

$(document).arrive(".is-context-loading", {fireOnAttributesModification: true}, function() {
    // 'this' refers to the newly created element
    var $newElem = $(this);
	console.log($newElem);
});*/

function OctopullViewModel() {
	EventEmitter.call(this);
	var self = this;
	
	self.loading = ko.observable(false);
	self.tooltip = ko.observable("");

	// Repository
	self._repoHref = ko.observable(null);
	self.repo = ko.pureComputed(function() {
		var href = self._repoHref();
		var match = /^\/([^\/]+)\/([^\/]+)$/.exec(href);
		if (match === null) {
			return null;
		} else {
			return {
				owner: match[1],
				repo: match[2]
			};
		}
	});
	
	// Pull Request
	self._prnumStr = ko.observable(null);
	self.prnum = ko.pureComputed(function() {
		var str = self._prnumStr();
		var match = /^#([0-9]+)$/.exec(str);
		if (match === null) {
			return null;
		} else {
			return match[1];
		}
	});
	
	self.repo.subscribe(function() {
		console.log(arguments);
	});
	self.prnum.subscribe(function() {
		console.log(arguments);
	});
}
inherits(OctopullViewModel, EventEmitter);

OctopullViewModel.prototype._bindOnArrival = function(query, bindings) {
	var self = this;
	
	if (typeof bindings === "array")
		bindings = bindings.join(",");
	
	$(document).arrive(query, function() {
		var element = $(this);
		
		element.attr("data-bind", bindings);
		ko.applyBindings(self, $(this).get(0));
	});
}

OctopullViewModel.prototype.init = function() {
	var self = this;
	
	self._bindOnArrival(".js-current-repository", [
		"read_href: _repoHref",
		"leave: function() { _repoHref(null) }"
	]);
	self._bindOnArrival(".view-pull-request  .gh-header-number", [
		"read_text: _prnumStr",
		"leave: function() { _prnumStr(null) }"
	]);

	$(document).ready(function() {
		$(".header-logo-invertocat").attr("data-bind", "style: { color: loading() ? 'red' : 'blue' }");
		
		//ko.applyBindings(self);
		
		self.emit("ready");
	});
}

module.exports = OctopullViewModel;