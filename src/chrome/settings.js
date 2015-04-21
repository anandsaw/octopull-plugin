var Q = require('q');

function SettingsLoader() {
}

SettingsLoader.prototype.get = function(setting, def) {
	var defs = {};
	defs[setting] = def;
	
	var deferred = Q.defer();
	chrome.storage.sync.get(defs, function(items) {
		deferred.resolve(items[setting]);
	});
	return deferred.promise;
}

module.exports = new SettingsLoader();