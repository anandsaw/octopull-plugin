var $ = require('jquery');
var OctopullView = require('./view.js');
var OctopullAgent = require('./agent.js');

var agent = new OctopullAgent();
var view = new OctopullView();

view.on("loading", function() {
	view.repoActions.clear();
});

view.on("load", function(screen) {	
	if (screen.owner && screen.repository && screen.diff_base && screen.diff_head) {
		agent.navigate("repos/" + screen.owner + "/" + screen.repository + "/diff/" + screen.diff_base + "/" + screen.diff_head);
	}
});

agent.on("loading", function() {
	view.showProgressBar();
});

agent.on("loaded", function() {
	view.hideProgressBar();
});

agent.on("message", function(message) {
	view.clear();
	view.addMessage(message);
});

agent.on("repository", function(repo) {
	view.clear();
	if (repo.diff) {
		view.diffView.addWarnings(repo.diff.warnings);
	}
});