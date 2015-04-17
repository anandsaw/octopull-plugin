var $ = require('jquery');
var ko = require('knockout');
var inherits = require('inherits');
var EventEmitter = require('eventemitter2').EventEmitter2;
var templates = require('templates');

global.$ = $;
require('../libs/arrive.min.js');

// ** DiffViewModel ** //
function ViolationViewModel(diff, warning) {
	var self = this;
	self.diff = diff;
	self.warning = warning;
	
	self.severity = ko.pureComputed(function() {
		return 'warning';
	});
	
	self.path = warning.path;
	self.line = warning.line;
	self.commit = warning.commit;
	self.message = warning.message;
		
	self.comment = function() {
		
	};
}

function DiffViewModel() {
	var self = this;
	self.warnings = ko.observableArray([]);
	
	self.warningsForFileLineRevision = function(path, line, rev) {
		return ko.pureComputed(function() {
			return ko.utils.arrayFilter(self.warnings(), function(warning) {
				return warning.path == path && warning.line == line && warning.commit == rev;
			});
		});
	}
	
	self.hasWarningsForFileLineRevision = function(path, line, rev) {
		return ko.pureComputed(function() {
			var warnings = self.warningsForFileLineRevision(path, line, rev);
			return ko.unwrap(warnings).length > 0;
		});
	}
}

DiffViewModel.prototype.addWarnings = function(warnings) {
	var self = this;
	this.warnings.push.apply(this.warnings, warnings.map(function(warning) {
		return new ViolationViewModel(self, warning);
	}));
}

function DiffLineViewModel(diff, path, line, rev, position) {
	var self = this;
	self.diff = diff;
	
	self.summary = ko.pureComputed(function() {
		var warnings = self.getWarnings();
		var length = ko.unwrap(warnings).length;
		return length + " warning(s)";
	});
	
	self.worstSeverity = ko.pureComputed(function() {
		return 'ignore';
	});
	
	self.getWarnings = ko.pureComputed(function() {
		diff.warningsForFileLineRevision(path, line, rev);
	});
		
	self.hasWarnings = ko.pureComputed(function() {
		var warnings = self.getWarnings();
		return ko.unwrap(warnings).length > 0;
	});
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
	var position = $(row).find(".add-line-comment").attr("data-position");
	$(row).find(".blob-num").each(function(index, blob) {
		if (index < revisions.length)
			$(blob).addClass(revisions[index]);
		if (position !== undefined)
			$(blob).attr("data-position", position);
	});
}

DiffView.prototype.attachLineNumber = function(line, path) {
	var self = this;
	
	var lineNumber = $(line).attr('data-line-number');
	var position = $(line).attr('data-position');
	var rev = null;
	if ($(line).hasClass('base')) {
		rev = self._base;
	} else if ($(line).hasClass('head')) {
		rev = self._head;
	}
	if (rev) {
		templates.get('line-dot.html').then(function(template) {
			$(line).prepend($(template));
			ko.applyBindings(new DiffLineViewModel(self._viewModel, path, lineNumber, rev, position), line);
		});
	}
}

DiffView.prototype.remove = function() {
}

module.exports = DiffView;