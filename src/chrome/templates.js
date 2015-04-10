var Q = require('q');
var $ = require('jquery');

function TemplateLoader() {
	this.templates = {};
}

TemplateLoader.prototype.load = function(url) {
	var promise = Q($.get(chrome.extension.getURL("/templates/" + url)));
	this.templates[url] = promise;
	return promise;
}

TemplateLoader.prototype.get = function(url) {
	if (this.templates[url]) {
		return this.templates[url];
	} else {
		return this.load(url);
	}
}

module.exports = new TemplateLoader();