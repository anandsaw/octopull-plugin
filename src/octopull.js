var $ = require('jquery');
var OctopullView = require('./view.js');

var view = new OctopullView();

view.on("loading", function() {
	view.repoActions.clear();
});

view.on("load", function(screen) {	
	if (screen.owner && screen.repository && screen.diff_base && screen.diff_head) {
		$.get("https://octopull.rmhartog.me/api/foo/" + screen.owner + "/" + screen.repository + "/" + screen.diff_base).then(function(data) {
			view.diffView.addWarnings(data);
		});
		$.get("https://octopull.rmhartog.me/api/foo/" + screen.owner + "/" + screen.repository + "/" + screen.diff_head).then(function(data) {
			view.diffView.addWarnings(data);
		});
	}
});