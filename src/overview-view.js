var $ = require('jquery');
var ko = require('knockout');
var Q = require('q');
var inherits = require('inherits');
var EventEmitter = require('eventemitter2').EventEmitter2;
var templates = require('templates');

function OverviewViewModel() {
  var self = this;
  
  self.activeTab = ko.observable('filters');
  
  self.baseCommit = ko.observable();
  self.headCommit = ko.observable();
  
  self.href = function(path, linenumber, commit) {
    var cm = "";
    if (commit == self.baseCommit())
      cm = ".base";
    else if (commit == self.headCommit())
      cm = ".head";
    else
      return null;
    
    var line = $("#files")
      .find(".file-header[data-path=" + JSON.stringify(path) + "]")
      .next(".data")
      .find(cm + ".js-linkable-line-number[data-line-number=" + JSON.stringify(linenumber) + "]");
    if (line.length == 1) {
      return "#" + line.attr('id');
    } else {
      return null;
    }
  };
    
  self.warnings = ko.observableArray();
  self.selectedWarnings = ko.computed(function() {
    return self.warnings().filter(function(value, index, array) {
		return self.toolActive(value.tool)() && self.href(value.path, value.line, value.commit) != null;
	});
  });
  
  self.toolActiveObservables = [];
  self.toolActive = function(tool) {
	  if (self.toolActiveObservables[tool]) {
		  return self.toolActiveObservables[tool];
	  } else {
		  return self.toolActiveObservables[tool] = ko.observable(true);
	  }
  };
  
  self.tools = ko.pureComputed(function() {
	var tools = {};
	self.warnings().forEach(function(w) {
	  if (!tools[w.tool]) {
        tools[w.tool] = {
          name: w.tool,
          active: self.toolActive(w.tool)
        };
      }
	});
	return Object.keys(tools).map(function(t) { return tools[t]; });
  });
  
  self.warningsForTool = function(tool) {
    return ko.pureComputed(function() {
      return ko.utils.arrayFilter(self.warnings(), function(warning) {
        return warning.tool == tool && self.href(warning.path, warning.line, warning.commit) != null;
      });
    });
  };
}

function OctopullOverviewView() {
	EventEmitter.call(this);
	var self = this;
  
  self.viewModel = new OverviewViewModel();
  $(self.attach.bind(self));
}
inherits(OctopullOverviewView, EventEmitter);

OctopullOverviewView.prototype.attach = function() {
  var self = this;
  templates.get('overview.html').then(function(template) {
    var x = $(template).appendTo("body");
    ko.applyBindings(self.viewModel, x.get(0));
  });
}

OctopullOverviewView.get = function() {
	if (OctopullOverviewView._instance) {
		return OctopullOverviewView._instance;
	} else {
		return (OctopullOverviewView._instance = new OctopullOverviewView());
	}
}

module.exports = OctopullOverviewView;