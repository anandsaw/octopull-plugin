var $ = require('jquery');
var ko = require('knockout');
var inherits = require('inherits');
var EventEmitter = require('eventemitter2').EventEmitter2;

global.$ = $;
require('../libs/arrive.min.js');

// ** DiffViewModel ** //
function DiffViewModel() {
	var self = this;
	self.warnings = ko.observableArray([]);
	
	self.warningsForFileLineRevision = function(path, line, rev) {
		var i = 0;
		return ko.pureComputed(function() {
			return ko.utils.arrayFilter(self.warnings(), function(warning) {
				return warning.path == path && warning.line == line && warning.commit == rev;
			});
		});
	}
	
	self.hasWarningsForFileLineRevision = function(path, line, rev) {
		return ko.pureComputed(function() {
			var warnings = self.warningsForFileLineRevision(path, line, rev);
			return ko.unwrap(warnings).length;
		});
	}
}

DiffViewModel.prototype.addWarnings = function(warnings) {
	this.warnings.push.apply(this.warnings, warnings);
}
// ** /DiffViewModel ** //

function DiffView(element, base, head) {
	EventEmitter.call(this);
	var self = this;
	
	self._element = element;
	self._base = base;
	self._head = head;
	self._viewModel = new DiffViewModel();
	
	self.attach();
}
inherits(DiffView, EventEmitter);

DiffView.prototype.addWarnings = function(warnings) {
	this._viewModel.addWarnings(warnings);
}

DiffView.prototype.attach = function() {
	var self = this;
	
	var $files = $(this._element).find(".file");
	$files.each(function(index, element) {
		var path = $(element).find(".file-header").attr("data-path");
		
		var revisions = [ "base", "head" ];
		$(element).find(".diff-table > tbody > tr").each(function(index, row) {
			self.prepareRow(row, revisions);
		});
		$(element).arrive(".diff-table > tbody > tr", function() {
			var row = this;
			self.prepareRow(row, revisions);
		});

		$(element).find(".js-linkable-line-number").each(function(index, line) {
			self.attachLineNumber(line, path);
		});
		$(element).arrive(".js-linkable-line-number", function() {
			var line = this;
			self.attachLineNumber(line, path);
		});
	});
}

DiffView.prototype.prepareRow = function(row, revisions) {
	$(row).find(".blob-num").each(function(index, blob) {
		if (index < revisions.length)
			$(blob).addClass(revisions[index]);
	});
}

DiffView.prototype.attachLineNumber = function(line, path) {
	var self = this;
	
	var lineNumber = $(line).attr('data-line-number');
	console.log(lineNumber);
	var rev = null;
	if ($(line).hasClass('base')) {
		rev = self._base;
	} else if ($(line).hasClass('head')) {
		rev = self._head;
	}
	if (rev) {
		var arguments = JSON.stringify(path) + ", " + JSON.stringify(lineNumber) + ", " + JSON.stringify(rev);
		
		$(line).prepend(
			$("<span style='float: left; text-align: left;'>").addClass("select-menu").addClass("js-menu-container").addClass("js-select-menu").attr("data-bind", "if: hasWarningsForFileLineRevision(" + arguments + ")").append(
				$("<a href='#'>").addClass("js-menu-target").append($("<span style='line-height: 1.2em'>").addClass("octicon").addClass("octicon-primitive-dot").addClass("text-pending")),
				$("<div>").addClass("select-menu-modal-holder").addClass("js-menu-content").addClass("js-navigation-container").append(
					$("<div>").addClass("select-menu-modal").append(
						$("<div>").addClass("select-menu-header").append(
							$("<span>").addClass("select-menu-title").append("Warnings"),
							$("<span>").addClass("octicon").addClass("octicon-remove-close").addClass("js-menu-close")
						),
						$("<ul>").addClass("select-menu-list").attr("data-bind", "foreach: warningsForFileLineRevision(" + arguments + ");").append(
							$("<li>").addClass("select-menu-item").append(
								$("<span>").addClass("select-menu-item-text").attr("data-bind", "text: message")
							)
						)
					)
				)
			)
		);
	}
	ko.applyBindings(self._viewModel, line);
}

DiffView.prototype.remove = function() {
}

module.exports = DiffView;