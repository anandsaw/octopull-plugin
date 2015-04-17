var $ = require('jquery');
var inherits = require('inherits');
var EventEmitter = require('eventemitter2').EventEmitter2;

var host = "https://octopull.rmhartog.me/api/";
host = "http://localhost:8080/";

function OctopullAgent() {
	EventEmitter.call(this);
	var self = this;
	
	$.ajaxSetup({
		xhrFields: {
			withCredentials: true
		}
	});
	
	self._host = host;
	self._currentRequest = null;
	self._loading = false;
}
inherits(OctopullAgent, EventEmitter);

OctopullAgent.prototype.navigate = function(url) {
	var self = this;
	
	if (self._currentRequest !== null) {
		self._currentRequest.abort();
		self._currentRequest = null;
	}
	var request = $.get(self._host + url);
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
	});
}

OctopullAgent.prototype._parseResponse = function(jqXHR, data) {
	var contentType = jqXHR.getResponseHeader("Content-Type");
	if (contentType === "application/vnd.octopull.message+json") {
		this.emit("message", data || JSON.parse(jqXHR.responseText));
	} else if (contentType === "application/vnd.octopull.repository+json") {
		this.emit("repository", data || JSON.parse(jqXHR.reponseText));
	} else if (jqXHR.status >= 400 || jqXHR.status <= 0) {
		this.emit("error", {
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

module.exports = OctopullAgent;