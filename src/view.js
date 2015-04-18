var $ = require('jquery');
var inherits = require('inherits');
var EventEmitter = require('eventemitter2').EventEmitter2;

var DiffView = require('./diff-view.js');
var RepoActionsView = require('./repo-actions-view.js');
var MessagesView = require('./msg-view.js');

global.$ = $;
require('jquery.lifecycle');
require('../libs/arrive.min.js');
require('jquery-screen-events')($);

function OctopullView() {
	EventEmitter.call(this);
	var self = this;
	
	self._counter = 0;
	self._loaded = false;
	self._waitForElements = [];
	
	self.diffView = null;
	self.repoActions = new RepoActionsView();
	self._progressBar = null;
	self._msgView = null;
	
	$(document).ready(self.onLoad.bind(self));
	$(document).leave("[data-loader-id]", { fireOnAttributesModification: true }, function() {
		var id = $(this).attr("data-loader-id");
		self._doneWaitingFor(id);
	});
}
inherits(OctopullView, EventEmitter);

OctopullView.prototype._waitFor = function(element) {
	var self = this;
	var oldLength = self._waitForElements.length;
	self._waitForElements.push(element);

	if (oldLength == 0) {
		self.onLoading();
	}
}

OctopullView.prototype._doneWaitingFor = function(element) {
	var self = this;
	if (self._waitForElements.length > 0) {
		self._waitForElements = self._waitForElements.filter(function(el) {
			return el !== element;
		});
		if (self._waitForElements.length == 0) {
			self.onLoad();
		}
	}
}

OctopullView.prototype._hookLoader = function(query) {
	var self = this;

	$(query).each(function(index, node) {
		var id = $(node).attr("data-loader-id");
		if (id === undefined) {
			id = "" + self._counter++;
			$(node).attr("data-loader-id", id);
			$(node).lifecycle({
				change: function(property, value) {
					if (property === "class") {
						var classes = value.split(/\s+/);
						if (classes.indexOf("is-context-loading") === -1) {
							self._doneWaitingFor(id);
						} else {
							self._waitFor(id);
						}
					}
				}
			});
		}
	});
}

OctopullView.prototype.onLoad = function() {
	this._hookLoader(".page-context-loader");
	this._hookLoader(".context-loader");
	
	this.createNotificationBar();
	
	this._loaded = true;
	this.emit("load", this.context());
}

OctopullView.prototype.onLoading = function() {
	this.removeDiffView();
	
	this._loaded = false;
	this.emit("loading");
}

OctopullView.prototype.context = function() {
	var owner = null;
	var repository = null;
	var pull_request = null;
	var diff_base = null;
	var diff_head = null;
	
	var repo = $(".js-current-repository").first().attr("href");
	if (repo) {
		var match = /^\/([^\/]+)\/([^\/]+)$/.exec(repo);
		if (match !== null) {
			owner = match[1];
			repository = match[2];
		}
	}
	
	var prnum = $(".gh-header-number").first().text();
	if (prnum) {
		var match = /^#([0-9]+)$/.exec(prnum);
		if (match !== null) {
			pull_request = match[1];
		}
	}
	
	var sha = {};
	$($(".issues-listing").parent().contents()).each(function(index, node) {
		if (node.nodeType == 8) {
			var match = /(base|head) sha1: &quot;([0-9a-z]+)&quot;/.exec(node.data);
			if (match !== null)
				sha[match[1]] = match[2];
		}
	});
	if ("base" in sha && "head" in sha) {
		diff_base = sha.base;
		diff_head = sha.head;
	}
	
	return {
		owner: owner,
		repository: repository,
		pull_request: pull_request,
		diff_base: diff_base,
		diff_head: diff_head
	};
}

OctopullView.prototype.setRepo = function(repo) {
	if (repo.diff) {
		repo.diff.repo = repo;
		this.createDiffView(repo.diff);
	}
}

OctopullView.prototype.createDiffView = function(diff) {
	var diffElement = $(".files-bucket > #diff").get(0);
	if (diffElement) {
		this.diffView = new DiffView(diffElement, diff);
	}
}

OctopullView.prototype.removeDiffView = function() {
	if (this.diffView !== null) {
		this.diffView.remove();
		this.diffView = null;
	}
}

OctopullView.prototype.clear = function() {
	this.repoActions.clear();
	if (this._msgView) {
		this._msgView.clear();
	}
	if (this.diffView) {
		this.diffView.clear();
	}
}

OctopullView.prototype.createNotificationBar = function() {
	var notificationBar = $(".octopull-notificationbar");
	if (notificationBar.get(0) == undefined) {
		notificationBar = $("<div>").addClass("octopull-notificationbar");
		$(".header").after(notificationBar);
	}
	
	$.screenoffset.breakpoint(notificationBar.offset().top, 'fixed-notification-bar');
	$(window).on('screenoffset.fixed-notification-bar', function (evt, breakpoint) {
		notificationBar.addClass('fixed');
	});
	$(window).on('screenoffset.default', function (evt, breakpoint) {
		notificationBar.removeClass('fixed');
	});
	
	this.createMessageView(notificationBar);
	this.createProgressBar(notificationBar);
}

OctopullView.prototype.createProgressBar = function(notificationBar) {
	if (this._progressBar == null) {
		this._progressBar = $("<div>").addClass("octopull-loader").prepend($("<div>").addClass("octopull-loader-bar"));
		$(notificationBar).append(this._progressBar);
	}
}

OctopullView.prototype.showProgressBar = function() {
	this._progressBar.addClass("loading");
}

OctopullView.prototype.hideProgressBar = function() {
	this._progressBar.removeClass("loading");
}

OctopullView.prototype.createMessageView = function(notificationBar) {
	if (this._msgView == null) {
		this._msgView = new MessagesView(notificationBar);
	}
}

OctopullView.prototype.addMessage = function(message) {
	this._msgView.addMessage(message);
}

module.exports = OctopullView;