chrome.storage.sync.get({
	environment: "production"
}, function(items) {
	document.getElementById('staging').checked = (items.environment == "staging");
});

document.getElementById("save").onclick = function() {
	 var connectStaging = document.getElementById('staging').checked;
	chrome.storage.sync.set({
		environment: connectStaging ? "staging" : "production"
	}, function() {
		// Update status to let user know options were saved.
		var status = document.getElementById('status');
		status.textContent = 'Options saved.';
		setTimeout(function() {
			status.textContent = '';
		}, 750);
	});
};