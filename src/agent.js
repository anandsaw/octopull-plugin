var $ = require('jquery');
var inherits = require('inherits');
var EventEmitter = require('eventemitter2').EventEmitter2;
var settings = require('settings');

function OctopullAgent() {
	EventEmitter.call(this);
	var self = this;
	
	$.ajaxSetup({
		xhrFields: {
			withCredentials: true
		}
	});
	
	self._host = settings.get('environment', 'production').then(function(env) {
		if (env == "staging") {
			return "https://octopull.rmhartog.me/staging/";
		} else {
			return "https://octopull.rmhartog.me/api/";
		}
	});
	self._currentRequest = null;
	self._loading = false;
}
inherits(OctopullAgent, EventEmitter);

OctopullAgent.prototype.navigate = function(url) {
	this.request({
		url: url,
		method: 'GET'
	});
}

OctopullAgent.prototype.request = function(settings) {
	var self = this;

	if (self._currentRequest !== null) {
		self._currentRequest.abort();
		self._currentRequest = null;
	}
	
	self._host.then(function(host) {		
		var url = settings.url;
		if (!url.startsWith('http')) {
			url = host + url;
		}	
		var request = $.ajax({
			url: url,
			method: settings.method || 'GET',
			data: settings.data
		});
		if (!self._loading) {
			self._loading = true;
			self.emit("loading");
		}

		self._currentRequest = request;
		request.then(function(data, textStatus, jqXHR) {
			if (self._currentRequest == request) {
				self._parseResponse(jqXHR, data);
				self._endRequest();
			}
		}, function(jqXHR, textStatus, errorThrown) {
			if (self._currentRequest == request) {
				console.log(jqXHR.status);
				self._parseResponse(jqXHR, null);
				self._endRequest();
			}
		}).done();
	}).done();
}

OctopullAgent.prototype.sendStatistics = function(statistics) {
	var self = this;
	
	self._host.then(function(host) {
		var url = host + "statistics";
		var request = $.ajax({
			url: url,
			method: 'POST',
			data: JSON.stringify(statistics),
			contentType: "application/json"
		});
	}).done();
}

OctopullAgent.prototype._parseResponse = function(jqXHR, data) {
	var self = this;
	
	var contentType = jqXHR.getResponseHeader("Content-Type");
	var location = jqXHR.getResponseHeader("Location");
	if (contentType === "application/vnd.octopull.message+json") {
		self.emit("message", data || JSON.parse(jqXHR.responseText));
	} else if (contentType === "application/vnd.octopull.repository+json") {
		self.emit("repository", data || JSON.parse(jqXHR.reponseText));
	} else if (jqXHR.status == 201 && location) {
		console.log("HRM?");
		self._host.then(function(host) {
			if (location.startsWith(host)) {
				self.navigate(location);
			} else {
				self.emit("created", {
					location: location
				});
			}
		});
	} else if (jqXHR.status >= 400 || jqXHR.status <= 0) {
		self.emit("error", {
			status: jqXHR.status,
			text: jqXHR.textStatus
		});
	}
}

OctopullAgent.prototype._endRequest = function() {
	this._currentRequest = null;
	if (this._loading) {
		this._loading = false;
		this.emit("loaded");
	}
}

OctopullAgent.get = function() {
	if (OctopullAgent._instance) {
		return OctopullAgent._instance;
	} else {
		return (OctopullAgent._instance = new OctopullAgent());
	}
}

module.exports = OctopullAgent;